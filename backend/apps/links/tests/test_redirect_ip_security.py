from unittest.mock import patch

from django.test import TestCase, override_settings
from django.urls import reverse

from apps.analytics.models import Click
from apps.analytics.utils import hash_ip_address
from apps.links.models import Link


@override_settings(
    SECRET_KEY="test-secret-key",
    FRONTEND_URL="http://localhost:5173",
)

class RedirectIPSecurityTests(TestCase):
    def setUp(self):
        self.link = Link.objects.create(original_url="https://example.com", slug="abc123", is_active=True)
        self.redirect_url = reverse("redirect-to-original-url", kwargs={"slug": self.link.slug})

    @patch("apps.links.views.is_redirect_rate_limited", return_value=False)
    @patch("apps.links.views.get_client_ip", return_value="203.0.113.10")
    def test_redirect_stores_hashed_ip(self, mock_get_client_ip, mock_rate_limit):
        response = self.client.get(self.redirect_url)

        click = Click.objects.get(link=self.link)

        expected_hash = hash_ip_address("203.0.113.10")

        self.assertEqual(response.status_code, 302)
        self.assertEqual(click.ip_hash, expected_hash)

    @patch("apps.links.views.is_redirect_rate_limited", return_value=False)
    @patch("apps.links.views.get_client_ip", return_value="203.0.113.10")
    def test_raw_ip_is_not_saved(self, mock_get_client_ip, mock_rate_limit):
        self.client.get(self.redirect_url)

        click = Click.objects.get(link=self.link)

        self.assertNotEqual(click.ip_hash, "203.0.113.10")

        self.assertNotIn("203.0.113.10", click.ip_hash)

    @patch("apps.links.views.is_redirect_rate_limited", return_value=False)
    @patch("apps.links.views.get_client_ip", return_value="203.0.113.10")
    def test_ip_hash_has_sha256_length(self, mock_get_client_ip, mock_rate_limit):
        self.client.get(self.redirect_url)

        click = Click.objects.get(link=self.link)

        self.assertEqual(len(click.ip_hash), 64)

    @patch("apps.links.views.is_redirect_rate_limited", return_value=False)
    @patch("apps.links.views.get_client_ip", return_value="203.0.113.10")
    def test_redirect_creates_one_click_record(self, mock_get_client_ip, mock_rate_limit):
        self.client.get(self.redirect_url)

        self.assertEqual(Click.objects.filter(link=self.link).count(), 1)

    @patch("apps.links.views.is_redirect_rate_limited", return_value=False)
    @patch("apps.links.views.get_client_ip", return_value="203.0.113.10")
    def test_redirect_still_sends_user_to_original_url(self, mock_get_client_ip, mock_rate_limit):
        response = self.client.get(self.redirect_url)

        self.assertRedirects(response, "https://example.com", fetch_redirect_response=False)


class HashIPAddressTests(TestCase):
    @override_settings(SECRET_KEY="test-secret-key")
    def test_same_ip_produces_same_hash(self):
        first_hash = hash_ip_address("203.0.113.10")
        second_hash = hash_ip_address("203.0.113.10")

        self.assertEqual(first_hash, second_hash)

    @override_settings(SECRET_KEY="test-secret-key")
    def test_different_ips_produce_different_hashes(self):
        first_hash = hash_ip_address("203.0.113.10")
        second_hash = hash_ip_address("203.0.113.11")

        self.assertNotEqual(first_hash, second_hash)

    @override_settings(SECRET_KEY="test-secret-key")
    def test_hash_does_not_equal_raw_ip(self):
        raw_ip = "203.0.113.10"

        result = hash_ip_address(raw_ip)

        self.assertNotEqual(result, raw_ip)
        self.assertEqual(len(result), 64)

    @override_settings(SECRET_KEY="test-secret-key")
    def test_missing_ip_returns_empty_string(self):
        result = hash_ip_address(None)

        self.assertEqual(result, "")
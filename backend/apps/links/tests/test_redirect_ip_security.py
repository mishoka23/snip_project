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
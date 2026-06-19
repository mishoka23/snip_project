from datetime import timedelta
from unittest.mock import patch
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from apps.analytics.models import Click
from apps.links.models import Link


@override_settings(
    FRONTEND_URL="http://localhost:5173",
    IP_HASH_SALT="test-ip-hash-salt",
)

class RedirectTests(TestCase):
    def setUp(self):
        self.link = Link.objects.create(
            original_url="https://example.com",
            slug="abc123",
            is_active=True,
        )

        self.redirect_url = reverse("redirect-to-original-url", kwargs={"slug": self.link.slug})

    @patch("apps.links.views.is_redirect_rate_limited", return_value=False)
    @patch("apps.links.views.get_client_ip", return_value="203.0.113.10")
    def test_valid_slug_redirects_to_original_url(self, _mock_get_client_ip,
        _mock_rate_limit):
        response = self.client.get(self.redirect_url)

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, self.link.original_url)

    @patch("apps.links.views.is_redirect_rate_limited", return_value=False)
    @patch("apps.links.views.get_client_ip", return_value="203.0.113.10")
    def test_redirect_creates_click_record(self, _mock_get_client_ip,
        _mock_rate_limit):
        response = self.client.get(
            self.redirect_url,
            HTTP_REFERER="https://google.com",
            HTTP_USER_AGENT="Test Browser",
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(Click.objects.count(), 1)

        click = Click.objects.get()

        self.assertEqual(click.link, self.link)
        self.assertEqual(click.referrer, "https://google.com")
        self.assertEqual(click.user_agent, "Test Browser")
        self.assertEqual(len(click.ip_hash), 64)

    @patch("apps.links.views.is_redirect_rate_limited", return_value=False)
    def test_missing_slug_redirects_to_frontend_not_found(self, _mock_rate_limit):
        response = self.client.get(
            reverse(
                "redirect-to-original-url",
                kwargs={"slug": "missing1"},
            )
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "http://localhost:5173/not-found")

        self.assertEqual(Click.objects.count(), 0)

    @patch("apps.links.views.is_redirect_rate_limited", return_value=False)
    def test_inactive_link_redirects_to_not_found(self, _mock_rate_limit):
        self.link.is_active = False
        self.link.save(update_fields=["is_active"])

        response = self.client.get(self.redirect_url)

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "http://localhost:5173/not-found")
        self.assertEqual(Click.objects.count(), 0)

    @patch("apps.links.views.is_redirect_rate_limited", return_value=False)
    def test_expired_link_is_deactivated_and_redirects_to_not_found(self,
        _mock_rate_limit):
        self.link.expires_at = timezone.now() - timedelta(minutes=1)
        self.link.save(update_fields=["expires_at"])

        response = self.client.get(self.redirect_url)

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "http://localhost:5173/not-found")

        self.link.refresh_from_db()

        self.assertFalse(self.link.is_active)
        self.assertEqual(Click.objects.count(), 0)

    @patch("apps.links.views.is_redirect_rate_limited", return_value=True)
    @patch("apps.links.views.get_client_ip", return_value="203.0.113.10")
    def test_rate_limited_redirect_returns_429(self, _mock_get_client_ip,
        _mock_rate_limit):
        response = self.client.get(self.redirect_url)

        self.assertEqual(response.status_code, 429)
        self.assertEqual(Click.objects.count(), 0)
import socket
from unittest.mock import patch
from django.core.exceptions import ValidationError
from django.test import SimpleTestCase
from apps.links.validators import validate_public_url


class PublicURLValidationTests(SimpleTestCase):
    @patch("apps.links.validators.socket.getaddrinfo")
    def test_accepts_public_https_url(self, mock_getaddrinfo):
        mock_getaddrinfo.return_value = [
            (
                socket.AF_INET,
                socket.SOCK_STREAM,
                6,
                "",
                ("93.184.216.34", 443),
            )
        ]

        result = validate_public_url("https://example.com")

        self.assertIsNone(result)

    @patch("apps.links.validators.socket.getaddrinfo")
    def test_accepts_public_http_url(self, mock_getaddrinfo):
        mock_getaddrinfo.return_value = [
            (
                socket.AF_INET,
                socket.SOCK_STREAM,
                6,
                "",
                ("93.184.216.34", 80),
            )
        ]

        result = validate_public_url("http://example.com")

        self.assertIsNone(result)

    def test_rejects_invalid_url(self):
        with self.assertRaises(ValidationError):
            validate_public_url("not-a-valid-url")

    def test_rejects_unsupported_scheme(self):
        with self.assertRaises(ValidationError):
            validate_public_url("ftp://example.com")

    def test_rejects_localhost(self):
        with self.assertRaises(ValidationError):
            validate_public_url("http://localhost")

    def test_rejects_localhost_subdomain(self):
        with self.assertRaises(ValidationError):
            validate_public_url("http://api.localhost")

    def test_rejects_local_domain(self):
        with self.assertRaises(ValidationError):
            validate_public_url("http://service.local")

    def test_rejects_internal_domain(self):
        with self.assertRaises(ValidationError):
            validate_public_url("http://service.internal")

    def test_rejects_direct_private_ipv4_address(self):
        with self.assertRaises(ValidationError):
            validate_public_url("http://192.168.1.10")

    def test_rejects_direct_loopback_ipv4_address(self):
        with self.assertRaises(ValidationError):
            validate_public_url("http://127.0.0.1")

    def test_rejects_direct_link_local_address(self):
        with self.assertRaises(ValidationError):
            validate_public_url("http://169.254.169.254")

    def test_rejects_direct_ipv6_loopback_address(self):
        with self.assertRaises(ValidationError):
            validate_public_url("http://[::1]")

    @patch("apps.links.validators.socket.getaddrinfo")
    def test_rejects_domain_resolving_to_private_ip(self, mock_getaddrinfo):
        mock_getaddrinfo.return_value = [
            (
                socket.AF_INET,
                socket.SOCK_STREAM,
                6,
                "",
                ("10.0.0.5", 80),
            )
        ]

        with self.assertRaises(ValidationError):
            validate_public_url("http://private.example.com")

    @patch("apps.links.validators.socket.getaddrinfo")
    def test_rejects_domain_resolving_to_loopback_ip(self, mock_getaddrinfo):
        mock_getaddrinfo.return_value = [
            (
                socket.AF_INET,
                socket.SOCK_STREAM,
                6,
                "",
                ("127.0.0.1", 80),
            )
        ]

        with self.assertRaises(ValidationError):
            validate_public_url("http://loopback.example.com")

    @patch("apps.links.validators.socket.getaddrinfo", side_effect=socket.gaierror)
    def test_rejects_unresolvable_hostname(self, mock_getaddrinfo):
        with self.assertRaises(ValidationError):
            validate_public_url("https://does-not-exist.invalid")
import string
from unittest.mock import patch

from django.test import TestCase

from apps.links.models import Link
from apps.links.utils import generate_secure_slug, generate_unique_slug


class SlugGenerationTests(TestCase):
    def test_generate_secure_slug_returns_expected_length(self):
        slug = generate_secure_slug()
        self.assertEqual(len(slug), 6)

    def test_generate_secure_slug_uses_only_allowed_characters(self):
        slug = generate_secure_slug()

        allowed_characters = string.ascii_letters + string.digits

        self.assertTrue(all(character in allowed_characters for character in slug))

    def test_generate_secure_slug_can_use_custom_length(self):
        slug = generate_secure_slug(length=8)
        self.assertEqual(len(slug), 8)

    def test_generate_unique_slug_returns_unused_slug(self):
        slug = generate_unique_slug(Link)
        self.assertFalse(Link.objects.filter(slug=slug).exists())

    @patch("apps.links.utils.generate_secure_slug")
    def test_generate_unique_slug_retries_after_collision(self, mock_generate_secure_slug):
        Link.objects.create(
            original_url="https://example.com/existing",
            slug="abc123",
            is_active=True,
        )

        mock_generate_secure_slug.side_effect = [
            "abc123",
            "xyz789",
        ]

        slug = generate_unique_slug(Link)

        self.assertEqual(slug, "xyz789")
        self.assertEqual(mock_generate_secure_slug.call_count, 2)

    @patch("apps.links.utils.generate_secure_slug")
    def test_generate_unique_slug_checks_custom_alias_collisions(self, mock_generate_secure_slug):
        Link.objects.create(
            original_url="https://example.com/custom",
            slug="custom1",
            custom_alias="custom1",
            is_active=True,
        )

        mock_generate_secure_slug.side_effect = [
            "custom1",
            "new123",
        ]

        slug = generate_unique_slug(Link)

        self.assertEqual(slug, "new123")
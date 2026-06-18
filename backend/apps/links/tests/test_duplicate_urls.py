from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.links.models import Link


User = get_user_model()


class DuplicateURLTests(APITestCase):
    def setUp(self):
        self.url = reverse("links-list")

        self.user_one = User.objects.create_user(
            username="user_one",
            email="user_one@example.com",
            password="StrongPassword123!",
        )

        self.user_two = User.objects.create_user(
            username="user_two",
            email="user_two@example.com",
            password="StrongPassword123!",
        )

    @patch("apps.links.serializers.validate_public_url")
    @patch("apps.links.serializers.generate_unique_slug", return_value="first01")
    def test_same_user_receives_existing_link_for_duplicate_url(self,
        mock_generate_unique_slug,
        mock_validate_public_url,
    ):
        existing_link = Link.objects.create(
            owner=self.user_one,
            original_url="https://example.com/article",
            slug="exist01",
            is_active=True,
        )

        self.client.force_authenticate(user=self.user_one)

        response = self.client.post(
            self.url,
            {
                "original_url": "https://example.com/article",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(Link.objects.filter(owner=self.user_one).count(), 1)

        self.assertEqual(response.data["id"], existing_link.id)

        self.assertEqual(response.data["slug"], existing_link.slug)

        mock_generate_unique_slug.assert_not_called()

    @patch("apps.links.serializers.validate_public_url")
    @patch("apps.links.serializers.generate_unique_slug", return_value="second01")
    def test_different_users_can_shorten_same_url(
        self,
        mock_generate_unique_slug,
        mock_validate_public_url,
    ):
        Link.objects.create(
            owner=self.user_one,
            original_url="https://example.com/shared",
            slug="userone1",
            is_active=True,
        )

        self.client.force_authenticate(user=self.user_two)

        response = self.client.post(
            self.url,
            {
                "original_url": "https://example.com/shared",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Link.objects.count(), 2)

        created_link = Link.objects.get(owner=self.user_two)

        self.assertEqual(
            created_link.original_url,
            "https://example.com/shared",
        )

        self.assertEqual(created_link.slug, "second01")

    @patch("apps.links.serializers.validate_public_url")
    @patch("apps.links.serializers.generate_unique_slug", return_value="active01")
    def test_inactive_duplicate_does_not_block_new_link(self,
        mock_generate_unique_slug,
        mock_validate_public_url,
    ):
        Link.objects.create(
            owner=self.user_one,
            original_url="https://example.com/inactive",
            slug="oldlink1",
            is_active=False,
        )

        self.client.force_authenticate(user=self.user_one)

        response = self.client.post(
            self.url,
            {
                "original_url": "https://example.com/inactive",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Link.objects.filter(owner=self.user_one).count(), 2)
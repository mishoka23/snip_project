from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.links.models import Link


User = get_user_model()


class LinkPermissionTests(TestCase):
    def setUp(self):
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

        self.user_one_link = Link.objects.create(
            owner=self.user_one,
            original_url="https://example.com/user-one",
            slug="one123",
            is_active=True,
        )

        self.user_two_link = Link.objects.create(
            owner=self.user_two,
            original_url="https://example.com/user-two",
            slug="two123",
            is_active=True,
        )

        self.client = APIClient()

    def test_user_only_sees_own_links(self):
        self.client.force_authenticate(user=self.user_one)

        response = self.client.get(reverse("links-list"))

        self.assertEqual(response.status_code, 200)

        returned_slugs = [
            item["slug"]
            for item in response.data["results"]
        ]

        self.assertIn(self.user_one_link.slug, returned_slugs)

        self.assertNotIn(self.user_two_link.slug, returned_slugs)

    def test_user_can_retrieve_own_link(self):
        self.client.force_authenticate(user=self.user_one)

        response = self.client.get(
            reverse(
                "links-detail",
                kwargs={"slug": self.user_one_link.slug},
            )
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["slug"], self.user_one_link.slug)

    def test_user_cannot_retrieve_another_users_link(self):
        self.client.force_authenticate(user=self.user_one)

        response = self.client.get(
            reverse(
                "links-detail",
                kwargs={"slug": self.user_two_link.slug},
            )
        )

        self.assertEqual(response.status_code, 404)

    def test_user_cannot_delete_another_users_link(self):
        self.client.force_authenticate(user=self.user_one)

        response = self.client.delete(
            reverse(
                "links-detail",
                kwargs={"slug": self.user_two_link.slug},
            )
        )

        self.assertEqual(response.status_code, 404)

        self.user_two_link.refresh_from_db()

        self.assertTrue(self.user_two_link.is_active)

    def test_user_can_soft_delete_own_link(self):
        self.client.force_authenticate(user=self.user_one)

        response = self.client.delete(
            reverse(
                "links-detail",
                kwargs={"slug": self.user_one_link.slug},
            )
        )

        self.assertEqual(response.status_code, 204)

        self.user_one_link.refresh_from_db()

        self.assertFalse(self.user_one_link.is_active)

    def test_user_cannot_access_another_users_analytics(self):
        self.client.force_authenticate(user=self.user_one)

        response = self.client.get(
            reverse(
                "links-analytics",
                kwargs={"slug": self.user_two_link.slug},
            )
        )

        self.assertEqual(response.status_code, 404)

    def test_unauthenticated_user_cannot_list_links(self):
        response = self.client.get(reverse("links-list"))

        self.assertEqual(response.status_code, 401)
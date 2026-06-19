from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class AuthenticationTests(APITestCase):
    def setUp(self):
        self.register_url = "/api/v1/auth/register/"
        self.login_url = "/api/v1/auth/token/"
        self.refresh_url = "/api/v1/auth/token/refresh/"
        self.links_url = "/api/v1/links/"

        self.email = "testuser@example.com"
        self.password = "StrongPassword123!"

        self.user = User.objects.create_user(
            username=self.email,
            email=self.email,
            password=self.password)

    def test_user_can_register(self):
        response = self.client.post(
            self.register_url,
            {
                "username": "Newuser",
                "email": "newuser@example.com",
                "password": "AnotherStrongPassword123!",
                "password_confirm": "AnotherStrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="newuser@example.com",).exists())

    def test_registration_rejects_mismatched_passwords(self):
        response = self.client.post(
            self.register_url,
            {
                "username": "Newuser",
                "email": "newuser@example.com",
                "password": "AnotherStrongPassword123!",
                "password_confirm": "DifferentPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertFalse(User.objects.filter(email="newuser@example.com",).exists())

    def test_registration_rejects_duplicate_email(self):
        response = self.client.post(
            self.register_url,
            {
                "username": "Duplicate User",
                "email": self.email,
                "password": "AnotherStrongPassword123!",
                "password_confirm": "AnotherStrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_can_login_with_valid_credentials(self):
        response = self.client.post(
            self.login_url,
            {
                "username": self.user.username,
                "password": self.password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_rejects_invalid_password(self):
        response = self.client.post(
            self.login_url,
            {
                "username": self.user.username,
                "password": "WrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.assertNotIn("access", response.data)
        self.assertNotIn("refresh", response.data)

    def test_refresh_token_returns_new_access_token(self):
        login_response = self.client.post(
            self.login_url,
            {
                "username": self.user.username,
                "password": self.password,
            },
            format="json",
        )

        refresh_token = login_response.data["refresh"]

        response = self.client.post(
            self.refresh_url,
            {
                "refresh": refresh_token,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_invalid_refresh_token_is_rejected(self):
        response = self.client.post(
            self.refresh_url,
            {
                "refresh": "invalid-token",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_user_cannot_list_links(self):
        response = self.client.get(self.links_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_list_links(self):
        login_response = self.client.post(
            self.login_url,
            {
                "username": self.user.username,
                "password": self.password,
            },
            format="json",
        )

        access_token = login_response.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        response = self.client.get(self.links_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.links.models import Link

User = get_user_model()

class LinkCreateAPITests(APITestCase):
    # every test method so each test starts with the same URL.
    def setUp(self):
        # Build POST URL from the DRF router name for the LinkViewSet list/create endpoint.
        self.url = reverse("links-list")  

    # Check that a normal valid URL creates a link successfully.
    def test_create_link_with_valid_url(self):  
        # create payload
        payload = {  
            "original_url": "https://example.com",
        }

        # send the request
        response = self.client.post(  
            self.url,
            payload,
            format="json",
        )

        # compare returned status
        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        # db should contain only one Link row.
        self.assertEqual(Link.objects.count(), 1)

        # get the first stored link
        link = Link.objects.first()

        # compare link with db link
        self.assertEqual(link.original_url, "https://example.com")

        # check if the api response contains the slug and the full short url
        self.assertIn("slug", response.data)
        self.assertIn("short_url", response.data)

    
    def test_create_link_without_url_returns_error(self):  
        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # no links should be returned
        self.assertEqual(Link.objects.count(), 0)

    def test_create_link_with_invalid_url_returns_error(self):
        payload = {
            "original_url": "not-a-valid-url"
            }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertEqual(Link.objects.count(), 0)

    def test_create_link_with_custom_alias(self):
        payload = {
            "original_url": "https://example.com",
            "custom_alias": "my-link"
            }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        link = Link.objects.first()

        self.assertEqual(link.custom_alias, "my-link")
        self.assertEqual(link.slug, "my-link")

    def test_reject_creating_with_duplicated_custom_alias(self):
        payload = {
            "original_url": "https://example.com",
            "custom_alias": "my-link"
            }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        duplicated_payload = {
            "original_url": "https://example.com",
            "custom_alias": "my-link"
            }
        
        second_response = self.client.post(self.url, duplicated_payload, format = "json")

        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn("custom_alias", second_response.data["details"])

    def test_when_user_authenticated_assigned_owner(self):
        user = User.objects.create_user(
            username = "ms@google.com",
            email = "ms@google.com",
            password = "1234*Abv"
        )

        self.client.force_authenticate(user = user)

        payload = {
            "original_url": "https://example.com",
            "custom_alias": "own-link"
        }

        response = self.client.post(self.url, payload, format = "json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        link = Link.objects.get(custom_alias = "own-link")

        self.assertEqual(link.owner, user)

    def test_successful_create_returns_all_expected_fields(self):
        payload = {
            "original_url": "https://example.com",
            "custom_alias": "own-link"
        }

        response = self.client.post(self.url, payload, format = "json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        expected_fields = {
            "id", "original_url", "slug", "custom_alias", 
            "short_url", "click_count", "created_at"
        }

        self.assertEqual(response.data.keys(), expected_fields)
        self.assertIsNotNone(response.data["id"])
        self.assertEqual(response.data["original_url"], payload["original_url"])

        self.assertEqual(response.data["custom_alias"], payload["custom_alias"])
        self.assertEqual(response.data["slug"], payload["custom_alias"])

        self.assertEqual(response.data["click_count"], 0)
        self.assertIsNotNone(response.data["created_at"])

        self.assertTrue(response.data["short_url"].endswith(f"/{response.data['slug']}/"))

    def test_create_link_generates_default_slug(self):
        payload = {
            "original_url": "https://example.com",
            "custom_alias": "own-link"
        }

        response = self.client.post(self.url, payload, format = "json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("slug", response.data)
        self.assertNotEqual(response.data["slug"], payload["original_url"])

    def test_new_link_has_zero_click_count(self):
        payload = {
            "original_url": "https://example.com",
            "custom_alias": "own-link"
        } 

        response = self.client.post(self.url, payload, format = "json")

        self.assertEqual(response.data["click_count"], 0)

    # def test_backend_rejects_custom_alias_more_than_8_chars(self):
    #     payload = {
    #         "original_url": "https://example.com",
    #         "custom_alias": "personal-link"
    #     } 

    #     response = self.client.post(self.url, payload, format = "json")

    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    #     self.assertEqual(response.data["error"], "custom_alias")
    #     self.assertIn("custom_alias", response.data["details"])

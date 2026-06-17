from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.links.models import Link


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

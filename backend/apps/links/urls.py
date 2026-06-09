from django.urls import path

from apps.links.views import LinkCreateAPIView


urlpatterns = [
    path("links/", LinkCreateAPIView.as_view(), name="link-create"),
]
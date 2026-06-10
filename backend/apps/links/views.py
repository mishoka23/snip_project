from rest_framework import permissions, viewsets, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.decorators import action

from django.shortcuts import get_object_or_404, redirect
from django.utils import timezone
from django.db.models import Count
from django.db.models.functions import TruncDate

from datetime import timedelta

from apps.analytics.models import Click
from apps.analytics.utils import get_client_ip, hash_ip_address
from apps.links.models import Link
from apps.links.serializers import LinkCreateSerializer, LinkManagementSerializer

from .permissions import IsOwnerOrAdmin


class LinkViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "create":
            return LinkCreateSerializer

        return LinkManagementSerializer

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Link.objects
            .filter(is_active=True)
            .annotate(click_count=Count("clicks"))
            .order_by("-created_at")
        )

        if user.is_authenticated and user.is_staff:
            return queryset

        if user.is_authenticated:
            return queryset.filter(owner=user)

        return Link.objects.none()

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]

        if self.action in ["list", "retrieve", "destroy"]:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]

        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        link = self.get_object()
        link.is_active = False
        link.save(update_fields=["is_active"])

        return Response(status=status.HTTP_204_NO_CONTENT)


def redirect_to_original_url(request, slug):
    link = get_object_or_404(Link, slug=slug, is_active=True)

    if link.expires_at and link.expires_at <= timezone.now():
        link.is_active = False
        link.save(update_fields=["is_active"])

        return redirect("/404")

    client_ip = get_client_ip(request)
    ip_hash = hash_ip_address(client_ip)

    Click.objects.create(
        link=link,
        referrer=request.META.get("HTTP_REFERER", ""),
        user_agent=request.META.get("HTTP_USER_AGENT", ""),
        ip_hash=ip_hash,
        country_code=None,
    )

    return redirect(link.original_url)


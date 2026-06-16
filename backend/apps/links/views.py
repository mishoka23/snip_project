from rest_framework import permissions, viewsets, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.decorators import action

from django.shortcuts import redirect
from django.conf import settings
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

        if self.action in ["list", "retrieve", "destroy", "analytics"]:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]

        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        link = self.get_object()
        link.is_active = False
        link.save(update_fields=["is_active"])

        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=["get"], url_path="analytics")
    def analytics(self, request, slug = None):
        link = self.get_object()

        today = timezone.localdate()
        start_date = today - timedelta(days = 29)

        clicks = Click.objects.filter(link = link)

        total_clicks = clicks.count()

        clicks_per_day_queryset = (
            clicks
            .filter(clicked_at__date__gte=start_date)
            .annotate(day=TruncDate("clicked_at"))
            .values("day")
            .annotate(clicks=Count("id"))
            .order_by("day")
        )

        clicks_by_day = {item["day"]: item["clicks"] for item in clicks_per_day_queryset}

        clicks_per_day = []

        for index in range(30):
            day = start_date + timedelta(days = index)

            clicks_per_day.append({"date": day.isoformat(),"clicks": clicks_by_day.get(day, 0),})

        top_referrers = (
            clicks
            .exclude(referrer__isnull=True)
            .exclude(referrer="")
            .values("referrer")
            .annotate(clicks=Count("id"))
            .order_by("-clicks")[:5])

        top_countries = (
            clicks
            .exclude(country_code__isnull=True)
            .exclude(country_code="")
            .values("country_code")
            .annotate(clicks=Count("id"))
            .order_by("-clicks")[:5])

        return Response({
            "link": {
                "id": link.id,
                "slug": link.slug,
                "short_url": request.build_absolute_uri(f"/{link.slug}/"),
                "original_url": link.original_url,
                "created_at": link.created_at,},
            "summary": {
                "total_clicks": total_clicks,},
                "clicks_per_day": clicks_per_day,
                "top_referrers": list(top_referrers),
                "top_countries": list(top_countries)})


def redirect_to_original_url(request, slug):
    try:
        link = Link.objects.get(slug=slug, is_active=True)
    except Link.DoesNotExist:
        return redirect(f"{settings.FRONTEND_URL}/not-found")

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


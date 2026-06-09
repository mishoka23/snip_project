from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.links.serializers import LinkCreateSerializer

from django.shortcuts import get_object_or_404, redirect
from django.utils import timezone
from apps.analytics.models import Click
from apps.analytics.utils import get_client_ip, hash_ip_address
from apps.links.models import Link

class LinkCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LinkCreateSerializer(data = request.data, context={"request": request})

        if serializer.is_valid():
            link = serializer.save()

            return Response(
                LinkCreateSerializer(link,context = {"request": request}).data,
                status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)

def redirect_to_original_url(request, slug):
    link = get_object_or_404(Link, slug = slug, is_active=True)

    if link.expires_at and link.expires_at <= timezone.now():
        link.is_active = False
        link.save(update_fields = ["is_active"])

        return redirect("/404")

    client_ip = get_client_ip(request)
    ip_hash = hash_ip_address(client_ip)

    Click.objects.create(link = link, referrer = request.META.get("HTTP_REFERER", ""), 
                        user_agent = request.META.get("HTTP_USER_AGENT", ""), 
                        ip_hash = ip_hash, country_code = None)

    return redirect(link.original_url)
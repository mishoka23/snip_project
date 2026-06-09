from django.conf import settings
from rest_framework import serializers

from apps.links.models import Link
from apps.links.utils import generate_unique_slug
from apps.links.validators import validate_public_url

class LinkCreateSerializer(serializers.ModelSerializer):
    short_url = serializers.SerializerMethodField(read_only = True)
    click_count = serializers.SerializerMethodField(read_only = True)

    class Meta:
        model = Link
        # fields = ["id", "original_url", "slug", "custom_alias", "short_url", "created_at"]
        fields = ["id", "original_url", "slug", "custom_alias", "short_url", "click_count", "created_at"]

        read_only_fields = ["id", "slug", "short_url", "click_count", "created_at"]

    def validate_original_url(self, value):    
        validate_public_url(value)

        return value
    
    def validate_custom_alias(self, value):
        if not value:
            return value

        if Link.objects.filter(custom_alias = value).exists():
            raise serializers.ValidationError("This custom alias is already taken.")

        return value
    
    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user if request and request.user.is_authenticated else None

        custom_alias = validated_data.get("custom_alias")

        if custom_alias:
            slug = custom_alias
        else:
            slug = generate_unique_slug(Link)

        link = Link.objects.create(owner = user, original_url = validated_data["original_url"], slug = slug, custom_alias = custom_alias)

        return link
    
    def get_short_url(self, obj):
        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(f"/{obj.slug}/")

        base_domain = getattr(settings, "BASE_DOMAIN", "http://localhost:8000")
        
        return f"{base_domain}/{obj.slug}/"
    
    # to count clicks
    def get_click_count(self, obj):
        return obj.clicks.count()
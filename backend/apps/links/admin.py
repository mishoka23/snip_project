from django.contrib import admin

from .models import Link


@admin.register(Link)
class LinkAdmin(admin.ModelAdmin):
    list_display = ["id", "slug", "custom_alias", "owner", "original_url", "is_active",
                    "created_at", "expires_at"]
    
    list_filter = ["is_active", "created_at", "expires_at"]

    search_fields = ["slug", "custom_alias", "original_url", "owner__username", "owner__email"]

    readonly_fields = ["id", "created_at"]
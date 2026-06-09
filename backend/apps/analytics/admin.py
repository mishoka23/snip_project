from django.contrib import admin
from .models import Click


@admin.register(Click)
class ClickAdmin(admin.ModelAdmin):
    list_display = ["id", "link", "clicked_at", "referrer", "country_code"]

    list_filter = ["clicked_at", "country_code"]

    search_fields = ["link__slug", "referrer", "user_agent", "ip_hash"]

    readonly_fields = ["id", "clicked_at"]
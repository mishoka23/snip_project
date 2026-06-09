from django.conf import settings
from django.db import models

class Link(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete = models.CASCADE, null = True, blank = True, related_name = "links")
    original_url = models.URLField(max_length = 2048)
    slug = models.CharField(max_length = 8, unique = True, db_index = True)
    custom_alias = models.CharField(max_length = 20, unique = True, null = True, blank = True)
    is_active = models.BooleanField(default = True)
    created_at = models.DateTimeField(auto_now_add = True)
    expires_at = models.DateTimeField(null = True, blank = True)

    # Newest links appear first by default.
    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.slug} -> {self.original_url}"

    
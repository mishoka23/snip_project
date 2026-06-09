from django.db import models
from apps.links.models import Link

class Click(models.Model):
    link = models.ForeignKey(Link, on_delete = models.CASCADE, related_name = "clicks")
    clicked_at = models.DateTimeField(auto_now_add = True, db_index = True)
    referrer = models.CharField(max_length = 500, blank = True, null = True)
    user_agent = models.CharField(max_length = 500, blank = True, null = True)
    ip_hash = models.CharField(max_length = 64)
    country_code = models.CharField(max_length = 2, blank = True, null = True)
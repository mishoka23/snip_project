import hashlib

from django.conf import settings

# Return a SHA-256 hash of the visitor IP address.
def hash_ip_address(ip_address):
    if not ip_address:
        return ""

    value = f"{settings.IP_HASH_SALT}:{ip_address}"

    return hashlib.sha256(value.encode("utf-8")).hexdigest()

# Extract the client IP address from the request.
# In production behind Nginx, X-Forwarded-For may contain the real client IP.
def get_client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")

    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    return request.META.get("REMOTE_ADDR")  
import hashlib

# Return a SHA-256 hash of the visitor IP address.
def hash_ip_address(ip_address):
    if not ip_address:
        return ""

    return hashlib.sha256(ip_address.encode("utf-8")).hexdigest()

# Extract the client IP address from the request.
# In production behind Nginx, X-Forwarded-For may contain the real client IP.
def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")

    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()

    return request.META.get("REMOTE_ADDR")
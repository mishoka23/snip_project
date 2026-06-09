import ipaddress
from urllib.parse import urlparse

from django.core.exceptions import ValidationError
from django.core.validators import URLValidator

# Validate that a URL is a public HTTP/HTTPS URL.
def validate_public_url(value):
    url_validator = URLValidator(schemes=["http", "https"])

    try:
        url_validator(value)
    except ValidationError:
        raise ValidationError("Enter a valid HTTP or HTTPS URL.")
    

    # Parse URL into parts
    parsed_url = urlparse(value)

    scheme = parsed_url.scheme
    hostname = parsed_url.hostname

    # validate http or https
    if scheme not in ["http", "https"]:
        raise ValidationError("Only HTTP and HTTPS URLs are allowed.")

    # hostname
    if not hostname:
        raise ValidationError("URL must include a valid hostname.")

    hostname = hostname.lower()

    # reject localhost
    if hostname == "localhost" or hostname.endswith(".localhost"):
        raise ValidationError("Localhost URLs are not allowed.")
    
    # Reject direct private/internal IP addresses
    try:
        ip = ipaddress.ip_address(hostname)

        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_reserved
            or ip.is_multicast
            or ip.is_unspecified
            or ip.is_link_local
        ):
            raise ValidationError("Private or internal IP addresses are not allowed.")

    except ValueError:
        # Hostname is a domain name, not an IP address.
        # That is allowed here.
        pass
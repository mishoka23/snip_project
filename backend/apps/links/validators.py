import ipaddress
import socket
from urllib.parse import urlparse

from django.core.exceptions import ValidationError
from django.core.validators import URLValidator


BLOCKED_HOSTNAMES = {
    "localhost",
    "localhost.localdomain",
}

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

    hostname = hostname.lower().rstrip(".")

    # reject localhost
    if hostname in BLOCKED_HOSTNAMES or hostname.endswith(".localhost") or hostname.endswith(".internal") or hostname.endswith(".local"):
        raise ValidationError("Localhost URLs are not allowed.")
    
    # Reject a hostname entered directly as an IP address.
    try:
        ip_address = ipaddress.ip_address(hostname)
    except ValueError:
        ip_address = None

    if ip_address is not None:
        validate_public_ip(ip_address)
        return

    # Resolve domain names and validate every returned IP address.
    try:
        resolved_addresses = socket.getaddrinfo(
            hostname,
            parsed_url.port or default_port_for_scheme(scheme),
            type=socket.SOCK_STREAM,
        )
    except socket.gaierror:
        raise ValidationError(
            "The URL hostname could not be resolved."
        )

    if not resolved_addresses:
        raise ValidationError(
            "The URL hostname could not be resolved."
        )

    for address_info in resolved_addresses:
        resolved_ip_string = address_info[4][0]

        try:
            resolved_ip = ipaddress.ip_address(resolved_ip_string)
        except ValueError:
            raise ValidationError(
                "The URL resolved to an invalid IP address."
            )

        validate_public_ip(resolved_ip)


def validate_public_ip(ip_address):
    if not ip_address.is_global:
        raise ValidationError(
            "Private or internal IP addresses are not allowed."
        )


def default_port_for_scheme(scheme):
    if scheme == "https":
        return 443

    return 80
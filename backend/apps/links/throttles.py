from rest_framework.throttling import AnonRateThrottle

class AnonymousLinkCreateThrottle(AnonRateThrottle):
    rate = "10/hour"
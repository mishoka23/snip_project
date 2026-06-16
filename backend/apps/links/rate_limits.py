from django.core.cache import cache

REDIRECT_LIMIT = 60
REDIRECT_WINDOW_SECONDS = 60

def is_redirect_rate_limited(client_ip):
    if not client_ip:
        return False
    
    cache_key = f"redirect-rate-limit:{client_ip}"
    request_count = cache.get(cache_key, 0)

    if request_count >= REDIRECT_LIMIT:
        return True
    
    if request_count == 0 :
        cache.set(cache_key, 1, timeout = REDIRECT_WINDOW_SECONDS)
    else:
        cache.incr(cache_key)

    return False
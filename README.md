# snip_project
A project for URL shortener which will help to learn Django and React

### Future rate-limiting upgrade

The MVP uses Django's local-memory cache for rate-limit counters.

Before production:

- Replace `LocMemCache` with Redis.
- Share rate-limit counters across all backend workers and servers.
- Add separate limits for authenticated users.
- Add monitoring for repeated abuse.
- Configure trusted proxy headers before relying on client IP addresses.

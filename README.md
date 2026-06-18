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

## Authentication token storage

The demo stores JWT access and refresh tokens in the browser's `localStorage`.

This is acceptable for the MVP because it keeps the frontend authentication flow simple. However, `localStorage` is accessible to JavaScript, so a successful cross-site scripting attack could read and steal the tokens.

For production, JWT tokens should preferably be stored in secure `httpOnly` cookies configured with:

- `HttpOnly`
- `Secure`
- `SameSite=Lax` or `SameSite=Strict`
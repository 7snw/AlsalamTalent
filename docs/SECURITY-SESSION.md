# ctrlZ — Session Handling & JWT Policy

## Overview
ctrlZ uses short-lived JWT access tokens and longer-lived refresh tokens to maintain user sessions for Freelancers, Clients, and Admins.

## Token Types
- **Access Token**: JWT (signed HS256) carrying: sub (userId), role, sid (session id), jti (token id), iat, exp.
- **Refresh Token**: Opaque random string mapped to the same sid (session id).

## Creation
- On successful login:
  1) Generate a `sid` (session id) per device/login.
  2) Issue Access Token (TTL = 15 minutes).
  3) Issue Refresh Token (TTL = 7 days), HTTP-only, Secure, SameSite=Strict cookie.

## Storage
- **Access Token**: Sent via `Authorization: Bearer <jwt>` (or an HttpOnly cookie if enabled).
- **Refresh Token**: HttpOnly Secure cookie `rt`, bound to the browser; never accessible to JS.
- Server stores a hashed copy of refresh tokens for revocation and rotation security.

## Expiry & Renewal
- **Access Token** expires after 15 minutes.
- If expired but refresh is valid, the `/auth/refresh` endpoint rotates the refresh token (old one revoked) and issues a new Access Token (+ new Refresh Token).
- **Absolute Session Timeout**: 8 hours from initial login (no refresh after this).
- **Idle Timeout**: 30 minutes of inactivity → session requires re-authentication.

## Logout & Revocation
- `/auth/logout` revokes the active refresh token (`sid`) and clears cookies.
- Admins can revoke all sessions for a user (e.g., security event).

## Cookies
- `rt`: HttpOnly, Secure, SameSite=Strict, Path=/auth, Max-Age=7 days.
- (Optional) `at`: HttpOnly, Secure, SameSite=Lax, Max-Age=15 min (if you prefer cookie instead of header for access tokens).

## Error Codes
- 40101: Missing/invalid access token
- 40102: Access token expired, try refresh
- 40103: Refresh failed/rotated — re-login required

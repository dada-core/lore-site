---
title: "API overview"
description: "Lore’s interface runs entirely on a REST API, described in OpenAPI. Today it covers the setup, sign-in, the account and the administration of the organization."
---

## Base address

```text title="URL"
https://lore.example.com/api/v1
```

The complete OpenAPI description is served, without authentication, at `/api/v1/openapi.json`.

## What the API covers

- **Initial setup**: `GET /api/v1/setup`, `POST /api/v1/setup/verify-code` and `POST /api/v1/setup`.
- **Sign-in**: `POST /api/v1/auth/login`, `POST /api/v1/auth/logout` and `GET /api/v1/session`.
- **Invitations**: `POST /api/v1/invitations/inspect` and `POST /api/v1/invitations/accept`.
- **Password reset**: `POST /api/v1/password-reset/inspect` and `POST /api/v1/password-reset/complete`.
- **My account**: `/api/v1/account`, its address (`/email`), its password (`/password`) and its sessions (`/sessions`).
- **Administration**: `/api/v1/admin/organization`, `/api/v1/admin/members` and `/api/v1/admin/invitations`, for owners and administrators only.

Spaces, documents and search will be added with version 0.1.

## Authentication

The API uses the same session as the interface: `POST /api/v1/auth/login` opens it and keeps it in a cookie. Requests that change something (`POST`, `PUT`, `PATCH`, `DELETE`) must also send the CSRF token back: Lore puts it in the `XSRF-TOKEN` cookie, and the request returns it in the `X-XSRF-TOKEN` header.

```sh title="Example with curl"
# 1. Receive the XSRF-TOKEN cookie
curl -c cookies.txt https://lore.example.com/api/v1/session
# 2. Sign in, with the XSRF-TOKEN value read from cookies.txt
curl -b cookies.txt -c cookies.txt -X POST https://lore.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" -H "X-XSRF-TOKEN: <token>" \
  -d '{"email": "admin@example.com", "password": "<password>"}'
# 3. Call the API
curl -b cookies.txt https://lore.example.com/api/v1/account
```

Personal access tokens, for scripts and integrations, are planned after version 0.1.

## Pagination

Lists, such as the members list, accept `page` (starting at 0) and `size` (50 by default, 200 at most):

```json title="Response"
{
  "items": [ … ],
  "page": 0,
  "size": 50,
  "total": 128
}
```

## Errors

Errors use the `application/problem+json` format, with a stable `code` field: rely on it rather than on the message.

| HTTP status | Examples of `code` | Meaning |
| --- | --- | --- |
| 400 | `invalid_request` | Invalid request. The `errors` field lists the fields involved, each with its own code, for example `invalid_email` or `password_min_length` |
| 401 | `unauthenticated`, `invalid_credentials` | No open session, or credentials refused |
| 403 | `admin_only`, `owner_only`, `csrf` | Action reserved for another role, or CSRF token missing or expired |
| 404 | `not_found`, `invalid_link` | Not found, or an expired invitation or reset link |
| 409 | `last_owner`, `own_account`, `setup_done` | The action conflicts with the current state, for example removing the last owner |
| 415 | `unsupported_media_type` | The body must be JSON |
| 429 | `login_locked` | Too many failed sign-ins: try again after the lockout |

---
title: "API overview"
description: "Lore’s interface runs entirely on a REST API, described in OpenAPI. Today it covers the setup, sign-in, the account, the administration of the organization, spaces, documents and search."
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
- **Administration**: `/api/v1/admin/organization`, `/api/v1/admin/members`, `/api/v1/admin/invitations` and `/api/v1/admin/storage`, for owners and administrators only.
- **Spaces**: `/api/v1/spaces`, and for each space its folders (`/{spaceId}/folders`) and its members (`/{spaceId}/members`).
- **Documents**: `/api/v1/spaces/{spaceId}/documents`, `/api/v1/documents/{id}` and its actions, the content and the file of each version (`/versions/{number}/rendering` and `/versions/{number}/file`), `/api/v1/documents/recent`, `/api/v1/imports/limits` and `/api/v1/imports/attention`. See [Documents](api-documents.md).
- **Search**: `GET /api/v1/search` and, for the palette, `GET /api/v1/search/titles`.

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
| 400 | `invalid_request` | Invalid request. The `errors` field lists the fields involved, each with its own code, for example `invalid_email`, `password_min_length` or `common_words_only` |
| 401 | `unauthenticated`, `invalid_credentials` | No open session, or credentials refused |
| 403 | `admin_only`, `owner_only`, `contributor_only`, `maintainer_only`, `maintainer_or_owner_only`, `csrf` | Action reserved for another role, or CSRF token missing or expired |
| 404 | `not_found`, `invalid_link` | Not found, or an expired invitation or reset link |
| 409 | `last_owner`, `own_account`, `setup_done`, `space_archived`, `document_archived`, `same_content`, `folder_not_empty`, `not_retryable`, `extraction_pending`, `no_rendering` | The action conflicts with the current state, for example removing the last owner, or reading the content of a document still being extracted |
| 410 | `file_missing` | The file of a document cannot be found on the server’s disk |
| 413 | `file_too_large` | The file is over the maximum size, given in megabytes in `maxMegabytes` |
| 415 | `unsupported_media_type` | The body must be JSON |
| 429 | `login_locked`, `too_many_searches`, `export_running` | Too many failed sign-ins: try again after the lockout; two of your searches are already running; or one of your exports of the audit log |
| 503 | `search_timeout` | The search went beyond 5 seconds: make it more precise |
| 507 | `storage_full` | Less than 100 MB would be left free on the server’s disk |

Downloading a file also answers `206` for part of the file, `304` when the browser already has it, and `416` for a range outside the file, without an error body. See [Download the original](api-documents.md#download-the-original).

---
title: "API overview"
description: "Lore’s interface runs entirely on a REST API, described in OpenAPI. Today it covers the setup, sign-in, the account, the administration of the organization, spaces, documents, search and the audit log."
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
- **Administration**: `/api/v1/admin/organization`, `/api/v1/admin/members`, `/api/v1/admin/invitations`, `/api/v1/admin/storage` and `/api/v1/admin/audit` (and its export, `/export`), for owners and administrators only. An owner or an administrator who becomes a member (`PATCH /api/v1/admin/members/{id}`), is disabled (`POST /api/v1/admin/members/{id}/disable`) or is removed (`DELETE /api/v1/admin/members/{id}`) loses the invitations and reset links they created that are still pending: they are revoked, and their number is given in the details of the operation in the audit log (`revokedLinks`, in `details`), when there are any.
- **Spaces**: `/api/v1/spaces`, and for each space its folders (`/{spaceId}/folders`) and its members (`/{spaceId}/members`).
- **Documents**: `/api/v1/spaces/{spaceId}/documents`, `/api/v1/documents/{id}` and its actions, the content and the file of each version (`/versions/{number}/rendering` and `/versions/{number}/file`), `/api/v1/documents/recent`, `/api/v1/activity`, `/api/v1/imports/limits` and `/api/v1/imports/attention`. See [Documents](api-documents.md).
- **Search**: `GET /api/v1/search` and, for the palette, `GET /api/v1/search/titles`.

## Authentication

The API uses the same session as the interface: `POST /api/v1/auth/login` opens it and keeps it in a cookie. Requests that change something (`POST`, `PUT`, `PATCH`, `DELETE`) must also send the CSRF token back: Lore puts it in the `XSRF-TOKEN` cookie, and the request returns it in the `X-XSRF-TOKEN` header. When `LORE_PUBLIC_URL` uses HTTPS, the cookies are named `__Host-XSRF-TOKEN` and `__Host-LORE_SESSION`: a script that reads the `XSRF-TOKEN` cookie must also accept the prefixed name.

```sh title="Example with curl"
# 1. Receive the CSRF token cookie (`__Host-XSRF-TOKEN` when `LORE_PUBLIC_URL` uses HTTPS, otherwise `XSRF-TOKEN`)
curl -c cookies.txt https://lore.example.com/api/v1/session
# 2. Sign in, with the value of this cookie read from cookies.txt
curl -b cookies.txt -c cookies.txt -X POST https://lore.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" -H "X-XSRF-TOKEN: <token>" \
  -d '{"email": "wilfried.kouakou@dada.group", "password": "<password>"}'
# 3. Call the API
curl -b cookies.txt https://lore.example.com/api/v1/account
```

Personal access tokens, for scripts and integrations, are planned after version 0.1.

## Pagination

Paginated lists (members, documents of a space, versions of a document) accept `page` (starting at 0) and `size` (50 by default, 200 at most):

```json title="Response"
{
  "items": [ … ],
  "page": 0,
  "size": 50,
  "total": 128
}
```

The audit log and the activity of a document move forward by cursor (`before`, `next`); search has its own limits; the other lists are returned whole.

## Errors

Errors use the `application/problem+json` format, with a stable `code` field: rely on it rather than on the message.

| HTTP status | Examples of `code` | Meaning |
| --- | --- | --- |
| 400 | `invalid_request` | Invalid request. The `errors` field lists the fields involved, each with its own code, for example `invalid_email`, `password_min_length` or `common_words_only` |
| 401 | `unauthenticated`, `invalid_credentials` | No open session, or credentials refused |
| 403 | `admin_only`, `owner_only`, `contributor_only`, `maintainer_only`, `maintainer_or_owner_only`, `account_disabled`, `csrf`, `forbidden` | Action reserved for another role, sign-in of a disabled account, or CSRF token missing or expired |
| 404 | `not_found`, `invalid_link` | Not found, or an expired invitation or reset link |
| 409 | `last_owner`, `own_account`, `setup_done`, `space_archived`, `document_archived`, `same_content`, `folder_not_empty`, `not_retryable`, `extraction_pending`, `no_rendering`, `last_maintainer`, `already_space_member`, `account_disabled`, `setup_required` | The action conflicts with the current state, for example removing the last owner or the last maintainer of a space, creating a reset link for a disabled account, signing in before the initial setup, or reading the content of a document still being extracted |
| 410 | `file_missing` | The file of a document cannot be found on the server’s disk |
| 413 | `file_too_large` | The file is over the maximum size, given in megabytes in `maxMegabytes` |
| 415 | `unsupported_media_type` | The body must be JSON |
| 429 | `login_locked`, `too_many_searches`, `export_running` | Too many failed sign-ins, wrong current passwords on `PUT /api/v1/account/email` and `PUT /api/v1/account/password` included: try again after the lockout; two of your searches are already running; or one of your exports of the audit log |
| 500 | `server_error` | Unexpected error: the details are in the server logs, not in the response |
| 503 | `search_timeout`, `server_busy` | The search went beyond 5 seconds: make it more precise; or a password computation waited its turn more than 10 seconds, at sign-in, at the initial setup, when accepting an invitation, at a password reset or in *My account* |
| 507 | `storage_full` | Less than 100 MB would be left free on the server’s disk |

Downloading a file also answers `206` for part of the file, `304` when the browser already has it, and `416` for a range outside the file, without an error body. See [Download the original](api-documents.md#download-the-original).

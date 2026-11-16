---
title: "Documents"
description: "List, import, read, update, move, restrict and delete documents through the API, and follow the extraction of their text."
---

These routes follow the rules described in the [API overview](api.md): the session and CSRF token of the interface, and errors in the `application/problem+json` format.

- A space or a document you cannot see answers `404`, as if it did not exist.
- On a document you can see, an action your role does not allow answers `403`, with the code `contributor_only`, `maintainer_only` or `maintainer_or_owner_only`.
- An archived space refuses any change: `409 space_archived`.

## List the documents of a space

`GET /api/v1/spaces/{spaceId}/documents`

Returns a page of the documents of the space that you can see, grouped by folder (those without a folder first), then from the most recent to the oldest.

| Parameter | Description |
| --- | --- |
| `folder` | A folder’s identifier, or `none` for the documents without a folder |
| `restricted` | `true` for restricted documents only, `false` for the others |
| `ids` | Given documents, 100 at most, for instance to follow their extraction |
| `page`, `size` | Pagination: 50 per page by default, 200 at most |

```json title="Response 200"
{
  "items": [
    {
      "id": "0193a7c2-…",
      "title": "Restore a PostgreSQL database from a backup",
      "folderId": "…",
      "category": "RUNBOOK",
      "status": "PUBLISHED",
      "restricted": false,
      "owner": { "id": "…", "displayName": "Amenan Souaga" },
      "updatedAt": "2026-11-16T09:12:52Z",
      "version": 1,
      "filename": "restore-pg.md",
      "mediaType": "text/markdown",
      "sizeBytes": 18342,
      "extractionStatus": "INDEXED",
      "extractionError": null,
      "language": "en",
      "pageCount": null,
      "sectionCount": 6
    }
  ],
  "page": 0,
  "size": 50,
  "total": 9
}
```

## Count the documents of a space

`GET /api/v1/spaces/{spaceId}/documents/summary`

Counts the documents of the space that you can see: in all, being extracted, scanned, failed, and by folder (`folderId` set to `null` for those without a folder).

```json title="Response 200"
{
  "total": 9,
  "inProgress": 1,
  "scanned": 1,
  "failed": 0,
  "folders": [
    { "folderId": null, "count": 2 },
    { "folderId": "…", "count": 7 }
  ]
}
```

## Import a document

`POST /api/v1/spaces/{spaceId}/documents`

One file per request, as `multipart/form-data`. Reserved for the space’s contributors and maintainers.

| Field | Description |
| --- | --- |
| `file` | The file: PDF, Word (`.docx`), Markdown or text. Required. |
| `folderId` | Its folder in the space. Left out: at the root of the space. |
| `status` | `DRAFT` (the default) or `PUBLISHED` |
| `category` | One of the categories below. Left out: no category. |
| `restricted` | `true` to show it only to the people chosen, the space’s maintainers and its owner |
| `userIds` | The people chosen, members of the space: their identifiers separated by commas, or the field repeated. A request holds at most 50 fields: beyond about forty people, separate them with commas. |

```sh title="Request"
curl -b cookies.txt -X POST https://lore.example.com/api/v1/spaces/{spaceId}/documents \
  -H "X-XSRF-TOKEN: <token>" \
  -F file=@restore-pg.md \
  -F folderId=… \
  -F status=DRAFT \
  -F category=RUNBOOK
```

The CSRF token goes in the `X-XSRF-TOKEN` header: Lore does not look for it among the form fields, so as to refuse a request without a token before reading its file. Likewise, a request larger than the maximum size plus 1 MB is refused with `413` from its `Content-Length` header, without being read.

The `201` response returns the document, in the same shape as [Read a document](#read-a-document), with `extractionStatus` set to `PENDING`: extraction continues in the background. If a document of the space that you can see has the same content, `duplicateOf` names it (`id` and `title`); the file is imported anyway.

| HTTP status | `code` | Cause |
| --- | --- | --- |
| 400 | `invalid_request` | A field to correct, listed in `errors` (below) |
| 403 | `contributor_only` | You are a reader of this space |
| 409 | `space_archived` | The space is archived |
| 413 | `file_too_large` | The file is over the maximum size; the response gives it in megabytes in `maxMegabytes` |
| 507 | `storage_full` | Less than 100 MB would be left free on the server’s disk |

| Field | Error codes |
| --- | --- |
| `file` | `required`; `empty_file`; `unsupported_format`, with the accepted extensions; `legacy_word` for a `.doc`; `content_mismatch` when the content does not match the extension |
| `folderId` | `unknown_folder`, also for a folder of another space |
| `status`, `category` | `invalid_value` |
| `userIds` | `not_space_member` |

### Categories

| Code | Category |
| --- | --- |
| `RUNBOOK` | Runbook |
| `OPERATING_PROCEDURE` | Operating procedure |
| `INCIDENT_REPORT` | Incident report |
| `SECURITY` | Security documentation |
| `VENDOR` | Vendor documentation |
| `ARCHITECTURE` | Architecture documentation |
| `TECHNICAL` | Technical documentation |

## Read a document

`GET /api/v1/documents/{id}`

Returns the document, its current version and what you may do with it (`actions`), so that only what is allowed is shown.

```json title="Response 200"
{
  "id": "0193a7c2-…",
  "title": "Restore a PostgreSQL database from a backup",
  "description": null,
  "category": "RUNBOOK",
  "status": "PUBLISHED",
  "restricted": false,
  "space": { "id": "…", "name": "Infrastructure", "slug": "infrastructure", "color": "#13705E" },
  "folder": { "id": "…", "name": "Runbooks" },
  "owner": { "id": "…", "displayName": "Amenan Souaga" },
  "createdAt": "2026-11-16T09:12:40Z",
  "updatedAt": "2026-11-16T09:12:52Z",
  "currentVersion": {
    "id": "…",
    "number": 1,
    "filename": "restore-pg.md",
    "mediaType": "text/markdown",
    "sizeBytes": 18342,
    "language": "en",
    "pageCount": null,
    "sectionCount": 6,
    "extractionStatus": "INDEXED",
    "extractionError": null,
    "textTruncated": false,
    "extractedAt": "2026-11-16T09:12:52Z",
    "createdAt": "2026-11-16T09:12:40Z",
    "author": { "id": "…", "displayName": "Amenan Souaga" }
  },
  "actions": { "edit": true, "delete": true, "manageAccess": true, "retry": false },
  "duplicateOf": null
}
```

| Field | Values |
| --- | --- |
| `extractionStatus` | `PENDING` (in progress), `INDEXED`, `SCANNED` or `FAILED` |
| `extractionError` | For a failure: `encrypted`, `corrupt`, `unsupported_content` (final), `timeout`, `extractor_crashed`, `file_missing` (passing). See [Storage and extraction](storage.md#failures-and-new-attempts). |
| `language` | `fr`, `en` or `other`, once the text is extracted |
| `pageCount` | The number of pages of a PDF |
| `sectionCount` | The number of passages the text was split into |
| `textTruncated` | `true` if the text was over 10 million characters and was cut |
| `owner`, `author` | `null` for someone who left the organization |

## Update a document

`PATCH /api/v1/documents/{id}`

Changes the title (200 characters at most), the description (2,000) or the category. A field left out does not change; an empty description or category is removed. Reserved for the space’s contributors and maintainers. Returns the document.

```json title="Request body"
{
  "title": "Restore a PostgreSQL database",
  "description": "Procedure tested on PostgreSQL 18.",
  "category": "RUNBOOK"
}
```

Field errors: `title` (`required`, `too_long`), `description` (`too_long`), `category` (`invalid_value`).

## Move a document

`POST /api/v1/documents/{id}/move`

Puts the document in another folder of its space, or at its root with `null`. Reserved for the space’s contributors and maintainers. Returns the document.

```json title="Request body"
{ "folderId": "…" }
```

Field error: `folderId` (`unknown_folder`).

## Delete a document

`DELETE /api/v1/documents/{id}`

Permanently deletes the document, its versions, its text and its access, then its file if no other document of the organization uses it. Reserved for the space’s maintainers, and for the person who imported it as long as it has a single version (`403 maintainer_only` otherwise). Answers `204`.

## Retry the extraction

`POST /api/v1/documents/{id}/extraction/retry`

After a failure with a passing cause (`timeout`, `extractor_crashed`, `file_missing`), puts the document back in the extraction queue; it returns to `PENDING`. Reserved for the space’s contributors and maintainers. For a final cause, or a document that did not fail: `409 not_retryable`.

## Access to a document

`GET /api/v1/documents/{id}/access`

Tells whether the document is restricted and, if it is, who sees it and why: `chosen` (a person chosen), `maintainer` (a maintainer of the space), `owner` (the document’s owner). The organization’s owners and administrators also see the document, but are only listed under one of these reasons.

```json title="Response 200"
{
  "restricted": true,
  "spaceMembers": 5,
  "people": [
    { "id": "…", "displayName": "Elfried Yaba", "email": "elfried.yaba@dada.group", "reasons": ["chosen"] },
    { "id": "…", "displayName": "Christ Koffi", "email": "christ.koffi@dada.group", "reasons": ["chosen", "owner"] },
    { "id": "…", "displayName": "Amenan Souaga", "email": "amenan.souaga@dada.group", "reasons": ["maintainer"] }
  ]
}
```

`PUT /api/v1/documents/{id}/access`

Restricts the document to the people chosen, members of the space, or opens it to the whole space again with `restricted` set to `false`, which removes the people chosen. Without `userIds`, a document that is already restricted keeps its people chosen. Reserved for the space’s maintainers and the document’s owner (`403 maintainer_or_owner_only` otherwise). Returns the same shape as `GET`.

```json title="Request body"
{ "restricted": true, "userIds": ["…", "…"] }
```

Field error: `userIds` (`not_space_member`).

## Import limits

`GET /api/v1/imports/limits`

The maximum size in force and the accepted extensions, to check the files before uploading them.

```json title="Response 200"
{ "maxMegabytes": 50, "maxBytes": 52428800, "extensions": ["pdf", "docx", "md", "markdown", "txt"] }
```

## Imports to follow

`GET /api/v1/imports/attention`

The documents you imported and can still see whose extraction is in progress or failed, most recent first, 20 at most. Each with `id`, `title`, `space` (`id`, `name`, `slug`, `color`), `extractionStatus` and `extractionError`.

## Storage and import (administration)

`GET /api/v1/admin/storage`

Reserved for owners and administrators (`403 admin_only`). Returns the stored volume (`usedBytes`, each content counted once) and the free space (`freeBytes`), the number of documents (`documents`, `inProgress`, `scanned`, `failed`), the maximum size in force (`maxUploadMegabytes`), the server’s ceiling (`maxUploadCeilingMegabytes`) and the default size (`defaultMaxUploadMegabytes`), the accepted extensions, the state of the extraction (`extraction`: `active`, `workers` and the cause of a failure in `problem`) and the folder of the files (`filesPath`).

`PATCH /api/v1/admin/storage`

Changes the maximum size of a file, in megabytes, from 1 up to the ceiling set by `LORE_MAX_UPLOAD_SIZE`. Returns the same shape as `GET`.

```json title="Request body"
{ "maxUploadMegabytes": 100 }
```

Field error: `maxUploadMegabytes` (`out_of_range`, with `min` and `max`).

## Spaces and folders

- `GET /api/v1/spaces` and the routes that return a space give, in `documentCount`, the number of its documents that you can see.
- `DELETE /api/v1/spaces/{spaceId}/folders/{folderId}` answers `409 folder_not_empty` as long as the folder holds a document, even a restricted one you cannot see.

---
title: "Documents"
description: "List, read, import and update documents through the API."
---

## List the documents of a space

`GET /api/v1/spaces/{spaceId}/documents`

Returns a paginated list.

| Parameter | Description |
| --- | --- |
| `folder` | A folder’s identifier |
| `status` | `DRAFT`, `PUBLISHED`, `OBSOLETE` or `ARCHIVED` |
| `page`, `size` | Pagination |

## Read a document

`GET /api/v1/documents/{id}`

Returns the document’s metadata and its current version.

```json title="Response 200"
{
  "id": "d7c1f1e2-…",
  "title": "Restore a PostgreSQL database from a backup",
  "space": { "id": "…", "name": "Infrastructure" },
  "folder": { "id": "…", "name": "Runbooks" },
  "status": "PUBLISHED",
  "category": "Runbook",
  "owner": { "id": "…", "name": "Amenan Souaga" },
  "restricted": false,
  "language": "en",
  "currentVersion": {
    "number": 4,
    "filename": "restore-pg.md",
    "mediaType": "text/markdown",
    "sizeBytes": 18342,
    "extractionStatus": "INDEXED",
    "createdAt": "2026-11-10T18:04:12Z"
  }
}
```

## Import a document

`POST /api/v1/spaces/{spaceId}/documents`

The file is sent as `multipart/form-data`.

```sh title="Request"
curl https://lore.example.com/api/v1/spaces/{spaceId}/documents \
  -H "Authorization: Bearer <token>" \
  -F file=@restore-pg.md \
  -F folderId=… \
  -F status=DRAFT \
  -F category=Runbook
```

The `201` response returns the document, with `extractionStatus` set to `PENDING`: extraction continues in the background.

## Add a version

`POST /api/v1/documents/{id}/versions`

Sends a new file, with a note describing the change.

```sh title="Request"
curl https://lore.example.com/api/v1/documents/{id}/versions \
  -H "Authorization: Bearer <token>" \
  -F file=@restore-pg.md \
  -F note="Add the Common errors section"
```

## Update the metadata

`PATCH /api/v1/documents/{id}`

Changes the title, status, category or owner.

```json title="Request body"
{
  "status": "OBSOLETE",
  "replacedBy": "a41b…"
}
```

## Download a file

`GET /api/v1/documents/{id}/versions/{number}/file`

Returns the file exactly as it was imported, with its original content type.

---
title: "Documents"
description: "List, import, read, download, update, move, restrict and delete documents through the API, import their new versions, change their status and owner, follow the extraction of their text and their activity, and read the audit log."
---

These routes follow the rules described in the [API overview](api.md): the session and CSRF token of the interface, and errors in the `application/problem+json` format.

- A space or a document you cannot see answers `404`, as if it did not exist.
- On a document you can see, an action your role does not allow answers `403`, with the code `contributor_only`, `maintainer_only` or `maintainer_or_owner_only`.
- An archived space refuses any change: `409 space_archived`.
- An archived document refuses any change but the change of its status and its deletion: `409 document_archived`.

## List the documents of a space

`GET /api/v1/spaces/{spaceId}/documents`

Returns a page of the documents of the space that you can see, grouped by folder (those without a folder first), then in the order asked: by default, from the most recent to the oldest.

| Parameter | Description |
| --- | --- |
| `folder` | A folder’s identifier, or `none` for the documents without a folder |
| `restricted` | `true` for restricted documents only, `false` for the others |
| `ids` | Given documents, 100 at most, for instance to follow their extraction |
| `status` | The statuses wanted, one or several: `DRAFT`, `PUBLISHED`, `OBSOLETE`, `ARCHIVED`. Without `status`, the archived documents are left out; with `ARCHIVED`, you only receive those you see, as a maintainer of the space, an owner or an administrator |
| `sort` | The order within each folder: `updated` (date of the last update, the default), `title`, `category`, `status` or `size` (size of the file) |
| `direction` | `asc` or `desc`; by default, `desc` for `updated` and `asc` for the others |
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
      "sectionCount": 6,
      "newerVersion": null
    }
  ],
  "page": 0,
  "size": 50,
  "total": 9
}
```

`newerVersion` describes a version imported after the current one, being extracted or failed: `number`, `extractionStatus`, `extractionError` and `createdAt`; `null` when the latest version is the current one.

Field errors: `folder`, `sort`, `direction` and `status` (`invalid_value`), `ids` (`too_many`).

## Count the documents of a space

`GET /api/v1/spaces/{spaceId}/documents/summary`

Counts the documents of the space that you can see: in all, being extracted, scanned, failed, and by folder (`folderId` set to `null` for those without a folder). Archived documents are counted apart, in `archived`, and nowhere else: neither in `total`, nor in the folders, nor in the `documentCount` of the space. `archived` is 0 for whoever does not see them.

```json title="Response 200"
{
  "total": 9,
  "inProgress": 1,
  "scanned": 1,
  "failed": 0,
  "archived": 1,
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
  "statusChangedAt": "2026-11-16T09:12:40Z",
  "replacedBy": null,
  "restricted": false,
  "space": { "id": "…", "name": "Infrastructure", "slug": "infrastructure", "color": "#13705E" },
  "folder": { "id": "…", "name": "Runbooks" },
  "owner": { "id": "…", "displayName": "Amenan Souaga" },
  "createdAt": "2026-11-16T09:12:40Z",
  "updatedAt": "2026-11-16T09:12:52Z",
  "versionCount": 1,
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
    "author": { "id": "…", "displayName": "Amenan Souaga" },
    "sha256": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    "fileAvailable": true,
    "note": null,
    "changeRatio": 1
  },
  "newerVersion": null,
  "actions": {
    "edit": true, "delete": true, "manageAccess": true, "retry": false, "changeOwner": true,
    "newVersion": true, "changeStatus": true, "archive": false
  },
  "duplicateOf": null
}
```

| Field | Values |
| --- | --- |
| `extractionStatus` | `PENDING` (in progress), `INDEXED`, `SCANNED` or `FAILED` |
| `extractionError` | For a failure: `encrypted`, `corrupt`, `unsupported_content` (final), `timeout`, `extractor_crashed`, `file_missing` (passing). See [Storage and extraction](storage.md#failures-and-new-attempts). |
| `language` | `fr`, `en` or `other`: detected once the text is extracted, or chosen by a contributor |
| `pageCount` | The number of pages of a PDF |
| `sectionCount` | The number of passages the text was split into |
| `textTruncated` | `true` if the text was over 10 million characters and was cut |
| `owner`, `author` | `null` for someone who left the organization |
| `sha256` | The SHA-256 fingerprint of the file, to compare it with a copy |
| `fileAvailable` | `false` if the file cannot be found on the server’s disk: its download then answers `410 file_missing` |
| `statusChangedAt` | Since when the document has its status; for a document imported before version 0.1.0-beta.1, its creation date |
| `replacedBy` | For an outdated document, the one that replaces it (`id` and `title`); `null` when there is none, or when you cannot read it: neither its title nor its identifier is given to you |
| `versionCount` | The number of versions of the document |
| `note` | What changes, written at the import of the version; `null` for the first one |
| `changeRatio` | How much the version changed, from 0 to 1: the share of passages added or removed from the previous version. 1 for the first version, `null` when unknown (scanned document, failure) |
| `newerVersion` | A version imported after the current one, being extracted or failed: `number`, `extractionStatus`, `extractionError`, `createdAt` and `author`; `null` otherwise |
| `actions` | What you may do: `edit`, `delete`, `manageAccess`, `retry`, `changeOwner`, `newVersion` (import a new version), `changeStatus` and `archive` (archive the document, or take it out of Archived) |

| Parameter | Description |
| --- | --- |
| `version` | The number of an older version, opened in its own page: the view recorded is of that version, once an hour and per document |

Each call records a view in the audit log, with the number of the version shown, once an hour at most for the same person and the same document, never for a `404` response.

## Read the content of a version

`GET /api/v1/documents/{id}/versions/{number}/rendering`

Returns the content of a Markdown, Word or text document, laid out and cleaned, as the page of the document shows it. A very long document is split into parts of about 500,000 characters: the response gives one at a time.

| Parameter | Description |
| --- | --- |
| `part` | The part wanted, from 1 |
| `anchor` | An anchor, such as `h-7` or `part-3`: the response gives the part that holds it. An anchor the document does not have gives the first part. |
| `outline` | `false` not to receive the outline; `true` by default |
| `fromVersion` | With `anchor`: the number of the version the anchor was made for, for instance a link copied before a new version. The response gives the part that holds the section of the same title in this version, and its anchor in `anchor`; `null` when the section no longer exists. A title found several times is matched by its rank. |

Without `part` or `anchor`, the response gives the first part.

```json title="Response 200"
{
  "number": 1,
  "renderer": 1,
  "part": 1,
  "partCount": 1,
  "truncated": false,
  "anchor": "h-7",
  "outline": [
    { "anchor": "h-1", "level": 1, "title": "Restore a PostgreSQL database from a backup", "part": 1 },
    { "anchor": "h-5", "level": 2, "title": "4. Check the restore", "part": 1 },
    { "anchor": "h-6", "level": 3, "title": "4.1 Checks", "part": 1 },
    { "anchor": "h-7", "level": 3, "title": "4.2 Common errors", "part": 1 }
  ],
  "html": "<section id=\"h-1\"><h2>Restore a PostgreSQL database from a backup</h2>…"
}
```

| Field | Values |
| --- | --- |
| `number` | The number of the version |
| `renderer` | The number of the rendering rules |
| `part`, `partCount` | The part returned, and the number of parts of the document |
| `truncated` | `true` if the content stops before the end of the document |
| `outline` | The headings of the whole document: anchor, level from 1 to 6, text and the part that holds it; `null` with `outline=false` |
| `html` | The part, as cleaned HTML: one `section` per heading (`h-7`) or per part of a text (`part-3`) |
| `anchor` | The place shown: the anchor asked, or the section of the same title found with `fromVersion`; `null` when there is none |

The response carries an `ETag` and `Cache-Control: private, no-cache`: content already received is not sent again (`304`), but access is checked at each request.

| HTTP status | `code` | Cause |
| --- | --- | --- |
| 400 | `invalid_request` | `part` (`out_of_range`, with `min` and `max`) |
| 404 | `not_found` | The document, or this version, does not exist for you |
| 409 | `extraction_pending` | The text of the version is being extracted |
| 409 | `no_rendering` | A PDF, which shows from its file, a failed extraction, or a version without laid-out content, for example a Word document whose layout could not be read |

## Download the original

`GET /api/v1/documents/{id}/versions/{number}/file`

Returns the file of the version as it was imported, to everyone who sees the document, readers included. `HEAD` gives the same headers, without the file.

| Parameter | Description |
| --- | --- |
| `disposition` | `attachment` (the default) to save it, or `inline` to show it, accepted for a PDF only |

```http title="Response 200"
HTTP/1.1 200
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Length: 1258291
Content-Disposition: attachment; filename="Disaster recovery plan 2026.docx"; filename*=UTF-8''Disaster%20recovery%20plan%202026.docx
ETag: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
Last-Modified: Mon, 16 Nov 2026 09:12:40 GMT
Cache-Control: private, no-cache
Accept-Ranges: bytes
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'none'; sandbox
```

- **Name.** The original name, in two forms: `filename` in ASCII, accents removed and other characters replaced with `_`, and `filename*` in UTF-8.
- **Type.** The one Lore established at import, never the one announced by the browser.
- **`ETag`.** The SHA-256 fingerprint of the file, the same as `currentVersion.sha256`.
- **Cache.** The browser may keep the file, but asks again at each opening: access that was withdrawn answers `404`, never `304`.
- **Ranges.** `Range` and `If-Range` are honored: a range is served only if `If-Range` names the same file, otherwise the whole file is sent. It is never compressed, not even a text file.

| HTTP status | `code` | Cause |
| --- | --- | --- |
| 200 | | The whole file |
| 206 | | The range or ranges asked by `Range` |
| 304 | | The browser already has this file (`If-None-Match`) |
| 400 | `invalid_request` | `disposition` (`invalid_value`), also for `inline` on a format other than PDF |
| 404 | `not_found` | The document, or this version, does not exist for you |
| 410 | `file_missing` | The file cannot be found on the server’s disk |
| 416 | | A range outside the file, with `Content-Range: bytes */<size>` |

Each download records an event in the audit log, with the name and size of the file. A `HEAD` request, a range that does not start at the first byte (the resumption of a download) and `disposition=inline` record none.

## Recent documents

`GET /api/v1/documents/recent`

The documents you opened last and still see, from the most recent to the oldest: 3 by default, up to 10 with `size`. Each with `id`, `title`, `space` (`id`, `name`, `slug`, `color`), `folder` (`id` and `name`, or `null`), `status` and `viewedAt`, the time of the view. A document deleted, or one you no longer see, is not listed.

Field error: `size` (`out_of_range`, with `min` and `max`).

## Update a document

`PATCH /api/v1/documents/{id}`

Changes the title (200 characters at most), the description (2,000), the category or the language. A field left out does not change; an empty description or category is removed. Reserved for the space’s contributors and maintainers. Returns the document.

```json title="Request body"
{
  "title": "Restore a PostgreSQL database",
  "description": "Procedure tested on PostgreSQL 18.",
  "category": "RUNBOOK",
  "language": "en"
}
```

- **Language.** `language` is `fr`, `en` or `other`. Changing it indexes the document again for search at once, in the same request; the language chosen is kept if the same version is extracted again. While the text is being extracted, the language cannot be changed: `409 extraction_pending`.
- **Audit log.** Each change records `document.updated`, with the fields changed in `changes`; for the language, the former one in `previousLanguage`.

Field errors: `title` (`required`, `too_long`), `description` (`too_long`), `category` and `language` (`invalid_value`). An archived document: `409 document_archived`.

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

After a failure with a passing cause (`timeout`, `extractor_crashed`, `file_missing`), puts the latest version back in the extraction queue: the current version, or a new version that failed; it returns to `PENDING`. Reserved for the space’s contributors and maintainers. For a final cause, or a version that did not fail: `409 not_retryable`.

## Import a new version

`POST /api/v1/documents/{id}/versions`

Sends the file of a new version, as an import does: a `multipart/form-data` form, with the same checks and the same errors on the file. Reserved for the space’s contributors and maintainers. Answers `201` with the document: `newerVersion` describes the new version, being extracted; the current version does not change yet.

| Field | Description |
| --- | --- |
| `file` | The file: PDF, Word (.docx), Markdown or text. The format may change from one version to the next. |
| `note` | What changes, 500 characters at most; optional |
| `status` | `DRAFT` or `PUBLISHED`: the status the document takes when the version becomes the current one; left out, it does not change |

- **Number.** The largest number of the document plus one: two files sent at once receive two different numbers.
- **Current version.** The new version becomes the current one once its text is extracted, at once, for reading as for search. If a later version became current in the meantime, it stays in the history. After a failure, the current version does not change: see [Retry the extraction](#retry-the-extraction).
- **Status.** The status asked applies then, unless the status of the document changed since the version was imported, or the document is archived; it is recorded in the audit log in the name of the person who imported the version.
- **Language.** A language chosen by hand on the current version is taken over by the new version.
- **Audit log.** `document.version_imported`, with `version`, `previous` (the number of the current version), `filename`, `size` and `status`; the note is not copied.

| HTTP code | `code` | Cause |
| --- | --- | --- |
| 400 | `invalid_request` | `file` (as for an import), `note` (`too_long`), `status` (`invalid_value`) |
| 409 | `same_content` | The file is the same as the one of the latest version, current, in progress or failed; `version` gives its number. The same as an older version, it is accepted: it is a way back. |
| 409 | `document_archived` | The document is archived |
| 413 | `file_too_large` | The file is over the largest size |
| 507 | `storage_full` | The server’s disk is full |

## Versions of a document

`GET /api/v1/documents/{id}/versions`

The versions of the document, the latest first, by pages (`page`, `size`: 50 by default, 200 at most), for anyone who sees the document. Each in the shape of `currentVersion`: `number`, `createdAt`, `author`, `note`, `changeRatio`, `extractionStatus`, `extractionError`, `filename`, `mediaType`, `sizeBytes`, `sha256`, `pageCount`, `sectionCount`, `language`, `fileAvailable`.

`GET /api/v1/documents/{id}/versions/{number}`

One version, in the same shape; `404` for a number the document does not have. Its content is read with `/rendering` and its file downloaded with `/file`, under the same number. The passages of a version that is no longer the current one are deleted: search does not find it.

## Change the status

`PUT /api/v1/documents/{id}/status`

```json title="Request body"
{ "status": "OBSOLETE", "replacedBy": "…" }
```

- **Who.** The space’s contributors and maintainers move a document between Draft, Published and Outdated. Archiving is reserved for the maintainers of the space, the owners and the administrators: `403 maintainer_only` otherwise. An archived document is seen by them only: it answers `404` to the others, for leaving Archived as for the rest.
- **Replacement.** For Outdated only, optional: a document you can read, in any of your spaces. Neither the document itself, nor an outdated or archived one. Leaving Outdated removes the replacement; deleting the replacement removes it too.
- **Date.** `statusChangedAt` changes with the status only. Without a change of status or of replacement, nothing is done; a document that stays outdated may change its replacement.
- **Audit log.** `document.status_changed`, with `before`, `after`, `replacedBy` and `replacedByTitle`.

Returns the document. Field errors: `status` (`invalid_value`), `replacedBy` (`unknown_document`, also for a document you cannot read; `not_replaceable`).

## Activity of a document

`GET /api/v1/documents/{id}/activity`

What was done to the document, the latest first, for anyone who sees it: imports and new versions, changes of status, access, owner, folder, title, description, category and language. Never its views nor its downloads.

| Parameter | Description |
| --- | --- |
| `before` | The cursor `next` of the previous page |
| `size` | 20 by default, 50 at most |

```json title="Response 200"
{
  "items": [
    {
      "id": 4182,
      "occurredAt": "2026-11-17T15:12:00Z",
      "actor": { "id": "…", "displayName": "Hervé Coulibaly" },
      "action": "document.status_changed",
      "details": { "before": "PUBLISHED", "after": "OBSOLETE", "replacedBy": { "id": "…", "title": "Restore a PostgreSQL database from a backup" } }
    }
  ],
  "next": "1794928320000000-4182"
}
```

The details only give what you may know: the number of people chosen for an access (`added`, `removed`), not who; the replacement of an outdated document only if you can read it. `actor` is `null` for an operation of the server. Field errors: `before` (`invalid_value`), `size` (`out_of_range`).

## Recent activity

`GET /api/v1/activity`

The 8 latest imports, new versions and changes of status of the documents you see, archived ones left out: for *Recent activity in your spaces*, on the home page. The response is an array, each item with `id`, `occurredAt`, `actor`, `action`, `document` (`id`, `title`), `space` and `details` (`version`, `before`, `after`).

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

## Change the owner

`PUT /api/v1/documents/{id}/owner`

Hands the document over to another active member of the space who has at least the Contributor role. Reserved for the space’s maintainers and the document’s owner, if they are at least a contributor (`403 maintainer_or_owner_only` otherwise). Returns the document.

```json title="Request body"
{ "userId": "…" }
```

For a restricted document, the new owner sees it. The former owner no longer sees it, unless they are among the people chosen, a maintainer of the space, or an owner or administrator of the organization: otherwise, the response then has all its `actions` set to `false`, and the document answers `404` afterwards.

Field error: `userId` (`required`; `not_space_member`, also for a deactivated account; `not_contributor`).

## Import limits

`GET /api/v1/imports/limits`

The maximum size in force and the accepted extensions, to check the files before uploading them.

```json title="Response 200"
{ "maxMegabytes": 50, "maxBytes": 52428800, "extensions": ["pdf", "docx", "md", "markdown", "txt"] }
```

## Imports to follow

`GET /api/v1/imports/attention`

The versions you imported, first imports and new versions of documents you can still see, whose extraction is in progress or failed, as long as no later version became the current one; most recent first, 20 at most. Each with the `id` and `title` of the document, `space` (`id`, `name`, `slug`, `color`), `version`, `extractionStatus` and `extractionError`.

## Storage and import (administration)

`GET /api/v1/admin/storage`

Reserved for owners and administrators (`403 admin_only`). Returns the stored volume (`usedBytes`, each content counted once) and the free space (`freeBytes`), the number of documents (`documents`, `inProgress`, `scanned`, `failed`), the maximum size in force (`maxUploadMegabytes`), the server’s ceiling (`maxUploadCeilingMegabytes`) and the default size (`defaultMaxUploadMegabytes`), the accepted extensions, the state of the extraction (`extraction`: `active`, `workers` and the cause of a failure in `problem`) and the folder of the files (`filesPath`).

`PATCH /api/v1/admin/storage`

Changes the maximum size of a file, in megabytes, from 1 up to the ceiling set by `LORE_MAX_UPLOAD_SIZE`. Returns the same shape as `GET`.

```json title="Request body"
{ "maxUploadMegabytes": 100 }
```

Field error: `maxUploadMegabytes` (`out_of_range`, with `min` and `max`).

## Audit log (administration)

`GET /api/v1/admin/audit`

The operations of the organization, the latest first. Reserved for owners and administrators (`403 admin_only`).

| Parameter | Description |
| --- | --- |
| `category` | `view`, `download`, `import`, `status`, `change`, `deletion`, `rights`, `members`, `sign_in`, `organization`, or `other` for an action no category knows |
| `actor` | The identifier of a person, or `system` for the operations of the server |
| `from`, `to` | A period, as ISO 8601 instants (`2026-11-01T00:00:00Z`); `to` excluded |
| `before` | The cursor `next` of the previous page |
| `size` | 50 by default, 200 at most |

```json title="Response 200"
{
  "items": [
    {
      "id": 4182,
      "occurredAt": "2026-11-17T15:12:00Z",
      "actor": { "id": "…", "displayName": "Hervé Coulibaly", "email": "herve.coulibaly@dada.group" },
      "action": "document.status_changed",
      "category": "status",
      "resource": { "type": "document", "id": "…" },
      "ip": "10.0.3.17",
      "details": { "title": "Nightly backups with Barman", "before": "PUBLISHED", "after": "OBSOLETE" }
    }
  ],
  "next": "1794928320000000-4182"
}
```

`actor` is `null` for an operation of the server; `displayName` and `email` are given for someone who left the organization too. Field errors: `category`, `actor`, `from`, `to`, `before` (`invalid_value`), `size` (`out_of_range`).

`GET /api/v1/admin/audit/export`

The same filters, without `before` or `size`, as CSV (`text/csv`, UTF-8 with a byte order mark, RFC 4180), written as it is read, as the attachment `lore-audit-2026-11-18.csv`. Columns: `occurred_at`, `actor_id`, `actor_name`, `actor_email`, `action`, `category`, `resource_type`, `resource_id`, `title`, `space`, `ip` and `details` (as JSON). A value that starts with `=`, `+`, `-`, `@`, a tab or a carriage return is written after an apostrophe, so that a spreadsheet does not read it as a formula. A value that holds a semicolon or a tab is quoted, like one that holds a comma, a quote or a line break, so that a spreadsheet set for French does not split the cell there. The export itself is recorded in the log (`audit.exported`, with the filters and the number of lines). One export at a time per person: `429 export_running`.

## Spaces and folders

- `GET /api/v1/spaces` and the routes that return a space give, in `documentCount`, the number of its documents that you can see.
- `DELETE /api/v1/spaces/{spaceId}/folders/{folderId}` answers `409 folder_not_empty` as long as the folder holds a document, even a restricted one you cannot see.

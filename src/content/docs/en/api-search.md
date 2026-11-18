---
title: "Search"
description: "API search applies exactly the same access rights and the same syntax as the interface."
---

These routes follow the rules described in the [API overview](api.md): the session of the interface, and errors in the `application/problem+json` format. They are open to every member of the organization, and only cover the documents the signed-in person can read.

## Search

`GET /api/v1/search`

The documents that match `q`, ranked by relevance, outdated documents last, with the excerpt of their best passage, and the values of the filters with their number of documents.

| Parameter | Description |
| --- | --- |
| `q` | The search, with the [syntax of the interface](search.md#syntax): 500 characters and 32 words at most. Required. |
| `space` | One or more spaces, by their identifier |
| `category` | One or more [categories](api-documents.md#categories), such as `RUNBOOK` |
| `status` | One or more statuses: `DRAFT`, `PUBLISHED`, `OBSOLETE` or `ARCHIVED`. Without `status`, the archived documents are left out; with `ARCHIVED`, you only receive those you see, as a maintainer of their space, an owner or an administrator |
| `format` | One or more types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/markdown` or `text/plain` |
| `updated` | `30d` or `12m`: the documents updated in the last 30 days, or in the last 12 months |
| `includeArchived` | `true` to add the documents of the archived spaces you still see |
| `page` | The page, from 0 (the default) to 49 |
| `size` | The number of documents per page: 20 by default, 50 at most |

- **Several values.** Repeat the parameter: `status=DRAFT&status=PUBLISHED`. `category` and `status` also accept lowercase.
- **Spaces.** A space you cannot see gives the same answer as a made-up identifier: no document, without an error. The documents of an archived space are only included with `includeArchived=true`, or when `space` names that space.

First open a session, as in [Authentication](api.md#authentication): a search is a `GET` request, which does not need the CSRF token.

```sh title="Request"
curl -G -b cookies.txt https://lore.example.com/api/v1/search \
  --data-urlencode 'q=pg_restore role "does not exist"' \
  --data-urlencode 'status=PUBLISHED'
```

The response below only shows the first of the three documents found.

```json title="Response 200"
{
  "items": [
    {
      "document": {
        "id": "0193a7c2-…",
        "title": "Restore a PostgreSQL database from a backup",
        "titleHighlights": [[0, 7]],
        "status": "PUBLISHED",
        "category": "RUNBOOK",
        "mediaType": "text/markdown",
        "language": "en",
        "restricted": false,
        "extractionStatus": "INDEXED",
        "updatedAt": "2026-11-16T09:12:52Z",
        "space": { "id": "…", "name": "Infrastructure", "slug": "infrastructure", "archived": false },
        "folder": { "id": "…", "name": "Runbooks" }
      },
      "version": 1,
      "match": "passage",
      "passage": {
        "anchor": "h-7-2",
        "page": null,
        "headings": ["4. Check the restore", "4.2 Common errors"],
        "excerpt": "If pg_restore reports role \"reporting\" does not exist, create the role, then start the import again.",
        "highlights": [[3, 13], [22, 26], [48, 53], [66, 70]]
      },
      "description": null,
      "words": ["Restore", "pg_restore", "role", "exist"],
      "otherPassages": {
        "total": 2,
        "items": [
          { "anchor": "h-3", "page": null, "headings": ["2. Prepare the restore"] },
          { "anchor": "h-6", "page": null, "headings": ["4. Check the restore", "4.1 Checks"] }
        ]
      }
    }
  ],
  "page": 0,
  "size": 20,
  "total": 3,
  "facets": {
    "spaces": [
      { "id": "…", "name": "Infrastructure", "slug": "infrastructure", "archived": false, "count": 2 },
      { "id": "…", "name": "Project Atlas", "slug": "project-atlas", "archived": false, "count": 1 }
    ],
    "categories": [
      { "value": "ARCHITECTURE", "count": 1 },
      { "value": "INCIDENT_REPORT", "count": 1 },
      { "value": "RUNBOOK", "count": 1 }
    ],
    "statuses": [{ "value": "PUBLISHED", "count": 3 }],
    "formats": [
      { "value": "application/pdf", "count": 1 },
      { "value": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "count": 1 },
      { "value": "text/markdown", "count": 1 }
    ]
  }
}
```

| Field | Values |
| --- | --- |
| `total` | The number of documents found, filters included |
| `document` | The document, with its current version: its space (`archived` set to `true` for an archived space) and its folder, or `null`; for an outdated document, `replacedBy` (`id` and `title`) names the one that replaces it, if you can read it, `null` otherwise |
| `version` | The number of the current version, for the link of the passage |
| `match` | What matches: `passage`, `title` or `description` |
| `passage` | The best passage, the one that gathers the most terms: its anchor (`h-7-2`, `page-112`, `part-3`), its page for a PDF, the headings of its sections from the top, its excerpt and its `highlights`. `null` when `match` is `title` or `description` |
| `description` | When `match` is `description`: an excerpt of the description (`text`) and its `highlights`; `null` otherwise |
| `words` | The words found, as written in the title and the excerpt, 20 at most: the ones the reader highlights |
| `otherPassages` | The number of the other passages found in the document (`total`), and the first five, in the order of the document |
| `facets` | Each value present in the results without the filters, with its number of documents. `spaces` names an archived space to those who still see it; `categories`, `statuses` and `formats` only count its documents with `includeArchived=true`. `statuses` gives `ARCHIVED` and its number to whoever sees archived documents; the other filters only count them with `status=ARCHIVED` |

**Positions.** `titleHighlights` and `highlights` mark the words found with `[start, end[` pairs, start included and end excluded, in UTF-16 units, those of JavaScript: an emoji counts for two, an accented letter for one. Two words separated by a single `_`, `-`, `.` or `/` make a single highlight: `pg_restore`.

**Plain text.** No HTML comes out of search: `title`, `excerpt` and `text` are plain text, to be shown as such, never as HTML. A tag written in the text of a document does not show in them.

**Link of a result.** To open the document at the passage found, its words highlighted: `/documents/{id}?from=search&q=…&v={version}#{anchor}`. Without a passage, `/documents/{id}?from=search&q=…` opens the document at the top. See [Open at the right passage](reader.md#open-at-the-right-passage).

| HTTP status | `code` | Cause |
| --- | --- | --- |
| 400 | `invalid_request` | A parameter to correct, listed in `errors` (below) |
| 401 | `unauthenticated` | No open session |
| 429 | `too_many_searches` | Two of your searches are already running on this instance of Lore |
| 503 | `search_timeout` | The search went beyond 5 seconds: make it more precise |

| Field | Error codes |
| --- | --- |
| `q` | `required`; `too_long` and `too_many_words`, with `max`; `common_words_only`, only common words; `exclusions_only`, only words left out |
| `category`, `status`, `format`, `updated` | `invalid_value` |
| `page`, `size` | `out_of_range`, with `min` and `max` |

## Search by title

`GET /api/v1/search/titles`

The search of the palette: the documents you can read whose title has a word that begins with each of the words of `q`, accents and capitals ignored. The documents being extracted are included; archived documents, and those of archived spaces, are not. The ones whose title begins with `q` come first, then the most recently updated.

| Parameter | Description |
| --- | --- |
| `q` | From 1 to 100 characters. Required. |
| `size` | The number of documents: 8 by default, 12 at most |

```sh title="Request"
curl -G -b cookies.txt https://lore.example.com/api/v1/search/titles --data-urlencode 'q=resto'
```

```json title="Response 200"
[
  {
    "id": "0193a7c2-…",
    "title": "Restore a PostgreSQL database from a backup",
    "titleHighlights": [[0, 5]],
    "status": "PUBLISHED",
    "mediaType": "text/markdown",
    "space": { "id": "…", "name": "Infrastructure", "slug": "infrastructure", "archived": false },
    "folder": { "id": "…", "name": "Runbooks" }
  }
]
```

`titleHighlights` marks the beginnings of words that match, in the same units as the search.

Field errors: `q` (`required`; `too_long`, with `max`), `size` (`out_of_range`, with `min` and `max`). As for the search: `429 too_many_searches` and `503 search_timeout`.

## Limits

- **Duration.** A search has 5 seconds: beyond that, `503 search_timeout`.
- **Searches at once.** Two at most per person, on each instance of Lore: beyond that, `429 too_many_searches`. Wait for the answer to a search before starting a third one.
- **Documents browsed.** 1,000 at most, whatever the size of the pages: `page` goes from 0 to 49 with 20 documents a page, from 0 to 19 with 50. Beyond: `page` (`out_of_range`, with `min` and `max`).
- **Ranking.** So that very frequent searches stay fast, the fine ranking, by the passages, only covers the first 200 documents of a first estimate, made from the title and the number of passages found; the following ones keep the order of that estimate. `total` stays exact.
- **API tokens.** Version 0.1 has none: search goes through the session of the interface. Personal access tokens are planned after version 0.1.

No search is recorded in the audit log, nor in the server’s logs. But `q` is part of the address: see [Security and sign-in](security.md#search).

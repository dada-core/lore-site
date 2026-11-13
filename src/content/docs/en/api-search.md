---
title: "Search"
description: "API search applies exactly the same access rights and the same syntax as the interface."
---

## Search

`GET /api/v1/search`

Full-text search in the documents the authenticated person can read.

| Parameter | Description |
| --- | --- |
| `q` | The query, with the [usual syntax](search.md#syntax) |
| `space` | Limit to one or more spaces |
| `status` | Limit to one or more statuses |
| `page`, `size` | Pagination |

```sh title="Request"
curl -G https://lore.example.com/api/v1/search \
  -H "Authorization: Bearer <token>" \
  --data-urlencode 'q=pg_restore role "does not exist"'
```

```json title="Response 200"
{
  "items": [
    {
      "document": { "id": "…", "title": "Restore a PostgreSQL database…", "status": "PUBLISHED" },
      "version": 4,
      "passage": {
        "location": "Section 4.2 › Common errors",
        "excerpt": "If pg_restore reports ERROR: role \"app_rw\" does not exist…",
        "highlights": [[3, 13], [29, 33], [43, 57]]
      },
      "otherPassages": 0
    }
  ],
  "page": 0,
  "size": 50,
  "total": 4
}
```

The `highlights` positions mark the characters to highlight in `excerpt`.

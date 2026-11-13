---
title: "Searching"
description: "Search covers the content of every document you have access to. It opens with Ctrl K, or from the Search page."
---

## Syntax

| Query | Result |
| --- | --- |
| `pg_restore role` | Passages that contain every word |
| `"does not exist"` | The exact phrase |
| `backup -barman` | Leaves out passages that contain “barman” |
| `pg_restore or pg_dump` | Either one |

## What search understands

- **Accents and capitals ignored**: “role” also finds “Rôle”.
- **Word forms**: “servers” finds “server”, in both English and French.
- **Technical identifiers**: `ERR_CONNECTION_REFUSED`, `pg_restore` or a variable name are found exactly as written.

### Document language

Each document’s language is detected on import, English or French in version 0.1. A contributor can correct it: the document is then indexed again.

## Filters and result order

Filter by space, category, status and date. Results are grouped by document and ranked by relevance; a match in the title counts more. Outdated documents come last, with the document that replaces them.

## What never appears

- Documents you have no access to, even partially.
- Documents whose extraction is still running.
- The content of scanned documents: only their title is searchable.

## Search by meaning <span class="vb">v0.2</span>

From version 0.2, search will combine exact word matching and closeness in meaning: “bring a database back online” will also find “restore the billing database”.

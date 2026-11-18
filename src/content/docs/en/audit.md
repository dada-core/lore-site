---
title: "Audit log"
description: "The audit log records the sensitive operations of the whole organization. Owners and administrators browse it and export it as CSV."
---

## What is recorded

Each operation belongs to a category, the one of the filter of the screen:

| Category | Operations |
| --- | --- |
| View | A document opened, or an older version, with its number: once an hour at most for the same person and the same document |
| Download | An original or an older version downloaded, with its number, the name and size of the file |
| Import | A new document, with the name and size of its file, its space, its folder and whether it is restricted; a new version, with its number and the one of the current version at its import, the name and size of the file, and the status asked |
| Status | The status of a document changed, with the former one, the new one and, for an outdated document, the title of its replacement |
| Change | The title, description, category or language of a document changed, with the fields involved; a move from one folder to another |
| Deletion | A document permanently deleted, with its number of versions |
| Rights | A document restricted or opened to the whole space again, people chosen added or removed; the owner of a document changed, with the former and the new one; a role changed, in the organization or in a space |
| Members | An invitation created or revoked; an account joining, leaving, deactivated or activated again; a reset link; a member added to a space or removed |
| Sign-in | A failed sign-in, an account locked; a password or an email address changed; a new password chosen through a reset link |
| Organization | A space created, changed, archived, made active again or deleted, with its number of documents; a folder created, renamed or deleted; a setting changed, such as the maximum size of a file; an export of the log |
| Other | An operation that no other category covers |

A change of language keeps the former one: in the `document.updated` event, `changes` contains `language`, and `previousLanguage` gives the former language. What changes, written with a new version, is not copied into the log: it stays in the history of the document. Text extraction is not recorded.

Searches are never recorded, neither in this log, nor in the server’s logs. Opening a document from a result is a view, recorded like the others. See [Searching](search.md#privacy).

A page opened again or reloaded within the hour adds no view, and a document the person cannot see never records one. Each download is recorded; the resumption of an interrupted download is not, nor is reading a PDF in the page or in a new tab, which is part of the view.

Views and downloads never show on the document: its *Activity* says what was changed, not who read it. Each person only finds their own views, under *Resume*, on their home page.

Each event keeps the title of the document and the name of its space at the time of the action: it remains readable after a deletion.

## Browse

*Administration › Audit log*, reserved to owners and administrators, shows the operations of the whole organization, the latest on top, 50 at a time, then *Show more*. The palette leads there too: *Go to › Audit log*.

| Column | Content |
| --- | --- |
| Date | The day and time of the operation |
| Person | Who acted, named even after they left the organization; *System* for an operation without an author, such as a failed sign-in |
| Category | The category of the operation |
| Operation | A sentence, such as “Imported version 5 of “Disaster recovery plan 2026”” or “Changed the status of “…”: Outdated” |
| IP address | Shown only when *Show the IP address* is ticked |

Three filters narrow the list, and the address of the page keeps them:

- **Category**: one of the categories above, or all of them.
- **Person**: a member of the organization, *System*, or everyone.
- **Period**: the last 7 days, by default, the last 30 days or the last 12 months.

When nothing matches: “No operation with these filters.”

[See it in the demo](https://lore.dada-core.com/en/demo/#/admin/audit)

## Export

*Export as CSV* downloads every operation the filters keep, not only the 50 shown, in a file such as `lore-audit-2026-11-18.csv`. The page stays open during the download.

| Column | Content |
| --- | --- |
| `occurred_at` | The date and time, in UTC, in the ISO 8601 format |
| `actor_id`, `actor_name`, `actor_email` | Who acted; empty for an operation without an author |
| `action` | The operation, such as `document.version_imported` |
| `category` | Its category, such as `import` |
| `resource_type`, `resource_id` | What it applies to, such as a document and its identifier |
| `title`, `space` | The title of the document and the name of its space at the time of the operation |
| `ip` | The IP address |
| `details` | The details of the operation, in JSON |

- **Format.** UTF-8 with a BOM, so that a spreadsheet reads accents; commas, quotes and line ends as RFC 4180 sets them.
- **Formulas neutralized.** A value that starts with `=`, `+`, `-` or `@` is written after an apostrophe: opened in a spreadsheet, the file runs no formula, even if the title of a document was written for that. A value that holds a semicolon is quoted: a spreadsheet set to cut cells at semicolons keeps it whole.
- **One at a time.** The file is written as the log is read. A second export started by the same person before the end of the first is refused.
- **Recorded in the log.** Each export is itself an operation, `audit.exported`, with its filters and its number of lines, in the Organization category.

The export is also available through the API: see [Documents API](api-documents.md).

## Retention

Events are kept for one year: every night, Lore deletes the older ones. If several instances of Lore share the same database, only one of them does it. An exported file escapes this rule: keep it with the same care.

## Personal data

The log says who opened, downloaded or changed which document, and when, with the IP address: this is personal data. It serves security, for example to know who had access to a document. Only the organization’s owners and administrators browse and export it, and it is deleted after one year. Let the members of your organization know.

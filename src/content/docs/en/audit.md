---
title: "Audit log"
description: "The audit log records the sensitive operations of the whole organization."
---

## What is recorded

| Type | Examples |
| --- | --- |
| View | A document opened |
| Download | An original or an older version downloaded |
| Import | A new document, with the name and size of its file, its space, its folder and whether it is restricted; a new version |
| Status | A document marked outdated or archived |
| Deletion | A document permanently deleted, with its number of versions |
| Permissions | A document restricted or opened to the whole space again, people chosen added or removed; a role changed |
| Members | Invitation, deactivation, reset link |
| Sign-in | Repeated failures, an account locked |
| Organization | A space created or deleted, with its number of documents; a setting changed, such as the maximum size of a file |

Changes to a document are recorded too: its title, description or category changed, with the fields involved, and its move from one folder to another. Text extraction, on the other hand, is not.

Each event keeps the title of the document and the name of its space at the time of the action: it remains readable after a deletion.

## Browse and export

In *Administration › Audit log*, filter by type of action, by person and by period, then export as CSV. [See it in the demo](https://lore.dada-core.com/en/demo/#/admin/audit)

## Retention

Events are kept for one year.

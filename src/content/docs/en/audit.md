---
title: "Audit log"
description: "The audit log records the sensitive operations of the whole organization."
---

## What is recorded

| Type | Examples |
| --- | --- |
| View | A document opened, with its version: once an hour at most for the same person and the same document |
| Download | An original or an older version downloaded, with the name and size of the file |
| Import | A new document, with the name and size of its file, its space, its folder and whether it is restricted; a new version |
| Status | A document marked outdated or archived |
| Deletion | A document permanently deleted, with its number of versions |
| Permissions | A document restricted or opened to the whole space again, people chosen added or removed; the owner of a document changed, with the former and the new one; a role changed |
| Members | Invitation, deactivation, reset link |
| Sign-in | Repeated failures, an account locked |
| Organization | A space created or deleted, with its number of documents; a setting changed, such as the maximum size of a file |

Changes to a document are recorded too: its title, description, category or language changed, with the fields involved, and its move from one folder to another. A change of language keeps the former one: in the `document.updated` event, `changes` contains `language`, and `previousLanguage` gives the former language. Text extraction, on the other hand, is not recorded.

Searches are never recorded, neither in this log, nor in the server’s logs. Opening a document from a result is a view, recorded like the others. See [Searching](search.md#privacy).

A page opened again or reloaded within the hour adds no view, and a document the person cannot see never records one. Each download is recorded; the resumption of an interrupted download is not, nor is reading a PDF in the page or in a new tab, which is part of the view.

Views never show on the document: only in this log, and for each person under *Resume*, on their own home page.

Each event keeps the title of the document and the name of its space at the time of the action: it remains readable after a deletion.

## Browse and export

In *Administration › Audit log*, filter by type of action, by person and by period, then export as CSV. [See it in the demo](https://lore.dada-core.com/en/demo/#/admin/audit)

## Retention

Events are kept for one year: every night, Lore deletes the older ones. If several instances of Lore share the same database, only one of them does it.

## Personal data

The log says who opened, downloaded or changed which document, and when, with the IP address: this is personal data. It serves security, for example to know who had access to a document. Only the organization’s owners and administrators can browse it, and it is deleted after one year. Let the members of your organization know.

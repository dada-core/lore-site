---
title: "Spaces and folders"
description: "Documents are organized in spaces, then in folders. Access rights are decided at the space level."
---

## Organization, spaces and folders

| Level | Role | Example |
| --- | --- | --- |
| Organization | Groups the accounts and spaces. | DadaGroup |
| Space | A team or a domain, with its members and their roles. | Infrastructure |
| Folder | A way to organize documents within a space. | Runbooks |
| Document | An imported file, with its versions. | Restore a PostgreSQL database |

A member only sees the spaces they belong to. The organization’s owners and administrators see every space.

## Create a space

Give it a name, a description, a short address and a color. You become the space owner and can invite members. See [Roles and permissions](permissions.md).

## Library views

| View | Use |
| --- | --- |
| Grid | One row per document, with its columns: status, category, owner, date, version, indexing, language. Grouped by folder by default. |
| Kanban by status | One column per status: drafts, published, outdated, archived. |

Filter by folder, sort by update date and hide the columns you do not need. The sidebars fold with <kbd>[</kbd> and <kbd>]</kbd>.

[See the library in the demo](https://lore.dada-core.com/en/demo/#/spaces/infrastructure)

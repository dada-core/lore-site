---
title: "Spaces and folders"
description: "A space brings together a team or a domain, with its members, their roles and its documents. Folders organize its content."
---

## Organization, spaces and folders

| Level | Role | Example |
| --- | --- | --- |
| Organization | Groups the accounts and spaces. | DadaGroup |
| Space | A team or a domain, with its members and their roles. | Infrastructure |
| Folder | A way to organize content within a space. | On-call procedures |
| Document | An imported file, kept in a folder or at the root of the space. | Disaster recovery plan 2026 |

A member only sees the spaces they belong to. The organization’s owners and administrators see every space, with the rights of a maintainer, without having to be members. See [Roles and permissions](permissions.md).

## Create a space

Any member of the organization can create a space: the *+* button next to *Spaces* in the sidebar, or *Create a space* on the *Spaces* page, opened from *All spaces*.

| Field | What to know |
| --- | --- |
| Name | Required, 80 characters at most. |
| Description | Optional, 500 characters at most. It is shown on the *Spaces* page and at the top of the space’s *Documents* page. |
| Address | Suggested from the name, and editable. See below. |
| Color | One of the seven colors offered. It sets the space apart in the sidebar. |

You become the maintainer of the space. Then add its members from its *Members* page.

### The address

Each space has an address such as `/spaces/infrastructure`.

- Lore suggests it from the name: “Network & Security” gives `network-security`. It only contains lowercase letters without accents, digits and hyphens, 60 characters at most.
- It is unique within the organization. If the suggested address is already taken, Lore adds `-2`, `-3`… An address typed by hand that is already taken is refused.
- A maintainer can change it in the space’s *Settings*. Links to the old address stop working.

> [!WARNING]
> **The name and address of a space are not secret.** A space you cannot see shows nothing: not its exact name, its members or its content. But since its address is unique, someone who tries to take the same one learns that it is in use. For a confidential subject, pick a neutral name, such as “Project Orion”.

## Finding your way

- **The sidebar** lists your active spaces. The open space unfolds its pages: *Documents*, *Members* and, for its maintainers, *Settings*. The sidebar folds with <kbd>[</kbd>.
- **The home page** shows your spaces as tiles, with your role and the number of members. Above them, *Resume* lists the last three documents you opened, and *Recent activity in your spaces* the eight latest imports, new versions and changes of status of the documents you see.
- **The *Spaces* page** shows them as a table: description, documents, members, your role and last activity. The *Archived* tab gathers the archived spaces you can still see.
- **The *Documents* page** of a space has two views: *Grid* and *Board by status*.
  - **Grid.** The documents, grouped by folder. *Sort* orders them by last update, title, category, status or size, ascending or descending; *Hide columns* lightens the table. These choices are kept in the browser. Outdated documents are greyed out, and a version being extracted is shown on the line, such as “Version 5 in progress”.
  - **Board by status.** A column per status, Draft, Published and Outdated, with a card per document: title, category, owner, version and date. Each column shows 50 documents, then *Show more*. The Archived column only appears to the maintainers of the space, the owners and the administrators. Cards do not move from one column to another: the status is changed from the document’s page. The address keeps the view (`?view=kanban`).

The number of documents of a space only counts the ones you can see, archived ones left out. Archived documents do not appear in the grid, even for those who see them: at the bottom, “3 archived documents” shows them apart, for the maintainers of the space, the owners and the administrators. Its last activity takes into account the changes to the space, its folders and its documents.

## Folders

Folders are managed from the space’s *Documents* page.

- Contributors and maintainers create them (*New folder*), rename and delete them. Readers browse them.
- There is a single level of folders, without subfolders, in the order they were created.
- Two folders of the same space cannot have the same name, even with different capitalization.
- A document does not have to be in a folder: it can stay at the root of the space, under *No folder*. A new space has no folders at all.
- A folder that holds at least one document cannot be deleted: first move its documents to another folder, or to the root of the space. See [Importing documents](import.md#after-the-import).

> [!NOTE]
> **Known limit.** A folder that only holds restricted documents you cannot see cannot be deleted either: you thus learn that it is not empty, without learning anything about these documents. The space’s maintainers, who see all its documents, can empty it.

## Archive, make active again, delete

These actions are reserved for the space’s maintainers and for the organization’s owners and administrators, in *Settings › Danger zone*.

| Action | Effect |
| --- | --- |
| Archive | The space disappears for its readers and contributors. Its maintainers, the owners and the administrators still see it, in the *Archived* tab. It can no longer be changed: not its settings, its members, its folders or its documents, and nothing more can be imported into it. |
| Make active again | The space reappears for all its members and can be changed again. |
| Delete | Once the name of the space is typed to confirm, its folders, its documents and their versions are permanently deleted, and its members lose access. The files of its documents are then erased from the server, except those that a document of another space of the organization also uses. |

Creating, changing, archiving, reactivating and deleting a space are recorded in the audit log, as are the arrival, role changes and departure of its members, and the changes to its folders and documents. The deletion of a space records its number of documents.

[See a space in the demo](https://lore.dada-core.com/en/demo/#/spaces/infrastructure)

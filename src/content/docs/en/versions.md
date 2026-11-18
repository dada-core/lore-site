---
title: "Versions and statuses"
description: "Each document has a version history, a status and an owner: you always know which version is the reference."
---

## Import a new version

A document is updated by importing a new version of its file: *New version*, at the top of the document’s page, for the space’s contributors and maintainers. The window *New version of “…”* asks for:

| Field | What to know |
| --- | --- |
| The file | Dropped or chosen, with the same checks as an import: formats, largest size, refused files. The same format is advised, but it may change: the window says so, for instance “The format changes: Markdown, then PDF.” |
| What changes | Optional, 500 characters at most, shown to anyone who sees the document, in the history. It cannot be changed afterwards. |
| The status | A published document offers *Keep the Published status*, ticked: unticked, it goes back to Draft. An outdated document offers *Back to Published*. A draft stays a draft. |

*Import version 5* sends the file: “Version imported: its text is being extracted”. Version 4 stays readable and downloadable in the history.

- **Same file.** A file that is the same as the latest version, current, in progress or failed, is refused: “This file is the same as version 4.” The same as an older version, it is accepted: that is the way back.
- **Number.** Each version takes the next number; two people importing at the same time receive two different numbers.
- **Language.** It is detected again, unless someone chose the one of the current version by hand: the new version takes it over, and it can still be changed.
- **Archived document.** It accepts no new version: give it another status first.

See also [Importing documents](import.md#import-a-new-version).

## The current version

A new version only becomes the current one once its text is extracted, at once, for reading as for search:

- **During the extraction**, everyone reads the current version, and search relies on it. The document’s page shows “A new version is being processed.”, the list of documents “Version 5 in progress”, and your home page lists it under *To do*.
- **At the end of the extraction**, the new version takes its place. The status asked applies then, unless the status of the document changed in the meantime: a document archived during the extraction stays archived.
- **After a failure**, the current version does not change. Contributors see “Version 5 could not be processed: …”, with *Retry* for a passing cause, and *Import another version*.
- **Two versions at once.** If version 6 ends before version 5, it becomes the current one; version 5 stays in the history.

## History in strata

In the right panel, *Versions* draws the history as strata: one band per version, the latest on top and in colour. The thickness of a band shows how much the version changed: the share of passages added or removed from the previous one, from 0 (nothing changed) to 1 (all rewritten). The first version counts as whole; a hatched band marks a change that is unknown: a scanned document, a version in progress or failed, a version that never became current.

Choose a band, with the mouse or the arrows <kbd>↑</kbd> and <kbd>↓</kbd>: below it show “Version 4, current” or “Version 3”, its date of import and its author, what changes (“First version” for the first one), the name of its file, its *SHA-256 fingerprint* to copy, *Show* for an older version and *Download*. The ten latest versions show first, then *All the versions*.

## Read an older version

*Show* opens an older version in its own page, read only: its laid-out content or its PDF, its outline and the links of its sections, in the form `/documents/…/versions/3#h-7`. A banner says so: “You are reading version 3 of Sep 2, 2026. The current version is 5.”, with *Back to the current version*. Its file downloads as the one of the current version does.

- **View.** Opening an older version is a view, recorded in the audit log with its number, once an hour and per document as the page of the document: opened within the hour after the current version, it adds no line. Downloading it is a download.
- **Search.** It only searches the current version of each document: it never leads to an older version.
- **Link of another version.** A link to a section copied while version 3 was the current one carries its number. It opens the current version at the section of the same title, with “This link was made for version 3: here is the same section in the current version.”; if it no longer exists, at the top, with “This passage changed since version 3.” In both cases, *Show version 3* leads there. A PDF opens at the same page, if it still exists. The same link without a section opens the current version, with “This link was made for version 3: here is the current version.”

## Statuses

| Status | Meaning |
| --- | --- |
| Draft | Seen by the members of the space, marked as not final. |
| Published | The reference version. |
| Outdated | Still readable and searchable, but listed last, with the document that replaces it. |
| Archived | Out of the lists and the search. Seen by the maintainers of the space and the administrators, read only. |

| Who | What they can do |
| --- | --- |
| Contributors | Move a document between Draft, Published and Outdated |
| Maintainers of the space, owners and administrators | Also archive a document, and take it out of Archived |

*Change the status*, in the *More actions* menu or by clicking the status in the panel, opens a window that describes the effect of each status. For a contributor, Archived is greyed out there: “Reserved to the maintainers of the space.” *Archive*, in the same menu, opens the same window with Archived already chosen: the effect is read before saving. Each change of status is recorded in the audit log and in the *Activity* of the document.

### Outdated and replacement

Choose *Outdated*, then, if possible, the document that replaces it: type its title in *Replaced by*. Any document you can read is offered, in any of your spaces, except the document itself and outdated or archived documents.

- **Banner.** Readers see “This document is outdated since Nov 10, 2026. Use instead Restore a PostgreSQL database from a backup.”, the title as a link.
- **Privacy.** A reader who cannot read the replacement does not even learn its title: their banner stops at the date, and search does not name it.
- **Search.** An outdated document remains searchable, but always comes last, with “Replaced by” and the title of its replacement for whoever reads it.
- **Replacement removed.** Leaving Outdated removes the replacement; deleting the replacement removes it too. A replacement you cannot read stays when you save the status: you could neither see it nor mean to remove it.

### Archived

An archived document disappears from the lists, the counts, the search and the palette for readers and contributors, its owner included: for them, it answers as a document that does not exist. The maintainers of the space, the owners and the administrators still see it, with “This document is archived since …: only the maintainers of the space and the administrators see it. It can no longer be changed.”

- **Where to find it.** In the Archived column of the *Board by status*, through “3 archived documents” at the bottom of the grid, or in search by ticking *Archived* in the *Status* chip. See [Spaces and folders](spaces.md#finding-your-way).
- **Read only.** No new version, no title, description, category, language, folder, access or owner. Only its status and its deletion remain possible.

## Activity

Below the content of each document, *Activity* tells what was done to it, the latest first: imports and new versions, changes of status, access, owner, folder, title, description, category and language, with the person and the date. Views and downloads never appear there: only the [audit log](audit.md) keeps them. A change of access says to how many people the document is restricted, not who.

On the home page, *Recent activity in your spaces* shows the eight latest imports, new versions and changes of status of the documents you see.

## What does not exist yet

- **Restore a version.** To go back, download the older version, then import it as a new version.
- **Compare two versions**, delete a version, or change what changes after the import.
- **Awaiting review** <span class="vb">v0.2</span>: a status that will submit a document to the maintainers of the space before it is published.
- **Review dates** <span class="vb">v0.2</span>: a planned date will remind the owner to read the document again; overdue reviews will appear in the dashboard.

[See a document and its history in the demo](https://lore.dada-core.com/en/demo/#/documents/restaurer-pg)

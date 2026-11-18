---
title: "Release notes"
description: "What changes in each version of Lore."
---

## Version 0.1 <span class="vb">In preparation</span>

First version: a complete workspace, without artificial intelligence.

- Accounts, organizations and invitations by link
- Spaces, folders and roles
- PDF, Word, text and Markdown import, up to 50 MB
- Reader that opens at the right passage
- Full-text search, filtered by access rights
- Versions and statuses
- Audit log
- Installation with Docker Compose, .deb and .rpm packages or a universal archive

## Version 0.1.0-beta.1 <span class="vb">Preview</span>

Released on November 18, 2026: every feature of version 0.1 is in it. It keeps the data of a 0.1.0-alpha.4 installation: the upgrade only adds a migration, without extracting the documents again (see [Upgrading](upgrade.md#from-the-010-alpha4-preview)). Its data will carry over to version 0.1.0, which follows a pass on quality.

- A new version of a document, with what changes and the status to take; the current version is still read and searched until the new one is extracted
- History in strata, the thickness of each version showing how much it changed; older versions can be read and downloaded
- A section link made for an older version opens at the section of the same title in the current version
- Draft, Published, Outdated (with the document that replaces it) and Archived statuses; kanban view of the library
- Archived documents seen only by the maintainers of the space and the administrators, read only
- The activity of each document, and recent activity on the home page, without views or downloads
- Audit log in the administration: filters by category, person and period, CSV export itself recorded in the log
- Search: archived documents left out unless asked, “Replaced by” on an outdated document, a pasted error message found much faster

See [Versions and statuses](versions.md) and [Audit log](audit.md).

Its files are on its [release page](https://github.com/dada-core/lore/releases/tag/v0.1.0-beta.1).

## Version 0.1.0-alpha.4 <span class="vb">Preview</span>

Released on November 18, 2026, to try search before version 0.1. It keeps the data of a 0.1.0-alpha.3 installation: the upgrade only adds a migration, which computes the search index of the documents already imported, without extracting them again (see [Upgrading](upgrade.md#from-the-010-alpha3-preview)). It is not meant for production: its data may not carry over to the next version.

- Full-text search with PostgreSQL alone: words, phrases between quotes, words left out, `or`, identifiers, addresses and error codes found as they are pasted
- Accents and capitals ignored, the forms of a word found together (“redemarrer” finds “Redémarrage”)
- Ranked results, obsolete documents last, with the excerpt of the best passage, its words highlighted, and the other passages found
- Filters by space, category, status, format and date, each with its number of documents
- Permissions applied in the query: a document you cannot see appears neither in the results, nor in the counts, nor in the excerpts
- <kbd>Ctrl K</kbd> palette, <kbd>/</kbd> shortcut, recent searches kept in the browser
- A document opened at the passage found, its words highlighted, with *Back to results*
- The language of a document can be changed, and it is indexed again at once
- No search recorded, neither in the audit log nor in the logs of the server

See [Search](search.md). Versions and statuses, and the audit log screen, come with version 0.1.

Its files are on its [release page](https://github.com/dada-core/lore/releases/tag/v0.1.0-alpha.4).

## Version 0.1.0-alpha.3 <span class="vb">Preview</span>

Released on November 17, 2026, to try the document reader before version 0.1. It keeps the data of a 0.1.0-alpha.2 installation: the upgrade only adds a migration, and extracts Markdown, Word and text documents again for their laid-out content (see [Upgrading](upgrade.md#from-the-010-alpha2-preview)). It is not meant for production: its data may not carry over to the next version.

- Markdown, Word and text documents shown laid out, after Lore cleans them
- PDF files read in the page with pdf.js, without downloading them whole, and opened at the page asked
- Links to a section or a page, and an outline that follows the reading
- Download of the original under its original name, for anyone who sees the document
- Properties of the document, with its SHA-256 fingerprint, and change of its owner
- *Resume* on the home page, sorting and columns of the list of documents
- Views and downloads recorded in the audit log, whose events are deleted after a year

See [Reading a document](reader.md). Search, versions and statuses, and the audit log screen come with version 0.1.

Its files are on its [release page](https://github.com/dada-core/lore/releases/tag/v0.1.0-alpha.3).

## Version 0.1.0-alpha.2 <span class="vb">Preview</span>

Released on November 16, 2026, to try spaces and document import before version 0.1. It keeps the data of a 0.1.0-alpha.1 installation: the upgrade only adds migrations. It is not meant for production: its data may not carry over to the next version.

- Spaces, single-level folders and roles in spaces: reader, contributor, maintainer
- Spaces to join, chosen in an invitation link
- Import of PDF, Word (DOCX), Markdown and text files, five uploads at a time, up to 50 MB per file by default
- Text extraction in the background, in separate processes started by Lore (Apache Tika), with detection of scanned PDF files
- Documents restricted to a few people
- *Administration › Storage and import*: maximum size of a file, up to the `LORE_MAX_UPLOAD_SIZE` ceiling (1 GB by default), stored volume and state of the extraction
- Your imports still in progress or failed, listed on the home page
- New variables `LORE_FILES_PATH`, `LORE_MAX_UPLOAD_SIZE`, `LORE_EXTRACTION_WORKERS`, `LORE_EXTRACTION_TIMEOUT` and `LORE_EXTRACTION_MEMORY`; the Docker image leaves half of the container’s memory to the extraction processes

Behind a reverse proxy, set its size limit a little above the maximum size of a file: see [HTTPS and reverse proxy](reverse-proxy.md). The viewer, search, versions and statuses, and the audit log screen come with version 0.1.

Its files are on its [release page](https://github.com/dada-core/lore/releases/tag/v0.1.0-alpha.2).

## Version 0.1.0-alpha.1 <span class="vb">Preview</span>

Released on November 13, 2026, to try the installation before version 0.1. It is not meant for production: its data may not carry over to the next version.

- Initial setup in the browser, with the code shown in the server logs
- Sign-in, invitations by link and password reset links
- My account
- Administration of the organization: members, roles and security settings
- Docker image for amd64 and arm64, .deb and .rpm packages, universal archive

Its files are on its [release page](https://github.com/dada-core/lore/releases/tag/v0.1.0-alpha.1).

## Next versions

| Version | Planned content |
| --- | --- |
| 0.2 | Search by meaning, knowledge articles, dashboard |
| 0.3 | Optional assistant and conversation history |

Each released version will also be announced on the [releases page of the GitHub repository](https://github.com/dada-core/lore/releases).

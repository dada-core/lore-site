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

---
title: "What is Lore?"
description: "Lore is an open source workspace where technical teams gather, search and maintain their documentation: runbooks, procedures, architecture documents and incident reports."
---

## What Lore does

- **Library** <span class="vb">v0.1</span>: spaces per team or domain, folders, and documents imported as PDF, Word, text or Markdown.
- **Search** <span class="vb">v0.1</span>: full-text search that finds technical identifiers exactly as written and opens each document at the right passage.
- **Versions and statuses** <span class="vb">v0.1</span>: every import creates a version; every document has a status and an owner.
- **Permissions** <span class="vb">v0.1</span>: roles per space and restricted documents, enforced everywhere, search included.
- **Knowledge base** <span class="vb">v0.2</span>: problem and solution articles, approved by the space maintainers.
- **Assistant** <span class="vb">v0.3</span>: optional answers in natural language, with their sources.

## Where Lore stands

Lore is getting ready for version 0.1. Today, the application handles the initial setup, sign-in, invitations, password resets, *My account* and the administration of the organization: members and roles, security settings, storage and import. It also handles spaces, their folders and roles, the import of PDF, Word, Markdown and text documents, with the extraction of their text and documents restricted to a few people, their reading (laid-out content, PDF files shown in the page, links to a section or a page), search in their text, filtered by permissions, the versions of each document and their statuses, and the audit log of the organization. A preview, 0.1.0-beta.1, holds all these features: see the [release notes](release-notes.md).

## What Lore is not

Lore is not a chatbot. The assistant is an optional module, turned off by default: the library, search, versions and permissions work entirely without artificial intelligence.

## Principles

| Principle | What it means |
| --- | --- |
| Permissions first | Nobody sees the content of a document they cannot access: not in lists, results, excerpts, or through the assistant. |
| Sourced and verifiable | Every result points to the original document, version and passage. |
| Works without AI | The assistant is a module each organization turns on or not. |
| Easy to host | Lore and PostgreSQL, nothing else. With Docker Compose, Lore installs in under five minutes. It also comes as a .deb or .rpm package and as an archive. |

## Accessibility

Lore aims at WCAG 2.2, level AA.

- **Automated checks.** On every change to the code, nine end-to-end journeys run in Chromium, and those of reading, search, keyboard and phone also in Firefox and WebKit. Every screen of version 0.1, about fifty with the windows, passes the automated axe audit, without any violation, in the light theme, in the dark theme and on a 375 px screen. The main windows can be driven with the keyboard alone.
- **Manual check.** A pass with a screen reader, NVDA and Firefox on Windows, will take place before version 0.1.0.
- **Limits.** The scanned pages of a PDF are only images, and a PDF shown in the page offers its text, not its structure (headings, tables). A text view of PDFs will come after version 0.1.

The supported browsers are listed in [Installation](installation.md#choose-a-method).

## Where to start

- [Installation](installation.md): install Lore with Docker, a package or the archive.
- [First steps](first-steps.md): invite your team, review security and set up your account.
- [Members and invitations](members.md): roles, invitations and password resets.
- [Environment variables](variables.md): every configuration option.

To see the application without installing anything, open the [demo](https://lore.dada-core.com/en/demo/#/), filled with sample data.

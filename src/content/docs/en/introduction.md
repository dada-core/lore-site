---
title: "What is Lore?"
description: "Lore is an open source workspace where technical teams gather, search and maintain their documentation: runbooks, procedures, architecture documents and incident reports."
---

## What Lore does

- **Library** <span class="vb">v0.1</span>: spaces per team or domain, folders, and documents imported as PDF, Word, text or Markdown.
- **Search** <span class="vb">v0.1</span>: full-text search that finds technical identifiers exactly as written and opens each document at the right passage.
- **Versions and statuses** <span class="vb">v0.1</span>: every import creates a version; every document has a status and an owner.
- **Permissions** <span class="vb">v0.1</span>: roles per space and restricted documents, enforced everywhere, search included.
- **Knowledge base** <span class="vb">v0.2</span>: problem and solution articles, approved by the space owners.
- **Assistant** <span class="vb">v0.3</span>: optional answers in natural language, with their sources.

## Where Lore stands

Lore is getting ready for version 0.1. Today, the application handles the initial setup, sign-in, invitations, password resets, *My account* and the administration of the organization: members, roles and security settings. The library, search, versions and document permissions come with version 0.1.

## What Lore is not

Lore is not a chatbot. The assistant is an optional module, turned off by default: the library, search, versions and permissions will work entirely without artificial intelligence.

## Principles

| Principle | What it means |
| --- | --- |
| Permissions first | Nobody sees the content of a document they cannot access: not in lists, results, excerpts, or through the assistant. |
| Sourced and verifiable | Every result points to the original document, version and passage. |
| Works without AI | The assistant is a module each organization turns on or not. |
| Easy to host | Lore and PostgreSQL, nothing else: with Docker, a .deb or .rpm package, or an archive, in less than five minutes. |

## Where to start

- [Installation](installation.md): install Lore with Docker, a package or the archive.
- [First steps](first-steps.md): invite your team, adjust security and your account.
- [Members and invitations](members.md): roles, invitations and password resets.
- [Environment variables](variables.md): every configuration option.

To see the application without installing anything, open the [demo](https://lore.dada-core.com/en/demo/#/), filled with sample data.

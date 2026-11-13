---
title: "Assistant"
description: "The assistant answers in natural language from the documents you have access to, and always cites its sources. It is optional and turned off by default."
release: v0.3
---

## Turn the assistant on

An administrator turns it on in *Administration › Assistant* and chooses the language model: a server hosted by the organization, or an external provider. The rest of Lore works the same way, with or without the assistant.

## How an answer is built

1. **Search**
   The question becomes a search, with your access rights: only the passages you can read are kept.
2. **Selection**
   Passages from outdated documents are left out.
3. **Writing**
   The model writes an answer from these passages only.
4. **Citations**
   Every statement points to the document, version and passage used.

## When it does not answer

If the available documents are not enough for a reliable answer, the assistant says so and suggests the closest documents, rather than making up a procedure. You can then report a gap in the documentation.

## Privacy

> [!NOTE]
> **What is sent to the model.** Only the question and the passages the person asking is allowed to read. Never whole documents, never other people’s documents.

Conversations are kept for 90 days by default; an administrator can shorten this or turn the history off.

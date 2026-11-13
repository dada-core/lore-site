---
title: "Importing documents"
description: "Lore imports PDF, Word, text and Markdown files, extracts their text and splits it into passages for search."
---

## Supported formats

| Format | What is extracted | Split |
| --- | --- | --- |
| PDF | The text of each page | By page |
| Word (DOCX) | The text and headings | By heading |
| Markdown | The text and headings | By heading |
| Text | The text | By size |

Splitting lets a document open directly at the page or heading found.

## Import

1. **Open the import window**
   The *Import* button, or the <kbd>I</kbd> key.
2. **Choose the destination**
   The space, the folder, the initial status and the category.
3. **Drop the files**
   They are imported as soon as they are dropped; extraction continues in the background.

## Maximum size

50 MB per file by default. An administrator can change this limit in *Administration › Storage and import*, or with the `LORE_MAX_UPLOAD_SIZE` variable.

## Extraction states

| State | Meaning | What to do |
| --- | --- | --- |
| Indexed | The text is extracted and searchable. | Nothing. |
| In progress | Extraction is still running. | Wait a few seconds. |
| Scanned | The PDF only holds images: only its title and metadata are searchable. | Add a description, or plug in an extractor with text recognition. |
| Not imported | The file is over the maximum size. | Make the file smaller, or ask for a higher limit. |
| Failed | The file is password-protected, or unreadable. | Remove the protection, then import a new version. |

> [!NOTE]
> **Scanned documents.** Text recognition (OCR) is not included in version 0.1. See [Storage and extraction](storage.md).

## Import a new version

From a document, choose *New version* and describe what changes. The previous version remains available in the history. See [Versions and statuses](versions.md).

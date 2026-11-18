---
title: "Importing documents"
description: "Lore imports PDF, Word, Markdown and text files, extracts their text in the background and splits it into passages that keep their place: a page or a heading."
---

## Accepted formats

| Format | Extensions | What is extracted | Split |
| --- | --- | --- | --- |
| PDF | `.pdf` | The text of each page | By page |
| Word | `.docx` | The text and headings | By heading |
| Markdown | `.md`, `.markdown` | The text, headings and code blocks | By heading |
| Text | `.txt` | The text | By size, between two lines |

Lore recognizes the format of a file from its extension **and** from its content: a file renamed to `.pdf` that is not a PDF is refused. The type announced by the browser is never used.

- An older Word document (`.doc`) is refused: save it as DOCX, then import it.
- A text or Markdown file can be in UTF-8, in UTF-16 with its byte order mark, or in Windows-1252: Lore recognizes the encoding on its own. In a UTF-8 file, a few invalid characters are replaced, without changing how the rest is read.
- Attachments and objects embedded in a PDF or a Word document are not read.

Each passage keeps its place in the document: its page, or its heading and the headings above it. This is what lets a document open right at the relevant spot, from the link of a section or a page. For a Markdown, Word or text document, the extraction also produces the laid-out content that the page of the document shows: see [Reading a document](reader.md).

## Import

Contributors and maintainers of a space import documents into it, as do the organization’s owners and administrators. An archived space no longer accepts any.

1. **Open the import window**
   The *Import* button on a space’s *Documents* page or on the home page, or the <kbd>I</kbd> key. From the home page, choose the space first.
2. **Choose the destination**
   The folder, or *No folder* to keep the documents at the root of the space; the status, *Draft* (the default) or *Published*; the category, which is optional.
3. **Restrict access, if needed**
   Tick *Restrict access to some people*, then choose among the members of the space. The documents are then never visible to the others, not even for a moment. See [Restricted documents](permissions.md#restricted-documents).
4. **Drop the files**
   Several at once: the window uploads five at a time and shows the progress of each. Text extraction then continues in the background: you can close the window.

Each file becomes a document, with its version 1:

- **Its title** comes from the file name, without the extension, with hyphens and underscores replaced by spaces: `recovery-plan_2026.docx` gives “Recovery plan 2026”. For a Markdown file, its first level 1 heading replaces it once extraction is done, cut to 200 characters, unless someone changed the title in the meantime. The title stored in the properties of a PDF or Word document is not used.
- **Its owner** is the person who imported it.
- **Its status and category** are the ones chosen in the window.

### Duplicates

If a document of the space that you can see has exactly the same content, the file is imported anyway, and the window tells you so: delete the duplicate if you do not need it. On the server, this content is stored only once.

### Interrupted upload

An upload that is cut off, by the network for instance, leaves nothing on the server: it starts again from the beginning. A file that was fully received is imported, even if the page closes afterwards. During an upload, closing the window or leaving the page (the browser’s *Back* button, a link of the application) asks *Stop sending?*: *Keep sending* stays put, *Close and stop* drops the files that have not been fully sent yet. Reloading or closing the tab makes the browser ask for confirmation, with the same effect.

## Maximum size

50 MB per file by default. An owner or an administrator changes it in *Administration › Storage and import*, from 1 MB up to the ceiling set on the server by `LORE_MAX_UPLOAD_SIZE` (1 GB by default). See [Storage and extraction](storage.md#file-size).

The window sets aside a file that is too large before uploading it, and the server refuses it anyway.

## Refused files

A refused file is not imported: no document is created, and nothing is left on the server.

| Cause | What to do |
| --- | --- |
| The file is over the maximum size. | Make the file smaller, or ask an administrator to raise the limit. |
| The file is empty. | Check the file on your computer. |
| The format is not accepted. | Save the document as PDF, DOCX, Markdown or text. |
| It is an older Word document (`.doc`). | Save it as DOCX. |
| The content does not match the extension. | Check the file: it may be misnamed, or damaged. |
| The server’s disk is almost full. | Tell the person who runs the server. |

## Extraction states

| State | Meaning | What to do |
| --- | --- | --- |
| In progress | The text is being extracted, or is waiting its turn. | Wait a few seconds. |
| Indexed | The text is extracted and split into passages. | Nothing. |
| Scanned | At least half of the pages of the PDF only hold images, without text. | Add a description to the document. |
| Failed | The text could not be extracted. | Depending on the cause, see below. |

The state of each document is shown in the import window, in the list of documents of the space and on the document’s page. Your own imports still in progress or failed are also listed on the home page.

**Scanned document.** A page counts as having no text below 20 visible characters. The document is imported, its number of pages is known and the text of its other pages is kept; search finds it by its title and description: give it a description that says what it contains.

**Truncated text.** Lore keeps up to 10 million characters of text per document. Beyond that, the rest is left out, and the document’s page says so.

**Language.** The extraction also detects the language of the text: French, English or other. Search uses it to recognize the forms of words. If it was wrong, a contributor corrects it in the document’s panel: see [Change the language](reader.md#change-the-language).

### When extraction fails

| Cause | What Lore does | What to do |
| --- | --- | --- |
| File protected by a password | Fails at once | Remove the protection, then import the file again. |
| Damaged or unreadable file | Fails at once | Open the file on your computer, save it again, then import it. |
| Content that is not of the announced format | Fails at once | Check the file, for instance a `.docx` that is not a Word document. |
| Time limit exceeded, extraction process stopped, file not found | Tries again after 1 minute, then after 5 minutes | After three attempts, *Retry* from the document. |

*Retry* is only offered for a passing cause, to the space’s contributors and maintainers: for a protected or damaged file, another attempt would fail the same way.

> [!NOTE]
> **Scanned documents.** Text recognition (OCR) is not included in version 0.1, nor is plugging in an external extractor that would bring it. See [Storage and extraction](storage.md#external-extractor).

## After the import

| Action | Who | What to know |
| --- | --- | --- |
| Change the title, description or category | The space’s contributors and maintainers | Title of 200 characters at most, description of 2,000. |
| Change the language | The space’s contributors and maintainers | French, English or other: the document is indexed again at once. Not during the extraction. See [Change the language](reader.md#change-the-language). |
| Move to another folder | The space’s contributors and maintainers | To a folder of the same space, or to its root. |
| Restrict access, or open it to the space again | The space’s maintainers, the document’s owner | See [Restricted documents](permissions.md#restricted-documents). |
| Change the owner | The space’s maintainers, the document’s owner | To an active member of the space, at least a contributor. The new owner sees the document, even a restricted one. See [Change the owner](reader.md#change-the-owner). |
| Delete | The space’s maintainers; the person who imported it, as long as it has a single version | After confirmation, permanently: there is no trash. Its file is erased if no other document uses it. |

The organization’s owners and administrators have the rights of a maintainer. In an archived space, none of these actions is possible.

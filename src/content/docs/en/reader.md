---
title: "Reading a document"
description: "Lore shows each document in the page: a PDF as it is, a Markdown, Word or text document laid out. A link can open it right at the relevant section or page."
---

## What is shown

| Format | What is shown |
| --- | --- |
| PDF | The file itself, page by page, with its text selectable |
| Markdown | Headings, paragraphs, lists, tables, quotes, struck text, links, and code blocks with their indentation |
| Word | Headings, paragraphs, tables, bold, italics, underline, struck text and links |
| Text | The text as it is written: spaces, tabs and line breaks kept, lines that are too long wrapped |

A Markdown, Word or text document is shown from a rendering produced by the extraction, together with its text, then cleaned before it is saved: it keeps only layout elements, without any script or style. Each code block has a *Copy* button. See [Security and sign-in](security.md#reading-documents).

During the extraction, a PDF shows at once; for the other formats, the page says “The content will show as soon as the extraction ends.” and updates by itself. After a failure, only the banner that gives its cause is shown: the file can still be downloaded. See [When extraction fails](import.md#when-extraction-fails). More rarely, an indexed document has no laid-out content, for example a Word document whose layout could not be read: the page says “The content of this document cannot be shown. Download the original to read it.”

### Markdown

- **Links.** `http`, `https` and `mailto` links open in a new tab; a web address written as is becomes a link. A link to a heading of the same document, for example `#common-errors`, leads to that heading. A relative link to another file, such as `../README.md`, becomes plain text.
- **Images.** They are never loaded: in their place, “Image not shown:” followed by their alternative text. For an image hosted elsewhere, this text is a link to it.
- **HTML written in the file.** Only the `<br>`, `<kbd>`, `<sup>`, `<sub>`, `<details>` and `<summary>` tags are kept. The others are removed, their text kept.
- **Code.** It is shown without syntax highlighting.

### Word

A note under the title says so: “Simplified view of the Word document: images and layout are not reproduced.”, with a *Download the original* link.

- Lists appear as paragraphs, starting with their number or bullet.
- No images, no embedded objects, no layout, colors or fonts.
- A link to a bookmark of the document, such as those of its table of contents, leads to the section that holds it.

### Text

A text file is split into parts of 4,000 characters at most, cut between two lines: they are also its passages. It has no outline.

## The PDF viewer

A PDF shows in the page with pdf.js, served by Lore itself, without any outside service, and loaded only when a PDF is opened.

- **Only the pages read are transferred.** Page 112 of a 312-page guide shows without waiting for the rest of the file.
- **The bar** gives the page shown, for example “Page 112 of 312”, with the previous and next page, the *Go to page* field and the zoom. On a phone, the page takes the width of the screen.
- **The text can be selected and copied.** For a scanned PDF, the bar says “Scanned image, without a text layer”, and nothing is highlighted in it.
- **The links of the PDF** open in a new tab. Its scripts and forms are never run.
- **The bookmarks of the PDF**, if it has any, fill *On this page*.

Once the viewer is selected, with a click or with <kbd>Tab</kbd>:

| Shortcut | Action |
| --- | --- |
| <kbd>←</kbd> <kbd>→</kbd> | Previous page, next page |
| <kbd>+</kbd> <kbd>-</kbd> | Zoom in, zoom out |

These keys do nothing while you type in the *Go to page* field.

*Open in the browser*, in the *More actions* menu, opens the PDF in a new tab, with the browser’s own PDF viewer. If a PDF cannot be shown in the page, Lore says so: “This PDF cannot be shown here. Download the original to read it.”

## Open at the right passage

The link of a document always opens its current version, even if its title or folder changes:

```text title="Link of the document"
https://lore.example.com/documents/0193a7c2-…
```

A link can also point to a passage, after the `#` sign, with the version it belongs to (`v`):

```text title="Link of a section"
https://lore.example.com/documents/0193a7c2-…?v=1#h-7
```

| Anchor | Passage |
| --- | --- |
| `h-7` | The seventh heading of a Markdown or Word document, and its section; `h-0` is what comes before the first heading |
| `part-3` | The third part of a text file |
| `page-112` | Page 112 of a PDF |

An anchor followed by the number of a passage, such as `h-7-2`, leads to its section, `h-7`.

On opening, the document scrolls to the passage and frames it. In a Markdown or Word document, the heading of the section gets the focus: a screen reader starts there.

**Highlighted words.** A link can also carry words to highlight, in `q`:

```text title="Link of a passage found"
https://lore.example.com/documents/0193a7c2-…?from=search&q=pg_restore%20role&v=1#h-7-2
```

The words of `q` are highlighted in the section or page pointed to only, regardless of accents and case; a phrase between straight quotes stays whole, and neither `or` nor the words left out, such as `-barman`, are highlighted. With `from=search`, a banner says so: “Passage found for “pg_restore role”, section 4.2 Common errors. It is highlighted below.”

**From a search result.** The link of a result has this form, with the current version at the time of the search. A document found by its title or its description opens at the top, without a banner.

- **Forms found.** The reader also highlights the words that search found in another form, such as “serveur” for “serveurs”, twenty at most. A copied link only carries `q`: only the words written in `q` are highlighted.
- **Back to the results.** The banner offers *Back to the results*. From the results page, it leads back there, with its filters; from a copied link or a new tab, it runs the search of `q` again.

| Case | What is shown |
| --- | --- |
| A heading, a part or a page the document does not have | The document opens at the top, or at its first page for a PDF, with “This passage does not exist in this document.” |
| A link made for another version than the current one | The document opens at the top, with “This passage has changed since version 1.” |
| You are not signed in | After signing in, the document opens at the same passage. |
| You cannot see the document | *This page cannot be found*, as for a document that does not exist. |

### Copy a link

- *Copy the link*, in the *More actions* menu, copies the link of the document.
- When a heading is hovered, a `#` appears beside it: it copies the link of its section, with its version, “Link of the section copied”. With the keyboard, this button follows the heading.
- When Lore is served without HTTPS, for example over `http://` on an internal network, the browser refuses access to the clipboard: a small window then shows the link, already selected. Copy it with <kbd>Ctrl C</kbd>.

### Outline

*On this page*, at the bottom of the right panel, lists the headings of a Markdown or Word document on three levels, and marks the section being read. A click leads to the heading and updates the address, without adding a step to the browser’s history. For a PDF, it lists its bookmarks, if it has any; a text file has no outline.

## Properties

The right panel, shown or hidden with <kbd>]</kbd>, tells everything about the document.

| Property | What is shown | Who changes it |
| --- | --- | --- |
| Status | *Draft* or *Published* | Chosen at import |
| Owner | Their name, or *Former member* if they left the organization | See [Change the owner](#change-the-owner) |
| Category | Its pill, or *No category* | The space’s contributors and maintainers |
| Space | A link to its documents | Nobody |
| Folder | Its name, or *No folder* | The space’s contributors and maintainers, with *Move* |
| Language | French, English or other, detected at extraction | The space’s contributors and maintainers, see [Change the language](#change-the-language) |
| Format | The format, the number of pages or sections and the size, for example “PDF, 312 pages, 24.8 MB” | Nobody |
| Indexing | The state of the extraction and its date | *Retry*, after a passing failure |

Then come *Access*, which says who sees the document, *Versions*, with the card of the version (date of import, author, file name, *SHA-256 fingerprint* to copy and *Download*), then *On this page*.

Under the title, a line gives the status, the version, the date of the last update, restricted access, and `EN` for a document in English; then comes the description, or *Add a description* for a contributor. In an archived space, everything is read-only.

### Change the owner

The owner makes sure the document stays up to date, and may manage its access. Choose *Change the owner* in the *More actions* menu, or click the owner in the panel.

- **Who changes it.** The space’s maintainers, and the current owner of the document if they are at least a contributor. A document whose owner left the organization can only be taken over by a maintainer of the space.
- **Who can become owner.** An active member of the space, with at least the Contributor role.
- **For a restricted document**, the new owner sees it. If you are neither among the people chosen, nor a maintainer of the space, nor an administrator, you will no longer see it; the window warns you: “Christ Koffi will see this document. You will no longer see it: you are not among the people chosen.”

The organization’s owners and administrators have the rights of a maintainer of the space. The change is recorded in the audit log.

### Change the language

The language decides how search reads the document: in French or in English, it recognizes the forms of words, such as “serveur” for “serveurs”; in another language, it searches the words as written. If the detection was wrong, for example for a guide in English detected as French:

1. **Choose the language**
   Click the language, in the right panel, then choose *French*, *English* or *Other*.
2. **Confirm**
   The *Change the language of the document?* window says so: “Changing the language indexes the document again, so that search takes the new language into account.” Click *Change the language*.

The document is indexed again at once: “Language updated: the document is indexed again.” The language chosen is kept if the same version is extracted again.

- **Who changes it.** The space’s contributors and maintainers, as well as the organization’s owners and administrators.
- **When.** Not while the text is being extracted, nor in an archived space.
- **Audit log.** The change is recorded there, with the former language.

## Download the original

*Download the original*, the icon at the top right, or *Download* in the card of the version, gives the file as it was imported, under its original name.

- **Everyone who sees the document can download it**, readers included: showing a PDF transfers the file to the browser anyway. In an archived space, those who still see it can download it too.
- **To check a copy**, compare its fingerprint with the *SHA-256 fingerprint* of the card of the version, for example with `sha256sum`.
- **Each download** is recorded in the audit log.

If the file has disappeared from the server’s disk, the page says so: “The file of this document cannot be found on the server. Tell the person who runs Lore.” *Download* then disappears; the content of a Markdown, Word or text document, kept in the database, can still be read.

## Print

- **Markdown, Word and text.** <kbd>Ctrl P</kbd>, or *Print* in the *More actions* menu, prints the content only, without the sidebar, the panel or the banners. It starts with the title, the status, the version and the date of printing: a printed procedure says which version it comes from.
- **PDF.** *Print* opens it in a new tab, where the browser prints it.

## Very long documents

A very long document shows part by part, about 500,000 characters each, cut between two sections or two paragraphs: “Part 2 of 20”, with *Previous part* and *Next part*. Nearly every document fits in a single part.

- The outline covers the whole document and opens the right part; so does a link to a passage.
- The browser’s search (<kbd>Ctrl F</kbd>) and printing cover the part shown, as a banner reminds you.

Lore keeps up to 10 million characters of text per document. Beyond that, the content stops at the same place as the text kept, and the banner adds: “The rest is not shown: download the original.” A PDF, on the other hand, always shows in full.

## Resume reading

The home page lists, under *Resume*, the last three documents you opened and still see, with their space, their folder, their status and when you read them. A document you no longer see, deleted or restricted since, disappears from it.

These readings come from the audit log, which records the opening of a document once an hour at most for each person. They never show on the document: only the organization’s owners and administrators see them, in the audit log, which can be browsed in the administration from version 0.1.

## Limits

- **Images.** The images of a Markdown or Word document are never shown. To see them, download the original.
- **Word documents.** The view is simplified: no layout, colors or fonts, and lists are numbered paragraphs.
- **Code.** No syntax highlighting.
- **Very long documents.** Shown part by part; the browser’s search and printing cover the part shown.

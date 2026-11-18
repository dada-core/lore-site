---
title: "Searching"
description: "Search covers the text, the title and the description of every document you have access to. It opens with Ctrl K, or from the Search page."
---

## Start a search

- **Search page.** *Search*, in the sidebar, or the <kbd>/</kbd> key opens the page, with its field selected. Type your search in “Search your documents”, then *Search* or <kbd>Enter</kbd>: it runs when you submit it, not at each key.
- **Palette.** <kbd>Ctrl K</kbd>, or the *Search* field at the top of the sidebar, opens the palette: type your search, then choose “Search the documents for “…””, offered first. See [The palette](#the-palette).

Without a search, the page shows your [recent searches](#recent-searches) and a reminder of the syntax. With a search, its address keeps it along with its filters, for example `/search?q=pg_restore&status=PUBLISHED`: the browser’s *Back* button finds the results again, and a copied link runs the same search. [See it in the demo](https://lore.dada-core.com/en/demo/#/search?q=pg_restore%20role%20%22does%20not%20exist%22)

## Syntax

| Query | Result |
| --- | --- |
| `pg_restore role` | The documents that contain each of the words |
| `"does not exist"` | The exact phrase, its words in a row |
| `backup -barman` | Leaves out any document that contains “barman” |
| `pg_restore or pg_dump` | Either one |

A search is made of terms: a word, a phrase between straight quotes, or words joined by `or`. A document is found if it contains each term somewhere, in its title, its description or any of its passages: not necessarily in the same passage.

- **Accents and capitals** do not count: “role” also finds “Rôle”.
- **Words left out.** A word preceded by a `-`, such as `-barman`, or a phrase, such as `-"maintenance mode"`, leaves out any document that contains it, in its title, its description or a passage. A `-` inside a word (`kube-system`), doubled (`--no-owner`) or in a phrase between quotes is part of what is searched.
- **Common words.** Very common words, in English and in French, such as “the”, “of”, “le”, “les” or “de”, are not required: nearly every document contains them.
- **Tolerated input.** An unclosed quote, or an `or` at the start or at the end of a search, does not prevent searching.

> [!WARNING]
> **Pasted command.** An option with a single dash, at the start of a word, is read as a word to leave out: `-enddate` in `openssl x509 -enddate` leaves out the documents that contain “enddate”. A single letter (`-n` in `kubectl get pods -n kube-system`) or a common word (`-the`) leaves nothing out. Put the command between quotes: `"openssl x509 -enddate"`.

### What is refused

| Input | Message under the field |
| --- | --- |
| Only common words, such as “the” or “le la de”; typed in capitals, a common word of one language only (`SES`, `IT`) is searched as a name | “Make your search more precise: add a technical term, an error message or a server name.” |
| Only words left out, such as `-barman` | “Add at least one word to search for.” |
| More than 32 words | “32 words at most.” |

The field accepts 500 characters at most.

## Technical identifiers

Paste an identifier as you copied it: it is found where it is written.

- **Names and codes**, such as `pg_restore`, `archive_command` or `ERR_CONNECTION_REFUSED`. An identifier made of several words is searched as a phrase; “pg restore”, in two words, finds it too.
- **Addresses, numbers and paths**, such as `10.0.3.17`, `pg-prod-02`, `INC-2291` or `/var/lib/postgresql/18/main/pg_wal`. An address or a number is searched whole: `10.0.3.18` does not find `10.0.3.17`.
- **Error messages**, pasted whole, such as `pg_restore: error: role "reporting" does not exist`.
- **Web addresses.** Pasted with `https://`, they are searched without that beginning, the way Lore indexes them.

## Word forms

Search reads what you type in English, in French and as written.

- **Forms of the same word.** “restoring” finds “restore”, “serveurs” finds “serveur”.
- **Words of the same family.** A word whose stem has five letters or more is also searched as a beginning: its stem, shortened by two letters without going below five. “redemarrer” thus finds “Redémarrage”, and “vérifier”, “Vérification”. Only words made of letters are widened, never a number, an address or an identifier; a shorter stem stays exact: “port” does not find “portail”.
- **Exact matches come first**, before the widened forms, which sometimes find neighboring words.

### Document language

The language of each document, French, English or other, is detected when its text is extracted. It decides how its words are indexed: with their forms in French or in English, as written in another language.

If the detection was wrong, for example for a guide in English detected as French, a contributor or a maintainer of the space corrects the language in the document’s properties panel. The document is indexed again at once, and the language chosen is kept if the same version is extracted again. See [Change the language](reader.md#change-the-language).

## What is searched

- **The current version** of each document: the text of its passages, with the headings of the sections that hold them, as well as its title and its description.
- **A scanned or failed document**: its title and its description only. Give it a description that says what it contains. See [Extraction states](import.md#extraction-states).
- **A truncated text**: the 10 million characters kept.

Neither the file name nor the owner is searched. The category, the status and the format are [filters](#filters).

## Results

The number of documents found, “3 documents”, and the order, “Ranked by relevance. Outdated documents come last.”, come before the list. Each result is a document, with:

- its title, the words found highlighted, which opens the document;
- its space and its folder, the place of its best passage, such as “Section 4.2 Common errors” or “Page 112”, and its category;
- an excerpt of that passage, the words found highlighted: one or two pieces of about 35 words, separated by “…”;
- its status, its version, its date of update, and “Restricted access” if it is; for an outdated document, “Replaced by” and the title of the document that replaces it, if you can read it;
- if there are any, its other passages found, such as “2 other passages in this document”: a click unfolds the place of the first five, in the order of the document, and each opens it at that passage.

The best passage is the one that gathers the most terms. A document found only by its title shows “Match in the title.”, or “Scanned document: only its title matches.”; found by its description, an excerpt of it.

*Show more results*, at the bottom of the list, adds the next 20 documents. Then come two reminders: “Only the documents you have access to appear.” and “Scanned documents can only be found by their title and description.”

### Open a result

A click opens the document at the passage found, framed, the words highlighted, including the forms found by search, such as “serveur” for “serveurs”. The “Passage found for…” banner offers *Back to the results*, which leads back to the list and its filters. A document found by its title or its description opens at the top. See [Open at the right passage](reader.md#open-at-the-right-passage).

### No results

The page says “No document matches “quota ceph””, then “Check the spelling of identifiers, remove a word or the quotes. Scanned documents can only be found by their title and description.”

## Filters

Under the field, five chips: *Space*, *Category*, *Status*, *Format* and *Date*.

- Each chip lists the values present in the results, with their number of documents, all ticked at first. Untick the ones you do not want, at least one staying ticked: the chip says so, “Space: 2 of 3”, and so does the number of results, “2 documents of 3”.
- *Date* is about the date of update: “Any time”, “Last 30 days” or “Last 12 months”.
- The numbers are those of the results without the filters.
- The filters are kept in the address; a new search clears them.
- If the filters leave everything out: “No result with these filters.”, with *Remove the filters*.

### Archived spaces

The documents of an archived space do not appear by default, even for those who still see the space: its maintainers, and the organization’s owners and administrators. They find it in the *Space* chip, unticked and marked “archived”: tick it to add its documents to the results.

### Archived documents

An archived document does not appear by default either, even for those who see it: the maintainers of its space, the owners and the administrators. They find *Archived* in the *Status* chip, unticked, with its number of documents: tick it to add them to the results. The others see neither the value nor its number. The palette never offers an archived document.

## Result order

1. A document whose title contains all the terms comes first.
2. Then a document with a passage that gathers all the terms, first in their exact form.
3. Then the others, according to the terms their best passage gathers. A section heading counts more than the text; the title and the description of the document count too.
4. Outdated documents always come last, whatever their rank.

With equal relevance, the most recently updated document comes first.

## The palette

<kbd>Ctrl K</kbd>, or the *Search* field of the sidebar, opens the palette: “Search for a document, a space or an action…”. The page of something not found opens it too, with *Search*.

- **Empty**, it offers: *Actions* (“Import documents”, the <kbd>I</kbd> key, if you can import; “Create a space”; “Change theme”); *Go to* (“Home”, “Search”, “All spaces”, “Administration” and “Audit log” for owners and administrators, “My account”); *Spaces*, with their number of documents; *Recent documents*, the last five you opened.
- **While you type**, it first offers “Search the documents for “…””; then the actions, the destinations and the spaces whose name contains the words typed; then the documents whose title has a word that begins with each of the words typed, among those you see, those being extracted included, archived spaces and documents aside. Twelve items at most; accents and capitals do not count.
- **With the keyboard**, <kbd>↑</kbd> and <kbd>↓</kbd> choose an item, <kbd>Enter</kbd> opens it, <kbd>Esc</kbd> closes the palette.

## Recent searches

Without a search, the *Search* page lists your last eight searches. They are kept in this browser, for your account, never on the server. *Clear* removes them (“Recent searches cleared”), and so does signing out: a shared computer does not show them to the next person.

## What never appears

- **The documents you do not see**, restricted or kept in a space you are not a member of: not in the results, not in their number, not in the filters and their numbers, not in the excerpts, not in the palette. When only such documents match, the page is the same as for a word nobody wrote.
- **The documents being extracted**, at their first import: they appear as soon as the extraction ends. The palette already finds them by their title.
- **The documents of archived spaces, and archived documents**, by default: see [Archived spaces](#archived-spaces) and [Archived documents](#archived-documents).
- **Older versions**: only the current version of each document is searched.

## Privacy

Lore writes no search down: neither in the audit log, nor in the server’s logs. Opening a document from a result is a view, recorded like the others.

The search goes in the address of the page, `/search?q=…`: it stays in the browser’s history, and may appear in the access logs of a reverse proxy. See [Security and sign-in](security.md#search).

## Limits

| Limit | Value | Beyond |
| --- | --- | --- |
| Length of a search | 500 characters and 32 words | Refused, with a message under the field |
| Duration of a search | 5 seconds | “The search took too long. Make it more precise: add a word or quotes.” |
| Searches at once | 2 per person | “Another search is already running. Try again in a moment.” |
| Results browsed | 1,000 documents, in pages of 20 | Make the search more precise |

- **Excerpts.** They are plain text: a tag written in the text of a document, such as `<VirtualHost>` in a runbook, does not show in them.
- **Web addresses.** An address written at the end of a sentence in a document, followed by a period, is only found by its host name, such as `wiki.dada.group`.
- **Not in version 0.1**: searching for the beginning of a word in the content (`restaur*`), spelling suggestions, synonyms specific to an organization, filters by owner and by language, sorting by date, and recognizing the text of scanned documents.

## Search by meaning <span class="vb">v0.2</span>

From version 0.2, search will combine exact word matching and closeness in meaning: “bring a database back online” will also find “restore the billing database”.

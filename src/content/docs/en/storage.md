---
title: "Storage and extraction"
description: "Where Lore keeps the imported files, how it extracts their text and indexes it for search, and what to plan for on the server: disk, memory and settings."
---

## Files

Imported files are kept in the folder set by `LORE_FILES_PATH`:

| Installation | Default folder |
| --- | --- |
| Docker Compose | `/var/lib/lore/files`, in the files volume |
| Packages | `/var/lib/lore/files` |
| Archive | `data/files`, next to `bin/` |

- Each file is kept in the folder of its organization, under its SHA-256 hash, without its name or extension: `<organization>/ab/cd/<hash>`. Its original name, type and size are kept in the database.
- A file is never changed after it is imported.
- The same content imported several times in an organization is stored only once. Each import still creates its own document.
- A file is erased once no document of the organization uses it any more: after a document is deleted, or a space with its documents.
- **Versions.** The file and the laid-out content of each version are kept, to show and download it from the history; its passages, which only search reads, are deleted once it is no longer the current version. A document with twenty versions keeps twenty files, but the search index of one.
- If a file is missing from the disk, for example after a database was restored without its files, the page of the document says so and no longer offers to download it. Lore writes it in its logs, with the organization and the hash of the file.

### The tmp folder

A file being received is first written once to `tmp/`, inside `LORE_FILES_PATH`. Lore reads it back to compute its hash and size, then moves it to its place in one step. The extraction processes work in `tmp/extraction/`. At each start, Lore deletes from them what was left there for more than an hour: these folders do not need to be backed up. Do not put `tmp/` on a different disk from the rest of the folder: moving a file to its place must happen in one step.

### At startup

Lore checks that the folder exists, or that it can create it, and that it can write to it. Otherwise, it stops with a message that names `LORE_FILES_PATH`.

With the packages, the service can only write to `/var/lib/lore`. For a folder elsewhere, add it to `ReadWritePaths` with an override of the service:

```sh title="Terminal"
sudo systemctl edit lore
```

```ini title="Service override"
[Service]
ReadWritePaths=/srv/lore/files
```

Then restart Lore: `sudo systemctl restart lore`.

## File size

| Limit | Value | Who sets it |
| --- | --- | --- |
| Maximum size of a file | 50 MB by default, from 1 MB up to the ceiling | Owners and administrators, in *Administration › Storage and import* |
| Ceiling | 1 GB by default and at most | The person who runs the server, with `LORE_MAX_UPLOAD_SIZE` |

If the ceiling is lower than the size chosen, the ceiling applies. An empty file is refused.

Lore also refuses an import if less than 100 MB would be left free on the disk of the files.

There is no quota: the volume stored by the organization, each content counted once, is shown in *Administration › Storage and import*, with the number of documents, scanned documents, failures and extractions in progress.

Behind a reverse proxy, set its size limit a little above Lore’s: the request of an import holds the file and a few fields. See [HTTPS and reverse proxy](reverse-proxy.md).

## Text extraction

After the import, the text of each file is extracted in the background, with Apache Tika for PDF and Word documents, in processes separate from the application. A malicious or oversized file makes its own extraction fail, without ever bringing Lore down.

- **Processes started by Lore.** Lore starts them itself, with the same Java and the same program: there is nothing else to install. A process starts with the first file to handle, stops after 5 minutes without work, and is replaced every 200 files.
- **Without the secrets of the application.** These processes receive only a few system variables (`PATH`, `HOME`, temporary folders, language): neither the database password, nor any `LORE_*` variable, nor the Java options of the application (`LORE_JAVA_OPTS`, `JAVA_TOOL_OPTIONS`). They read the file, write the extracted text to `tmp/extraction/`, and Lore records the result. They run, however, under the same system account as Lore: they are not isolated from what this account can read, such as its configuration file.
- **In parallel.** `LORE_EXTRACTION_WORKERS` extractions at a time, one per process: 2 by default, from 1 to 8.
- **Limited in memory.** Each process gets `LORE_EXTRACTION_MEMORY`, 512 MB by default. If it runs out, it stops, and the extraction is tried again.
- **Limited in time.** An extraction that goes beyond `LORE_EXTRACTION_TIMEOUT`, 120 seconds by default, is stopped along with its process, then tried again.
- **Limited in text.** Lore keeps up to 10 million characters per document; beyond that, the text is truncated, and the document says so.
- **Resumed after a stop.** The extractions to run are kept in the database: after a restart, or a crash of the server, they resume on their own.

Attachments and objects embedded in documents are not read.

### Laid-out content

For a Markdown, Word or text document, the extraction also produces, in the same reading, the laid-out content that the page of the document shows. Lore cleans it, then keeps it in the database with the extracted text, never in the files folder: it takes about as much room as the text, and `pg_dump` backs it up with the rest. A PDF has none: its page shows it from its file. See [Backup and restore](backup.md).

### Failures and new attempts

| Cause | API code | What Lore does |
| --- | --- | --- |
| Time limit exceeded | `timeout` | Tries again after 1 minute, then after 5 minutes. After three attempts, the document is marked as failed, and a contributor can retry it. |
| Extraction process stopped, or a disk error on the server during extraction | `extractor_crashed` | The same. |
| File not found on the disk | `file_missing` | The same. |
| File protected by a password | `encrypted` | Fails at once. |
| Damaged file, or one built to exhaust the extraction | `corrupt` | Fails at once. |
| Content that is not of the announced format | `unsupported_content` | Fails at once. |

Extraction is not recorded in the audit log. The state of *Apache Tika*, active or the cause of a failure to start a process, is shown in *Administration › Storage and import*.

## Search index

Search adds no service: it relies on PostgreSQL’s full-text search, in the same database.

- **What is indexed.** The text of each passage, with the headings of its sections, as well as the title and the description of each document. Each of them twice: in the language of the document, French, English or other, to recognize the forms of words; and as written, without accents or capitals, for technical identifiers.
- **Always up to date.** PostgreSQL computes the index again each time a text, a title, a description or a language is written: there is no job to follow, and no index to rebuild.
- **Current version only.** A new version becomes the current one at the end of its extraction, in a single transaction: its passages and their vectors are written, then those of the previous version deleted. Measured on a document of 2,500 passages: 5.3 seconds, 4.9 of which to write the passages and their vectors, what any extraction costs, and 0.4 for the rest; meanwhile, search always finds the document, in one version or the other. Keeping the passages of each older version would cost about 10 KB per passage.
- **Room.** The vectors and their indexes take about 2.5 times the room of the text, in the database: measured on 300,000 passages of 10,000 documents, about 720 million characters. The text and the vectors of each passage are kept apart from its row: this is what makes search fast. PostgreSQL does so only beyond about 2 KB a row: short passages stay in their row, and searching a very frequent word among them reads more.
- **Backup.** `pg_dump` does not back up the vectors, which are computed from the text: PostgreSQL computes them again on restore. See [Backup and restore](backup.md).

## Memory to plan for

By default, count the memory of the application, plus about 2 × 650 MB during extractions: for each process, `LORE_EXTRACTION_MEMORY` (512 MB) and about 150 MB for Java around it.

- **Docker.** The application takes at most half of the container’s memory, to leave the rest to the extraction processes.
- **Packages and archive.** The application’s memory is set with `LORE_JAVA_OPTS`; that of the extraction processes comes on top of it.

With less than 4 GB of memory, set `LORE_EXTRACTION_WORKERS` to 1. If you raise `LORE_EXTRACTION_WORKERS` or `LORE_EXTRACTION_MEMORY`, plan the memory accordingly. See [Environment variables](variables.md).

## External extractor <span class="vb">After v0.1</span>

Apache Tika, built into Lore, is the only extractor of version 0.1. Plugging in an external extraction service, for instance for text recognition (OCR) of scanned PDF files, is planned after version 0.1.

> [!WARNING]
> **The extractor’s license.** Lore only includes components under free licenses that anyone can use. The license of an external extractor will be your organization’s responsibility: some OCR models, for instance, forbid commercial use above a certain revenue.

---
title: "Storage and extraction"
description: "Where files are kept, how their text is extracted, and how to add an external extractor."
---

## Files

Imported files are kept in the `/var/lib/lore/files` volume, named after their hash. The same file imported twice in an organization is stored only once.

## Size and quotas

50 MB per file by default. There is no quota: the volume stored per organization is shown in *Administration › Storage and import*.

## Text extraction

Extraction is done by Apache Tika, in a process separate from the application: a malicious or oversized file makes its own extraction fail, without ever bringing Lore down. Each extraction is limited in time and in text size.

## External extractor

For text recognition (OCR) or PDFs with a complex layout, you can plug in an external extraction service, in a separate container. Set its address in `LORE_EXTERNAL_EXTRACTOR_URL`.

> [!WARNING]
> **The extractor’s license.** Lore only includes components under free licenses that anyone can use. The license of an external extractor is your organization’s responsibility: some OCR models, for instance, forbid commercial use above a certain revenue.

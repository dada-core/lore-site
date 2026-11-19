---
title: "Upgrading"
description: "An upgrade means installing the new version and restarting. Database migrations are applied on startup."
---

## Upgrade

1. **Read the release notes**

   Some versions require a specific action. See the [release notes](release-notes.md).

2. **Back up**

   See [Backup and restore](backup.md).

3. **Install the new version**

   ```sh tab="Docker Compose"
   docker compose pull
   docker compose up -d
   ```

   ```sh tab="Ubuntu, Debian"
   sudo apt install ./lore_0.1.1_amd64.deb
   ```

   ```sh tab="RHEL, Rocky Linux, AlmaLinux"
   sudo dnf install ./lore-0.1.1-1.x86_64.rpm
   ```

   ```sh tab="Archive"
   tar xzf lore-0.1.1.tar.gz
   # Stop the older version, then:
   cp lore-0.1.0/conf/lore.env lore-0.1.1/conf/
   mv lore-0.1.0/data lore-0.1.1/
   lore-0.1.1/bin/lore
   ```

   The package restarts the service itself if it was running. Your settings, in `/etc/lore/lore.env`, are kept. When the template of this file changes, as in 0.1.0, `apt` asks what to do with it: keep your version (`N`, the default); in a script, add `-o Dpkg::Options::=--force-confold`. `dnf` keeps your file and puts the new template next to it, in `lore.env.rpmnew`.

   With the archive, the imported files are in `data/files`, next to `bin/`: move the `data` folder into the new version, unless `LORE_FILES_PATH` names a folder outside the archive. On Windows: `Move-Item lore-0.1.0\data lore-0.1.1\`.

   With Docker Compose, `docker compose pull` installs the latest patch release of the tag written in `docker-compose.yml`, for example `0.1`. To move to the next release, first replace this tag, for example with `0.2`, or download the `docker-compose.yml` file of the new release.

4. **Check**

   ```sh tab="Docker Compose"
   docker compose logs -f lore
   ```

   ```sh tab="Packages"
   sudo journalctl -u lore -f
   ```

## From the 0.1.0-beta.1 preview

Version 0.1.0 adds no migration: the data is carried over as it is, with no new extraction.

Before the upgrade, check these points:

- **Reverse proxy.** Lore no longer trusts the `X-Forwarded-*` headers coming from any private network, only those of the proxies declared in `LORE_TRUSTED_PROXIES`, by default a proxy on the same machine with the packages and the archive, and none outside the container with Docker. Before, a computer on the local network that reached Lore directly could choose the IP address written in the log and get around the lockout by IP address. Behind a proxy on another machine, or with Docker behind a proxy, declare it: otherwise, every request carries the address of the proxy, and Lore’s logs point it out. See [Declare the proxy](reverse-proxy.md#declare-the-proxy).
- **Docker Compose.** The file of the preview names the `0.1.0-beta.1` image: download the `docker-compose.yml` of version 0.1.0 and carry your changes over to it, or, in yours, replace the tag with `0.1`. Behind a proxy, also add the `LORE_TRUSTED_PROXIES` line shown in the [installation](installation.md#docker-compose), which reads it from `.env`, and follow [With Docker Compose](reverse-proxy.md#with-docker-compose).
- **Fixed setup code.** With a `LORE_SETUP_CODE` shorter than 12 characters, spaces and hyphens not counted, Lore now refuses to start until the initial setup is done. An installation already set up is not affected. See [Initial setup](initial-setup.md#the-setup-code).

After the upgrade:

- **Signing in again.** When `LORE_PUBLIC_URL` uses HTTPS, everyone signs in again once: the cookies change names (`__Host-LORE_SESSION`, `__Host-XSRF-TOKEN`), and the former sessions no longer work; they expire after the inactivity timeout, and until then may still be listed in *My account*. A script that reads the `XSRF-TOKEN` cookie must also accept the prefixed name. See [Security and sign-in](security.md#sessions).
- **Sign-in attempts.** The counters start again from zero, and current lockouts are lifted.
- **Pending links.** The invitations and reset links created by an administrator demoted, disabled or removed before the upgrade stay valid until they expire, unless that person is later disabled or removed: revoke the pending invitations in *Administration › Members*; a reset link expires after 24 hours, or is cancelled by a new link created for the same person.
- **Scanned documents.** The new rule for scanned documents only applies to files imported afterwards: a document already marked *Scanned*, such as a presentation without any image, stays so until a new version is imported. See [Extraction states](import.md#extraction-states).

## From the 0.1.0-alpha.4 preview

The 0.1.0-beta.1 preview, which brings versions, statuses and the screen of the audit log, adds a few columns, an index of the replacements and three indexes of the log at its first start. Only the date of each document’s status and the extent of its first version are written, and no document is extracted again: about 1 second for 10,000 documents, then 1.4 seconds for the indexes of a log of 1.3 million events. Lore only starts once the migration is over.

- **Statuses.** Each document keeps its status; the date of that status is its creation date.
- **Versions.** Each document keeps its single version, which stays its current version.

## From the 0.1.0-alpha.3 preview

The 0.1.0-alpha.4 preview, which brings search, computes at its first start the search index of the documents already imported: PostgreSQL rewrites the table of passages, keeping their text and their vectors apart from their row, then builds the indexes. No document is extracted again, and each keeps the language detected at its import.

- **Duration.** About 6 minutes, measured on 300,000 passages, that is about 720 million characters in 10,000 documents.
- **During the migration, Lore does not start yet**: neither the interface nor the API answers. Plan for this window, and follow the migration in the logs, as in the *Check* step.
- **Room.** The vectors and their indexes take about 2.5 times the room of the text, in the database. For the time of the migration, rewriting the table of passages also needs the room of a copy of that table. See [Storage and extraction](storage.md#search-index).

## From the 0.1.0-alpha.2 preview

The 0.1.0-alpha.3 preview, which brings the document reader, extracts again, at its first start, the current version of each Markdown, Word and text document already indexed: this is how it receives the laid-out content its page shows. These documents show *In progress* during their extraction, a few moments each, then go back to *Indexed*. PDFs and failed documents do not change.

This content is kept in the database: count about the size of the text of these documents on top, which `pg_dump` backs up with the rest. See [Storage and extraction](storage.md#laid-out-content).

## Roll back

Database migrations cannot be undone. To go back to a previous version, restore the backup made before the upgrade, then reinstall the older version: the older image, or the older package with `sudo apt install --allow-downgrades` or `sudo dnf downgrade`.

## Files of each release

Each release is published on the [repository’s releases page](https://github.com/dada-core/lore/releases), with these files:

| File | Contents |
| --- | --- |
| `lore-0.1.0.tar.gz`, `lore-0.1.0.zip` | The universal archive |
| `lore_0.1.0_amd64.deb`, `lore_0.1.0_arm64.deb` | The packages for Ubuntu and Debian |
| `lore-0.1.0-1.x86_64.rpm`, `lore-0.1.0-1.aarch64.rpm` | The packages for RHEL, Rocky Linux and AlmaLinux |
| `docker-compose.yml` | The Docker Compose file, with the image of the release |
| `SHA256SUMS` | The checksums, to verify with `sha256sum --check --ignore-missing SHA256SUMS` |

## Image tags

| Tag | Content |
| --- | --- |
| `0.1` | The latest patch release of 0.1, recommended; the `docker-compose.yml` of a release names it |
| `0.1.0` | A specific release |
| `0.1.0-beta.1` | A preview, which only has its own tag |
| `0.1.0-candidate` | The image of a release during its checks, before it is published: do not use it |

There is no `latest` tag.

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
   cp lore-0.1.0/conf/lore.env lore-0.1.1/conf/
   # Stop the older version, then:
   lore-0.1.1/bin/lore
   ```

   The package restarts the service itself if it was running. Your settings, in `/etc/lore/lore.env`, are kept.

   With Docker Compose, `docker compose pull` installs the latest patch release of the tag written in `docker-compose.yml`, for example `0.1`. To move to the next release, first replace this tag, for example with `0.2`, or download the `docker-compose.yml` file of the new release.

4. **Check**

   ```sh tab="Docker Compose"
   docker compose logs -f lore
   ```

   ```sh tab="Packages"
   sudo journalctl -u lore -f
   ```

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
| `0.1` | The latest patch release of 0.1, recommended |
| `0.1.3` | A specific release |

---
title: "Backup and restore"
description: "Two things to back up: the PostgreSQL database and the imported files. Keep your settings too: the .env file with Docker, lore.env otherwise."
---

## Back up

```sh tab="Docker Compose"
# Database, in pg_dump's custom format
docker compose exec -T postgres pg_dump -U lore -Fc lore > lore-$(date +%F).dump

# Imported files
docker run --rm -v lore_files:/data -v "$PWD":/backup alpine \
  tar czf /backup/files-$(date +%F).tar.gz --exclude=./tmp -C /data .
```

```sh tab="Packages"
# Database, in pg_dump's custom format
sudo -u postgres pg_dump -Fc lore > lore-$(date +%F).dump

# Imported files
sudo tar czf files-$(date +%F).tar.gz --exclude=./tmp -C /var/lib/lore/files .
```

With Docker, the volume name depends on the Docker Compose project folder: check it with `docker volume ls`. If PostgreSQL runs on another server, add the `-h` (host) and `-U lore` options to `pg_dump` and `pg_restore`, without `sudo -u postgres`. With the archive, the commands are those of the packages, with the archive’s `data/files` folder.

**Order and limit.** Back up the database, then the files. Lore keeps running meanwhile: a document deleted between the two comes back at the restore without its file (“The file of this document cannot be found on the server. Tell the person who runs Lore.”); a file imported after the copy of the database stays on disk without a document. For a copy without any gap, stop Lore while you back up (`docker compose stop lore`, or `sudo systemctl stop lore`), then start it again.

**Times.** On a database of 10,000 documents and 300,000 passages, `pg_dump -Fc` takes 30 seconds and produces 226 MB; the restore takes about 5 minutes, as PostgreSQL computes the search vectors and indexes again, which are not in the copy.

The `tmp/` folder of the imported files does not need to be backed up: at each start, Lore deletes from it what was left there for more than an hour. With the archive, the imported files are in `data/files`, next to `bin/`, unless `LORE_FILES_PATH` names another folder.

## Restore

1. **Stop the application**

   ```sh tab="Docker Compose"
   docker compose stop lore
   ```

   ```sh tab="Packages"
   sudo systemctl stop lore
   ```

2. **Restore the database**

   ```sh tab="Docker Compose"
   docker compose exec -T postgres pg_restore -U lore -d lore --clean --if-exists < lore-2026-11-10.dump
   ```

   ```sh tab="Packages"
   sudo -u postgres pg_restore -d lore --clean --if-exists < lore-2026-11-10.dump
   ```

3. **Restore the files**

   ```sh tab="Docker Compose"
   docker run --rm -v lore_files:/data -v "$PWD":/backup alpine \
     tar xzf /backup/files-2026-11-10.tar.gz -C /data
   ```

   ```sh tab="Packages"
   sudo tar xzf files-2026-11-10.tar.gz -C /var/lib/lore/files
   ```

4. **Start again**

   ```sh tab="Docker Compose"
   docker compose start lore
   ```

   ```sh tab="Packages"
   sudo systemctl start lore
   ```

> [!TIP]
> **Test your restores.** A backup that was never restored is only a hypothesis. Restore regularly on a test machine. Lore’s continuous integration runs these backups and restores, with the commands of this page, at each change.

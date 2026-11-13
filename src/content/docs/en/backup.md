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
  tar czf /backup/files-$(date +%F).tar.gz -C /data .
```

```sh tab="Packages"
# Database, in pg_dump's custom format
sudo -u postgres pg_dump -Fc lore > lore-$(date +%F).dump

# Imported files
sudo tar czf files-$(date +%F).tar.gz -C /var/lib/lore/files .
```

With Docker, the volume name depends on the Docker Compose project folder: check it with `docker volume ls`. If PostgreSQL runs on another server, add the `-h` (host) and `-U lore` options to `pg_dump`.

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
> **Test your restores.** A backup that was never restored is only a hypothesis. Restore regularly on a test machine.

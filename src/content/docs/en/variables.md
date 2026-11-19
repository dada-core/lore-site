---
title: "Environment variables"
description: "Lore is configured with environment variables: in docker-compose.yml with Docker, in /etc/lore/lore.env with the packages, in conf/lore.env with the archive. Only one is required: the database password."
---

## Essential

| Variable | Description |
| --- | --- |
| `LORE_DB_PASSWORD` | The PostgreSQL database password. Required. |
| `LORE_PUBLIC_URL` | The address your team uses to open Lore, for example `https://lore.example.com`, used in invitation and reset links. Optional: without it, Lore uses the address entered during the initial setup. When it is set, it takes precedence and can no longer be changed in the administration. The published `docker-compose.yml` and the `lore.env` of the packages and the archive set it to `http://localhost:8080`: replace it with your team’s address. |

## Database

| Variable | Default | Description |
| --- | --- | --- |
| `LORE_DB_HOST` | `postgres` (`localhost` in the settings file of the packages and the archive) | PostgreSQL host |
| `LORE_DB_PORT` | `5432` | Port |
| `LORE_DB_NAME` | `lore` | Database name |
| `LORE_DB_USER` | `lore` | User |

## Import and extraction

| Variable | Default | Description |
| --- | --- | --- |
| `LORE_FILES_PATH` | `/var/lib/lore/files` (Docker and packages), `data/files` next to `bin/` (archive) | Folder of the imported files and of their temporary files (`tmp/`). Lore checks at startup that it can write to it. With the packages, a folder outside `/var/lib/lore` must also be added to `ReadWritePaths`. |
| `LORE_MAX_UPLOAD_SIZE` | `1GB` | Ceiling of the size of a file, from `1MB` to `1GB`. The size in force is set below it, in *Administration › Storage and import*: 50 MB by default. |
| `LORE_EXTRACTION_WORKERS` | `2` | Text extractions running in parallel, one per process, from 1 to 8 |
| `LORE_EXTRACTION_TIMEOUT` | `120s` | Maximum extraction time for a file, at least 10 seconds |
| `LORE_EXTRACTION_MEMORY` | `512MB` | Memory of each extraction process, at least 128 MB |

See [Storage and extraction](storage.md).

## Emails (optional) <span class="vb">Planned</span>

Sending invitations and resets by email is planned: Lore does not read these variables yet. Until then, links are passed on by hand, without a mail server.

| Variable | Description |
| --- | --- |
| `LORE_SMTP_HOST` | SMTP server |
| `LORE_SMTP_PORT` | Port, often 587 |
| `LORE_SMTP_USER` | Username |
| `LORE_SMTP_PASSWORD` | Password |
| `LORE_SMTP_FROM` | Sender address |

## Other

| Variable | Default | Description |
| --- | --- | --- |
| `LORE_SESSION_TIMEOUT` | `8h` | Longest a session can stay inactive. *Administration › Security and sign-in* can lower it, not exceed it. |
| `LORE_SETUP_CODE` | empty | A fixed initial setup code, for automated installations: at least 12 characters, spaces and hyphens not counted: with a shorter one, Lore refuses to start until the initial setup is done, and its logs name the variable. When empty, a random code is written to the logs. See [Initial setup](initial-setup.md#the-setup-code). |
| `LORE_LOG_LEVEL` | `INFO` | Logging level. Even in `DEBUG` or `TRACE`, Lore writes neither the passwords, nor the invitation and reset links, nor the setup code typed in the browser, nor the searches, nor the session cookies; the random code itself is written to the logs until the setup is done. `DEBUG` and `TRACE` remain for troubleshooting only: libraries write other details of the requests there. Go back to `INFO` right away, then delete these logs. |
| `LORE_PORT` | `8080` | Lore’s port, with the packages and the archive. With Docker, change the published port instead. |
| `LORE_TRUSTED_PROXIES` | `127.0.0.0/8, ::1/128` | The reverse proxies whose `X-Forwarded-*` headers Lore trusts: ranges in CIDR notation, each with its “/”, separated by commas, for example `10.0.0.5/32, 10.0.0.6/32`. By default, a proxy on the same machine, with the packages and the archive; with Docker, no proxy outside the container: see [With Docker Compose](reverse-proxy.md#with-docker-compose). Empty: no proxy (with Docker Compose, an empty value in `.env` gives back the default value). A list without any “/”, or a host or container name instead of an address, keeps Lore from starting, like a malformed range. **As narrow as possible.** Any machine of a declared range that reaches Lore directly can choose the address recorded: declare the address of the proxy alone (`10.0.0.5/32`), not the network of your computers. See [HTTPS and reverse proxy](reverse-proxy.md#declare-the-proxy). |
| `LORE_JAVA_OPTS` | `-XX:MaxRAMPercentage=25` | Java options of the application, with the packages and the archive, for example `-Xmx2g` for the memory. The extraction processes have their own: `LORE_EXTRACTION_MEMORY`. |

## Where to set them

| Method | File | After a change |
| --- | --- | --- |
| Docker Compose | The `environment` section of the `lore` service, in `docker-compose.yml`. The `.env` file only provides the three variables this file reads (`LORE_PUBLIC_URL`, `DB_PASSWORD`, `LORE_TRUSTED_PROXIES`): another variable written in `.env` is ignored. | `docker compose up -d` |
| Packages | `/etc/lore/lore.env` | `sudo systemctl restart lore` |
| Archive | `conf/lore.env` | Restart Lore |

## Example

With Docker, secrets stay in the `.env` file next to `docker-compose.yml`, and are referenced with the `${…}` syntax. With the packages and the archive, the file holds one variable per line:

```yaml tab="docker-compose.yml"
services:
  lore:
    environment:
      LORE_PUBLIC_URL: https://lore.example.com
      LORE_DB_PASSWORD: ${DB_PASSWORD}
      LORE_SESSION_TIMEOUT: 4h
```

```sh tab="lore.env"
LORE_PUBLIC_URL=https://lore.example.com
LORE_DB_HOST=localhost
LORE_DB_PASSWORD='a-long-password'
LORE_SESSION_TIMEOUT=4h
```

In `lore.env`, put a value in straight single quotes if it contains spaces or special characters. With the archive on Windows, use straight double quotes instead: single quotes would become part of the value. For `LORE_TRUSTED_PROXIES`, separate the ranges with commas, without spaces: `10.0.0.5/32,10.0.0.6/32`.

---
title: Installation
description: "Three ways to install Lore on your server: Docker Compose, a .deb or .rpm package, or the universal archive. Lore only needs PostgreSQL 18."
---

> [!NOTE]
> **Lore is not released yet.** The files to download and the Docker image on this page will be available with version 0.1. Until then, you can try Lore from its [source code](https://github.com/dada-core/lore#try-it-from-source).

## Choose a method

| Method | For | What you need |
| --- | --- | --- |
| [Docker Compose](#docker-compose) | The quickest: a trial, or a server that already runs Docker | Docker 24 or later, with Docker Compose |
| [.deb or .rpm package](#deb-and-rpm-packages) | A Linux server managed like the others: a systemd service, updates through the package manager | A [supported distribution](#supported-distributions) and PostgreSQL 18 |
| [Universal archive](#universal-archive) | Any other system, Windows and macOS included | Java 21 or later and PostgreSQL 18 |

In every case, plan for 2 CPUs and 4 GB of memory for a team (as a guide), 10 GB of disk plus the size of your documents, and port 8080 or a reverse proxy for HTTPS.

> [!TIP]
> **No default password.** The first administrator account is created in the browser, during the [initial setup](initial-setup.md).

## Docker Compose

Two containers, the application and PostgreSQL 18. The `docker-compose.yml` file is published with each release of Lore:

```sh tab="Linux and macOS"
curl -LO https://github.com/dada-core/lore/releases/latest/download/docker-compose.yml
echo "DB_PASSWORD=$(openssl rand -base64 24)" > .env
docker compose up -d
```

```powershell tab="Windows"
Invoke-WebRequest https://github.com/dada-core/lore/releases/latest/download/docker-compose.yml -OutFile docker-compose.yml
Set-Content .env "DB_PASSWORD=choose-a-long-password"
docker compose up -d
```

On Windows and macOS, this installation is fine for a trial. In production, prefer a Linux server.

The `.env` file holds the database password. Keep it with your secrets: you also need it to restore a backup.

On a server, add to this file the address your team will use to open Lore, replacing `lore.example.com`, then restart the containers. This address appears in invitation links. See [Environment variables](variables.md).

```sh
echo "LORE_PUBLIC_URL=https://lore.example.com" >> .env
docker compose up -d
```

The downloaded file describes both containers and their volumes:

```yaml title="docker-compose.yml"
# Lore and its PostgreSQL database.
#
#   echo "DB_PASSWORD=$(openssl rand -base64 24)" > .env
#   docker compose up -d
#
# Then open http://localhost:8080: the setup code is in the logs (docker compose logs lore).

services:
  lore:
    image: ghcr.io/dada-core/lore:0.1
    ports:
      - "8080:8080"
    environment:
      # The address your team will use to open Lore: it appears in invitation links.
      LORE_PUBLIC_URL: ${LORE_PUBLIC_URL:-http://localhost:8080}
      LORE_DB_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD in the .env file next to docker-compose.yml}
    volumes:
      - files:/var/lib/lore/files
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: pgvector/pgvector:pg18
    environment:
      POSTGRES_DB: lore
      POSTGRES_USER: lore
      POSTGRES_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD in the .env file next to docker-compose.yml}
    volumes:
      - db:/var/lib/postgresql
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "lore", "-d", "lore"]
      interval: 5s
      timeout: 3s
      retries: 10
    restart: unless-stopped

volumes:
  files:
  db:
```

To check that both containers are running:

```sh
docker compose ps
```

## .deb and .rpm packages

The package holds Lore and its own Java runtime: there is nothing else to install but PostgreSQL 18. It creates the `lore` system user and the `lore` service, without starting it.

### Supported distributions

| Distribution | Releases | File |
| --- | --- | --- |
| Ubuntu | 22.04, 24.04 and 26.04 LTS | `lore_0.1.0_amd64.deb`, `lore_0.1.0_arm64.deb` |
| Debian | 12 and 13 | `lore_0.1.0_amd64.deb`, `lore_0.1.0_arm64.deb` |
| RHEL, Rocky Linux, AlmaLinux | 8, 9 and 10 | `lore-0.1.0-1.x86_64.rpm`, `lore-0.1.0-1.aarch64.rpm` |

Continuous integration tests the package installation on each of these distributions on amd64 (x86_64), and on Ubuntu 22.04, Debian 13, AlmaLinux 8 and 10 on arm64 (aarch64).

### 1. Install PostgreSQL 18

Lore needs PostgreSQL 18 or later, with the `unaccent` extension, which ships with PostgreSQL. The database may also run on another server.

| Distribution | Default release | PostgreSQL 18 |
| --- | --- | --- |
| Ubuntu 26.04 | 18 | Provided by the distribution |
| Ubuntu 22.04 and 24.04, Debian 12 and 13 | 14, 16, 15 and 17 | Official PostgreSQL repository (PGDG) |
| RHEL 8 | 10 (streams up to 16) | Official PostgreSQL repository (PGDG) |
| RHEL 9 | 13 | The distribution’s `postgresql:18` module stream |
| RHEL 10 | 16 | The distribution’s `postgresql18` packages |

```sh tab="Ubuntu 26.04"
sudo apt install postgresql-18
```

```sh tab="Ubuntu 22.04, 24.04, Debian"
sudo apt install postgresql-common gnupg
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh
sudo apt install postgresql-18
```

```sh tab="RHEL 8"
sudo dnf install https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-$(uname -m)/pgdg-redhat-repo-latest.noarch.rpm
sudo dnf -qy module disable postgresql
sudo dnf install postgresql18-server postgresql18-contrib
sudo /usr/pgsql-18/bin/postgresql-18-setup initdb
sudo systemctl enable --now postgresql-18
```

```sh tab="RHEL 9"
sudo dnf module enable postgresql:18
sudo dnf install postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo sed -i 's/ident$/scram-sha-256/' /var/lib/pgsql/data/pg_hba.conf
sudo systemctl enable --now postgresql
```

```sh tab="RHEL 10"
sudo dnf install postgresql18-server postgresql18-contrib
sudo postgresql-setup --initdb
sudo sed -i 's/ident$/scram-sha-256/' /var/lib/pgsql/data/pg_hba.conf
sudo systemctl enable --now postgresql
```

The RHEL commands also apply to Rocky Linux and AlmaLinux. On RHEL 9 and 10, the `sed` command replaces the `ident` authentication of local connections with a password, the one Lore uses.

Then create Lore’s role and database:

```sh
sudo -u postgres createuser --pwprompt lore
sudo -u postgres createdb --owner lore lore
```

### 2. Install Lore

```sh tab="Ubuntu, Debian"
curl -LO https://github.com/dada-core/lore/releases/download/v0.1.0/lore_0.1.0_amd64.deb
sudo apt install ./lore_0.1.0_amd64.deb
```

```sh tab="RHEL, Rocky Linux, AlmaLinux"
curl -LO https://github.com/dada-core/lore/releases/download/v0.1.0/lore-0.1.0-1.x86_64.rpm
sudo dnf install ./lore-0.1.0-1.x86_64.rpm
```

On an arm64 server, take `lore_0.1.0_arm64.deb` or `lore-0.1.0-1.aarch64.rpm`.

### 3. Configure and start

In `/etc/lore/lore.env`, set Lore’s address (`LORE_PUBLIC_URL`) and the database password you chose (`LORE_DB_PASSWORD`). Then:

```sh
sudo systemctl enable --now lore
sudo journalctl -u lore | grep -A 3 "setup code"
```

The second command shows the [initial setup](initial-setup.md) code. On RHEL, open the port if the firewall is on: `sudo firewall-cmd --permanent --add-port=8080/tcp`, then `sudo firewall-cmd --reload`.

### File locations

| Path | Contents |
| --- | --- |
| `/etc/lore/lore.env` | The settings, readable by root and the `lore` group |
| `/opt/lore` | The program and its Java runtime |
| `/var/lib/lore` | The imported files, kept on removal |
| `journalctl -u lore` | The logs |

## Universal archive

The archive runs on any system with Java 21 or later (Eclipse Temurin, for example) and a PostgreSQL 18 database, prepared as for the packages.

```sh tab="Linux and macOS"
curl -LO https://github.com/dada-core/lore/releases/download/v0.1.0/lore-0.1.0.tar.gz
tar xzf lore-0.1.0.tar.gz
cd lore-0.1.0
cp conf/lore.env.example conf/lore.env
bin/lore
```

```powershell tab="Windows"
Invoke-WebRequest https://github.com/dada-core/lore/releases/download/v0.1.0/lore-0.1.0.zip -OutFile lore-0.1.0.zip
Expand-Archive lore-0.1.0.zip .
cd lore-0.1.0
Copy-Item conf\lore.env.example conf\lore.env
bin\lore.cmd
```

Before you start Lore, set Lore’s address and the database access in `conf/lore.env`. Lore then runs in the foreground and prints the initial setup code in the terminal. For a permanent service on Linux, prefer the packages.

| File | Contents |
| --- | --- |
| `bin/lore`, `bin/lore.cmd` | The `lore` command, for Linux and macOS, and for Windows |
| `lib/lore.jar` | The program |
| `conf/lore.env.example` | The settings template |

## The lore command

The `lore` command administers Lore on the server: `lore help` lists the commands, `lore reset-password <email>` prints a password reset link for an account.

| Method | Example |
| --- | --- |
| Docker Compose | `docker compose exec lore lore help` |
| Packages | `sudo lore help` |
| Archive | `bin/lore help`, or `bin\lore.cmd help` on Windows |

## Uninstall

Make a [backup](backup.md) first.

| Method | Command | What stays |
| --- | --- | --- |
| Docker Compose | `docker compose down` | The database and files volumes. `docker compose down -v` deletes them too. |
| Packages | `sudo apt remove lore` or `sudo dnf remove lore` | `/var/lib/lore`, the PostgreSQL database and the `lore` user. `sudo apt purge lore` also deletes `/etc/lore`. |
| Archive | Stop Lore, then delete its folder | The PostgreSQL database. |

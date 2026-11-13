---
title: Installation
description: "Trois façons d’installer Lore sur votre serveur : Docker Compose, un paquet .deb ou .rpm, ou l’archive universelle. Lore n’a besoin que de PostgreSQL 18."
---

> [!NOTE]
> **La version 0.1 n’est pas encore publiée.** Une préversion, [0.1.0-alpha.1](https://github.com/dada-core/lore/releases/tag/v0.1.0-alpha.1), permet déjà d’essayer l’installation avec ce qui fonctionne aujourd’hui : la configuration initiale, la connexion, les invitations et l’administration de l’organisation. Pour l’installer, remplacez dans les commandes de cette page `latest/download` par `download/v0.1.0-alpha.1` (Docker Compose), et `0.1.0` par `0.1.0-alpha.1` (paquets et archive). Elle n’est pas faite pour la production : ses données ne seront pas forcément reprises par la version suivante.

## Choisir une méthode

| Méthode | Pour qui | Ce qu’il faut |
| --- | --- | --- |
| [Docker Compose](#docker-compose) | Le plus rapide : un essai, ou un serveur qui fait déjà tourner Docker | Docker 24 ou plus récent, avec Docker Compose |
| [Paquet .deb ou .rpm](#paquets-deb-et-rpm) | Un serveur Linux administré comme les autres : service systemd, mises à jour par le gestionnaire de paquets | Une [distribution prise en charge](#distributions-prises-en-charge) et PostgreSQL 18 |
| [Archive universelle](#archive-universelle) | Tout autre système, Windows et macOS compris | Java 21 ou plus récent et PostgreSQL 18 |

Dans tous les cas, comptez 2 processeurs et 4 Go de mémoire pour une équipe (indicatif), 10 Go de disque plus le volume de vos documents, et le port 8080 ou un proxy inverse pour le HTTPS.

> [!TIP]
> **Aucun mot de passe par défaut.** Le premier compte administrateur est créé dans le navigateur, lors de la [configuration initiale](initial-setup.md).

## Docker Compose

Deux conteneurs, l’application et PostgreSQL 18. Le fichier `docker-compose.yml` est publié avec chaque version de Lore :

```sh tab="Linux et macOS"
curl -LO https://github.com/dada-core/lore/releases/latest/download/docker-compose.yml
echo "DB_PASSWORD=$(openssl rand -base64 24)" > .env
docker compose up -d
```

```powershell tab="Windows"
Invoke-WebRequest https://github.com/dada-core/lore/releases/latest/download/docker-compose.yml -OutFile docker-compose.yml
Set-Content .env "DB_PASSWORD=choisissez-un-mot-de-passe-long"
docker compose up -d
```

Sous Windows et macOS, cette installation convient pour un essai. En production, préférez un serveur Linux.

Le fichier `.env` contient le mot de passe de la base. Conservez-le avec vos secrets : il sert aussi à restaurer une sauvegarde.

Sur un serveur, ajoutez à ce fichier l’adresse à laquelle votre équipe ouvrira Lore, en remplaçant `lore.example.com`, puis relancez les conteneurs. Cette adresse figure dans les liens d’invitation. Voir [Variables d’environnement](variables.md).

```sh
echo "LORE_PUBLIC_URL=https://lore.example.com" >> .env
docker compose up -d
```

Le fichier téléchargé décrit les deux conteneurs et leurs volumes :

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

Pour vérifier que les deux conteneurs tournent :

```sh
docker compose ps
```

## Paquets .deb et .rpm

Le paquet contient Lore et son propre environnement Java : il n’y a rien d’autre à installer que PostgreSQL 18. Il crée l’utilisateur système `lore` et le service `lore`, sans le démarrer.

### Distributions prises en charge

| Distribution | Versions | Fichier |
| --- | --- | --- |
| Ubuntu | 22.04, 24.04 et 26.04 LTS | `lore_0.1.0_amd64.deb`, `lore_0.1.0_arm64.deb` |
| Debian | 12 et 13 | `lore_0.1.0_amd64.deb`, `lore_0.1.0_arm64.deb` |
| RHEL, Rocky Linux, AlmaLinux | 8, 9 et 10 | `lore-0.1.0-1.x86_64.rpm`, `lore-0.1.0-1.aarch64.rpm` |

L’intégration continue teste l’installation des paquets sur chacune de ces distributions en amd64 (x86_64), et sur Ubuntu 22.04, Debian 13, AlmaLinux 8 et 10 en arm64 (aarch64).

### 1. Installer PostgreSQL 18

Lore demande PostgreSQL 18 ou plus récent, avec l’extension `unaccent`, livrée avec PostgreSQL. La base peut aussi tourner sur un autre serveur.

| Distribution | Version par défaut | PostgreSQL 18 |
| --- | --- | --- |
| Ubuntu 26.04 | 18 | Fourni par la distribution |
| Ubuntu 22.04 et 24.04, Debian 12 et 13 | 14, 16, 15 et 17 | Dépôt officiel de PostgreSQL (PGDG) |
| RHEL 8 | 10 (flux jusqu’à 16) | Dépôt officiel de PostgreSQL (PGDG) |
| RHEL 9 | 13 | Flux de modules `postgresql:18` de la distribution |
| RHEL 10 | 16 | Paquets `postgresql18` de la distribution |

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

Les commandes RHEL valent aussi pour Rocky Linux et AlmaLinux. Sous RHEL 9 et 10, la commande `sed` remplace l’authentification `ident` des connexions locales par un mot de passe, celui que Lore utilise.

Créez ensuite le rôle et la base de Lore :

```sh
sudo -u postgres createuser --pwprompt lore
sudo -u postgres createdb --owner lore lore
```

### 2. Installer Lore

```sh tab="Ubuntu, Debian"
curl -LO https://github.com/dada-core/lore/releases/download/v0.1.0/lore_0.1.0_amd64.deb
sudo apt install ./lore_0.1.0_amd64.deb
```

```sh tab="RHEL, Rocky Linux, AlmaLinux"
curl -LO https://github.com/dada-core/lore/releases/download/v0.1.0/lore-0.1.0-1.x86_64.rpm
sudo dnf install ./lore-0.1.0-1.x86_64.rpm
```

Sur un serveur arm64, prenez `lore_0.1.0_arm64.deb` ou `lore-0.1.0-1.aarch64.rpm`.

### 3. Configurer et démarrer

Dans `/etc/lore/lore.env`, indiquez l’adresse de Lore (`LORE_PUBLIC_URL`) et le mot de passe choisi pour la base (`LORE_DB_PASSWORD`). Puis :

```sh
sudo systemctl enable --now lore
sudo journalctl -u lore | grep -A 3 "setup code"
```

La seconde commande affiche le code de la [configuration initiale](initial-setup.md). Sous RHEL, ouvrez le port si le pare-feu est actif : `sudo firewall-cmd --permanent --add-port=8080/tcp`, puis `sudo firewall-cmd --reload`.

### Emplacements

| Chemin | Contenu |
| --- | --- |
| `/etc/lore/lore.env` | Les réglages, lisibles par root et par le groupe `lore` |
| `/opt/lore` | Le programme et son environnement Java |
| `/var/lib/lore` | Les fichiers importés, conservés à la désinstallation |
| `journalctl -u lore` | Les journaux |

## Archive universelle

L’archive fonctionne sur tout système qui dispose de Java 21 ou plus récent (par exemple Eclipse Temurin) et d’une base PostgreSQL 18, préparée comme pour les paquets.

```sh tab="Linux et macOS"
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

Avant de lancer Lore, indiquez dans `conf/lore.env` l’adresse de Lore et l’accès à la base. Lore tourne alors au premier plan et affiche le code de configuration initiale dans le terminal. Pour un service permanent sous Linux, préférez les paquets.

| Fichier | Contenu |
| --- | --- |
| `bin/lore`, `bin/lore.cmd` | La commande `lore`, pour Linux et macOS, et pour Windows |
| `lib/lore.jar` | Le programme |
| `conf/lore.env.example` | Le modèle des réglages |

## La commande lore

La commande `lore` administre Lore sur le serveur : `lore help` liste les commandes, `lore reset-password <e-mail>` affiche un lien de réinitialisation du mot de passe d’un compte.

| Méthode | Exemple |
| --- | --- |
| Docker Compose | `docker compose exec lore lore help` |
| Paquets | `sudo lore help` |
| Archive | `bin/lore help`, ou `bin\lore.cmd help` sous Windows |

## Désinstaller

Faites d’abord une [sauvegarde](backup.md).

| Méthode | Commande | Ce qui reste |
| --- | --- | --- |
| Docker Compose | `docker compose down` | Les volumes de la base et des fichiers. `docker compose down -v` les efface aussi. |
| Paquets | `sudo apt remove lore` ou `sudo dnf remove lore` | `/var/lib/lore`, la base PostgreSQL et l’utilisateur `lore`. `sudo apt purge lore` efface aussi `/etc/lore`. |
| Archive | Arrêtez Lore, puis supprimez le dossier | La base PostgreSQL. |

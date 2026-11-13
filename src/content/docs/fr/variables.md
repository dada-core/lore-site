---
title: "Variables d’environnement"
description: "Lore se configure par variables d’environnement : dans docker-compose.yml avec Docker, dans /etc/lore/lore.env avec les paquets, dans conf/lore.env avec l’archive. Une seule est obligatoire : le mot de passe de la base."
---

## Essentielles

| Variable | Description |
| --- | --- |
| `LORE_DB_PASSWORD` | Le mot de passe de la base PostgreSQL. Obligatoire. |
| `LORE_PUBLIC_URL` | L’adresse à laquelle votre équipe ouvre Lore, par exemple `https://lore.example.com`, utilisée dans les liens d’invitation et de réinitialisation. Facultative : sans elle, Lore reprend l’adresse saisie à la configuration initiale. Si elle est définie, elle prime et ne se modifie plus dans l’administration. |

## Base de données

| Variable | Défaut | Description |
| --- | --- | --- |
| `LORE_DB_HOST` | `postgres` (`localhost` dans le fichier des paquets et de l’archive) | Hôte PostgreSQL |
| `LORE_DB_PORT` | `5432` | Port |
| `LORE_DB_NAME` | `lore` | Nom de la base |
| `LORE_DB_USER` | `lore` | Utilisateur |

## Import et extraction <span class="vb">v0.1</span>

Ces variables arrivent avec l’import de documents : Lore ne les lit pas encore.

| Variable | Défaut | Description |
| --- | --- | --- |
| `LORE_MAX_UPLOAD_SIZE` | `50MB` | Taille maximale d’un fichier |
| `LORE_FILES_PATH` | `/var/lib/lore/files` | Dossier des fichiers importés |
| `LORE_EXTRACTION_WORKERS` | `2` | Processus d’extraction en parallèle |
| `LORE_EXTRACTION_TIMEOUT` | `120s` | Durée maximale d’extraction d’un fichier |
| `LORE_EXTERNAL_EXTRACTOR_URL` | vide | Adresse d’un extracteur externe facultatif |

## E-mails (facultatif) <span class="vb">Prévu</span>

L’envoi des invitations et des réinitialisations par e-mail est prévu : Lore ne lit pas encore ces variables. En attendant, les liens se transmettent à la main, sans serveur de messagerie.

| Variable | Description |
| --- | --- |
| `LORE_SMTP_HOST` | Serveur SMTP |
| `LORE_SMTP_PORT` | Port, souvent 587 |
| `LORE_SMTP_USER` | Identifiant |
| `LORE_SMTP_PASSWORD` | Mot de passe |
| `LORE_SMTP_FROM` | Adresse d’expédition |

## Divers

| Variable | Défaut | Description |
| --- | --- | --- |
| `LORE_SESSION_TIMEOUT` | `8h` | Durée maximale d’inactivité d’une session. Dans *Administration › Sécurité et connexion*, on peut la réduire, pas la dépasser. |
| `LORE_SETUP_CODE` | vide | Code de configuration initiale imposé, pour une installation automatisée. Vide : un code tiré au hasard est écrit dans les journaux. Voir [Configuration initiale](initial-setup.md). |
| `LORE_LOG_LEVEL` | `INFO` | Niveau de journalisation |
| `LORE_PORT` | `8080` | Port de Lore, avec les paquets et l’archive. Avec Docker, changez plutôt le port publié. |
| `LORE_JAVA_OPTS` | `-XX:MaxRAMPercentage=25` | Options de Java, avec les paquets et l’archive, par exemple `-Xmx2g` pour la mémoire |

## Où les indiquer

| Méthode | Fichier | Après un changement |
| --- | --- | --- |
| Docker Compose | La section `environment` du service `lore`, dans `docker-compose.yml` | `docker compose up -d` |
| Paquets | `/etc/lore/lore.env` | `sudo systemctl restart lore` |
| Archive | `conf/lore.env` | Redémarrez Lore |

## Exemple

Avec Docker, les secrets restent dans le fichier `.env`, à côté de `docker-compose.yml`, et sont repris avec la syntaxe `${…}`. Avec les paquets et l’archive, le fichier contient une variable par ligne :

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
LORE_DB_PASSWORD='un-mot-de-passe-long'
LORE_SESSION_TIMEOUT=4h
```

Dans `lore.env`, mettez une valeur entre apostrophes droites si elle contient des espaces ou des caractères spéciaux. Avec l’archive sous Windows, utilisez plutôt des guillemets droits : les apostrophes y feraient partie de la valeur.

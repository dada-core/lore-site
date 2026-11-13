---
title: "Mise à jour"
description: "Une mise à jour consiste à installer la nouvelle version et à redémarrer. Les migrations de la base s’appliquent au démarrage."
---

## Mettre à jour

1. **Lire les notes de version**

   Certaines versions demandent une action particulière. Voir les [notes de version](release-notes.md).

2. **Sauvegarder**

   Voir [Sauvegarde et restauration](backup.md).

3. **Installer la nouvelle version**

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
   # Arrêtez l’ancienne version, puis :
   lore-0.1.1/bin/lore
   ```

   Le paquet redémarre lui-même le service s’il était démarré. Vos réglages, dans `/etc/lore/lore.env`, sont conservés.

   Avec Docker Compose, `docker compose pull` installe la dernière version corrective de l’étiquette inscrite dans `docker-compose.yml`, par exemple `0.1`. Pour passer à la version suivante, remplacez d’abord cette étiquette, par exemple par `0.2`, ou téléchargez le fichier `docker-compose.yml` de la nouvelle version.

4. **Vérifier**

   ```sh tab="Docker Compose"
   docker compose logs -f lore
   ```

   ```sh tab="Paquets"
   sudo journalctl -u lore -f
   ```

## Revenir en arrière

Les migrations de la base ne sont pas réversibles. Pour revenir à une version précédente, restaurez la sauvegarde faite avant la mise à jour, puis réinstallez l’ancienne version : l’ancienne image, ou l’ancien paquet avec `sudo apt install --allow-downgrades` ou `sudo dnf downgrade`.

## Fichiers de chaque version

Chaque version est publiée sur la [page des versions du dépôt](https://github.com/dada-core/lore/releases), avec ces fichiers :

| Fichier | Contenu |
| --- | --- |
| `lore-0.1.0.tar.gz`, `lore-0.1.0.zip` | L’archive universelle |
| `lore_0.1.0_amd64.deb`, `lore_0.1.0_arm64.deb` | Les paquets pour Ubuntu et Debian |
| `lore-0.1.0-1.x86_64.rpm`, `lore-0.1.0-1.aarch64.rpm` | Les paquets pour RHEL, Rocky Linux et AlmaLinux |
| `docker-compose.yml` | Le fichier de Docker Compose, avec l’image de la version |
| `SHA256SUMS` | Les empreintes, à vérifier avec `sha256sum --check --ignore-missing SHA256SUMS` |

## Étiquettes d’image

| Étiquette | Contenu |
| --- | --- |
| `0.1` | La dernière version corrective de la 0.1, recommandée |
| `0.1.3` | Une version précise |

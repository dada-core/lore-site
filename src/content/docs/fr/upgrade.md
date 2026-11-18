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

## Depuis la préversion 0.1.0-alpha.3

La préversion 0.1.0-alpha.4, qui apporte la recherche, calcule à son premier démarrage l’index de recherche des documents déjà importés : PostgreSQL réécrit la table des passages, en rangeant leur texte et leurs vecteurs à part de leur ligne, puis construit les index. Aucun document n’est extrait de nouveau, et chacun garde la langue détectée à son import.

- **Durée.** Environ 6 minutes, mesurées sur 300 000 passages, soit environ 720 millions de caractères dans 10 000 documents.
- **Pendant la migration, Lore ne démarre pas encore** : ni l’interface, ni l’API ne répondent. Prévoyez cette fenêtre, et suivez la migration dans les journaux, comme à l’étape *Vérifier*.
- **Place.** Les vecteurs et leurs index occupent environ 2,5 fois la place du texte, dans la base. Le temps de la migration, la réécriture de la table des passages demande en plus la place d’une copie de cette table. Voir [Stockage et extraction](storage.md#index-de-recherche).

## Depuis la préversion 0.1.0-alpha.2

La préversion 0.1.0-alpha.3, qui apporte le lecteur de documents, extrait de nouveau, à son premier démarrage, la version actuelle de chaque document Markdown, Word et texte déjà indexé : il reçoit ainsi le contenu mis en forme qu’affiche sa page. Ces documents passent *En cours* le temps de leur extraction, quelques instants chacun, puis reviennent à *Indexé*. Les PDF et les documents en échec ne changent pas.

Ce contenu est gardé dans la base de données : comptez à peu près la taille du texte de ces documents en plus, que `pg_dump` sauvegarde avec le reste. Voir [Stockage et extraction](storage.md#contenu-mis-en-forme).

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

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
   # Arrêtez l’ancienne version, puis :
   cp lore-0.1.0/conf/lore.env lore-0.1.1/conf/
   mv lore-0.1.0/data lore-0.1.1/
   lore-0.1.1/bin/lore
   ```

   Le paquet redémarre lui-même le service s’il était démarré. Vos réglages, dans `/etc/lore/lore.env`, sont conservés. Quand le modèle de ce fichier change, comme avec la 0.1.0, `apt` demande quoi en faire : gardez votre version (`N`, le choix par défaut) ; dans un script, ajoutez `-o Dpkg::Options::=--force-confold`. `dnf` garde votre fichier et dépose le nouveau modèle à côté, dans `lore.env.rpmnew`.

   Avec l’archive, les fichiers importés sont dans `data/files`, à côté de `bin/` : déplacez le dossier `data` dans la nouvelle version, sauf si `LORE_FILES_PATH` désigne un dossier hors de l’archive. Sous Windows : `Move-Item lore-0.1.0\data lore-0.1.1\`.

   Avec Docker Compose, `docker compose pull` installe la dernière version corrective de l’étiquette inscrite dans `docker-compose.yml`, par exemple `0.1`. Pour passer à la version suivante, remplacez d’abord cette étiquette, par exemple par `0.2`, ou téléchargez le fichier `docker-compose.yml` de la nouvelle version.

4. **Vérifier**

   ```sh tab="Docker Compose"
   docker compose logs -f lore
   ```

   ```sh tab="Paquets"
   sudo journalctl -u lore -f
   ```

## Depuis la préversion 0.1.0-beta.1

La version 0.1.0 n’ajoute aucune migration : les données sont reprises telles quelles, sans nouvelle extraction.

Avant la mise à jour, vérifiez ces points :

- **Proxy inverse.** Lore ne croit plus les en-têtes `X-Forwarded-*` venus de tout réseau privé, mais seulement ceux des proxys déclarés dans `LORE_TRUSTED_PROXIES`, par défaut un proxy sur la même machine avec les paquets et l’archive, et aucun hors du conteneur avec Docker. Avant, un poste du réseau local qui joignait directement Lore pouvait choisir l’adresse IP inscrite au journal et contourner le blocage par adresse IP. Derrière un proxy sur une autre machine, ou avec Docker derrière un proxy, déclarez-le : sinon, toutes les requêtes portent l’adresse du proxy, et les journaux de Lore le signalent. Voir [Déclarer le proxy](reverse-proxy.md#déclarer-le-proxy).
- **Docker Compose.** Le fichier de la préversion désigne l’image `0.1.0-beta.1` : téléchargez le `docker-compose.yml` de la version 0.1.0 et reportez-y vos changements, ou, dans le vôtre, remplacez l’étiquette par `0.1`. Derrière un proxy, ajoutez-y aussi la ligne `LORE_TRUSTED_PROXIES` montrée dans l’[installation](installation.md#docker-compose), qui la lit dans `.env`, et suivez [Avec Docker Compose](reverse-proxy.md#avec-docker-compose).
- **Code de configuration fixé.** Avec un `LORE_SETUP_CODE` de moins de 12 caractères, espaces et tirets non comptés, Lore refuse désormais de démarrer tant que la configuration initiale n’est pas faite. Une installation déjà configurée n’est pas concernée. Voir [Configuration initiale](initial-setup.md#le-code-de-configuration).

Après la mise à jour :

- **Reconnexion.** Avec `LORE_PUBLIC_URL` en HTTPS, chacun se reconnecte une fois : les cookies changent de nom (`__Host-LORE_SESSION`, `__Host-XSRF-TOKEN`), et les anciennes sessions ne servent plus ; elles expirent après la durée d’inactivité, et d’ici là peuvent encore figurer dans *Mon compte*. Un script qui lit le cookie `XSRF-TOKEN` doit aussi accepter le nom préfixé. Voir [Sécurité et connexion](security.md#sessions).
- **Tentatives de connexion.** Les compteurs repartent de zéro, et les blocages en cours sont levés.
- **Liens en attente.** Les invitations et les liens de réinitialisation créés par un administrateur rétrogradé, désactivé ou retiré avant la mise à jour restent valables jusqu’à leur expiration, sauf si cette personne est ensuite désactivée ou retirée : révoquez les invitations en attente dans *Administration › Membres* ; un lien de réinitialisation expire au bout de 24 heures, ou est annulé par un nouveau lien créé pour la même personne.
- **Documents numérisés.** La nouvelle règle des documents numérisés ne vaut que pour les fichiers importés ensuite : un document déjà marqué *Numérisé*, comme une présentation sans image, le reste jusqu’à l’import d’une nouvelle version. Voir [États de l’extraction](import.md#états-de-lextraction).

## Depuis la préversion 0.1.0-alpha.4

La préversion 0.1.0-beta.1, qui apporte les versions, les statuts et l’écran du journal d’audit, ajoute quelques colonnes, un index des remplaçants et trois index du journal à son premier démarrage. Seules la date du statut de chaque document et l’ampleur de sa première version sont écrites, et aucun document n’est extrait de nouveau : environ 1 seconde pour 10 000 documents, puis 1,4 seconde pour les index d’un journal de 1,3 million d’événements. Lore ne démarre qu’à la fin de la migration.

- **Statuts.** Chaque document garde son statut ; la date de ce statut est celle de sa création.
- **Versions.** Chaque document garde sa version unique, qui reste sa version actuelle.

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
| `0.1` | La dernière version corrective de la 0.1, recommandée ; le `docker-compose.yml` d’une version la désigne |
| `0.1.0` | Une version précise |
| `0.1.0-beta.1` | Une préversion, qui n’a que sa propre étiquette |
| `0.1.0-candidate` | L’image d’une version pendant ses contrôles, avant sa publication : ne l’utilisez pas |

Il n’y a pas d’étiquette `latest`.

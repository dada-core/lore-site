---
title: "Sauvegarde et restauration"
description: "Deux éléments à sauvegarder : la base PostgreSQL et les fichiers importés. Gardez aussi vos réglages : le fichier .env avec Docker, lore.env sinon."
---

## Sauvegarder

```sh tab="Docker Compose"
# Base de données, au format personnalisé de pg_dump
docker compose exec -T postgres pg_dump -U lore -Fc lore > lore-$(date +%F).dump

# Fichiers importés
docker run --rm -v lore_files:/data -v "$PWD":/sauvegardes alpine \
  tar czf /sauvegardes/fichiers-$(date +%F).tar.gz --exclude=./tmp -C /data .
```

```sh tab="Paquets"
# Base de données, au format personnalisé de pg_dump
sudo -u postgres pg_dump -Fc lore > lore-$(date +%F).dump

# Fichiers importés
sudo tar czf fichiers-$(date +%F).tar.gz --exclude=./tmp -C /var/lib/lore/files .
```

Avec Docker, le nom du volume dépend du dossier du projet Docker Compose : vérifiez-le avec `docker volume ls`. Si PostgreSQL tourne sur un autre serveur, ajoutez à `pg_dump` et `pg_restore` les options `-h` (l’hôte) et `-U lore`, sans `sudo -u postgres`. Avec l’archive, les commandes sont celles des paquets, avec le dossier `data/files` de l’archive.

**Ordre et limite.** Sauvegardez la base, puis les fichiers. Lore continue de tourner pendant ce temps : un document supprimé entre les deux revient à la restauration sans son fichier (« Le fichier de ce document est introuvable sur le serveur. Prévenez la personne qui exploite Lore. ») ; un fichier importé après la copie de la base reste sur le disque sans document. Pour une copie sans écart, arrêtez Lore le temps de la sauvegarde (`docker compose stop lore`, ou `sudo systemctl stop lore`), puis redémarrez-le.

**Durées.** Sur une base de 10 000 documents et 300 000 passages, `pg_dump -Fc` prend 30 secondes et produit 226 Mo ; la restauration prend environ 5 minutes, PostgreSQL recalculant les vecteurs et les index de la recherche, qui ne sont pas dans la copie.

Le dossier `tmp/` des fichiers importés n’a pas besoin d’être sauvegardé : Lore y efface à chaque démarrage ce qui est resté là plus d’une heure. Avec l’archive, les fichiers importés sont dans `data/files`, à côté de `bin/`, sauf si `LORE_FILES_PATH` indique un autre dossier.

## Restaurer

1. **Arrêter l’application**

   ```sh tab="Docker Compose"
   docker compose stop lore
   ```

   ```sh tab="Paquets"
   sudo systemctl stop lore
   ```

2. **Restaurer la base**

   ```sh tab="Docker Compose"
   docker compose exec -T postgres pg_restore -U lore -d lore --clean --if-exists < lore-2026-11-10.dump
   ```

   ```sh tab="Paquets"
   sudo -u postgres pg_restore -d lore --clean --if-exists < lore-2026-11-10.dump
   ```

3. **Restaurer les fichiers**

   ```sh tab="Docker Compose"
   docker run --rm -v lore_files:/data -v "$PWD":/sauvegardes alpine \
     tar xzf /sauvegardes/fichiers-2026-11-10.tar.gz -C /data
   ```

   ```sh tab="Paquets"
   sudo tar xzf fichiers-2026-11-10.tar.gz -C /var/lib/lore/files
   ```

4. **Redémarrer**

   ```sh tab="Docker Compose"
   docker compose start lore
   ```

   ```sh tab="Paquets"
   sudo systemctl start lore
   ```

> [!TIP]
> **Testez vos restaurations.** Une sauvegarde jamais restaurée n’est qu’une hypothèse. Restaurez régulièrement sur une machine de test. L’intégration continue de Lore fait ces sauvegardes et ces restaurations, avec les commandes de cette page, à chaque modification.

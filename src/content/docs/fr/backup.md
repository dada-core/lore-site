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
  tar czf /sauvegardes/fichiers-$(date +%F).tar.gz -C /data .
```

```sh tab="Paquets"
# Base de données, au format personnalisé de pg_dump
sudo -u postgres pg_dump -Fc lore > lore-$(date +%F).dump

# Fichiers importés
sudo tar czf fichiers-$(date +%F).tar.gz -C /var/lib/lore/files .
```

Avec Docker, le nom du volume dépend du dossier du projet Docker Compose : vérifiez-le avec `docker volume ls`. Si PostgreSQL tourne sur un autre serveur, ajoutez à `pg_dump` les options `-h` (l’hôte) et `-U lore`.

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
> **Testez vos restaurations.** Une sauvegarde jamais restaurée n’est qu’une hypothèse. Restaurez régulièrement sur une machine de test.

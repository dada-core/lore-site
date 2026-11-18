---
title: "Stockage et extraction"
description: "Où Lore range les fichiers importés, comment il en extrait le texte et l’indexe pour la recherche, et ce qu’il faut prévoir sur le serveur : disque, mémoire et réglages."
---

## Fichiers

Les fichiers importés sont rangés dans le dossier indiqué par `LORE_FILES_PATH` :

| Installation | Dossier par défaut |
| --- | --- |
| Docker Compose | `/var/lib/lore/files`, dans le volume des fichiers |
| Paquets | `/var/lib/lore/files` |
| Archive | `data/files`, à côté de `bin/` |

- Chaque fichier est rangé dans le dossier de son organisation, sous son empreinte SHA-256, sans son nom ni son extension : `<organisation>/ab/cd/<empreinte>`. Son nom d’origine, son type et sa taille sont gardés dans la base.
- Un fichier n’est jamais modifié après son import.
- Un même contenu importé plusieurs fois dans une organisation n’est stocké qu’une fois. Chaque import crée tout de même son propre document.
- Un fichier est effacé quand plus aucun document de l’organisation ne l’utilise : après la suppression d’un document, ou d’un espace avec ses documents.
- **Versions.** Le fichier et le contenu mis en forme de chaque version sont gardés, pour l’afficher et la télécharger depuis l’historique ; ses passages, que seule la recherche lit, sont effacés quand elle cesse d’être la version actuelle. Un document à vingt versions garde donc vingt fichiers, mais l’index de recherche d’une seule.
- Si un fichier manque sur le disque, par exemple après la restauration d’une base sans ses fichiers, la page du document l’annonce et ne propose plus de le télécharger. Lore l’écrit dans ses journaux, avec l’organisation et l’empreinte du fichier.

### Le dossier tmp

Un fichier reçu est d’abord écrit une fois dans `tmp/`, à l’intérieur de `LORE_FILES_PATH`. Lore le relit pour calculer son empreinte et sa taille, puis le déplace d’un coup à sa place. Les processus d’extraction travaillent dans `tmp/extraction/`. À chaque démarrage, Lore y efface ce qui est resté là plus d’une heure : ces dossiers n’ont pas besoin d’être sauvegardés. Ne placez pas `tmp/` sur un autre disque que le reste du dossier : le déplacement d’un fichier à sa place doit se faire d’un seul coup.

### Au démarrage

Lore vérifie que le dossier existe, ou qu’il peut le créer, et qu’il peut y écrire. Sinon, il s’arrête avec un message qui nomme `LORE_FILES_PATH`.

Avec les paquets, le service ne peut écrire que dans `/var/lib/lore`. Pour un dossier ailleurs, ajoutez-le à `ReadWritePaths` par une surcharge du service :

```sh title="Terminal"
sudo systemctl edit lore
```

```ini title="Surcharge du service"
[Service]
ReadWritePaths=/srv/lore/files
```

Puis redémarrez Lore : `sudo systemctl restart lore`.

## Taille des fichiers

| Limite | Valeur | Qui la règle |
| --- | --- | --- |
| Taille maximale d’un fichier | 50 Mo par défaut, de 1 Mo jusqu’au plafond | Les propriétaires et les administrateurs, dans *Administration › Stockage et import* |
| Plafond | 1 Go par défaut et au maximum | La personne qui exploite le serveur, avec `LORE_MAX_UPLOAD_SIZE` |

Si le plafond est plus bas que la taille choisie, c’est lui qui s’applique. Un fichier vide est refusé.

Lore refuse aussi un import s’il resterait moins de 100 Mo libres sur le disque des fichiers.

Il n’y a aucun quota : le volume stocké par l’organisation, chaque contenu compté une fois, est affiché dans *Administration › Stockage et import*, avec le nombre de documents, de documents numérisés, d’échecs et d’extractions en cours.

Derrière un proxy inverse, réglez sa limite de taille un peu au-dessus de celle de Lore : la requête d’un import contient le fichier et quelques champs. Voir [HTTPS et proxy inverse](reverse-proxy.md).

## Extraction du texte

Après l’import, le texte de chaque fichier est extrait en arrière-plan, avec Apache Tika pour les PDF et les documents Word, dans des processus séparés de l’application. Un fichier piégé ou trop lourd fait échouer sa propre extraction, sans jamais faire tomber Lore.

- **Des processus lancés par Lore.** Lore les démarre lui-même, avec le même Java et le même programme : il n’y a rien d’autre à installer. Un processus démarre au premier fichier à traiter, s’arrête après 5 minutes sans travail, et est remplacé tous les 200 fichiers.
- **Sans les secrets de l’application.** Ces processus ne reçoivent que quelques variables du système (`PATH`, `HOME`, dossiers temporaires, langue) : ni le mot de passe de la base, ni aucune variable `LORE_*`, ni les options de Java de l’application (`LORE_JAVA_OPTS`, `JAVA_TOOL_OPTIONS`). Ils lisent le fichier, écrivent le texte extrait dans `tmp/extraction/`, et Lore enregistre le résultat. Ils tournent toutefois sous le même compte système que Lore : ils ne sont pas isolés de ce que ce compte peut lire, comme son fichier de configuration.
- **En parallèle.** `LORE_EXTRACTION_WORKERS` extractions à la fois, une par processus : 2 par défaut, de 1 à 8.
- **Limités en mémoire.** Chaque processus dispose de `LORE_EXTRACTION_MEMORY`, 512 Mo par défaut. S’il en manque, il s’arrête, et l’extraction est retentée.
- **Limités en durée.** Une extraction qui dépasse `LORE_EXTRACTION_TIMEOUT`, 120 secondes par défaut, est arrêtée avec son processus, puis retentée.
- **Limités en texte.** Lore garde jusqu’à 10 millions de caractères par document ; au-delà, le texte est tronqué, et le document le signale.
- **Repris après un arrêt.** Les extractions à faire sont gardées dans la base : après un redémarrage, ou un arrêt brutal du serveur, elles reprennent d’elles-mêmes.

Les pièces jointes et les objets incorporés aux documents ne sont pas lus.

### Contenu mis en forme

Pour un document Markdown, Word ou texte, l’extraction produit aussi, dans la même lecture, le contenu mis en forme qu’affiche la page du document. Lore le nettoie, puis le garde dans la base de données avec le texte extrait, jamais dans le dossier des fichiers : il occupe à peu près la place du texte, et `pg_dump` le sauvegarde avec le reste. Un PDF n’en a pas : sa page l’affiche à partir de son fichier. Voir [Sauvegarde et restauration](backup.md).

### Échecs et nouvelles tentatives

| Cause | Code de l’API | Ce que fait Lore |
| --- | --- | --- |
| Délai dépassé | `timeout` | Nouvelle tentative après 1 minute, puis après 5 minutes. Après trois essais, le document passe en échec, et un contributeur peut le relancer. |
| Processus d’extraction arrêté, ou erreur du disque du serveur pendant l’extraction | `extractor_crashed` | De même. |
| Fichier introuvable sur le disque | `file_missing` | De même. |
| Fichier protégé par un mot de passe | `encrypted` | Échec aussitôt. |
| Fichier endommagé, ou construit pour épuiser l’extraction | `corrupt` | Échec aussitôt. |
| Contenu qui n’est pas du format annoncé | `unsupported_content` | Échec aussitôt. |

L’extraction n’est pas inscrite au journal d’audit. L’état de *Apache Tika*, actif ou la cause d’une panne au démarrage d’un processus, est affiché dans *Administration › Stockage et import*.

## Index de recherche

La recherche n’ajoute aucun service : elle repose sur la recherche plein texte de PostgreSQL, dans la même base.

- **Ce qui est indexé.** Le texte de chaque passage, avec les titres de ses sections, ainsi que le titre et la description de chaque document. Chacun deux fois : dans la langue du document, français, anglais ou autre, pour reconnaître les formes des mots ; et tel qu’écrit, sans accents ni majuscules, pour les identifiants techniques.
- **Toujours à jour.** PostgreSQL recalcule l’index à chaque écriture d’un texte, d’un titre, d’une description ou d’une langue : il n’y a ni tâche à suivre, ni index à reconstruire.
- **Version actuelle seulement.** Une nouvelle version devient la version actuelle à la fin de son extraction, dans une seule transaction : ses passages et leurs vecteurs sont écrits, puis ceux de la version précédente effacés. Mesuré sur un document de 2 500 passages : 5,3 secondes, dont 4,9 pour écrire les passages et leurs vecteurs, ce que coûte toute extraction, et 0,4 pour le reste ; pendant ce temps, la recherche trouve toujours le document, dans l’une ou l’autre version. Garder les passages de chaque ancienne version coûterait environ 10 Ko par passage.
- **Place.** Les vecteurs et leurs index occupent environ 2,5 fois la place du texte, dans la base : mesuré sur 300 000 passages de 10 000 documents, environ 720 millions de caractères. Le texte et les vecteurs de chaque passage sont rangés à part de sa ligne : c’est ce qui rend la recherche rapide. PostgreSQL ne le fait qu’au-delà d’environ 2 Ko par ligne : des passages courts restent dans leur ligne, et la recherche d’un mot très fréquent parmi eux lit davantage.
- **Sauvegarde.** `pg_dump` ne sauvegarde pas les vecteurs, calculés à partir du texte : PostgreSQL les recalcule à la restauration. Voir [Sauvegarde et restauration](backup.md).

## Mémoire à prévoir

Par défaut, comptez la mémoire de l’application, plus environ 2 × 650 Mo pendant les extractions : pour chaque processus, `LORE_EXTRACTION_MEMORY` (512 Mo) et environ 150 Mo pour Java autour.

- **Docker.** L’application prend au plus la moitié de la mémoire du conteneur, pour laisser le reste aux processus d’extraction.
- **Paquets et archive.** La mémoire de l’application se règle avec `LORE_JAVA_OPTS` ; celle des processus d’extraction s’y ajoute.

Avec moins de 4 Go de mémoire, passez `LORE_EXTRACTION_WORKERS` à 1. Si vous augmentez `LORE_EXTRACTION_WORKERS` ou `LORE_EXTRACTION_MEMORY`, prévoyez la mémoire en conséquence. Voir [Variables d’environnement](variables.md).

## Extracteur externe <span class="vb">Après v0.1</span>

Apache Tika, intégré à Lore, est le seul extracteur de la version 0.1. Brancher un service d’extraction externe, par exemple pour la reconnaissance de texte (OCR) des PDF numérisés, est prévu après la version 0.1.

> [!WARNING]
> **Licence de l’extracteur.** Lore n’inclut que des composants sous licence libre utilisables par tous. La licence d’un extracteur externe relèvera de votre organisation : certains modèles d’OCR interdisent par exemple l’usage commercial au-delà d’un certain chiffre d’affaires.

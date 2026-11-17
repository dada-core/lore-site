---
title: "Notes de version"
description: "Les changements de chaque version de Lore."
---

## Version 0.1 <span class="vb">En préparation</span>

Première version : un environnement complet, sans intelligence artificielle.

- Comptes, organisations et invitations par lien
- Espaces, dossiers et rôles
- Import PDF, Word, texte et Markdown, jusqu’à 50 Mo
- Lecteur ouvert au bon passage
- Recherche plein texte, filtrée par les droits
- Versions et statuts
- Journal d’audit
- Installation avec Docker Compose, des paquets .deb et .rpm ou une archive universelle

## Version 0.1.0-alpha.3 <span class="vb">Préversion</span>

Publiée le 17 novembre 2026, pour essayer le lecteur de documents avant la version 0.1. Elle reprend les données d’une installation 0.1.0-alpha.2 : la mise à jour n’ajoute qu’une migration, et relance l’extraction des documents Markdown, Word et texte pour leur contenu mis en forme (voir [Mettre à jour](upgrade.md#depuis-la-préversion-010-alpha2)). Elle n’est pas faite pour la production : ses données ne seront pas forcément reprises par la version suivante.

- Documents Markdown, Word et texte affichés mis en forme, après un nettoyage par Lore
- PDF lus dans la page avec pdf.js, sans être téléchargés en entier, et ouverts à la page demandée
- Liens vers une section ou une page, et sommaire qui suit la lecture
- Téléchargement de l’original sous son nom d’origine, pour toute personne qui voit le document
- Propriétés du document, avec son empreinte SHA-256, et changement de son responsable
- *Reprendre* sur l’accueil, tri et colonnes de la liste des documents
- Consultations et téléchargements inscrits au journal d’audit, dont les événements sont effacés au bout d’un an

Voir [Lire un document](reader.md). La recherche, les versions et les statuts, et l’écran du journal d’audit arrivent avec la version 0.1.

Ses fichiers sont sur sa [page de version](https://github.com/dada-core/lore/releases/tag/v0.1.0-alpha.3).

## Version 0.1.0-alpha.2 <span class="vb">Préversion</span>

Publiée le 16 novembre 2026, pour essayer les espaces et l’import de documents avant la version 0.1. Elle reprend les données d’une installation 0.1.0-alpha.1 : la mise à jour n’ajoute que des migrations. Elle n’est pas faite pour la production : ses données ne seront pas forcément reprises par la version suivante.

- Espaces, dossiers sur un niveau et rôles dans les espaces : lecteur, contributeur, responsable
- Espaces à rejoindre, choisis dans un lien d’invitation
- Import de fichiers PDF, Word (DOCX), Markdown et texte, cinq envois à la fois, jusqu’à 50 Mo par fichier par défaut
- Extraction du texte en arrière-plan, dans des processus séparés lancés par Lore (Apache Tika), avec détection des PDF numérisés
- Documents restreints à quelques personnes
- *Administration › Stockage et import* : taille maximale d’un fichier, jusqu’au plafond `LORE_MAX_UPLOAD_SIZE` (1 Go par défaut), volume stocké et état de l’extraction
- Vos imports encore en cours ou en échec, rappelés sur l’accueil
- Nouvelles variables `LORE_FILES_PATH`, `LORE_MAX_UPLOAD_SIZE`, `LORE_EXTRACTION_WORKERS`, `LORE_EXTRACTION_TIMEOUT` et `LORE_EXTRACTION_MEMORY` ; l’image Docker laisse la moitié de la mémoire du conteneur aux processus d’extraction

Derrière un proxy inverse, réglez sa limite de taille un peu au-dessus de la taille maximale d’un fichier : voir [HTTPS et proxy inverse](reverse-proxy.md). Le lecteur, la recherche, les versions et les statuts, et l’écran du journal d’audit arrivent avec la version 0.1.

Ses fichiers sont sur sa [page de version](https://github.com/dada-core/lore/releases/tag/v0.1.0-alpha.2).

## Version 0.1.0-alpha.1 <span class="vb">Préversion</span>

Publiée le 13 novembre 2026, pour essayer l’installation avant la version 0.1. Elle n’est pas faite pour la production : ses données ne seront pas forcément reprises par la version suivante.

- Configuration initiale dans le navigateur, avec le code affiché dans les journaux du serveur
- Connexion, invitations par lien et liens de réinitialisation du mot de passe
- Mon compte
- Administration de l’organisation : membres, rôles et réglages de sécurité
- Image Docker pour amd64 et arm64, paquets .deb et .rpm, archive universelle

Ses fichiers sont sur sa [page de version](https://github.com/dada-core/lore/releases/tag/v0.1.0-alpha.1).

## Versions suivantes

| Version | Contenu prévu |
| --- | --- |
| 0.2 | Recherche par le sens, fiches de connaissances, tableau de bord |
| 0.3 | Assistant facultatif et historique des conversations |

Chaque version publiée sera aussi annoncée sur la [page des versions du dépôt GitHub](https://github.com/dada-core/lore/releases).

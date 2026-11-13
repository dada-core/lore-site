---
title: "Espaces et dossiers"
description: "Les documents sont rangés dans des espaces, puis dans des dossiers. Les droits se décident au niveau de l’espace."
---

## Organisation, espaces et dossiers

| Niveau | Rôle | Exemple |
| --- | --- | --- |
| Organisation | Regroupe les comptes et les espaces. | DadaGroup |
| Espace | Une équipe ou un domaine, avec ses membres et leurs rôles. | Infrastructure |
| Dossier | Un rangement à l’intérieur d’un espace. | Runbooks |
| Document | Un fichier importé, avec ses versions. | Restaurer une base PostgreSQL |

Un membre ne voit que les espaces dont il fait partie. Les propriétaires et administrateurs de l’organisation voient tous les espaces.

## Créer un espace

Indiquez un nom, une description, une adresse courte et une couleur. Vous devenez responsable de l’espace et pouvez y inviter des membres. Voir [Rôles et permissions](permissions.md).

## Vues de la bibliothèque

| Vue | Usage |
| --- | --- |
| Grille | Une ligne par document, avec ses colonnes : statut, catégorie, responsable, date, version, indexation, langue. Regroupement par dossier par défaut. |
| Kanban par statut | Une colonne par statut : brouillons, publiés, obsolètes, archivés. |

Filtrez par dossier, triez par date de mise à jour et masquez les colonnes inutiles. Les barres latérales se replient avec <kbd>[</kbd> et <kbd>]</kbd>.

[Voir la bibliothèque dans la démo](https://lore.dada-core.com/demo/#/spaces/infrastructure)

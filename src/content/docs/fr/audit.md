---
title: "Journal d’audit"
description: "Le journal d’audit trace les opérations sensibles de toute l’organisation."
---

## Ce qui est tracé

| Type | Exemples |
| --- | --- |
| Consultation | Ouverture d’un document |
| Téléchargement | Téléchargement d’un original ou d’une ancienne version |
| Import | Nouveau document, avec le nom et la taille de son fichier, son espace, son dossier et s’il est restreint ; nouvelle version |
| Statut | Passage à obsolète ou archivé |
| Suppression | Suppression définitive d’un document, avec son nombre de versions |
| Droits | Restriction d’un document ou retour à tout l’espace, personnes choisies ajoutées ou retirées ; changement de rôle |
| Membres | Invitation, désactivation, lien de réinitialisation |
| Connexion | Échecs répétés, blocage d’un compte |
| Organisation | Création ou suppression d’un espace, avec son nombre de documents ; changement d’un réglage, comme la taille maximale d’un fichier |

Les changements d’un document sont aussi inscrits : son titre, sa description ou sa catégorie modifiés, avec les champs changés, et son déplacement d’un dossier à l’autre. L’extraction du texte, elle, ne l’est pas.

Chaque événement garde le titre du document et le nom de son espace au moment de l’action : il reste lisible après une suppression.

## Consulter et exporter

Dans *Administration › Journal d’audit*, filtrez par type d’action, par personne et par période, puis exportez au format CSV. [Voir dans la démo](https://lore.dada-core.com/demo/#/admin/audit)

## Conservation

Les événements sont conservés un an.

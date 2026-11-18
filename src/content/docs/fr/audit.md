---
title: "Journal d’audit"
description: "Le journal d’audit trace les opérations sensibles de toute l’organisation."
---

## Ce qui est tracé

| Type | Exemples |
| --- | --- |
| Consultation | Ouverture d’un document, avec sa version : une fois par heure au plus pour une même personne et un même document |
| Téléchargement | Téléchargement d’un original ou d’une ancienne version, avec le nom et la taille du fichier |
| Import | Nouveau document, avec le nom et la taille de son fichier, son espace, son dossier et s’il est restreint ; nouvelle version |
| Statut | Passage à obsolète ou archivé |
| Suppression | Suppression définitive d’un document, avec son nombre de versions |
| Droits | Restriction d’un document ou retour à tout l’espace, personnes choisies ajoutées ou retirées ; changement du responsable d’un document, avec l’ancien et le nouveau ; changement de rôle |
| Membres | Invitation, désactivation, lien de réinitialisation |
| Connexion | Échecs répétés, blocage d’un compte |
| Organisation | Création ou suppression d’un espace, avec son nombre de documents ; changement d’un réglage, comme la taille maximale d’un fichier |

Les changements d’un document sont aussi inscrits : son titre, sa description, sa catégorie ou sa langue modifiés, avec les champs changés, et son déplacement d’un dossier à l’autre. Un changement de langue garde l’ancienne : dans l’événement `document.updated`, `changes` contient `language`, et `previousLanguage` donne l’ancienne langue. L’extraction du texte, elle, n’est pas inscrite.

Les recherches ne sont jamais inscrites, ni dans ce journal, ni dans les journaux du serveur. Ouvrir un document depuis un résultat est une consultation, inscrite comme les autres. Voir [Rechercher](search.md#confidentialité).

Une page rouverte ou rechargée dans l’heure n’ajoute pas de consultation, et un document que la personne ne peut pas voir n’en inscrit jamais. Chaque téléchargement est inscrit ; la reprise d’un téléchargement interrompu ne l’est pas, ni la lecture d’un PDF dans la page ou dans un nouvel onglet, qui fait partie de la consultation.

Les consultations ne s’affichent jamais sur le document : seulement dans ce journal, et pour chacun dans *Reprendre*, sur son propre accueil.

Chaque événement garde le titre du document et le nom de son espace au moment de l’action : il reste lisible après une suppression.

## Consulter et exporter

Dans *Administration › Journal d’audit*, filtrez par type d’action, par personne et par période, puis exportez au format CSV. [Voir dans la démo](https://lore.dada-core.com/demo/#/admin/audit)

## Conservation

Les événements sont conservés un an : chaque nuit, Lore efface ceux qui sont plus anciens. Si plusieurs instances de Lore partagent la même base, une seule s’en charge.

## Données personnelles

Le journal dit qui a ouvert, téléchargé ou modifié quel document, et quand, avec l’adresse IP : ce sont des données personnelles. Elles servent à la sécurité, par exemple pour savoir qui a eu accès à un document. Seuls les propriétaires et les administrateurs de l’organisation les consultent, et elles sont effacées au bout d’un an. Informez-en les membres de votre organisation.

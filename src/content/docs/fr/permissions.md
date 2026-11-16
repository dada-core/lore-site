---
title: "Rôles et permissions"
description: "Les droits se décident dans l’organisation, puis dans chaque espace. Lore les applique dans chaque requête : ce que vous ne pouvez pas voir n’apparaît nulle part."
---

## Rôles dans l’organisation

| Rôle | Droits |
| --- | --- |
| Propriétaire | Tout, y compris attribuer ou retirer le rôle Propriétaire. Accès à tous les espaces, avec les droits d’un responsable. |
| Administrateur | Gérer l’organisation : réglages, membres et invitations. Accès à tous les espaces, avec les droits d’un responsable. |
| Membre | Créer des espaces, et accéder à ceux dont il fait partie, selon son rôle dans chacun. |

Voir [Membres et invitations](members.md).

## Rôles dans un espace

| Action | Lecteur | Contributeur | Responsable |
| --- | --- | --- | --- |
| Voir l’espace, ses dossiers et ses membres | Oui | Oui | Oui |
| Créer, renommer et supprimer des dossiers | Non | Oui | Oui |
| Ajouter des membres, changer leur rôle, les retirer | Non | Non | Oui |
| Changer le nom, l’adresse, la description et la couleur | Non | Non | Oui |
| Archiver, réactiver et supprimer l’espace | Non | Non | Oui |
| Voir l’espace une fois archivé | Non | Non | Oui |
| Quitter l’espace | Oui | Oui | Oui, s’il reste un autre responsable |

La page *Membres* de chaque espace rappelle ce que permet chaque rôle.

## Ajouter des membres à un espace

- **Une personne déjà dans l’organisation.** Un responsable de l’espace clique sur *Ajouter des membres*, cherche les personnes par leur nom ou leur adresse e-mail, en coche une ou plusieurs, puis choisit leur rôle. Seuls les comptes actifs sont proposés.
- **Une nouvelle personne.** Faire entrer quelqu’un dans l’organisation reste réservé aux propriétaires et aux administrateurs. Leur lien d’invitation peut indiquer des *Espaces à rejoindre*, avec un rôle pour chacun : la personne en devient membre dès son arrivée. Un espace archivé entre-temps n’est pas rejoint.

Sur la page *Membres*, un responsable change le rôle d’un membre en cliquant sur ce rôle, et le retire avec *Retirer*. Chacun peut aussi *Quitter l’espace* depuis sa propre ligne. Retirer quelqu’un de l’organisation le retire de tous ses espaces.

## Un espace garde toujours un responsable

Il est impossible de retirer ou de rétrograder le dernier responsable d’un espace, ou de le quitter quand on l’est : nommez d’abord un autre responsable. Un compte désactivé ne compte pas comme le responsable qui reste.

Désactiver le compte du dernier responsable, ou le retirer de l’organisation, reste possible : une mesure de sécurité ne doit pas attendre. Les propriétaires et les administrateurs, qui gèrent tous les espaces, nomment alors un nouveau responsable.

## Introuvable plutôt qu’interdit

Un espace que vous ne pouvez pas voir, ou un espace archivé quand vous n’en êtes pas responsable et n’êtes ni propriétaire ni administrateur de l’organisation, répond comme un espace qui n’existe pas : *Cette page est introuvable*. Dans un espace que vous voyez, une action que votre rôle ne permet pas est refusée avec un message qui l’explique.

> [!WARNING]
> **Le nom et l’adresse d’un espace ne sont pas secrets.** Une adresse est unique dans l’organisation : quelqu’un qui tente de prendre celle d’un espace qu’il ne voit pas apprend qu’elle est utilisée, sans rien voir d’autre. Pour un sujet confidentiel, choisissez un nom neutre. Voir [L’adresse](spaces.md#ladresse).

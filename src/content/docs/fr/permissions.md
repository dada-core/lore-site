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
| Voir les documents ouverts à tout l’espace | Oui | Oui | Oui |
| Voir un document restreint | S’il fait partie des personnes choisies, ou s’il est responsable du document | S’il fait partie des personnes choisies, ou s’il est responsable du document | Oui |
| Lire et télécharger les documents qu’il voit | Oui | Oui | Oui |
| Importer des documents | Non | Oui | Oui |
| Modifier le titre, la description et la catégorie d’un document, le déplacer d’un dossier à l’autre | Non | Oui | Oui |
| Relancer une extraction en échec | Non | Oui | Oui |
| Restreindre un document, ou le rouvrir à tout l’espace | Non | Ceux dont il est responsable | Oui |
| Changer le responsable d’un document | Non | Ceux dont il est responsable | Oui |
| Supprimer un document | Non | Ceux qu’il a importés, tant qu’ils n’ont qu’une version | Oui |
| Créer et renommer des dossiers, supprimer un dossier vide | Non | Oui | Oui |
| Ajouter des membres, changer leur rôle, les retirer | Non | Non | Oui |
| Changer le nom, l’adresse, la description et la couleur | Non | Non | Oui |
| Archiver, réactiver et supprimer l’espace | Non | Non | Oui |
| Voir l’espace une fois archivé | Non | Non | Oui |
| Quitter l’espace | Oui | Oui | Oui, s’il reste un autre responsable |

La page *Membres* de chaque espace rappelle ce que permet chaque rôle. Dans un espace archivé, plus rien ne se modifie : ni ses membres, ni ses dossiers, ni ses documents.

Le responsable d’un document est d’abord la personne qui l’a importé. Les responsables de l’espace, et le responsable du document s’il est au moins contributeur, peuvent le confier à un autre membre actif de l’espace, qui a au moins le rôle Contributeur. Un document dont le responsable a quitté l’organisation ne peut être repris que par un responsable de l’espace.

## Ajouter des membres à un espace

- **Une personne déjà dans l’organisation.** Un responsable de l’espace clique sur *Ajouter des membres*, cherche les personnes par leur nom ou leur adresse e-mail, en coche une ou plusieurs, puis choisit leur rôle. Seuls les comptes actifs sont proposés.
- **Une nouvelle personne.** Faire entrer quelqu’un dans l’organisation reste réservé aux propriétaires et aux administrateurs. Leur lien d’invitation peut indiquer des *Espaces à rejoindre*, avec un rôle pour chacun : la personne en devient membre dès son arrivée. Un espace archivé entre-temps n’est pas rejoint.

Sur la page *Membres*, un responsable change le rôle d’un membre en cliquant sur ce rôle, et le retire avec *Retirer*. Chacun peut aussi *Quitter l’espace* depuis sa propre ligne. Retirer quelqu’un de l’organisation le retire de tous ses espaces.

## Un espace garde toujours un responsable

Il est impossible de retirer ou de rétrograder le dernier responsable d’un espace, ou de le quitter quand on l’est : nommez d’abord un autre responsable. Un compte désactivé ne compte pas comme le responsable qui reste.

Désactiver le compte du dernier responsable, ou le retirer de l’organisation, reste possible : une mesure de sécurité ne doit pas attendre. Les propriétaires et les administrateurs, qui gèrent tous les espaces, nomment alors un nouveau responsable.

## Documents restreints

Un document restreint n’est visible que :

- des personnes choisies, toutes membres de l’espace ;
- des responsables de l’espace ;
- du responsable du document, qui ne perd donc pas l’accès à ce qu’il vient de restreindre ;
- des propriétaires et des administrateurs de l’organisation.

Pour tous les autres, il n’apparaît nulle part : ni dans la liste des documents, ni dans le nombre de documents d’un espace ou d’un dossier, ni comme doublon signalé à l’import. Ouvert par son adresse, il répond comme un document qui n’existe pas.

- **À l’import.** Dans la fenêtre d’import, cochez *Restreindre l’accès à certaines personnes* : la liste des membres de l’espace s’ouvre, les responsables et vous-même déjà cochés. Les documents sont restreints dès leur création : ils ne sont jamais visibles des autres, pas même un instant. Voir [Importer des documents](import.md#importer).
- **Ensuite.** Depuis le document, dans *Accès au document*, on le restreint, on change les personnes choisies, ou on le rouvre à tout l’espace, ce qui retire les personnes choisies. C’est réservé aux responsables de l’espace et au responsable du document, s’il est au moins contributeur.
- **Seuls des membres de l’espace** peuvent être choisis. Retirer quelqu’un de l’espace, ou de l’organisation, lui retire l’accès à ses documents restreints ; l’ajouter de nouveau à l’espace ne le lui rend pas : il faut le choisir encore.
- **Changer le responsable** d’un document restreint le donne à voir au nouveau responsable. L’ancien ne le voit plus, sauf s’il fait partie des personnes choisies, s’il est responsable de l’espace, ou propriétaire ou administrateur de l’organisation.
- **Être choisi donne la lecture.** Ce qu’une personne peut faire d’un document restreint dépend de son rôle dans l’espace : un lecteur choisi le consulte et en télécharge l’original, sans le modifier. Voir [Lire un document](reader.md).

Sur la page *Membres* de l’espace, ses responsables retrouvent la liste de ses documents restreints.

> [!WARNING]
> **Limites connues.** Un document restreint ne montre rien de lui-même, mais deux indices restent visibles des autres membres de l’espace :
>
> - un dossier qui ne contient que des documents restreints qu’ils ne voient pas ne peut pas être supprimé : ils apprennent qu’il n’est pas vide ;
> - la dernière activité de l’espace tient compte de tous ses documents : l’import d’un document restreint la met à jour.
>
> Ni le titre, ni le nombre, ni le contenu de ces documents n’apparaissent. Pour ne laisser aucun indice, rangez ces documents dans un espace dédié, aux membres choisis, sous un nom neutre.

## Introuvable plutôt qu’interdit

Un espace que vous ne pouvez pas voir, ou un espace archivé quand vous n’en êtes pas responsable et n’êtes ni propriétaire ni administrateur de l’organisation, répond comme un espace qui n’existe pas : *Cette page est introuvable*. Il en va de même d’un document que vous ne pouvez pas voir. Dans un espace que vous voyez, une action que votre rôle ne permet pas est refusée avec un message qui l’explique.

> [!WARNING]
> **Le nom et l’adresse d’un espace ne sont pas secrets.** Une adresse est unique dans l’organisation : quelqu’un qui tente de prendre celle d’un espace qu’il ne voit pas apprend qu’elle est utilisée, sans rien voir d’autre. Pour un sujet confidentiel, choisissez un nom neutre. Voir [L’adresse](spaces.md#ladresse).

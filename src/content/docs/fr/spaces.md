---
title: "Espaces et dossiers"
description: "Un espace regroupe une équipe ou un domaine, avec ses membres, leurs rôles et ses documents. Les dossiers rangent son contenu."
---

## Organisation, espaces et dossiers

| Niveau | Rôle | Exemple |
| --- | --- | --- |
| Organisation | Regroupe les comptes et les espaces. | DadaGroup |
| Espace | Une équipe ou un domaine, avec ses membres et leurs rôles. | Infrastructure |
| Dossier | Un rangement à l’intérieur d’un espace. | Procédures d’astreinte |
| Document | Un fichier importé, rangé dans un dossier ou à la racine de l’espace. | Plan de reprise d’activité 2026 |

Un membre ne voit que les espaces dont il fait partie. Les propriétaires et les administrateurs de l’organisation voient tous les espaces, avec les droits d’un responsable, sans avoir besoin d’en être membres. Voir [Rôles et permissions](permissions.md).

## Créer un espace

Tout membre de l’organisation peut créer un espace : bouton *+* à côté d’*Espaces* dans la barre latérale, ou *Créer un espace* sur la page *Espaces*, que l’on ouvre par *Tous les espaces*.

| Champ | Ce qu’il faut savoir |
| --- | --- |
| Nom | Obligatoire, 80 caractères au plus. |
| Description | Facultative, 500 caractères au plus. Elle s’affiche sur la page *Espaces* et en tête de la page *Documents* de l’espace. |
| Adresse | Proposée d’après le nom, modifiable. Voir plus bas. |
| Couleur | Une des sept couleurs proposées. Elle distingue l’espace dans la barre latérale. |

Vous devenez responsable de l’espace. Ajoutez ensuite ses membres depuis sa page *Membres*.

### L’adresse

Chaque espace a une adresse de la forme `/spaces/infrastructure`.

- Lore la propose d’après le nom : « Réseau & Sécurité » donne `reseau-securite`. Elle ne contient que des minuscules sans accent, des chiffres et des tirets, 60 caractères au plus.
- Elle est unique dans l’organisation. Si l’adresse proposée est déjà prise, Lore ajoute `-2`, `-3`… Une adresse choisie à la main et déjà prise est refusée.
- Un responsable peut la changer dans les *Paramètres* de l’espace. Les liens vers l’ancienne adresse ne fonctionnent plus.

> [!WARNING]
> **Le nom et l’adresse d’un espace ne sont pas secrets.** Un espace que vous ne voyez pas ne montre rien : ni son nom exact, ni ses membres, ni son contenu. Mais comme son adresse est unique, quelqu’un qui tente de prendre la même apprend qu’elle est utilisée. Pour un sujet confidentiel, choisissez un nom neutre, par exemple « Projet Orion ».

## Se repérer

- **La barre latérale** liste vos espaces actifs. L’espace ouvert déplie ses pages : *Documents*, *Membres* et, pour ses responsables, *Paramètres*. Elle se replie avec <kbd>[</kbd>.
- **L’accueil** présente vos espaces en tuiles, avec leur nombre de documents, leur nombre de membres et votre rôle. Au-dessus, *Reprendre* rappelle les trois derniers documents que vous avez ouverts, et *Activité récente dans vos espaces* les huit derniers imports, nouvelles versions et changements de statut des documents que vous voyez.
- **La page *Espaces*** les présente en tableau : description, documents, membres, votre rôle et dernière activité. L’onglet *Archivés* regroupe les espaces archivés que vous voyez encore.
- **La page *Documents*** d’un espace a deux vues : *Grille* et *Kanban par statut*. Dans l’une comme dans l’autre, *Filtrer* n’affiche qu’un dossier, ou *Sans dossier*, chacun avec son nombre de documents ; *Tous les documents* les affiche de nouveau. Le bouton porte alors le dossier choisi, comme « Dossier : Procédures d’astreinte », et l’adresse le garde.
  - **Grille.** Les documents, regroupés par dossier. *Trier par* les classe par date de mise à jour, titre, catégorie, statut ou taille, en ordre croissant ou décroissant ; *Masquer des colonnes* allège le tableau. Ces choix sont gardés dans le navigateur. Un clic sur l’en-tête d’un groupe le replie ou le déplie. Les documents obsolètes y sont grisés, et une version en cours d’extraction est signalée sur la ligne, comme « Version 5 en cours ». En bas, des compteurs donnent le nombre de documents de l’espace, ou du dossier affiché, puis, s’il y en a, ceux en cours d’indexation, numérisés et en échec.
  - **Kanban par statut.** Une colonne par statut, Brouillon, Publié et Obsolète, avec une carte par document : titre, catégorie, responsable, version et date. Chaque colonne montre 50 documents, puis *Afficher plus*. La colonne Archivé n’apparaît qu’aux responsables de l’espace, aux propriétaires et aux administrateurs. Les cartes ne se déplacent pas d’une colonne à l’autre : le statut se change depuis la page du document. L’adresse garde la vue (`?view=kanban`).

Le nombre de documents d’un espace ne compte que ceux que vous voyez, archivés exclus. Les documents archivés n’apparaissent pas dans la grille, même pour ceux qui les voient : en bas, « 3 documents archivés » les affiche à part, pour les responsables de l’espace, les propriétaires et les administrateurs. Sa dernière activité tient compte des changements de l’espace, de ses dossiers et de ses documents.

## Dossiers

Les dossiers se gèrent depuis la page *Documents* de l’espace.

- Les contributeurs et les responsables les créent (*Nouveau dossier*), les renomment et les suppriment. Les lecteurs les consultent.
- Ils sont sur un seul niveau, sans sous-dossiers, dans l’ordre de leur création.
- Deux dossiers d’un même espace ne peuvent pas porter le même nom, même écrit avec d’autres majuscules.
- Un document n’a pas forcément de dossier : il peut rester à la racine de l’espace, sous *Sans dossier*. Un espace neuf n’a d’ailleurs aucun dossier.
- Un dossier qui contient au moins un document ne peut pas être supprimé : déplacez d’abord ses documents vers un autre dossier, ou à la racine de l’espace. Voir [Importer des documents](import.md#après-limport).

> [!NOTE]
> **Limite connue.** Un dossier qui ne contient que des documents restreints que vous ne voyez pas ne peut pas non plus être supprimé : vous apprenez ainsi qu’il n’est pas vide, sans rien savoir de ces documents. Les responsables de l’espace, qui voient tous ses documents, peuvent le vider.

## Archiver, réactiver, supprimer

Ces actions sont réservées aux responsables de l’espace et aux propriétaires et administrateurs de l’organisation, dans *Paramètres › Zone sensible*.

| Action | Effet |
| --- | --- |
| Archiver | L’espace disparaît pour ses lecteurs et ses contributeurs. Ses responsables, les propriétaires et les administrateurs le voient encore, dans l’onglet *Archivés*. Il ne peut plus être modifié : ni ses paramètres, ni ses membres, ni ses dossiers, ni ses documents, et on n’y importe plus rien. |
| Réactiver | L’espace réapparaît pour tous ses membres et peut de nouveau être modifié. |
| Supprimer | Après la saisie du nom de l’espace pour confirmer, ses dossiers, ses documents et leurs versions sont supprimés définitivement, et ses membres perdent l’accès. Les fichiers de ses documents sont ensuite effacés du serveur, sauf ceux qu’un document d’un autre espace de l’organisation utilise aussi. |

La création, les modifications, l’archivage, la réactivation et la suppression d’un espace sont inscrits au journal d’audit, comme l’arrivée, le changement de rôle et le départ de ses membres, et les changements de ses dossiers et de ses documents. La suppression d’un espace indique son nombre de documents.

[Voir un espace dans la démo](https://lore.dada-core.com/demo/#/spaces/infrastructure)

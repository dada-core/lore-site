---
title: "Importer des documents"
description: "Lore importe les fichiers PDF, Word, Markdown et texte, en extrait le texte en arrière-plan et le découpe en passages qui gardent leur place : une page ou un titre."
---

## Formats acceptés

| Format | Extensions | Ce qui est extrait | Découpage |
| --- | --- | --- | --- |
| PDF | `.pdf` | Le texte de chaque page | Par page |
| Word | `.docx` | Le texte et les titres | Par titre |
| Markdown | `.md`, `.markdown` | Le texte, les titres et les blocs de code | Par titre |
| Texte | `.txt` | Le texte | Par taille |

Lore reconnaît le format d’un fichier d’après son extension **et** d’après son contenu : un fichier renommé en `.pdf` qui n’est pas un PDF est refusé. Le type annoncé par le navigateur n’est jamais utilisé.

- Un document Word ancien (`.doc`) est refusé : enregistrez-le au format DOCX, puis importez-le.
- Un fichier texte ou Markdown peut être en UTF-8, en UTF-16 avec sa marque d’ordre des octets, ou en Windows-1252 : Lore reconnaît l’encodage seul. Dans un fichier UTF-8, quelques caractères invalides sont remplacés, sans changer la lecture du reste.
- Les pièces jointes et les objets incorporés à un PDF ou à un document Word ne sont pas lus.

Chaque passage garde sa place dans le document : sa page, ou son titre et les titres qui le contiennent. C’est ce qui permet d’ouvrir un document directement au bon endroit.

## Importer

Les contributeurs et les responsables d’un espace y importent des documents, comme les propriétaires et les administrateurs de l’organisation. Un espace archivé n’en reçoit plus.

1. **Ouvrir la fenêtre d’import**
   Bouton *Importer* de la page *Documents* d’un espace ou de l’accueil, ou touche <kbd>I</kbd>. Depuis l’accueil, choisissez d’abord l’espace.
2. **Choisir la destination**
   Le dossier, ou *Sans dossier* pour ranger les documents à la racine de l’espace ; le statut, *Brouillon* (par défaut) ou *Publié* ; la catégorie, facultative.
3. **Restreindre l’accès, si besoin**
   Cochez *Restreindre l’accès à certaines personnes*, puis choisissez parmi les membres de l’espace. Les documents ne sont alors jamais visibles des autres, pas même un instant. Voir [Documents restreints](permissions.md#documents-restreints).
4. **Déposer les fichiers**
   Plusieurs à la fois : la fenêtre en envoie cinq en même temps et affiche la progression de chacun. L’extraction du texte se poursuit ensuite en arrière-plan : vous pouvez fermer la fenêtre.

Chaque fichier devient un document, avec sa version 1 :

- **Son titre** vient du nom du fichier, sans l’extension, les tirets et les soulignés remplacés par des espaces : `plan-reprise_2026.docx` donne « Plan reprise 2026 ». Pour un fichier Markdown, son premier titre de niveau 1 le remplace à la fin de l’extraction, coupé à 200 caractères, si personne n’a changé le titre entre-temps. Le titre enregistré dans les propriétés d’un PDF ou d’un document Word n’est pas utilisé.
- **Son responsable** est la personne qui l’a importé.
- **Son statut et sa catégorie** sont ceux choisis dans la fenêtre.

### Doublons

Si un document de l’espace que vous voyez a exactement le même contenu, le fichier est tout de même importé, et la fenêtre vous le signale : supprimez le doublon s’il est inutile. Sur le serveur, ce contenu n’est stocké qu’une fois.

### Envoi interrompu

Un envoi coupé, par exemple par le réseau, ne laisse rien sur le serveur : il se relance depuis le début. Un fichier entièrement reçu est importé, même si la page se ferme ensuite. Pendant un envoi, fermer la fenêtre ou quitter la page (bouton *Retour* du navigateur, lien de l’application) pose la question *Interrompre l’envoi ?* : *Continuer l’envoi* reste sur place, *Fermer et interrompre* abandonne les fichiers qui ne sont pas encore entièrement partis. Recharger ou fermer l’onglet fait demander une confirmation par le navigateur, avec le même effet.

## Taille maximale

50 Mo par fichier par défaut. Un propriétaire ou un administrateur la change dans *Administration › Stockage et import*, de 1 Mo jusqu’au plafond fixé sur le serveur par `LORE_MAX_UPLOAD_SIZE` (1 Go par défaut). Voir [Stockage et extraction](storage.md#taille-des-fichiers).

La fenêtre écarte un fichier trop gros avant de l’envoyer, et le serveur le refuse de toute façon.

## Fichiers refusés

Un fichier refusé n’est pas importé : aucun document n’est créé, et rien ne reste sur le serveur.

| Cause | Que faire |
| --- | --- |
| Le fichier dépasse la taille maximale. | Réduire le fichier, ou demander à un administrateur de relever la limite. |
| Le fichier est vide. | Vérifier le fichier sur votre ordinateur. |
| Le format n’est pas accepté. | Enregistrer le document en PDF, DOCX, Markdown ou texte. |
| C’est un document Word ancien (`.doc`). | L’enregistrer au format DOCX. |
| Le contenu ne correspond pas à l’extension. | Vérifier le fichier : il est peut-être mal nommé, ou endommagé. |
| Le disque du serveur est presque plein. | Prévenir la personne qui exploite le serveur. |

## États de l’extraction

| État | Signification | Que faire |
| --- | --- | --- |
| En cours | Le texte est en cours d’extraction, ou attend son tour. | Patienter quelques secondes. |
| Indexé | Le texte est extrait et découpé en passages. | Rien. |
| Numérisé | Au moins la moitié des pages du PDF ne contiennent que des images, sans texte. | Ajouter une description au document. |
| Échec | Le texte n’a pas pu être extrait. | Selon la cause, voir ci-dessous. |

L’état de chaque document s’affiche dans la fenêtre d’import, dans la liste des documents de l’espace et sur la page du document. Vos propres imports encore en cours ou en échec sont aussi rappelés sur l’accueil.

**Document numérisé.** Une page compte comme sans texte en dessous de 20 caractères visibles. Le document est importé, son nombre de pages est connu et le texte de ses autres pages est gardé ; il reste trouvable par son titre et sa description.

**Texte tronqué.** Lore garde jusqu’à 10 millions de caractères de texte par document. Au-delà, la suite est laissée de côté, et la page du document le signale.

### En cas d’échec

| Cause | Ce que fait Lore | Que faire |
| --- | --- | --- |
| Fichier protégé par un mot de passe | Échec aussitôt | Retirer la protection, puis importer le fichier à nouveau. |
| Fichier endommagé ou illisible | Échec aussitôt | Ouvrir le fichier sur votre ordinateur, l’enregistrer de nouveau, puis l’importer. |
| Contenu qui n’est pas du format annoncé | Échec aussitôt | Vérifier le fichier, par exemple un `.docx` qui n’est pas un document Word. |
| Délai dépassé, processus d’extraction arrêté, fichier introuvable | Nouvelle tentative après 1 minute, puis après 5 minutes | Après trois essais, *Relancer* depuis le document. |

*Relancer* n’est proposé que pour une cause passagère, aux contributeurs et aux responsables de l’espace : pour un fichier protégé ou endommagé, une nouvelle tentative échouerait de la même façon.

> [!NOTE]
> **Documents numérisés.** La reconnaissance de texte (OCR) n’est pas incluse dans la version 0.1, ni le branchement d’un extracteur externe qui l’apporterait. Voir [Stockage et extraction](storage.md#extracteur-externe).

## Après l’import

| Action | Qui | Ce qu’il faut savoir |
| --- | --- | --- |
| Changer le titre, la description ou la catégorie | Contributeurs et responsables de l’espace | Titre de 200 caractères au plus, description de 2 000. |
| Déplacer vers un autre dossier | Contributeurs et responsables de l’espace | Vers un dossier du même espace, ou à sa racine. |
| Restreindre l’accès, ou le rouvrir à l’espace | Responsables de l’espace, responsable du document | Voir [Documents restreints](permissions.md#documents-restreints). |
| Supprimer | Responsables de l’espace ; la personne qui l’a importé, tant qu’il n’a qu’une version | Après confirmation, définitivement : il n’y a pas de corbeille. Son fichier est effacé si aucun autre document ne l’utilise. |

Les propriétaires et les administrateurs de l’organisation ont les droits d’un responsable. Dans un espace archivé, aucune de ces actions n’est possible.

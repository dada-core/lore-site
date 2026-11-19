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
| Texte | `.txt` | Le texte | Par taille, entre deux lignes |

Lore reconnaît le format d’un fichier d’après son extension **et** d’après son contenu : un fichier renommé en `.pdf` qui n’est pas un PDF est refusé. Le type annoncé par le navigateur n’est jamais utilisé.

- Un document Word ancien (`.doc`) est refusé : enregistrez-le au format DOCX, puis importez-le.
- Un fichier texte ou Markdown peut être en UTF-8, en UTF-16 avec sa marque d’ordre des octets, ou en Windows-1252 : Lore reconnaît l’encodage seul. Dans un fichier UTF-8, quelques caractères invalides sont remplacés, sans changer la lecture du reste.
- Les pièces jointes et les objets incorporés à un PDF ou à un document Word ne sont pas lus.

Chaque passage garde sa place dans le document : sa page, ou son titre et les titres qui le contiennent. C’est ce qui permet d’ouvrir un document directement au bon endroit, depuis le lien d’une section ou d’une page. Pour un document Markdown, Word ou texte, l’extraction produit aussi le contenu mis en forme qu’affiche la page du document : voir [Lire un document](reader.md).

## Importer

Les contributeurs et les responsables d’un espace y importent des documents, comme les propriétaires et les administrateurs de l’organisation. Un espace archivé n’en reçoit plus.

1. **Ouvrir la fenêtre d’import**
   Bouton *Importer* de la page *Documents* d’un espace ou de l’accueil, ou touche <kbd>I</kbd>. Hors des pages d’un espace, choisissez d’abord l’espace, sauf si vous ne contribuez qu’à un seul : il est alors déjà choisi.
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

**Document numérisé.** Une page compte comme une image sans texte quand elle a moins de 20 caractères visibles et contient une image, quelle qu’elle soit. Une page sans aucune image ne compte jamais, même presque vide (diapositive à titre court, formulaire, schéma dessiné) ; une diapositive à titre court avec un logo, si. Le document est importé, son nombre de pages est connu et le texte de ses autres pages est gardé, et cherché ; le contenu de ses images ne l’est pas : donnez-lui une description qui dit ce qu’il contient.

**Texte tronqué.** Lore garde jusqu’à 10 millions de caractères de texte par document. Au-delà, la suite est laissée de côté, et la page du document le signale.

**Langue.** L’extraction détecte aussi la langue du texte : français, anglais ou autre. La recherche s’en sert pour reconnaître les formes des mots. Si elle s’est trompée, un contributeur la corrige dans le panneau du document : voir [Changer la langue](reader.md#changer-la-langue).

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

## Importer une nouvelle version

Un document se met à jour en important une nouvelle version de son fichier : *Nouvelle version*, en haut de la page du document, pour les contributeurs et les responsables de l’espace. Déposez le fichier, ou choisissez-le, puis écrivez *Ce qui change* (500 caractères au plus, visible dans l’historique des versions).

- **Mêmes contrôles qu’un import.** Formats, taille maximale, fichiers refusés : comme ci-dessus.
- **Fichier identique.** Un fichier identique à la dernière version, actuelle, en cours ou en échec, est refusé : « Ce fichier est identique à la version 4. » Identique à une version plus ancienne, il est accepté : c’est un retour en arrière.
- **Format.** Il peut changer d’une version à l’autre ; la fenêtre l’annonce (« Le format change : Markdown, puis PDF. »).
- **Statut.** Un document publié propose *Conserver le statut Publié*, cochée ; décochée, il repasse en Brouillon. Un document obsolète propose *Repasser en Publié*. Le choix s’applique quand la version devient la version actuelle, et pas si le statut a changé entre-temps.
- **Pendant l’extraction.** Tout le monde lit encore la version actuelle, et la recherche s’appuie sur elle ; la page du document affiche « Une nouvelle version est en cours de traitement. », la liste des documents « Version 5 en cours ». Une fois le texte extrait, la nouvelle version devient la version actuelle d’un coup, pour la lecture comme pour la recherche.
- **En cas d’échec.** La version actuelle ne change pas. Les contributeurs voient « La version 5 n’a pas pu être traitée : … », avec *Relancer* pour une cause passagère et *Importer une autre version*.
- **Langue.** Elle est détectée de nouveau, sauf si quelqu’un a choisi celle de la version actuelle : la nouvelle version la reprend.

La version précédente reste consultable et téléchargeable dans l’historique du document. Un document archivé n’accepte pas de nouvelle version : ramenez-le d’abord à un autre statut.

## Après l’import

| Action | Qui | Ce qu’il faut savoir |
| --- | --- | --- |
| Importer une nouvelle version | Contributeurs et responsables de l’espace | Voir [Importer une nouvelle version](#importer-une-nouvelle-version). |
| Changer le statut | Contributeurs et responsables de l’espace | Brouillon, Publié ou Obsolète, avec le document qui remplace un document obsolète. |
| Archiver, ou sortir d’Archivé | Responsables de l’espace | Retiré des listes et de la recherche ; seuls les responsables de l’espace et les administrateurs le voient, en lecture seule. |
| Changer le titre, la description ou la catégorie | Contributeurs et responsables de l’espace | Titre de 200 caractères au plus, description de 2 000. |
| Changer la langue | Contributeurs et responsables de l’espace | Français, anglais ou autre : le document est réindexé aussitôt. Pas pendant l’extraction. Voir [Changer la langue](reader.md#changer-la-langue). |
| Déplacer vers un autre dossier | Contributeurs et responsables de l’espace | Vers un dossier du même espace, ou à sa racine. |
| Restreindre l’accès, ou le rouvrir à l’espace | Responsables de l’espace, responsable du document | Voir [Documents restreints](permissions.md#documents-restreints). |
| Changer le responsable | Responsables de l’espace, responsable du document | Vers un membre actif de l’espace, au moins contributeur. Le nouveau responsable voit le document, même restreint. Voir [Changer le responsable](reader.md#changer-le-responsable). |
| Supprimer | Responsables de l’espace ; la personne qui l’a importé, tant qu’il n’a qu’une version | Après confirmation, définitivement : il n’y a pas de corbeille. Son fichier est effacé si aucun autre document ne l’utilise. |

Les propriétaires et les administrateurs de l’organisation ont les droits d’un responsable. Dans un espace archivé, aucune de ces actions n’est possible. Un document archivé n’accepte que le changement de son statut et sa suppression.

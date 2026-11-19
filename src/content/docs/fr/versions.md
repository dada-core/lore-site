---
title: "Versions et statuts"
description: "Chaque document a un historique de versions, un statut et un responsable : on sait toujours quelle version fait foi."
---

## Importer une nouvelle version

Un document se met à jour en important une nouvelle version de son fichier : *Nouvelle version*, en haut de la page du document, pour les contributeurs et les responsables de l’espace. La fenêtre *Nouvelle version de « … »* demande :

| Champ | Ce qu’il faut savoir |
| --- | --- |
| Le fichier | Déposé ou choisi, avec les mêmes contrôles qu’un import : formats, taille maximale, fichiers refusés. Le même format est conseillé, mais il peut changer : la fenêtre l’annonce, par exemple « Le format change : Markdown, puis PDF. » |
| Ce qui change | Facultatif, 500 caractères au plus, visible par toute personne qui voit le document, dans l’historique. Il ne se modifie plus ensuite. |
| Le statut | Un document publié propose *Conserver le statut Publié*, cochée : décochée, il repasse en Brouillon. Un document obsolète propose *Repasser en Publié*. Un brouillon reste un brouillon. |

*Importer la version 5* envoie le fichier : « Version importée : extraction du texte en cours ». La version 4 reste consultable et téléchargeable dans l’historique.

- **Fichier identique.** Un fichier identique à la dernière version, actuelle, en cours ou en échec, est refusé : « Ce fichier est identique à la version 4. » Identique à une version plus ancienne, il est accepté : c’est la façon de revenir en arrière.
- **Numéro.** Chaque version prend le numéro suivant ; deux personnes qui importent en même temps reçoivent deux numéros différents.
- **Langue.** Elle est détectée de nouveau, sauf si quelqu’un a choisi à la main celle de la version actuelle : la nouvelle version la reprend, et elle reste modifiable.
- **Document archivé.** Il n’accepte pas de nouvelle version : ramenez-le d’abord à un autre statut.

Voir aussi [Importer des documents](import.md#importer-une-nouvelle-version).

## La version actuelle

Une nouvelle version ne devient la version actuelle qu’une fois son texte extrait, d’un coup, pour la lecture comme pour la recherche :

- **Pendant l’extraction**, tout le monde lit la version actuelle, et la recherche s’appuie sur elle. La page du document affiche « Une nouvelle version est en cours de traitement. », la liste des documents « Version 5 en cours », et, si vous l’avez importée vous-même, votre accueil la rappelle dans *À traiter*.
- **À la fin de l’extraction**, la nouvelle version la remplace. Le statut demandé s’applique à ce moment-là, sauf si le statut du document a changé entre-temps : un document archivé pendant l’extraction le reste.
- **En cas d’échec**, la version actuelle ne change pas. Les contributeurs voient « La version 5 n’a pas pu être traitée : … », avec *Relancer* pour une cause passagère, et *Importer une autre version*.
- **Deux versions à la fois.** Si la version 6 finit avant la 5, elle devient la version actuelle ; la 5 reste dans l’historique.

## Historique en strates

Dans le panneau de droite, *Versions* dessine l’historique en strates : une bande par version, la plus récente en haut et en couleur. L’épaisseur d’une bande dit l’ampleur des modifications apportées par la version : la part des passages ajoutés ou retirés par rapport à la précédente, de 0 (rien n’a changé) à 1 (tout a été réécrit). La première version, une fois extraite, compte comme entière. Une bande hachurée signale une ampleur inconnue : version en cours ou en échec, version jamais devenue actuelle, ou version dont le texte, ou celui de la précédente, n’a aucun passage, comme un PDF entièrement numérisé.

Choisissez une bande, à la souris ou avec les flèches <kbd>↑</kbd> et <kbd>↓</kbd> : dessous s’affichent « Version 4, actuelle » ou « Version 3 », sa date d’import et son auteur, ce qui change (« Première version » pour la première), le nom de son fichier, son *Empreinte SHA-256* à copier, *Afficher* pour une version plus ancienne et *Télécharger*. Les dix versions les plus récentes s’affichent d’abord, puis *Toutes les versions*.

## Consulter une ancienne version

*Afficher* ouvre une ancienne version dans sa propre page, en lecture seule : son contenu mis en forme ou son PDF, son sommaire et les liens de ses sections, de la forme `/documents/…/versions/3#h-7`. Un bandeau le rappelle : « Vous consultez la version 3 du 2 sept. 2026. La version actuelle est la 5. », avec *Revenir à la version actuelle*. Son fichier se télécharge comme celui de la version actuelle.

- **Consultation.** Ouvrir une ancienne version est une consultation, inscrite au journal d’audit avec son numéro, une fois par heure et par document comme la page du document : ouverte dans l’heure qui suit la version actuelle, elle n’ajoute pas de ligne. La télécharger est un téléchargement.
- **Recherche.** Elle ne cherche que dans la version actuelle de chaque document : elle ne mène jamais à une ancienne version.
- **Lien d’une autre version.** Un lien de section copié quand la version 3 était la version actuelle porte son numéro. Il ouvre la version actuelle à la section du même titre, avec « Ce lien visait la version 3 : voici la même section dans la version actuelle. » ; si elle n’existe plus, en haut, avec « Ce passage a changé depuis la version 3. » Dans les deux cas, *Afficher la version 3* y mène. Un PDF s’ouvre à la même page, si elle existe encore. Le même lien sans section ouvre la version actuelle, avec « Ce lien visait la version 3 : voici la version actuelle. »

## Statuts

| Statut | Signification |
| --- | --- |
| Brouillon | Visible par les membres de l’espace, signalé comme non finalisé. |
| Publié | La version de référence. |
| Obsolète | Reste consultable et cherchable, mais classé en dernier, avec le document qui le remplace. |
| Archivé | Retiré des listes et de la recherche. Visible par les responsables de l’espace et les administrateurs, en lecture seule. |

| Qui | Ce qu’il peut faire |
| --- | --- |
| Contributeurs | Passer un document de Brouillon à Publié ou Obsolète, et retour |
| Responsables de l’espace, propriétaires et administrateurs | Aussi archiver un document, et le sortir d’Archivé |

*Changer le statut*, dans le menu *Autres actions* ou en cliquant sur le statut dans le panneau, ouvre une fenêtre qui décrit l’effet de chaque statut. Pour un contributeur, Archivé y est grisé : « Réservé aux responsables de l’espace. » *Archiver*, dans le même menu, ouvre la même fenêtre, Archivé déjà choisi : on lit l’effet avant d’enregistrer. Chaque changement de statut est inscrit au journal d’audit et dans l’*Activité* du document.

### Obsolète et remplaçant

Choisissez *Obsolète*, puis, si possible, le document qui le remplace : tapez son titre dans *Remplacé par*. Lore propose les documents dont le titre a un mot qui commence par chacun des mots tapés, huit au plus, parmi ceux que vous pouvez lire dans les espaces actifs, sauf le document lui-même et les documents obsolètes ou archivés.

- **Bandeau.** Les lecteurs voient « Ce document est obsolète depuis le 10 nov. 2026. Utilisez plutôt Restaurer une base PostgreSQL depuis une sauvegarde. », le titre en lien.
- **Confidentialité.** Un lecteur qui ne peut pas lire le remplaçant n’en apprend même pas le titre : son bandeau s’arrête à la date, et la recherche ne le nomme pas.
- **Recherche.** Un document obsolète reste cherchable, mais vient toujours en dernier, avec « Remplacé par » et le titre de son remplaçant pour qui le lit.
- **Remplaçant retiré.** Quitter Obsolète retire le remplaçant ; supprimer le remplaçant le retire aussi. Un remplaçant que vous ne pouvez pas lire reste en place quand vous enregistrez le statut : vous ne pouviez pas le voir, ni vouloir le retirer.

### Archivé

Un document archivé disparaît des listes, des nombres, de la recherche et de la palette pour les lecteurs et les contributeurs, son responsable compris : pour eux, il répond comme un document qui n’existe pas. Les responsables de l’espace, les propriétaires et les administrateurs le voient encore, avec « Ce document est archivé depuis le … : seuls les responsables de l’espace et les administrateurs le voient. Il ne peut plus être modifié. »

- **Où le retrouver.** Dans la colonne Archivé du *Kanban par statut*, par « 3 documents archivés » en bas de la grille, ou dans la recherche en cochant *Archivé* dans la puce *Statut*. Voir [Espaces et dossiers](spaces.md#se-repérer).
- **Lecture seule.** Ni nouvelle version, ni titre, description, catégorie, langue, dossier, accès ou responsable. Seuls son statut et sa suppression restent possibles.

## Activité

Sous le contenu de chaque document, *Activité* raconte ce qui lui a été fait, le plus récent d’abord : imports et nouvelles versions, changements de statut, d’accès, de responsable, de dossier, de titre, de description, de catégorie et de langue, avec la personne et la date. Les consultations et les téléchargements n’y figurent jamais : seul le [journal d’audit](audit.md) les garde. Un changement d’accès dit à combien de personnes le document est restreint, pas lesquelles.

Sur l’accueil, *Activité récente dans vos espaces* montre les huit derniers imports, nouvelles versions et changements de statut des documents que vous voyez. Elle lit les 2 000 derniers imports, nouvelles versions et changements de statut de toute l’organisation, puis garde ceux des documents que vous voyez et qui ne sont pas archivés : si aucun ne concerne un document que vous voyez, la liste reste vide.

## Ce qui n’existe pas encore

- **Rétablir une version.** Pour revenir en arrière, téléchargez l’ancienne version, puis importez-la comme nouvelle version.
- **Comparer deux versions**, supprimer une version, ou modifier ce qui change après l’import.
- **En attente de validation** <span class="vb">v0.2</span> : un statut qui soumettra un document aux responsables de l’espace avant sa publication.
- **Dates de révision** <span class="vb">v0.2</span> : une date prévue rappellera au responsable de relire le document ; les révisions en retard apparaîtront dans le tableau de bord.

[Voir un document et son historique dans la démo](https://lore.dada-core.com/demo/#/documents/restaurer-pg)

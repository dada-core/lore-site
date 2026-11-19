---
title: "Lire un document"
description: "Lore affiche chaque document dans la page : un PDF tel quel, un document Markdown, Word ou texte mis en forme. Un lien peut l’ouvrir directement à la bonne section ou à la bonne page."
---

## Ce qui s’affiche

| Format | Ce qui s’affiche |
| --- | --- |
| PDF | Le fichier lui-même, page par page, avec son texte sélectionnable |
| Markdown | Titres, paragraphes, listes, tableaux, citations, texte barré, liens, et blocs de code avec leur indentation |
| Word | Titres, paragraphes, tableaux, gras, italique, souligné, texte barré et liens |
| Texte | Le texte tel qu’il est écrit : espaces, tabulations et retours à la ligne gardés, lignes trop longues repliées |

Un document Markdown, Word ou texte s’affiche à partir d’un rendu produit par l’extraction, en même temps que son texte, puis nettoyé avant d’être enregistré : il ne garde que des éléments de mise en forme, sans script ni style. Chaque bloc de code porte un bouton *Copier*. Voir [Sécurité et connexion](security.md#lecture-des-documents).

Pendant l’extraction, un PDF s’affiche aussitôt ; pour les autres formats, la page indique « Le contenu s’affichera dès la fin de l’extraction. » et se met à jour d’elle-même. Après un échec, seul le bandeau qui en donne la cause s’affiche : le fichier reste téléchargeable. Voir [En cas d’échec](import.md#en-cas-déchec). Plus rarement, un document indexé n’a pas de contenu mis en forme, par exemple un document Word dont la mise en forme n’a pas pu être lue : la page indique « Le contenu de ce document ne peut pas être affiché. Téléchargez l’original pour le lire. »

### Markdown

- **Liens.** Les liens `http`, `https` et `mailto` s’ouvrent dans un nouvel onglet ; une adresse web écrite telle quelle devient un lien. Un lien vers un titre du même document, par exemple `#erreurs-fréquentes`, mène à ce titre. Un lien relatif vers un autre fichier, comme `../README.md`, devient du simple texte.
- **Images.** Elles ne sont jamais chargées : à leur place, « Image non affichée : » suivi de leur texte de remplacement. Pour une image hébergée ailleurs, ce texte est un lien vers elle.
- **HTML écrit dans le fichier.** Seules les balises `<br>`, `<kbd>`, `<sup>`, `<sub>`, `<details>` et `<summary>` sont gardées. Les autres sont retirées, leur texte conservé.
- **Code.** Il s’affiche sans coloration syntaxique.

### Word

Une note sous le titre le rappelle : « Affichage simplifié du document Word : images et mise en page ne sont pas reproduites. », avec un lien *Télécharger l’original*.

- Les listes apparaissent en paragraphes, précédés de leur numéro ou de leur puce.
- Ni images, ni objets incorporés, ni mise en page, couleurs ou polices.
- Un lien vers un signet du document, comme ceux de sa table des matières, mène à la section qui le contient.

### Texte

Un fichier texte est découpé en parties d’au plus 4 000 caractères, coupées entre deux lignes : ce sont aussi ses passages. Il n’a pas de sommaire.

## Le lecteur PDF

Un PDF s’affiche dans la page avec pdf.js, servi par Lore lui-même, sans aucun service extérieur, et chargé seulement à l’ouverture d’un PDF.

- **Seules les pages lues sont transférées.** La page 112 d’un guide de 312 pages s’affiche sans attendre le reste du fichier.
- **La barre** indique la page affichée, par exemple « Page 112 sur 312 », avec la page précédente et la suivante, le champ *Aller à la page* et le zoom. Sur un téléphone, la page prend la largeur de l’écran.
- **Le texte se sélectionne et se copie.** Pour un PDF numérisé, la barre indique « Image numérisée, sans couche texte », et rien n’y est surligné.
- **Les liens du PDF** s’ouvrent dans un nouvel onglet. Ses scripts et ses formulaires ne sont jamais exécutés.
- **Les signets du PDF**, s’il en a, remplissent *Sur cette page*.

Une fois le lecteur sélectionné, d’un clic ou avec <kbd>Tab</kbd> :

| Raccourci | Action |
| --- | --- |
| <kbd>←</kbd> <kbd>→</kbd> | Page précédente, page suivante |
| <kbd>+</kbd> <kbd>-</kbd> | Agrandir, réduire |

Ces touches n’agissent pas pendant une saisie dans le champ *Aller à la page*.

*Ouvrir dans le navigateur*, dans le menu *Autres actions*, ouvre le PDF dans un nouvel onglet, avec le lecteur PDF du navigateur. Si un PDF ne peut pas s’afficher dans la page, Lore l’indique : « Ce PDF ne peut pas être affiché ici. Téléchargez l’original pour le lire. »

## Ouvrir au bon passage

Le lien d’un document ouvre toujours sa version actuelle, même si son titre ou son dossier change :

```text title="Lien du document"
https://lore.example.com/documents/0193a7c2-…
```

Un lien peut aussi désigner un passage, après le signe `#`, avec la version à laquelle il appartient (`v`) :

```text title="Lien d’une section"
https://lore.example.com/documents/0193a7c2-…?v=1#h-7
```

| Ancre | Passage |
| --- | --- |
| `h-7` | Le septième titre d’un document Markdown ou Word, et sa section ; `h-0` désigne ce qui précède le premier titre |
| `part-3` | La troisième partie d’un fichier texte |
| `page-112` | La page 112 d’un PDF |

Une ancre suivie d’un numéro de passage, comme `h-7-2`, mène à sa section, `h-7`.

À l’ouverture, le document défile jusqu’au passage et l’encadre. Dans un document Markdown ou Word, le titre de la section reçoit le focus : un lecteur d’écran commence là.

**Mots surlignés.** Un lien peut aussi porter des mots à surligner, dans `q` :

```text title="Lien d’un passage trouvé"
https://lore.example.com/documents/0193a7c2-…?from=search&q=pg_restore%20role&v=1#h-7-2
```

Les mots de `q` sont surlignés dans la section ou la page désignée seulement, sans tenir compte des accents ni des majuscules ; une expression entre guillemets droits reste entière, et ni `or`, ni les mots exclus, comme `-barman`, ne sont surlignés. Avec `from=search`, un bandeau le rappelle : « Passage trouvé pour « pg_restore role », section 4.2 Erreurs fréquentes. Il est surligné ci-dessous. »

**Depuis un résultat de recherche.** Le lien d’un résultat a cette forme, avec la version actuelle au moment de la recherche. Un document trouvé par son titre ou sa description s’ouvre en haut, sans bandeau, mais avec *Retour aux résultats*.

- **Formes trouvées.** Le lecteur surligne aussi les mots que la recherche a trouvés sous une autre forme, comme « serveur » pour « serveurs », vingt au plus. Un lien copié ne porte que `q` : seuls les mots écrits dans `q` y sont surlignés.
- **Retour aux résultats.** Le bandeau propose *Retour aux résultats*. Depuis la page de résultats, il y ramène, avec ses filtres ; depuis un lien copié ou un nouvel onglet, il relance la recherche de `q`.

| Cas | Ce qui s’affiche |
| --- | --- |
| Un titre, une partie ou une page que le document n’a pas | Le document s’ouvre en haut, ou à sa première page pour un PDF, avec « Ce passage n’existe pas dans ce document. » |
| Un lien de section ou de page fait pour une version plus ancienne | La version actuelle s’ouvre à la section du même titre, avec « Ce lien visait la version 3 : voici la même section dans la version actuelle. » Si elle n’existe plus, en haut, avec « Ce passage a changé depuis la version 3. » Dans les deux cas, *Afficher la version 3* ouvre l’ancienne version. Un PDF s’ouvre au même numéro de page, s’il existe encore, avec « Ce lien visait la page 2 de la version 3 : voici la page 2 de la version actuelle. » |
| Un lien sans section fait pour une version plus ancienne | La version actuelle s’ouvre en haut, avec « Ce lien visait la version 3 : voici la version actuelle. » et *Afficher la version 3*. |
| Un lien qui désigne une version que le document n’a pas encore | Le document s’ouvre en haut, avec « Ce passage a changé depuis la version 6. » |
| Vous n’êtes pas connecté | Après la connexion, le document s’ouvre au même passage. |
| Vous ne pouvez pas voir le document | *Cette page est introuvable*, comme pour un document qui n’existe pas. |

### Copier un lien

- *Copier le lien*, dans le menu *Autres actions*, copie le lien du document.
- Au survol d’un titre, un `#` apparaît à côté de lui : il copie le lien de sa section, avec sa version, « Lien de la section copié ». Au clavier, ce bouton suit le titre.
- Quand Lore est servi sans HTTPS, par exemple en `http://` sur un réseau interne, le navigateur refuse l’accès au presse-papiers : une petite fenêtre montre alors le lien, déjà sélectionné. Copiez-le avec <kbd>Ctrl C</kbd>.

### Sommaire

*Sur cette page*, en bas du panneau de droite, liste les titres d’un document Markdown ou Word sur trois niveaux, et marque la section en cours de lecture. Un clic mène au titre et met à jour l’adresse, sans ajouter d’étape à l’historique du navigateur. Pour un PDF, il liste ses signets, s’il en a ; un fichier texte n’a pas de sommaire.

## Propriétés

Le panneau de droite, affiché ou masqué avec <kbd>]</kbd>, dit tout du document.

| Propriété | Ce qui s’affiche | Qui la modifie |
| --- | --- | --- |
| Statut | *Brouillon*, *Publié*, *Obsolète* ou *Archivé* | Contributeurs et responsables de l’espace, avec *Changer le statut* ; Archivé, les responsables de l’espace seulement |
| Responsable | Son nom, ou *Ancien membre* s’il a quitté l’organisation | Voir [Changer le responsable](#changer-le-responsable) |
| Catégorie | Sa pastille, ou *Sans catégorie* | Contributeurs et responsables de l’espace |
| Espace | Un lien vers ses documents | Personne |
| Dossier | Son nom, ou *Sans dossier* | Contributeurs et responsables de l’espace, avec *Déplacer* |
| Langue | Français, anglais ou autre, détectée à l’extraction ; *Pas encore détectée* tant que la première extraction n’a pas abouti | Contributeurs et responsables de l’espace, voir [Changer la langue](#changer-la-langue) |
| Format | Le format, le nombre de pages ou de sections et la taille, par exemple « PDF, 312 pages, 24,8 Mo » | Personne |
| Indexation | L’état de l’extraction et sa date | Personne. Après un échec passager, *Relancer* est dans le bandeau d’échec, au-dessus du contenu |

Suivent *Accès*, qui dit qui voit le document, *Versions*, l’historique en strates décrit ci-dessous, avec l’*Empreinte SHA-256* de la version choisie, à copier, puis *Sur cette page*.

Sous le titre, une ligne rappelle le statut, la version, la date de mise à jour, l’accès restreint, et `EN` pour un document en anglais ; puis vient la description, ou *Ajouter une description* pour un contributeur. Dans un espace archivé, tout est en lecture seule.

### Changer le titre et la description

Les contributeurs et les responsables de l’espace les changent depuis la page du document :

- **Le titre se modifie sur place.** Le crayon *Modifier le titre*, à côté du titre, le change en champ : <kbd>Entrée</kbd> enregistre, <kbd>Échap</kbd> annule. 200 caractères au plus.
- **La description se modifie dans une fenêtre.** *Modifier la description*, à côté d’elle, ou *Ajouter une description*, l’ouvre ; *Enregistrer* garde le texte, et une description vidée est retirée. 2 000 caractères au plus.

Les deux changements sont inscrits dans l’*Activité* du document et au journal d’audit.

### Changer le responsable

Le responsable veille à ce que le document reste à jour, et peut en gérer l’accès. Choisissez *Changer le responsable* dans le menu *Autres actions*, ou cliquez sur le responsable dans le panneau.

- **Qui le change.** Les responsables de l’espace, et le responsable actuel du document s’il est au moins contributeur. Un document dont le responsable a quitté l’organisation ne peut être repris que par un responsable de l’espace.
- **Qui peut le devenir.** Un membre actif de l’espace, avec au moins le rôle Contributeur.
- **Pour un document restreint**, le nouveau responsable le voit. Si vous n’êtes ni parmi les personnes choisies, ni responsable de l’espace, ni administrateur, vous ne le verrez plus ; la fenêtre vous prévient : « Christ Koffi verra ce document. Vous ne le verrez plus : vous ne faites pas partie des personnes choisies. »

Les propriétaires et les administrateurs de l’organisation ont les droits d’un responsable de l’espace. Le changement est inscrit au journal d’audit.

### Changer la langue

La langue décide de la façon dont la recherche lit le document : en français ou en anglais, elle reconnaît les formes des mots, comme « serveur » pour « serveurs » ; dans une autre langue, elle cherche les mots tels qu’écrits. Si la détection s’est trompée, par exemple pour un guide en anglais détecté comme français :

1. **Choisir la langue**
   Cliquez sur la langue, dans le panneau de droite, puis choisissez *Français*, *Anglais* ou *Autre*.
2. **Confirmer**
   La fenêtre *Changer la langue du document ?* le rappelle : « Changer la langue relance l’indexation du document, pour que la recherche tienne compte de la nouvelle langue. » Cliquez sur *Changer la langue*.

Le document est réindexé aussitôt : « Langue mise à jour : le document est réindexé. » La langue choisie est gardée si la même version est extraite de nouveau.

- **Qui la change.** Les contributeurs et les responsables de l’espace, comme les propriétaires et les administrateurs de l’organisation.
- **Quand.** Pas pendant l’extraction du texte, ni dans un espace archivé.
- **Journal d’audit.** Le changement y est inscrit, avec l’ancienne langue.

## Versions et statut

### Historique en strates

Dans *Versions*, chaque version est une bande, la plus récente en haut et en couleur. L’épaisseur d’une bande dit l’ampleur des modifications apportées par la version : la part des passages ajoutés ou retirés par rapport à la version précédente. La première version, une fois extraite, compte comme entière. Une bande hachurée signale une ampleur inconnue : version en cours ou en échec, version jamais devenue actuelle, ou version dont le texte, ou celui de la précédente, n’a aucun passage, comme un PDF entièrement numérisé. Une version en cours ou en échec, plus récente que la version actuelle, est marquée *en cours* ou *en échec*.

Choisissez une bande, à la souris ou avec les flèches <kbd>↑</kbd> et <kbd>↓</kbd> : dessous s’affichent sa date d’import et son auteur, ce qui change (« Première version » pour la première), le nom de son fichier, *Afficher* pour une version plus ancienne et *Télécharger*. Les dix versions les plus récentes s’affichent d’abord, puis *Toutes les versions*.

### Ancienne version

*Afficher* ouvre une ancienne version dans sa propre page, `/documents/{id}/versions/3`, en lecture seule : son contenu mis en forme ou son PDF, son sommaire et les liens de ses sections. Un bandeau le rappelle : « Vous consultez la version 3 du 2 sept. 2026. La version actuelle est la 5. », avec *Revenir à la version actuelle*. L’ouvrir est une consultation, inscrite au journal d’audit avec son numéro, une fois par heure et par document. La recherche ne mène jamais à une ancienne version : elle ne cherche que dans la version actuelle.

### Nouvelle version

*Nouvelle version*, en haut de la page, ouvre la fenêtre d’import d’une nouvelle version, pour les contributeurs et les responsables de l’espace. Voir [Importer une nouvelle version](import.md#importer-une-nouvelle-version). Pendant son extraction, la page affiche « Une nouvelle version est en cours de traitement. » et se met à jour d’elle-même quand elle devient la version actuelle.

### Statut

*Changer le statut*, dans le menu *Autres actions* ou en cliquant sur le statut dans le panneau, ouvre une fenêtre qui décrit l’effet de chaque statut. *Archiver*, dans le même menu, ouvre la même fenêtre, Archivé déjà choisi, pour les responsables de l’espace.

| Statut | Ce que voit le lecteur |
| --- | --- |
| Obsolète | « Ce document est obsolète depuis le 10 nov. 2026. Utilisez plutôt Restaurer une base PostgreSQL depuis une sauvegarde. », le titre en lien vers le document qui le remplace. Si vous ne pouvez pas le lire, ou s’il n’y en a pas, le bandeau s’arrête à la date. |
| Archivé | « Ce document est archivé depuis le … : seuls les responsables de l’espace et les administrateurs le voient. Il ne peut plus être modifié. » Seuls son statut et sa suppression restent possibles. |

### Activité

Sous le contenu, *Activité* raconte ce qui a été fait au document, le plus récent d’abord : imports et nouvelles versions, changements de statut, d’accès, de responsable, de dossier, de titre, de description, de catégorie et de langue, avec la personne et la date ; *Afficher plus* pour les plus anciens. Les consultations et les téléchargements n’y figurent jamais. Un changement d’accès dit à combien de personnes le document est restreint, pas lesquelles, et le remplaçant d’un document obsolète n’y est nommé qu’à qui peut le lire.

## Télécharger l’original

*Télécharger l’original*, l’icône en haut à droite, ou *Télécharger* dans la carte de la version, rend le fichier tel qu’il a été importé, sous son nom d’origine.

- **Toute personne qui voit le document le télécharge**, lecteurs compris : afficher un PDF transfère de toute façon le fichier au navigateur. Dans un espace archivé, ceux qui le voient encore le téléchargent aussi.
- **Pour vérifier une copie**, comparez son empreinte avec l’*Empreinte SHA-256* de sa version, dans *Versions*, par exemple avec `sha256sum`.
- **Chaque téléchargement** est inscrit au journal d’audit.

Si le fichier a disparu du disque du serveur, la page l’annonce : « Le fichier de ce document est introuvable sur le serveur. Prévenez la personne qui exploite Lore. » *Télécharger* disparaît alors ; le contenu d’un document Markdown, Word ou texte, gardé dans la base, reste lisible.

## Imprimer

- **Markdown, Word et texte.** <kbd>Ctrl P</kbd>, ou *Imprimer* dans le menu *Autres actions*, imprime le contenu seul, sans la barre latérale, le panneau ni les bandeaux. Il est précédé du titre, du statut, de la version et de la date d’impression : une procédure imprimée dit de quelle version elle vient.
- **PDF.** *Imprimer* l’ouvre dans un nouvel onglet, où le navigateur l’imprime.

## Documents très longs

Un document très long s’affiche par parties d’environ 500 000 caractères, coupées entre deux sections ou deux paragraphes : « Partie 2 sur 20 », avec *Partie précédente* et *Partie suivante*. Presque tous les documents tiennent en une seule partie.

- Le sommaire couvre tout le document et ouvre la bonne partie ; un lien vers un passage aussi.
- La recherche du navigateur (<kbd>Ctrl F</kbd>) et l’impression portent sur la partie affichée, ce que rappelle un bandeau.

Lore garde jusqu’à 10 millions de caractères de texte par document. Au-delà, le contenu s’arrête au même endroit que le texte gardé, et le bandeau ajoute : « La suite n’est pas affichée : téléchargez l’original. » Un PDF, lui, s’affiche toujours en entier.

## Reprendre une lecture

L’accueil rappelle, sous *Reprendre*, les trois derniers documents que vous avez ouverts et que vous voyez encore, avec leur espace, leur dossier, leur statut et le moment de votre lecture. Un document que vous ne voyez plus, supprimé ou restreint depuis, en disparaît.

Ces lectures viennent du journal d’audit, qui inscrit l’ouverture d’un document une fois par heure au plus pour chaque personne. Elles ne s’affichent jamais sur le document : seuls les propriétaires et les administrateurs de l’organisation les voient, dans *Administration › Journal d’audit*. Voir [Journal d’audit](audit.md).

## Limites

- **Images.** Les images d’un document Markdown ou Word ne sont jamais affichées. Pour les voir, téléchargez l’original.
- **Documents Word.** L’affichage est simplifié : ni mise en page, ni couleurs, ni polices, et les listes sont des paragraphes numérotés.
- **Code.** Sans coloration syntaxique.
- **Documents très longs.** Affichés par parties ; la recherche du navigateur et l’impression portent sur la partie affichée.
- **Accessibilité des PDF.** Les pages numérisées d’un PDF ne sont que des images, et un PDF affiché dans la page offre son texte, pas sa structure (titres, tableaux). Une vue texte des PDF viendra après la version 0.1.

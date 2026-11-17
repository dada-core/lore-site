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

Pendant l’extraction, un PDF s’affiche aussitôt ; pour les autres formats, la page indique « Le contenu s’affichera dès la fin de l’extraction. » et se met à jour d’elle-même. Après un échec, seul le bandeau qui en donne la cause s’affiche : le fichier reste téléchargeable. Voir [En cas d’échec](import.md#en-cas-déchec).

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

Les mots de `q` sont surlignés dans la section ou la page désignée seulement, sans tenir compte des accents ni des majuscules ; une expression entre guillemets droits reste entière. Avec `from=search`, un bandeau le rappelle : « Passage trouvé pour « pg_restore role », section 4.2 Erreurs fréquentes. Il est surligné ci-dessous. » C’est la forme des liens que donnera la recherche, prévue en version 0.1.

| Cas | Ce qui s’affiche |
| --- | --- |
| Un titre, une partie ou une page que le document n’a pas | Le document s’ouvre en haut, ou à sa première page pour un PDF, avec « Ce passage n’existe pas dans ce document. » |
| Un lien fait pour une autre version que la version actuelle | Le document s’ouvre en haut, avec « Ce passage a changé depuis la version 1. » |
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
| Statut | *Brouillon* ou *Publié* | Choisi à l’import |
| Responsable | Son nom, ou *Ancien membre* s’il a quitté l’organisation | Voir [Changer le responsable](#changer-le-responsable) |
| Catégorie | Sa pastille, ou *Sans catégorie* | Contributeurs et responsables de l’espace |
| Espace | Un lien vers ses documents | Personne |
| Dossier | Son nom, ou *Sans dossier* | Contributeurs et responsables de l’espace, avec *Déplacer* |
| Langue | Français, anglais ou autre, détectée à l’extraction | Personne : elle se corrigera avec la recherche, prévue en version 0.1 |
| Format | Le format, le nombre de pages ou de sections et la taille, par exemple « PDF, 312 pages, 24,8 Mo » | Personne |
| Indexation | L’état de l’extraction et sa date | *Relancer*, après un échec passager |

Suivent *Accès*, qui dit qui voit le document, *Versions*, avec la carte de la version (date d’import, auteur, nom du fichier, *Empreinte SHA-256* à copier et *Télécharger*), puis *Sur cette page*.

Sous le titre, une ligne rappelle le statut, la version, la date de mise à jour, l’accès restreint, et `EN` pour un document en anglais ; puis vient la description, ou *Ajouter une description* pour un contributeur. Dans un espace archivé, tout est en lecture seule.

### Changer le responsable

Le responsable veille à ce que le document reste à jour, et peut en gérer l’accès. Choisissez *Changer le responsable* dans le menu *Autres actions*, ou cliquez sur le responsable dans le panneau.

- **Qui le change.** Les responsables de l’espace, et le responsable actuel du document s’il est au moins contributeur. Un document dont le responsable a quitté l’organisation ne peut être repris que par un responsable de l’espace.
- **Qui peut le devenir.** Un membre actif de l’espace, avec au moins le rôle Contributeur.
- **Pour un document restreint**, le nouveau responsable le voit. Si vous n’êtes ni parmi les personnes choisies, ni responsable de l’espace, ni administrateur, vous ne le verrez plus ; la fenêtre vous prévient : « Christ Koffi verra ce document. Vous ne le verrez plus : vous ne faites pas partie des personnes choisies. »

Les propriétaires et les administrateurs de l’organisation ont les droits d’un responsable de l’espace. Le changement est inscrit au journal d’audit.

## Télécharger l’original

*Télécharger l’original*, l’icône en haut à droite, ou *Télécharger* dans la carte de la version, rend le fichier tel qu’il a été importé, sous son nom d’origine.

- **Toute personne qui voit le document le télécharge**, lecteurs compris : afficher un PDF transfère de toute façon le fichier au navigateur. Dans un espace archivé, ceux qui le voient encore le téléchargent aussi.
- **Pour vérifier une copie**, comparez son empreinte avec l’*Empreinte SHA-256* de la carte de la version, par exemple avec `sha256sum`.
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

Ces lectures viennent du journal d’audit, qui inscrit l’ouverture d’un document une fois par heure au plus pour chaque personne. Elles ne s’affichent jamais sur le document : seuls les propriétaires et les administrateurs de l’organisation les voient, dans le journal d’audit, consultable dans l’administration à partir de la version 0.1.

## Limites

- **Images.** Les images d’un document Markdown ou Word ne sont jamais affichées. Pour les voir, téléchargez l’original.
- **Documents Word.** L’affichage est simplifié : ni mise en page, ni couleurs, ni polices, et les listes sont des paragraphes numérotés.
- **Code.** Sans coloration syntaxique.
- **Documents très longs.** Affichés par parties ; la recherche du navigateur et l’impression portent sur la partie affichée.

---
title: "Rechercher"
description: "La recherche porte sur le texte, le titre et la description de tous les documents auxquels vous avez accès. Elle s’ouvre avec Ctrl K, ou depuis la page Recherche."
---

## Lancer une recherche

- **Page Recherche.** *Recherche*, dans la barre latérale, ou la touche <kbd>/</kbd> ouvre la page, son champ sélectionné. Tapez votre recherche dans « Rechercher dans vos documents », puis *Rechercher* ou <kbd>Entrée</kbd> : elle part quand vous la validez, pas à chaque touche.
- **Palette.** <kbd>Ctrl K</kbd>, ou le champ *Rechercher* en haut de la barre latérale, ouvre la palette : tapez votre recherche, puis choisissez « Rechercher « … » dans les documents », proposé en premier. Voir [La palette](#la-palette).

Sans recherche, la page montre vos [recherches récentes](#recherches-récentes) et un aide-mémoire de la syntaxe. Avec une recherche, son adresse la garde avec ses filtres, par exemple `/search?q=pg_restore&status=PUBLISHED` : le bouton *Retour* du navigateur retrouve les résultats, et un lien copié relance la même recherche. [Voir dans la démo](https://lore.dada-core.com/demo/#/search?q=pg_restore%20role%20%22does%20not%20exist%22)

## Syntaxe

| Saisie | Résultat |
| --- | --- |
| `pg_restore role` | Les documents qui contiennent chacun des mots |
| `"does not exist"` | L’expression exacte, ses mots à la suite |
| `sauvegarde -barman` | Écarte tout document qui contient « barman » |
| `pg_restore or pg_dump` | L’un ou l’autre |

Une recherche se compose de termes : un mot, une expression entre guillemets droits, ou des mots reliés par `or`. Un document est trouvé s’il contient chaque terme quelque part, dans son titre, sa description ou n’importe lequel de ses passages : pas forcément dans le même passage.

- **Accents et majuscules** ne comptent pas : « role » trouve aussi « Rôle ».
- **Mots exclus.** Un mot précédé d’un `-`, comme `-barman`, ou une expression, comme `-"mode maintenance"`, écarte tout document qui le contient, dans son titre, sa description ou un passage. Un `-` à l’intérieur d’un mot (`kube-system`), doublé (`--no-owner`) ou dans une expression entre guillemets fait partie de ce qui est cherché.
- **Mots vides.** Les mots très courants, en français et en anglais, comme « le », « les », « de », « the » ou « of », ne sont pas exigés : presque tous les documents les contiennent.
- **Saisie tolérée.** Un guillemet non fermé, ou un `or` en tête ou en fin de recherche, n’empêche pas de chercher.

> [!WARNING]
> **Commande collée.** Une option à un seul tiret, au début d’un mot, est lue comme une exclusion : `-enddate` dans `openssl x509 -enddate` écarte les documents qui contiennent « enddate ». Une lettre seule (`-n` dans `kubectl get pods -n kube-system`) ou un mot vide (`-le`) n’écarte rien. Mettez la commande entre guillemets : `"openssl x509 -enddate"`.

### Ce qui est refusé

| Saisie | Message sous le champ |
| --- | --- |
| Seulement des mots vides, comme « le la de » ou « the » ; tapé en majuscules, un mot vide d’une seule langue (`SES`, `IT`) est cherché comme un nom | « Précisez votre recherche : ajoutez un terme technique, un message d’erreur ou un nom de serveur. » |
| Seulement des mots exclus, comme `-barman` | « Ajoutez au moins un mot à chercher. » |
| Plus de 32 mots | « 32 mots au maximum. » |

Le champ accepte 500 caractères au plus.

## Identifiants techniques

Collez un identifiant tel que vous l’avez copié : il est retrouvé là où il est écrit.

- **Noms et codes**, comme `pg_restore`, `archive_command` ou `ERR_CONNECTION_REFUSED`. Un identifiant fait de plusieurs mots est cherché comme une expression ; « pg restore », en deux mots, le trouve aussi.
- **Adresses, numéros et chemins**, comme `10.0.3.17`, `pg-prod-02`, `INC-2291` ou `/var/lib/postgresql/18/main/pg_wal`. Une adresse ou un numéro est cherché entier : `10.0.3.18` ne trouve pas `10.0.3.17`.
- **Messages d’erreur**, collés entiers, comme `pg_restore: error: role "reporting" does not exist`.
- **Adresses web.** Collées avec `https://`, elles sont cherchées sans ce début, comme Lore les indexe.

## Formes des mots

La recherche lit votre saisie en français, en anglais et telle quelle.

- **Formes d’un même mot.** « serveurs » trouve « serveur », « restoring » trouve « restore ».
- **Mots de la même famille.** Un mot dont la racine compte cinq lettres ou plus est aussi cherché comme un début : sa racine, raccourcie de deux lettres sans descendre sous cinq. « redemarrer » trouve ainsi « Redémarrage », et « vérifier », « Vérification ». Seuls les mots faits de lettres sont élargis, jamais un nombre, une adresse ou un identifiant ; une racine plus courte reste exacte : « port » ne trouve pas « portail ».
- **Les correspondances exactes passent devant** les formes élargies, qui trouvent parfois des mots voisins.

### Langue des documents

La langue de chaque document, français, anglais ou autre, est détectée à l’extraction de son texte. Elle décide de la façon dont ses mots sont indexés : avec leurs formes en français ou en anglais, tels qu’écrits dans une autre langue.

Si la détection s’est trompée, par exemple pour un guide en anglais détecté comme français, un contributeur ou un responsable de l’espace corrige la langue dans le panneau des propriétés du document. Le document est réindexé aussitôt, et la langue choisie est gardée si la même version est extraite de nouveau. Voir [Changer la langue](reader.md#changer-la-langue).

## Ce qui est cherché

- **La version actuelle** de chaque document : le texte de ses passages, avec les titres des sections qui les portent, ainsi que son titre et sa description.
- **Un document numérisé ou en échec** : son titre et sa description seulement. Donnez-lui une description qui dit ce qu’il contient. Voir [États de l’extraction](import.md#états-de-lextraction).
- **Un texte tronqué** : les 10 millions de caractères gardés.

Ni le nom du fichier, ni le responsable ne sont cherchés. La catégorie, le statut et le format sont des [filtres](#filtres).

## Résultats

Le nombre de documents trouvés, « 3 documents », et l’ordre, « Classés par pertinence. Les documents obsolètes apparaissent en dernier. », précèdent la liste. Chaque résultat est un document, avec :

- son titre, les mots trouvés surlignés, qui ouvre le document ;
- son espace et son dossier, l’emplacement de son meilleur passage, comme « Section 4.2 Erreurs fréquentes » ou « Page 112 », et sa catégorie ;
- un extrait de ce passage, les mots trouvés surlignés : un ou deux morceaux d’environ 35 mots, séparés par « … » ;
- son statut, sa version, sa date de mise à jour, et « Accès restreint » s’il l’est ; pour un document obsolète, « Remplacé par » et le titre du document qui le remplace, si vous pouvez le lire ;
- s’il y en a, ses autres passages trouvés, comme « 2 autres passages dans ce document » : un clic déplie l’emplacement des cinq premiers, dans l’ordre du document, et chacun l’ouvre à ce passage.

Le meilleur passage est celui qui réunit le plus de termes. Un document trouvé seulement par son titre affiche « Correspondance dans le titre. », ou « Document numérisé : seul son titre correspond. » ; trouvé par sa description, un extrait de celle-ci.

*Afficher plus de résultats*, en bas de la liste, ajoute les 20 documents suivants. Puis viennent deux rappels : « Seuls les documents auxquels vous avez accès apparaissent. » et « Les documents numérisés ne sont recherchables que par leur titre et leur description. »

### Ouvrir un résultat

Un clic ouvre le document au passage trouvé, encadré, les mots surlignés, y compris les formes trouvées par la recherche, comme « serveur » pour « serveurs ». Le bandeau « Passage trouvé pour… » propose *Retour aux résultats*, qui ramène à la liste et à ses filtres. Un document trouvé par son titre ou sa description s’ouvre en haut. Voir [Ouvrir au bon passage](reader.md#ouvrir-au-bon-passage).

### Aucun résultat

La page indique « Aucun document ne correspond à « quota ceph » », puis « Vérifiez l’orthographe des identifiants, retirez un mot ou des guillemets. Les documents numérisés ne sont recherchables que par leur titre et leur description. »

## Filtres

Sous le champ, cinq puces : *Espace*, *Catégorie*, *Statut*, *Format* et *Date*.

- Chaque puce liste les valeurs présentes dans les résultats, avec leur nombre de documents, toutes cochées au départ. Décochez celles que vous ne voulez pas, une au moins restant cochée : la puce l’indique, « Espace : 2 sur 3 », et le nombre de résultats aussi, « 2 documents sur 3 ».
- *Date* porte sur la date de mise à jour : « À tout moment », « 30 derniers jours » ou « 12 derniers mois ».
- Les nombres portent sur les résultats sans les filtres.
- Les filtres sont gardés dans l’adresse ; une nouvelle recherche les remet à zéro.
- Si les filtres écartent tout : « Aucun résultat avec ces filtres. », avec *Retirer les filtres*.

### Espaces archivés

Les documents d’un espace archivé n’apparaissent pas par défaut, même pour ceux qui voient encore l’espace : ses responsables, les propriétaires et les administrateurs de l’organisation. Ceux-là le trouvent dans la puce *Espace*, décoché et marqué « archivé » : cochez-le pour ajouter ses documents aux résultats.

### Documents archivés

Un document archivé n’apparaît pas non plus par défaut, même pour ceux qui le voient : les responsables de son espace, les propriétaires et les administrateurs. Ceux-là trouvent *Archivé* dans la puce *Statut*, décoché, avec son nombre de documents : cochez-le pour les ajouter aux résultats. Les autres ne voient ni la valeur ni son nombre. La palette ne propose jamais un document archivé.

## Ordre des résultats

1. Un document dont le titre contient tous les termes passe devant.
2. Puis un document dont un passage réunit tous les termes, d’abord sous leur forme exacte.
3. Puis les autres, selon les termes que réunit leur meilleur passage. Un titre de section compte davantage que le texte ; le titre du document et sa description comptent aussi.
4. Les documents obsolètes viennent toujours en dernier, quel que soit leur rang.

À pertinence égale, le document le plus récemment mis à jour vient d’abord.

## La palette

<kbd>Ctrl K</kbd>, ou le champ *Rechercher* de la barre latérale, ouvre la palette : « Rechercher un document, un espace ou une action… ». La page introuvable l’ouvre aussi, avec *Rechercher*.

- **Vide**, elle propose : *Actions* (« Importer des documents », touche <kbd>I</kbd>, si vous pouvez importer ; « Créer un espace » ; « Changer de thème ») ; *Aller à* (« Accueil », « Recherche », « Tous les espaces », « Administration » et « Journal d’audit » pour les propriétaires et les administrateurs, « Mon compte ») ; *Espaces*, avec leur nombre de documents ; *Documents récents*, les cinq derniers que vous avez ouverts.
- **Pendant la frappe**, elle propose d’abord « Rechercher « … » dans les documents » ; puis les actions, les destinations et les espaces dont le nom contient les mots tapés ; puis les documents dont le titre a un mot qui commence par chacun des mots tapés, parmi ceux que vous voyez, en cours d’extraction compris, hors espaces et documents archivés. Douze éléments au plus ; accents et majuscules ne comptent pas.
- **Au clavier**, <kbd>↑</kbd> et <kbd>↓</kbd> choisissent un élément, <kbd>Entrée</kbd> l’ouvre, <kbd>Échap</kbd> ferme la palette.

## Recherches récentes

Sans recherche, la page *Recherche* rappelle vos huit dernières recherches. Elles sont gardées dans ce navigateur, pour votre compte, jamais sur le serveur. *Effacer* les retire (« Recherches récentes effacées »), et la déconnexion aussi : un poste partagé ne les montre pas à la personne suivante.

## Ce qui n’apparaît jamais

- **Les documents que vous ne voyez pas**, restreints ou rangés dans un espace dont vous n’êtes pas membre : ni dans les résultats, ni dans leur nombre, ni dans les filtres et leurs nombres, ni dans les extraits, ni dans la palette. Quand seuls de tels documents correspondent, la page est la même que pour un mot que personne n’a écrit.
- **Les documents en cours d’extraction**, à leur premier import : ils apparaissent dès la fin de l’extraction. La palette les trouve déjà par leur titre.
- **Les documents des espaces archivés, et les documents archivés**, par défaut : voir [Espaces archivés](#espaces-archivés) et [Documents archivés](#documents-archivés).
- **Les anciennes versions** : seule la version actuelle de chaque document est cherchée.

## Confidentialité

Lore n’écrit aucune recherche : ni au journal d’audit, ni dans les journaux du serveur. Ouvrir un document depuis un résultat est une consultation, inscrite comme les autres.

La recherche part dans l’adresse de la page, `/search?q=…` : elle reste dans l’historique du navigateur, et peut apparaître dans les journaux d’accès d’un proxy inverse. Voir [Sécurité et connexion](security.md#recherche).

## Limites

| Limite | Valeur | Au-delà |
| --- | --- | --- |
| Longueur d’une recherche | 500 caractères et 32 mots | Refusée, avec un message sous le champ |
| Durée d’une recherche | 5 secondes | « La recherche a pris trop de temps. Précisez-la : ajoutez un mot ou des guillemets. » |
| Recherches à la fois | 2 par personne | « Une autre recherche est déjà en cours. Réessayez dans un instant. » |
| Résultats parcourus | 1 000 documents, par pages de 20 | Précisez la recherche |

- **Extraits.** Ils sont du texte brut : une balise écrite dans le texte d’un document, comme `<VirtualHost>` dans un runbook, n’y paraît pas.
- **Adresses web.** Une adresse écrite en fin de phrase dans un document, suivie d’un point, n’est retrouvée que par son nom d’hôte, comme `wiki.dada.group`.
- **Pas en version 0.1** : la recherche d’un début de mot dans le contenu (`restaur*`), les suggestions d’orthographe, les synonymes propres à une organisation, les filtres par responsable et par langue, le tri par date, et la reconnaissance du texte des documents numérisés.

## Recherche par le sens <span class="vb">v0.2</span>

À partir de la version 0.2, la recherche combinera la correspondance exacte des mots et la proximité de sens : « remettre en service une base » trouvera aussi « restaurer la base de facturation ».

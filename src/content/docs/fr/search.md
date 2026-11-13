---
title: "Rechercher"
description: "La recherche porte sur le contenu de tous les documents auxquels vous avez accès. Elle s’ouvre avec Ctrl K, ou depuis la page Recherche."
---

## Syntaxe

| Saisie | Résultat |
| --- | --- |
| `pg_restore role` | Les passages qui contiennent tous les mots |
| `"does not exist"` | L’expression exacte |
| `sauvegarde -barman` | Exclut les passages qui contiennent « barman » |
| `pg_restore or pg_dump` | L’un ou l’autre |

## Ce que la recherche comprend

- **Accents et majuscules ignorés** : « role » trouve aussi « Rôle ».
- **Formes des mots** : « serveurs » trouve « serveur », en français comme en anglais.
- **Identifiants techniques** : `ERR_CONNECTION_REFUSED`, `pg_restore` ou un nom de variable sont retrouvés tels quels.

### Langue des documents

La langue de chaque document est détectée à l’import, en français ou en anglais dans la version 0.1. Un contributeur peut la corriger : le document est alors réindexé.

## Filtres et ordre des résultats

Filtrez par espace, catégorie, statut et date. Les résultats sont regroupés par document et classés par pertinence ; une correspondance dans le titre compte davantage. Les documents obsolètes apparaissent en dernier, avec leur remplaçant.

## Ce qui n’apparaît jamais

- Les documents auxquels vous n’avez pas accès, même partiellement.
- Les documents dont l’extraction est en cours.
- Le contenu des documents numérisés : seul leur titre est cherchable.

## Recherche par le sens <span class="vb">v0.2</span>

À partir de la version 0.2, la recherche combinera la correspondance exacte des mots et la proximité de sens : « remettre en service une base » trouvera aussi « restaurer la base de facturation ».

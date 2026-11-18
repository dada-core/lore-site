---
title: "Recherche"
description: "La recherche de l’API applique exactement les mêmes droits et la même syntaxe que l’interface."
---

Ces routes suivent les règles décrites dans la [présentation de l’API](api.md) : la session de l’interface, les erreurs au format `application/problem+json`. Elles sont ouvertes à tous les membres de l’organisation, et ne portent que sur les documents que la personne connectée peut lire.

## Rechercher

`GET /api/v1/search`

Les documents qui correspondent à `q`, classés par pertinence, les documents obsolètes en dernier, avec l’extrait de leur meilleur passage, et les valeurs des filtres avec leur nombre de documents.

| Paramètre | Description |
| --- | --- |
| `q` | La recherche, avec la [syntaxe de l’interface](search.md#syntaxe) : 500 caractères et 32 mots au plus. Obligatoire. |
| `space` | Un ou plusieurs espaces, par leur identifiant |
| `category` | Une ou plusieurs [catégories](api-documents.md#catégories), comme `RUNBOOK` |
| `status` | Un ou plusieurs statuts : `DRAFT`, `PUBLISHED`, `OBSOLETE` ou `ARCHIVED` |
| `format` | Un ou plusieurs types : `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/markdown` ou `text/plain` |
| `updated` | `30d` ou `12m` : les documents mis à jour dans les 30 derniers jours, ou dans les 12 derniers mois |
| `includeArchived` | `true` pour ajouter les documents des espaces archivés que vous voyez encore |
| `page` | La page, de 0 (par défaut) à 49 |
| `size` | Le nombre de documents par page : 20 par défaut, 50 au plus |

- **Plusieurs valeurs.** Répétez le paramètre : `status=DRAFT&status=PUBLISHED`. `category` et `status` acceptent aussi les minuscules.
- **Espaces.** Un espace que vous ne voyez pas donne la même réponse qu’un identifiant inventé : aucun document, sans erreur. Les documents d’un espace archivé ne sont inclus qu’avec `includeArchived=true`, ou quand `space` nomme cet espace.

Ouvrez d’abord une session, comme dans [Authentification](api.md#authentification) : une recherche est une requête `GET`, qui n’a pas besoin du jeton CSRF.

```sh title="Requête"
curl -G -b cookies.txt https://lore.example.com/api/v1/search \
  --data-urlencode 'q=pg_restore role "does not exist"' \
  --data-urlencode 'status=PUBLISHED'
```

La réponse ci-dessous ne montre que le premier des trois documents trouvés.

```json title="Réponse 200"
{
  "items": [
    {
      "document": {
        "id": "0193a7c2-…",
        "title": "Restaurer une base PostgreSQL depuis une sauvegarde",
        "titleHighlights": [],
        "status": "PUBLISHED",
        "category": "RUNBOOK",
        "mediaType": "text/markdown",
        "language": "fr",
        "restricted": false,
        "extractionStatus": "INDEXED",
        "updatedAt": "2026-11-16T09:12:52Z",
        "space": { "id": "…", "name": "Infrastructure", "slug": "infrastructure", "archived": false },
        "folder": { "id": "…", "name": "Runbooks" }
      },
      "version": 1,
      "match": "passage",
      "passage": {
        "anchor": "h-7-2",
        "page": null,
        "headings": ["4. Vérifier la restauration", "4.2 Erreurs fréquentes"],
        "excerpt": "Si pg_restore signale role \"reporting\" does not exist, créez le rôle avant de relancer la restauration.",
        "highlights": [[3, 13], [22, 26], [39, 43], [44, 47], [48, 53], [64, 68]]
      },
      "description": null,
      "words": ["pg_restore", "role", "does", "not", "exist", "rôle"],
      "otherPassages": {
        "total": 2,
        "items": [
          { "anchor": "h-3", "page": null, "headings": ["2. Préparer la restauration"] },
          { "anchor": "h-6", "page": null, "headings": ["4. Vérifier la restauration", "4.1 Contrôles"] }
        ]
      }
    }
  ],
  "page": 0,
  "size": 20,
  "total": 3,
  "facets": {
    "spaces": [
      { "id": "…", "name": "Infrastructure", "slug": "infrastructure", "archived": false, "count": 2 },
      { "id": "…", "name": "Projet Atlas", "slug": "projet-atlas", "archived": false, "count": 1 }
    ],
    "categories": [
      { "value": "ARCHITECTURE", "count": 1 },
      { "value": "INCIDENT_REPORT", "count": 1 },
      { "value": "RUNBOOK", "count": 1 }
    ],
    "statuses": [{ "value": "PUBLISHED", "count": 3 }],
    "formats": [
      { "value": "application/pdf", "count": 1 },
      { "value": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "count": 1 },
      { "value": "text/markdown", "count": 1 }
    ]
  }
}
```

| Champ | Valeurs |
| --- | --- |
| `total` | Le nombre de documents trouvés, filtres compris |
| `document` | Le document, avec sa version actuelle : son espace (`archived` à `true` pour un espace archivé) et son dossier, ou `null` |
| `version` | Le numéro de la version actuelle, pour le lien du passage |
| `match` | Ce qui correspond : `passage`, `title` (le titre) ou `description` |
| `passage` | Le meilleur passage, celui qui réunit le plus de termes : son ancre (`h-7-2`, `page-112`, `part-3`), sa page pour un PDF, les titres de ses sections depuis le haut, son extrait et ses `highlights`. `null` quand `match` vaut `title` ou `description` |
| `description` | Quand `match` vaut `description` : un extrait de la description (`text`) et ses `highlights` ; `null` sinon |
| `words` | Les mots trouvés, tels qu’écrits dans le titre et l’extrait, 20 au plus : ceux que le lecteur surligne |
| `otherPassages` | Le nombre des autres passages trouvés dans le document (`total`), et les cinq premiers, dans l’ordre du document |
| `facets` | Chaque valeur présente dans les résultats sans les filtres, avec son nombre de documents. `spaces` nomme un espace archivé à qui le voit encore ; `categories`, `statuses` et `formats` ne comptent ses documents qu’avec `includeArchived=true` |

**Positions.** `titleHighlights` et `highlights` désignent les mots trouvés par des paires `[début, fin[`, début compris et fin exclue, en unités UTF-16, celles de JavaScript : un émoji compte pour deux, une lettre accentuée pour une. Deux mots séparés par un seul `_`, `-`, `.` ou `/` forment un seul surlignage : `pg_restore`.

**Texte brut.** Aucun HTML ne sort de la recherche : `title`, `excerpt` et `text` sont du texte brut, à afficher comme tel, jamais comme du HTML. Une balise écrite dans le texte d’un document n’y paraît pas.

**Lien d’un résultat.** Pour ouvrir le document au passage trouvé, ses mots surlignés : `/documents/{id}?from=search&q=…&v={version}#{anchor}`. Sans passage, `/documents/{id}?from=search&q=…` ouvre le document en haut. Voir [Ouvrir au bon passage](reader.md#ouvrir-au-bon-passage).

| Code HTTP | `code` | Cause |
| --- | --- | --- |
| 400 | `invalid_request` | Un paramètre à corriger, listé dans `errors` (ci-dessous) |
| 401 | `unauthenticated` | Pas de session ouverte |
| 429 | `too_many_searches` | Deux de vos recherches sont déjà en cours sur cette instance de Lore |
| 503 | `search_timeout` | La recherche a dépassé 5 secondes : précisez-la |

| Champ | Codes d’erreur |
| --- | --- |
| `q` | `required` ; `too_long` et `too_many_words`, avec `max` ; `common_words_only`, seulement des mots vides ; `exclusions_only`, seulement des mots exclus |
| `category`, `status`, `format`, `updated` | `invalid_value` |
| `page`, `size` | `out_of_range`, avec `min` et `max` |

## Chercher par titre

`GET /api/v1/search/titles`

La recherche de la palette : les documents que vous pouvez lire dont le titre a un mot qui commence par chacun des mots de `q`, accents et majuscules ignorés. Les documents en cours d’extraction y figurent ; ceux des espaces archivés, non. Ceux dont le titre commence par `q` viennent d’abord, puis les plus récemment mis à jour.

| Paramètre | Description |
| --- | --- |
| `q` | De 1 à 100 caractères. Obligatoire. |
| `size` | Le nombre de documents : 8 par défaut, 12 au plus |

```sh title="Requête"
curl -G -b cookies.txt https://lore.example.com/api/v1/search/titles --data-urlencode 'q=restau'
```

```json title="Réponse 200"
[
  {
    "id": "0193a7c2-…",
    "title": "Restaurer une base PostgreSQL depuis une sauvegarde",
    "titleHighlights": [[0, 6]],
    "status": "PUBLISHED",
    "mediaType": "text/markdown",
    "space": { "id": "…", "name": "Infrastructure", "slug": "infrastructure", "archived": false },
    "folder": { "id": "…", "name": "Runbooks" }
  }
]
```

`titleHighlights` désigne les débuts de mots qui correspondent, dans les mêmes unités que la recherche.

Erreurs de champ : `q` (`required` ; `too_long`, avec `max`), `size` (`out_of_range`, avec `min` et `max`). Comme la recherche : `429 too_many_searches` et `503 search_timeout`.

## Limites

- **Durée.** Une recherche a 5 secondes : au-delà, `503 search_timeout`.
- **Recherches à la fois.** Deux au plus par personne, sur chaque instance de Lore : au-delà, `429 too_many_searches`. Attendez la réponse d’une recherche avant d’en lancer une troisième.
- **Documents parcourus.** 1 000 au plus, quelle que soit la taille des pages : `page` va de 0 à 49 avec 20 documents par page, de 0 à 19 avec 50. Au-delà : `page` (`out_of_range`, avec `min` et `max`).
- **Classement.** Pour que les recherches très fréquentes restent rapides, le classement fin, par les passages, ne porte que sur les 200 premiers documents d’une première estimation, faite d’après le titre et le nombre de passages trouvés ; les suivants gardent l’ordre de cette estimation. `total` reste exact.
- **Jetons d’API.** La version 0.1 n’en a pas : la recherche passe par la session de l’interface. Des jetons d’accès personnels sont prévus après la version 0.1.

Aucune recherche n’est inscrite au journal d’audit, ni dans les journaux du serveur. Mais `q` fait partie de l’adresse : voir [Sécurité et connexion](security.md#recherche).

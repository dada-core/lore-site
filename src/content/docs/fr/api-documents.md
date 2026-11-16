---
title: "Documents"
description: "Lister, importer, consulter, modifier, déplacer, restreindre et supprimer des documents par l’API, et suivre l’extraction de leur texte."
---

Ces routes suivent les règles décrites dans la [présentation de l’API](api.md) : la session et le jeton CSRF de l’interface, les erreurs au format `application/problem+json`.

- Un espace ou un document que vous ne pouvez pas voir répond `404`, comme s’il n’existait pas.
- Sur un document que vous voyez, une action que votre rôle ne permet pas répond `403`, avec le code `contributor_only`, `maintainer_only` ou `maintainer_or_owner_only`.
- Un espace archivé refuse toute modification : `409 space_archived`.

## Lister les documents d’un espace

`GET /api/v1/spaces/{spaceId}/documents`

Renvoie une page des documents de l’espace que vous voyez, regroupés par dossier (ceux sans dossier d’abord), puis du plus récent au plus ancien.

| Paramètre | Description |
| --- | --- |
| `folder` | L’identifiant d’un dossier, ou `none` pour les documents sans dossier |
| `restricted` | `true` pour les seuls documents restreints, `false` pour les autres |
| `ids` | Des documents précis, 100 au plus, par exemple pour suivre leur extraction |
| `page`, `size` | Pagination : 50 par page par défaut, 200 au plus |

```json title="Réponse 200"
{
  "items": [
    {
      "id": "0193a7c2-…",
      "title": "Restaurer une base PostgreSQL depuis une sauvegarde",
      "folderId": "…",
      "category": "RUNBOOK",
      "status": "PUBLISHED",
      "restricted": false,
      "owner": { "id": "…", "displayName": "Amenan Souaga" },
      "updatedAt": "2026-11-16T09:12:52Z",
      "version": 1,
      "filename": "restaurer-pg.md",
      "mediaType": "text/markdown",
      "sizeBytes": 18342,
      "extractionStatus": "INDEXED",
      "extractionError": null,
      "language": "fr",
      "pageCount": null,
      "sectionCount": 6
    }
  ],
  "page": 0,
  "size": 50,
  "total": 9
}
```

## Compter les documents d’un espace

`GET /api/v1/spaces/{spaceId}/documents/summary`

Compte les documents de l’espace que vous voyez : en tout, en cours d’extraction, numérisés, en échec, et par dossier (`folderId` à `null` pour ceux sans dossier).

```json title="Réponse 200"
{
  "total": 9,
  "inProgress": 1,
  "scanned": 1,
  "failed": 0,
  "folders": [
    { "folderId": null, "count": 2 },
    { "folderId": "…", "count": 7 }
  ]
}
```

## Importer un document

`POST /api/v1/spaces/{spaceId}/documents`

Un fichier par requête, en `multipart/form-data`. Réservé aux contributeurs et aux responsables de l’espace.

| Champ | Description |
| --- | --- |
| `file` | Le fichier : PDF, Word (`.docx`), Markdown ou texte. Obligatoire. |
| `folderId` | Son dossier dans l’espace. Absent : à la racine de l’espace. |
| `status` | `DRAFT` (par défaut) ou `PUBLISHED` |
| `category` | Une des catégories ci-dessous. Absente : sans catégorie. |
| `restricted` | `true` pour ne le montrer qu’aux personnes choisies, aux responsables de l’espace et à son responsable |
| `userIds` | Les personnes choisies, membres de l’espace : leurs identifiants séparés par des virgules, ou le champ répété. Une requête compte au plus 50 champs : au-delà d’une quarantaine de personnes, séparez-les par des virgules. |

```sh title="Requête"
curl -b cookies.txt -X POST https://lore.example.com/api/v1/spaces/{spaceId}/documents \
  -H "X-XSRF-TOKEN: <jeton>" \
  -F file=@restaurer-pg.md \
  -F folderId=… \
  -F status=DRAFT \
  -F category=RUNBOOK
```

Le jeton CSRF va dans l’en-tête `X-XSRF-TOKEN` : Lore ne le cherche pas parmi les champs du formulaire, pour refuser une requête sans jeton avant d’en lire le fichier. De même, une requête plus grosse que la taille maximale plus 1 Mo est refusée en `413` d’après son en-tête `Content-Length`, sans être lue.

La réponse `201` renvoie le document, dans la même forme que [Consulter un document](#consulter-un-document), avec `extractionStatus` à `PENDING` : l’extraction se poursuit en arrière-plan. Si un document de l’espace que vous voyez a le même contenu, `duplicateOf` le nomme (`id` et `title`) ; le fichier est importé quand même.

| Code HTTP | `code` | Cause |
| --- | --- | --- |
| 400 | `invalid_request` | Un champ à corriger, listé dans `errors` (ci-dessous) |
| 403 | `contributor_only` | Vous êtes lecteur de cet espace |
| 409 | `space_archived` | L’espace est archivé |
| 413 | `file_too_large` | Le fichier dépasse la taille maximale ; la réponse l’indique en mégaoctets dans `maxMegabytes` |
| 507 | `storage_full` | Il resterait moins de 100 Mo libres sur le disque du serveur |

| Champ | Codes d’erreur |
| --- | --- |
| `file` | `required` ; `empty_file` ; `unsupported_format`, avec les extensions acceptées ; `legacy_word` pour un `.doc` ; `content_mismatch` quand le contenu ne correspond pas à l’extension |
| `folderId` | `unknown_folder`, aussi pour un dossier d’un autre espace |
| `status`, `category` | `invalid_value` |
| `userIds` | `not_space_member` |

### Catégories

| Code | Catégorie |
| --- | --- |
| `RUNBOOK` | Runbook |
| `OPERATING_PROCEDURE` | Procédure d’exploitation |
| `INCIDENT_REPORT` | Rapport d’incident |
| `SECURITY` | Documentation de sécurité |
| `VENDOR` | Documentation constructeur |
| `ARCHITECTURE` | Documentation d’architecture |
| `TECHNICAL` | Documentation technique |

## Consulter un document

`GET /api/v1/documents/{id}`

Renvoie le document, sa version actuelle et ce que vous pouvez en faire (`actions`), pour n’afficher que ce qui est permis.

```json title="Réponse 200"
{
  "id": "0193a7c2-…",
  "title": "Restaurer une base PostgreSQL depuis une sauvegarde",
  "description": null,
  "category": "RUNBOOK",
  "status": "PUBLISHED",
  "restricted": false,
  "space": { "id": "…", "name": "Infrastructure", "slug": "infrastructure", "color": "#13705E" },
  "folder": { "id": "…", "name": "Runbooks" },
  "owner": { "id": "…", "displayName": "Amenan Souaga" },
  "createdAt": "2026-11-16T09:12:40Z",
  "updatedAt": "2026-11-16T09:12:52Z",
  "currentVersion": {
    "id": "…",
    "number": 1,
    "filename": "restaurer-pg.md",
    "mediaType": "text/markdown",
    "sizeBytes": 18342,
    "language": "fr",
    "pageCount": null,
    "sectionCount": 6,
    "extractionStatus": "INDEXED",
    "extractionError": null,
    "textTruncated": false,
    "extractedAt": "2026-11-16T09:12:52Z",
    "createdAt": "2026-11-16T09:12:40Z",
    "author": { "id": "…", "displayName": "Amenan Souaga" }
  },
  "actions": { "edit": true, "delete": true, "manageAccess": true, "retry": false },
  "duplicateOf": null
}
```

| Champ | Valeurs |
| --- | --- |
| `extractionStatus` | `PENDING` (en cours), `INDEXED`, `SCANNED` (numérisé) ou `FAILED` |
| `extractionError` | Pour un échec : `encrypted`, `corrupt`, `unsupported_content` (définitifs), `timeout`, `extractor_crashed`, `file_missing` (passagers). Voir [Stockage et extraction](storage.md#échecs-et-nouvelles-tentatives). |
| `language` | `fr`, `en` ou `other`, une fois le texte extrait |
| `pageCount` | Le nombre de pages d’un PDF |
| `sectionCount` | Le nombre de passages découpés |
| `textTruncated` | `true` si le texte dépassait 10 millions de caractères et a été coupé |
| `owner`, `author` | `null` pour une personne qui a quitté l’organisation |

## Modifier un document

`PATCH /api/v1/documents/{id}`

Change le titre (200 caractères au plus), la description (2 000) ou la catégorie. Un champ absent ne change pas ; une description ou une catégorie vide est retirée. Réservé aux contributeurs et aux responsables de l’espace. Renvoie le document.

```json title="Corps de la requête"
{
  "title": "Restaurer une base PostgreSQL",
  "description": "Procédure testée sur PostgreSQL 18.",
  "category": "RUNBOOK"
}
```

Erreurs de champ : `title` (`required`, `too_long`), `description` (`too_long`), `category` (`invalid_value`).

## Déplacer un document

`POST /api/v1/documents/{id}/move`

Range le document dans un autre dossier de son espace, ou à sa racine avec `null`. Réservé aux contributeurs et aux responsables de l’espace. Renvoie le document.

```json title="Corps de la requête"
{ "folderId": "…" }
```

Erreur de champ : `folderId` (`unknown_folder`).

## Supprimer un document

`DELETE /api/v1/documents/{id}`

Supprime définitivement le document, ses versions, son texte et ses accès, puis son fichier si aucun autre document de l’organisation ne l’utilise. Réservé aux responsables de l’espace, et à la personne qui l’a importé tant qu’il n’a qu’une version (`403 maintainer_only` sinon). Répond `204`.

## Relancer l’extraction

`POST /api/v1/documents/{id}/extraction/retry`

Après un échec dû à une cause passagère (`timeout`, `extractor_crashed`, `file_missing`), remet le document en file d’extraction ; il revient à `PENDING`. Réservé aux contributeurs et aux responsables de l’espace. Pour une cause définitive, ou un document qui n’est pas en échec : `409 not_retryable`.

## Accès d’un document

`GET /api/v1/documents/{id}/access`

Indique si le document est restreint et, s’il l’est, qui le voit et pourquoi : `chosen` (personne choisie), `maintainer` (responsable de l’espace), `owner` (responsable du document). Les propriétaires et les administrateurs de l’organisation voient aussi le document, mais n’y figurent qu’à l’un de ces titres.

```json title="Réponse 200"
{
  "restricted": true,
  "spaceMembers": 5,
  "people": [
    { "id": "…", "displayName": "Elfried Yaba", "email": "elfried.yaba@dada.group", "reasons": ["chosen"] },
    { "id": "…", "displayName": "Christ Koffi", "email": "christ.koffi@dada.group", "reasons": ["chosen", "owner"] },
    { "id": "…", "displayName": "Amenan Souaga", "email": "amenan.souaga@dada.group", "reasons": ["maintainer"] }
  ]
}
```

`PUT /api/v1/documents/{id}/access`

Restreint le document aux personnes choisies, membres de l’espace, ou le rouvre à tout l’espace avec `restricted` à `false`, ce qui retire les personnes choisies. Sans `userIds`, un document déjà restreint garde ses personnes choisies. Réservé aux responsables de l’espace et au responsable du document (`403 maintainer_or_owner_only` sinon). Renvoie la même forme que `GET`.

```json title="Corps de la requête"
{ "restricted": true, "userIds": ["…", "…"] }
```

Erreur de champ : `userIds` (`not_space_member`).

## Limites de l’import

`GET /api/v1/imports/limits`

La taille maximale en vigueur et les extensions acceptées, pour vérifier les fichiers avant de les envoyer.

```json title="Réponse 200"
{ "maxMegabytes": 50, "maxBytes": 52428800, "extensions": ["pdf", "docx", "md", "markdown", "txt"] }
```

## Imports à suivre

`GET /api/v1/imports/attention`

Les documents que vous avez importés et que vous voyez encore, dont l’extraction est en cours ou en échec, les plus récents d’abord, 20 au plus. Chacun avec `id`, `title`, `space` (`id`, `name`, `slug`, `color`), `extractionStatus` et `extractionError`.

## Stockage et import (administration)

`GET /api/v1/admin/storage`

Réservé aux propriétaires et aux administrateurs (`403 admin_only`). Renvoie le volume stocké (`usedBytes`, chaque contenu compté une fois) et la place libre (`freeBytes`), le nombre de documents (`documents`, `inProgress`, `scanned`, `failed`), la taille maximale en vigueur (`maxUploadMegabytes`), le plafond du serveur (`maxUploadCeilingMegabytes`) et la taille par défaut (`defaultMaxUploadMegabytes`), les extensions acceptées, l’état de l’extraction (`extraction` : `active`, `workers` et la cause d’une panne dans `problem`) et le dossier des fichiers (`filesPath`).

`PATCH /api/v1/admin/storage`

Change la taille maximale d’un fichier, en mégaoctets, de 1 jusqu’au plafond fixé par `LORE_MAX_UPLOAD_SIZE`. Renvoie la même forme que `GET`.

```json title="Corps de la requête"
{ "maxUploadMegabytes": 100 }
```

Erreur de champ : `maxUploadMegabytes` (`out_of_range`, avec `min` et `max`).

## Espaces et dossiers

- `GET /api/v1/spaces` et les routes qui renvoient un espace indiquent, dans `documentCount`, le nombre de ses documents que vous voyez.
- `DELETE /api/v1/spaces/{spaceId}/folders/{folderId}` répond `409 folder_not_empty` tant que le dossier contient un document, même un document restreint que vous ne voyez pas.

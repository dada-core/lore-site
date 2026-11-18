---
title: "Documents"
description: "Lister, importer, consulter, lire, télécharger, modifier, déplacer, restreindre et supprimer des documents par l’API, importer leurs nouvelles versions, changer leur statut et leur responsable, suivre l’extraction de leur texte et leur activité, et lire le journal d’audit."
---

Ces routes suivent les règles décrites dans la [présentation de l’API](api.md) : la session et le jeton CSRF de l’interface, les erreurs au format `application/problem+json`.

- Un espace ou un document que vous ne pouvez pas voir répond `404`, comme s’il n’existait pas.
- Sur un document que vous voyez, une action que votre rôle ne permet pas répond `403`, avec le code `contributor_only`, `maintainer_only` ou `maintainer_or_owner_only`.
- Un espace archivé refuse toute modification : `409 space_archived`.
- Un document archivé refuse toute modification, sauf le changement de son statut et sa suppression : `409 document_archived`.

## Lister les documents d’un espace

`GET /api/v1/spaces/{spaceId}/documents`

Renvoie une page des documents de l’espace que vous voyez, regroupés par dossier (ceux sans dossier d’abord), puis dans l’ordre demandé : par défaut, du plus récent au plus ancien.

| Paramètre | Description |
| --- | --- |
| `folder` | L’identifiant d’un dossier, ou `none` pour les documents sans dossier |
| `restricted` | `true` pour les seuls documents restreints, `false` pour les autres |
| `ids` | Des documents précis, 100 au plus, par exemple pour suivre leur extraction |
| `status` | Les statuts voulus, un ou plusieurs : `DRAFT`, `PUBLISHED`, `OBSOLETE`, `ARCHIVED`. Sans `status`, les documents archivés sont écartés ; avec `ARCHIVED`, vous ne recevez que ceux que vous voyez, comme responsable de l’espace, propriétaire ou administrateur |
| `sort` | L’ordre dans chaque dossier : `updated` (date de mise à jour, par défaut), `title`, `category`, `status` ou `size` (taille du fichier) |
| `direction` | `asc` ou `desc` ; par défaut, `desc` pour `updated` et `asc` pour les autres |
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
      "sectionCount": 6,
      "newerVersion": null
    }
  ],
  "page": 0,
  "size": 50,
  "total": 9
}
```

`newerVersion` décrit une version importée après la version actuelle, en cours d’extraction ou en échec : `number`, `extractionStatus`, `extractionError` et `createdAt` ; `null` quand la dernière version est la version actuelle.

Erreurs de champ : `sort`, `direction` et `status` (`invalid_value`), `ids` (`too_many`).

## Compter les documents d’un espace

`GET /api/v1/spaces/{spaceId}/documents/summary`

Compte les documents de l’espace que vous voyez : en tout, en cours d’extraction, numérisés, en échec, et par dossier (`folderId` à `null` pour ceux sans dossier). Les documents archivés sont comptés à part, dans `archived`, et nulle part ailleurs : ni dans `total`, ni dans les dossiers, ni dans le `documentCount` de l’espace. `archived` vaut 0 pour qui ne les voit pas.

```json title="Réponse 200"
{
  "total": 9,
  "inProgress": 1,
  "scanned": 1,
  "failed": 0,
  "archived": 1,
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
  "statusChangedAt": "2026-11-16T09:12:40Z",
  "replacedBy": null,
  "restricted": false,
  "space": { "id": "…", "name": "Infrastructure", "slug": "infrastructure", "color": "#13705E" },
  "folder": { "id": "…", "name": "Runbooks" },
  "owner": { "id": "…", "displayName": "Amenan Souaga" },
  "createdAt": "2026-11-16T09:12:40Z",
  "updatedAt": "2026-11-16T09:12:52Z",
  "versionCount": 1,
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
    "author": { "id": "…", "displayName": "Amenan Souaga" },
    "sha256": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    "fileAvailable": true,
    "note": null,
    "changeRatio": 1
  },
  "newerVersion": null,
  "actions": {
    "edit": true, "delete": true, "manageAccess": true, "retry": false, "changeOwner": true,
    "newVersion": true, "changeStatus": true, "archive": false
  },
  "duplicateOf": null
}
```

| Champ | Valeurs |
| --- | --- |
| `extractionStatus` | `PENDING` (en cours), `INDEXED`, `SCANNED` (numérisé) ou `FAILED` |
| `extractionError` | Pour un échec : `encrypted`, `corrupt`, `unsupported_content` (définitifs), `timeout`, `extractor_crashed`, `file_missing` (passagers). Voir [Stockage et extraction](storage.md#échecs-et-nouvelles-tentatives). |
| `language` | `fr`, `en` ou `other` : détectée une fois le texte extrait, ou choisie par un contributeur |
| `pageCount` | Le nombre de pages d’un PDF |
| `sectionCount` | Le nombre de passages découpés |
| `textTruncated` | `true` si le texte dépassait 10 millions de caractères et a été coupé |
| `owner`, `author` | `null` pour une personne qui a quitté l’organisation |
| `sha256` | L’empreinte SHA-256 du fichier, pour le comparer à une copie |
| `fileAvailable` | `false` si le fichier est introuvable sur le disque du serveur : son téléchargement répond alors `410 file_missing` |
| `statusChangedAt` | Depuis quand le document a son statut ; pour un document importé avant la version 0.1.0-beta.1, sa date de création |
| `replacedBy` | Pour un document obsolète, celui qui le remplace (`id` et `title`) ; `null` s’il n’y en a pas, ou si vous ne pouvez pas le lire : ni son titre ni son identifiant ne vous sont donnés |
| `versionCount` | Le nombre de versions du document |
| `note` | Ce qui change, écrit à l’import de la version ; `null` pour la première |
| `changeRatio` | L’ampleur des modifications apportées par la version, de 0 à 1 : la part des passages ajoutés ou retirés par rapport à la version précédente. 1 pour la première version, `null` quand elle est inconnue (document numérisé, échec) |
| `newerVersion` | Une version importée après la version actuelle, en cours d’extraction ou en échec : `number`, `extractionStatus`, `extractionError`, `createdAt` et `author` ; `null` sinon |
| `actions` | Ce que vous pouvez faire : `edit`, `delete`, `manageAccess`, `retry`, `changeOwner`, `newVersion` (importer une nouvelle version), `changeStatus` et `archive` (archiver le document, ou le sortir d’Archivé) |

| Paramètre | Description |
| --- | --- |
| `version` | Le numéro d’une ancienne version, ouverte dans sa page : c’est elle que la consultation inscrit, une fois par heure et par document |

Chaque appel inscrit une consultation au journal d’audit, avec le numéro de la version affichée, une fois par heure au plus pour une même personne et un même document, jamais pour une réponse `404`.

## Lire le contenu d’une version

`GET /api/v1/documents/{id}/versions/{number}/rendering`

Renvoie le contenu d’un document Markdown, Word ou texte, mis en forme et nettoyé, tel que l’affiche la page du document. Un document très long est découpé en parties d’environ 500 000 caractères : la réponse en donne une à la fois.

| Paramètre | Description |
| --- | --- |
| `part` | La partie voulue, à partir de 1 |
| `anchor` | Une ancre, comme `h-7` ou `part-3` : la réponse donne la partie qui la contient. Une ancre que le document n’a pas donne la première partie. |
| `outline` | `false` pour ne pas recevoir le sommaire ; `true` par défaut |
| `fromVersion` | Avec `anchor` : le numéro de la version pour laquelle l’ancre a été faite, par exemple un lien copié avant une nouvelle version. La réponse donne la partie qui contient la section du même titre dans cette version-ci, et son ancre dans `anchor` ; `null` si la section n’existe plus. Un titre présent plusieurs fois est retrouvé par son rang. |

Sans `part` ni `anchor`, la réponse donne la première partie.

```json title="Réponse 200"
{
  "number": 1,
  "renderer": 1,
  "part": 1,
  "partCount": 1,
  "truncated": false,
  "anchor": "h-7",
  "outline": [
    { "anchor": "h-1", "level": 1, "title": "Restaurer une base PostgreSQL depuis une sauvegarde", "part": 1 },
    { "anchor": "h-5", "level": 2, "title": "4. Vérifier la restauration", "part": 1 },
    { "anchor": "h-6", "level": 3, "title": "4.1 Contrôles", "part": 1 },
    { "anchor": "h-7", "level": 3, "title": "4.2 Erreurs fréquentes", "part": 1 }
  ],
  "html": "<section id=\"h-1\"><h2>Restaurer une base PostgreSQL depuis une sauvegarde</h2>…"
}
```

| Champ | Valeurs |
| --- | --- |
| `number` | Le numéro de la version |
| `renderer` | Le numéro des règles de rendu |
| `part`, `partCount` | La partie renvoyée, et le nombre de parties du document |
| `truncated` | `true` si le contenu s’arrête avant la fin du document |
| `outline` | Les titres de tout le document : ancre, niveau de 1 à 6, texte et partie qui le contient ; `null` avec `outline=false` |
| `html` | La partie, en HTML nettoyé : une `section` par titre (`h-7`) ou par partie d’un texte (`part-3`) |
| `anchor` | L’endroit montré : l’ancre demandée, ou la section du même titre retrouvée avec `fromVersion` ; `null` quand il n’y en a pas |

La réponse porte un `ETag` et `Cache-Control: private, no-cache` : un contenu déjà reçu n’est pas renvoyé (`304`), mais les droits sont vérifiés à chaque requête.

| Code HTTP | `code` | Cause |
| --- | --- | --- |
| 400 | `invalid_request` | `part` (`out_of_range`, avec `min` et `max`) |
| 404 | `not_found` | Le document, ou cette version, n’existe pas pour vous |
| 409 | `extraction_pending` | Le texte de la version est en cours d’extraction |
| 409 | `no_rendering` | Un PDF, qui s’affiche à partir de son fichier, une extraction en échec, ou une version sans contenu mis en forme, par exemple un document Word dont la mise en forme n’a pas pu être lue |

## Télécharger l’original

`GET /api/v1/documents/{id}/versions/{number}/file`

Renvoie le fichier de la version tel qu’il a été importé, à toute personne qui voit le document, lecteurs compris. `HEAD` donne les mêmes en-têtes, sans le fichier.

| Paramètre | Description |
| --- | --- |
| `disposition` | `attachment` (par défaut) pour l’enregistrer, ou `inline` pour l’afficher, accepté pour un PDF seulement |

```http title="Réponse 200"
HTTP/1.1 200
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Length: 1258291
Content-Disposition: attachment; filename="Plan de reprise d_activite 2026.docx"; filename*=UTF-8''Plan%20de%20reprise%20d%E2%80%99activit%C3%A9%202026.docx
ETag: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
Last-Modified: Mon, 16 Nov 2026 09:12:40 GMT
Cache-Control: private, no-cache
Accept-Ranges: bytes
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'none'; sandbox
```

- **Nom.** Le nom d’origine, sous deux formes : `filename` en ASCII, accents retirés et autres caractères remplacés par `_`, et `filename*` en UTF-8.
- **Type.** Celui établi par Lore à l’import, jamais celui annoncé par le navigateur.
- **`ETag`.** L’empreinte SHA-256 du fichier, la même que `currentVersion.sha256`.
- **Cache.** Le navigateur peut garder le fichier, mais redemande à chaque ouverture : un accès retiré répond `404`, jamais `304`.
- **Plages.** `Range` et `If-Range` sont respectés : une plage n’est servie que si `If-Range` désigne le même fichier, sinon le fichier part en entier. Il n’est jamais compressé, même un fichier texte.

| Code HTTP | `code` | Cause |
| --- | --- | --- |
| 200 | | Le fichier entier |
| 206 | | La ou les plages demandées par `Range` |
| 304 | | Le navigateur a déjà ce fichier (`If-None-Match`) |
| 400 | `invalid_request` | `disposition` (`invalid_value`), aussi pour `inline` sur un autre format qu’un PDF |
| 404 | `not_found` | Le document, ou cette version, n’existe pas pour vous |
| 410 | `file_missing` | Le fichier est introuvable sur le disque du serveur |
| 416 | | Une plage hors du fichier, avec `Content-Range: bytes */<taille>` |

Chaque téléchargement inscrit un événement au journal d’audit, avec le nom et la taille du fichier. Une requête `HEAD`, une plage qui ne commence pas au premier octet (la reprise d’un téléchargement) et `disposition=inline` n’en inscrivent pas.

## Documents récents

`GET /api/v1/documents/recent`

Les documents que vous avez ouverts en dernier et que vous voyez encore, du plus récent au plus ancien : 3 par défaut, jusqu’à 10 avec `size`. Chacun avec `id`, `title`, `space` (`id`, `name`, `slug`, `color`), `folder` (`id` et `name`, ou `null`), `status` et `viewedAt`, le moment de la consultation. Un document supprimé, ou que vous ne voyez plus, n’y figure pas.

Erreur de champ : `size` (`out_of_range`, avec `min` et `max`).

## Modifier un document

`PATCH /api/v1/documents/{id}`

Change le titre (200 caractères au plus), la description (2 000), la catégorie ou la langue. Un champ absent ne change pas ; une description ou une catégorie vide est retirée. Réservé aux contributeurs et aux responsables de l’espace. Renvoie le document.

```json title="Corps de la requête"
{
  "title": "Restaurer une base PostgreSQL",
  "description": "Procédure testée sur PostgreSQL 18.",
  "category": "RUNBOOK",
  "language": "fr"
}
```

- **Langue.** `language` vaut `fr`, `en` ou `other`. La changer réindexe aussitôt le document pour la recherche, dans la même requête ; la langue choisie est gardée si la même version est extraite de nouveau. Pendant l’extraction du texte, la langue ne se change pas : `409 extraction_pending`.
- **Journal d’audit.** Chaque modification inscrit `document.updated`, avec les champs changés dans `changes` ; pour la langue, l’ancienne dans `previousLanguage`.

Erreurs de champ : `title` (`required`, `too_long`), `description` (`too_long`), `category` et `language` (`invalid_value`). Un document archivé : `409 document_archived`.

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

Après un échec dû à une cause passagère (`timeout`, `extractor_crashed`, `file_missing`), remet la dernière version en file d’extraction : la version actuelle, ou une nouvelle version en échec ; elle revient à `PENDING`. Réservé aux contributeurs et aux responsables de l’espace. Pour une cause définitive, ou une version qui n’est pas en échec : `409 not_retryable`.

## Importer une nouvelle version

`POST /api/v1/documents/{id}/versions`

Envoie le fichier d’une nouvelle version, comme un import : un formulaire `multipart/form-data`, avec les mêmes contrôles et les mêmes erreurs sur le fichier. Réservé aux contributeurs et aux responsables de l’espace. Répond `201` avec le document : `newerVersion` décrit la nouvelle version, en cours d’extraction ; la version actuelle ne change pas encore.

| Champ | Description |
| --- | --- |
| `file` | Le fichier : PDF, Word (.docx), Markdown ou texte. Le format peut changer d’une version à l’autre. |
| `note` | Ce qui change, 500 caractères au plus ; facultatif |
| `status` | `DRAFT` ou `PUBLISHED` : le statut que prend le document quand la version devient la version actuelle ; absent, il ne change pas |

- **Numéro.** Le plus grand numéro du document plus un : deux envois simultanés reçoivent deux numéros différents.
- **Version actuelle.** La nouvelle version devient la version actuelle une fois son texte extrait, d’un coup, pour la lecture comme pour la recherche. Si une version plus récente l’est devenue entre-temps, elle reste dans l’historique. En échec, la version actuelle ne change pas : voir [Relancer l’extraction](#relancer-lextraction).
- **Statut.** Le statut demandé s’applique à ce moment-là, sauf si le statut du document a changé depuis l’import de la version ou s’il est archivé ; il est inscrit au journal au nom de la personne qui a importé la version.
- **Langue.** Une langue choisie à la main sur la version actuelle est reprise par la nouvelle version.
- **Journal d’audit.** `document.version_imported`, avec `version`, `previous` (le numéro de la version actuelle), `filename`, `size` et `status` ; la note n’est pas recopiée.

| Code HTTP | `code` | Cause |
| --- | --- | --- |
| 400 | `invalid_request` | `file` (comme pour un import), `note` (`too_long`), `status` (`invalid_value`) |
| 409 | `same_content` | Le fichier est identique à celui de la dernière version, actuelle, en cours ou en échec ; `version` donne son numéro. Identique à une version plus ancienne, il est accepté : c’est un retour en arrière. |
| 409 | `document_archived` | Le document est archivé |
| 413 | `file_too_large` | Le fichier dépasse la taille maximale |
| 507 | `storage_full` | Le disque du serveur est plein |

## Versions d’un document

`GET /api/v1/documents/{id}/versions`

Les versions du document, la plus récente d’abord, par pages (`page`, `size` : 50 par défaut, 200 au plus), pour toute personne qui voit le document. Chacune dans la forme de `currentVersion` : `number`, `createdAt`, `author`, `note`, `changeRatio`, `extractionStatus`, `extractionError`, `filename`, `mediaType`, `sizeBytes`, `sha256`, `pageCount`, `sectionCount`, `language`, `fileAvailable`.

`GET /api/v1/documents/{id}/versions/{number}`

Une version, dans la même forme ; `404` pour un numéro que le document n’a pas. Son contenu se lit avec `/rendering` et son fichier se télécharge avec `/file`, sous le même numéro. Les passages d’une version qui n’est plus la version actuelle sont effacés : la recherche ne la trouve pas.

## Changer le statut

`PUT /api/v1/documents/{id}/status`

```json title="Corps de la requête"
{ "status": "OBSOLETE", "replacedBy": "…" }
```

- **Qui.** Les contributeurs et les responsables de l’espace passent un document de Brouillon à Publié ou Obsolète, et retour. Archiver est réservé aux responsables de l’espace, aux propriétaires et aux administrateurs : `403 maintainer_only` sinon. Un document archivé n’est vu que d’eux : il répond `404` aux autres, pour le sortir d’Archivé comme pour le reste.
- **Remplaçant.** Pour Obsolète seulement, facultatif : un document que vous pouvez lire, dans n’importe lequel de vos espaces. Ni le document lui-même, ni un document obsolète ou archivé. Quitter Obsolète retire le remplaçant ; supprimer le remplaçant le retire aussi.
- **Date.** `statusChangedAt` change avec le statut seul. Sans changement de statut ni de remplaçant, rien n’est fait ; un document qui reste obsolète peut changer de remplaçant.
- **Journal d’audit.** `document.status_changed`, avec `before`, `after`, `replacedBy` et `replacedByTitle`.

Renvoie le document. Erreurs de champ : `status` (`invalid_value`), `replacedBy` (`unknown_document`, aussi pour un document que vous ne pouvez pas lire ; `not_replaceable`).

## Activité d’un document

`GET /api/v1/documents/{id}/activity`

Ce qui a été fait au document, le plus récent d’abord, pour toute personne qui le voit : imports et nouvelles versions, changements de statut, d’accès, de responsable, de dossier, de titre, de description, de catégorie et de langue. Jamais ses consultations ni ses téléchargements.

| Paramètre | Description |
| --- | --- |
| `before` | Le curseur `next` de la page précédente |
| `size` | 20 par défaut, 50 au plus |

```json title="Réponse 200"
{
  "items": [
    {
      "id": 4182,
      "occurredAt": "2026-11-17T15:12:00Z",
      "actor": { "id": "…", "displayName": "Hervé Coulibaly" },
      "action": "document.status_changed",
      "details": { "before": "PUBLISHED", "after": "OBSOLETE", "replacedBy": { "id": "…", "title": "Restaurer une base PostgreSQL depuis une sauvegarde" } }
    }
  ],
  "next": "1794928320000000-4182"
}
```

Les détails ne donnent que ce que vous pouvez savoir : le nombre de personnes choisies pour un accès (`added`, `removed`), pas lesquelles ; le remplaçant d’un document obsolète seulement si vous pouvez le lire. `actor` est `null` pour une opération du serveur. Erreurs de champ : `before` (`invalid_value`), `size` (`out_of_range`).

## Activité récente

`GET /api/v1/activity`

Les 8 derniers imports, nouvelles versions et changements de statut des documents que vous voyez, archivés exclus : pour *Activité récente dans vos espaces*, sur l’accueil. Chacun avec `occurredAt`, `actor`, `action`, `document` (`id`, `title`), `space` et `details` (`version`, `before`, `after`).

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

## Changer le responsable

`PUT /api/v1/documents/{id}/owner`

Confie le document à un autre membre actif de l’espace, qui a au moins le rôle Contributeur. Réservé aux responsables de l’espace et au responsable du document, s’il est au moins contributeur (`403 maintainer_or_owner_only` sinon). Renvoie le document.

```json title="Corps de la requête"
{ "userId": "…" }
```

Pour un document restreint, le nouveau responsable le voit. L’ancien ne le voit plus, sauf s’il fait partie des personnes choisies, s’il est responsable de l’espace, ou propriétaire ou administrateur de l’organisation : sinon, la réponse a alors toutes ses `actions` à `false`, et le document répond ensuite `404`.

Erreur de champ : `userId` (`required` ; `not_space_member`, aussi pour un compte désactivé ; `not_contributor`).

## Limites de l’import

`GET /api/v1/imports/limits`

La taille maximale en vigueur et les extensions acceptées, pour vérifier les fichiers avant de les envoyer.

```json title="Réponse 200"
{ "maxMegabytes": 50, "maxBytes": 52428800, "extensions": ["pdf", "docx", "md", "markdown", "txt"] }
```

## Imports à suivre

`GET /api/v1/imports/attention`

Les versions que vous avez importées, premiers imports et nouvelles versions de documents que vous voyez encore, dont l’extraction est en cours ou en échec, tant qu’aucune version plus récente n’est devenue la version actuelle ; les plus récentes d’abord, 20 au plus. Chacune avec `id` et `title` du document, `space` (`id`, `name`, `slug`, `color`), `version`, `extractionStatus` et `extractionError`.

## Stockage et import (administration)

`GET /api/v1/admin/storage`

Réservé aux propriétaires et aux administrateurs (`403 admin_only`). Renvoie le volume stocké (`usedBytes`, chaque contenu compté une fois) et la place libre (`freeBytes`), le nombre de documents (`documents`, `inProgress`, `scanned`, `failed`), la taille maximale en vigueur (`maxUploadMegabytes`), le plafond du serveur (`maxUploadCeilingMegabytes`) et la taille par défaut (`defaultMaxUploadMegabytes`), les extensions acceptées, l’état de l’extraction (`extraction` : `active`, `workers` et la cause d’une panne dans `problem`) et le dossier des fichiers (`filesPath`).

`PATCH /api/v1/admin/storage`

Change la taille maximale d’un fichier, en mégaoctets, de 1 jusqu’au plafond fixé par `LORE_MAX_UPLOAD_SIZE`. Renvoie la même forme que `GET`.

```json title="Corps de la requête"
{ "maxUploadMegabytes": 100 }
```

Erreur de champ : `maxUploadMegabytes` (`out_of_range`, avec `min` et `max`).

## Journal d’audit (administration)

`GET /api/v1/admin/audit`

Les opérations de l’organisation, les plus récentes d’abord. Réservé aux propriétaires et aux administrateurs (`403 admin_only`).

| Paramètre | Description |
| --- | --- |
| `category` | `view`, `download`, `import`, `status`, `change`, `deletion`, `rights`, `members`, `sign_in`, `organization`, ou `other` pour une action qu’aucune catégorie ne connaît |
| `actor` | L’identifiant d’une personne, ou `system` pour les opérations du serveur |
| `from`, `to` | Une période, en instants ISO 8601 (`2026-11-01T00:00:00Z`) ; `to` exclu |
| `before` | Le curseur `next` de la page précédente |
| `size` | 50 par défaut, 200 au plus |

```json title="Réponse 200"
{
  "items": [
    {
      "id": 4182,
      "occurredAt": "2026-11-17T15:12:00Z",
      "actor": { "id": "…", "displayName": "Hervé Coulibaly", "email": "herve.coulibaly@dada.group" },
      "action": "document.status_changed",
      "category": "status",
      "resource": { "type": "document", "id": "…" },
      "ip": "10.0.3.17",
      "details": { "title": "Sauvegardes nocturnes avec Barman", "before": "PUBLISHED", "after": "OBSOLETE" }
    }
  ],
  "next": "1794928320000000-4182"
}
```

`actor` est `null` pour une opération du serveur ; `displayName` et `email` sont donnés aussi pour une personne qui a quitté l’organisation. Erreurs de champ : `category`, `actor`, `from`, `to`, `before` (`invalid_value`), `size` (`out_of_range`).

`GET /api/v1/admin/audit/export`

Les mêmes filtres, sans `before` ni `size`, en CSV (`text/csv`, UTF-8 avec une marque d’ordre des octets, RFC 4180), écrit au fil de la lecture, en pièce jointe `lore-audit-2026-11-18.csv`. Colonnes : `occurred_at`, `actor_id`, `actor_name`, `actor_email`, `action`, `category`, `resource_type`, `resource_id`, `title`, `space`, `ip` et `details` (en JSON). Une valeur qui commence par `=`, `+`, `-` ou `@` est précédée d’une apostrophe, pour qu’un tableur ne la lise pas comme une formule. L’export est lui-même inscrit au journal (`audit.exported`, avec les filtres et le nombre de lignes). Un seul export à la fois par personne : `429 export_running`.

## Espaces et dossiers

- `GET /api/v1/spaces` et les routes qui renvoient un espace indiquent, dans `documentCount`, le nombre de ses documents que vous voyez.
- `DELETE /api/v1/spaces/{spaceId}/folders/{folderId}` répond `409 folder_not_empty` tant que le dossier contient un document, même un document restreint que vous ne voyez pas.

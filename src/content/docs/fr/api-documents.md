---
title: "Documents"
description: "Lister, consulter, importer et modifier des documents par l’API."
---

## Lister les documents d’un espace

`GET /api/v1/spaces/{spaceId}/documents`

Renvoie une liste paginée.

| Paramètre | Description |
| --- | --- |
| `folder` | Identifiant d’un dossier |
| `status` | `DRAFT`, `PUBLISHED`, `OBSOLETE` ou `ARCHIVED` |
| `page`, `size` | Pagination |

## Consulter un document

`GET /api/v1/documents/{id}`

Renvoie les métadonnées du document et sa version actuelle.

```json title="Réponse 200"
{
  "id": "d7c1f1e2-…",
  "title": "Restaurer une base PostgreSQL depuis une sauvegarde",
  "space": { "id": "…", "name": "Infrastructure" },
  "folder": { "id": "…", "name": "Runbooks" },
  "status": "PUBLISHED",
  "category": "Runbook",
  "owner": { "id": "…", "name": "Amenan Souaga" },
  "restricted": false,
  "language": "fr",
  "currentVersion": {
    "number": 4,
    "filename": "restaurer-pg.md",
    "mediaType": "text/markdown",
    "sizeBytes": 18342,
    "extractionStatus": "INDEXED",
    "createdAt": "2026-11-10T18:04:12Z"
  }
}
```

## Importer un document

`POST /api/v1/spaces/{spaceId}/documents`

Le fichier est envoyé en `multipart/form-data`.

```sh title="Requête"
curl https://lore.example.com/api/v1/spaces/{spaceId}/documents \
  -H "Authorization: Bearer <jeton>" \
  -F file=@restaurer-pg.md \
  -F folderId=… \
  -F status=DRAFT \
  -F category=Runbook
```

La réponse `201` renvoie le document, avec `extractionStatus` à `PENDING` : l’extraction se poursuit en arrière-plan.

## Ajouter une version

`POST /api/v1/documents/{id}/versions`

Envoie un nouveau fichier, avec une note de version.

```sh title="Requête"
curl https://lore.example.com/api/v1/documents/{id}/versions \
  -H "Authorization: Bearer <jeton>" \
  -F file=@restaurer-pg.md \
  -F note="Ajout de la section Erreurs fréquentes"
```

## Modifier les métadonnées

`PATCH /api/v1/documents/{id}`

Modifie le titre, le statut, la catégorie ou le responsable.

```json title="Corps de la requête"
{
  "status": "OBSOLETE",
  "replacedBy": "a41b…"
}
```

## Télécharger un fichier

`GET /api/v1/documents/{id}/versions/{number}/file`

Renvoie le fichier tel qu’il a été importé, avec son type de contenu d’origine.

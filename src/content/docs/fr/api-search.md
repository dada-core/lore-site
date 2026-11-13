---
title: "Recherche"
description: "La recherche de l’API applique exactement les mêmes droits et la même syntaxe que l’interface."
---

## Rechercher

`GET /api/v1/search`

Recherche plein texte dans les documents que la personne authentifiée peut lire.

| Paramètre | Description |
| --- | --- |
| `q` | La recherche, avec la [syntaxe habituelle](search.md#syntaxe) |
| `space` | Restreindre à un ou plusieurs espaces |
| `status` | Restreindre à un ou plusieurs statuts |
| `page`, `size` | Pagination |

```sh title="Requête"
curl -G https://lore.example.com/api/v1/search \
  -H "Authorization: Bearer <jeton>" \
  --data-urlencode 'q=pg_restore role "does not exist"'
```

```json title="Réponse 200"
{
  "items": [
    {
      "document": { "id": "…", "title": "Restaurer une base PostgreSQL…", "status": "PUBLISHED" },
      "version": 4,
      "passage": {
        "location": "Section 4.2 › Erreurs fréquentes",
        "excerpt": "Si pg_restore signale ERROR: role \"app_rw\" does not exist…",
        "highlights": [[3, 13], [29, 33], [43, 57]]
      },
      "otherPassages": 0
    }
  ],
  "page": 0,
  "size": 50,
  "total": 4
}
```

Les positions de `highlights` désignent les caractères à surligner dans `excerpt`.

---
title: "Présentation de l’API"
description: "L’interface de Lore repose entièrement sur une API REST, décrite en OpenAPI. Elle couvre aujourd’hui la configuration, la connexion, le compte, l’administration de l’organisation, les espaces, les documents, la recherche et le journal d’audit."
---

## Adresse de base

```text title="URL"
https://lore.example.com/api/v1
```

La description OpenAPI complète est servie, sans authentification, à l’adresse `/api/v1/openapi.json`.

## Ce que couvre l’API

- **Configuration initiale** : `GET /api/v1/setup`, `POST /api/v1/setup/verify-code` et `POST /api/v1/setup`.
- **Connexion** : `POST /api/v1/auth/login`, `POST /api/v1/auth/logout` et `GET /api/v1/session`.
- **Invitations** : `POST /api/v1/invitations/inspect` et `POST /api/v1/invitations/accept`.
- **Réinitialisation du mot de passe** : `POST /api/v1/password-reset/inspect` et `POST /api/v1/password-reset/complete`.
- **Mon compte** : `/api/v1/account`, son adresse (`/email`), son mot de passe (`/password`) et ses sessions (`/sessions`).
- **Administration** : `/api/v1/admin/organization`, `/api/v1/admin/members`, `/api/v1/admin/invitations`, `/api/v1/admin/storage` et `/api/v1/admin/audit` (et son export, `/export`), réservées aux propriétaires et aux administrateurs. Un propriétaire ou un administrateur qui devient membre (`PATCH /api/v1/admin/members/{id}`), est désactivé (`POST /api/v1/admin/members/{id}/disable`) ou est retiré (`DELETE /api/v1/admin/members/{id}`) perd les invitations et les liens de réinitialisation qu’il a créés et qui sont encore en attente : ils sont révoqués, et leur nombre figure dans le détail de l’opération au journal d’audit (`revokedLinks`, dans `details`), quand il y en a.
- **Espaces** : `/api/v1/spaces`, et pour chaque espace ses dossiers (`/{spaceId}/folders`) et ses membres (`/{spaceId}/members`).
- **Documents** : `/api/v1/spaces/{spaceId}/documents`, `/api/v1/documents/{id}` et ses actions, le contenu et le fichier de chaque version (`/versions/{number}/rendering` et `/versions/{number}/file`), `/api/v1/documents/recent`, `/api/v1/activity`, `/api/v1/imports/limits` et `/api/v1/imports/attention`. Voir [Documents](api-documents.md).
- **Recherche** : `GET /api/v1/search` et, pour la palette, `GET /api/v1/search/titles`.

## Authentification

L’API utilise la même session que l’interface : `POST /api/v1/auth/login` l’ouvre et la garde dans un cookie. Les requêtes qui modifient quelque chose (`POST`, `PUT`, `PATCH`, `DELETE`) doivent aussi renvoyer le jeton CSRF : Lore le dépose dans le cookie `XSRF-TOKEN`, et la requête le renvoie dans l’en-tête `X-XSRF-TOKEN`. Quand `LORE_PUBLIC_URL` est en HTTPS, les cookies s’appellent `__Host-XSRF-TOKEN` et `__Host-LORE_SESSION` : un script qui lit le cookie `XSRF-TOKEN` doit aussi accepter le nom préfixé.

```sh title="Exemple avec curl"
# 1. Recevoir le cookie du jeton CSRF (`__Host-XSRF-TOKEN` si `LORE_PUBLIC_URL` est en HTTPS, sinon `XSRF-TOKEN`)
curl -c cookies.txt https://lore.example.com/api/v1/session
# 2. Se connecter, avec la valeur de ce cookie lue dans cookies.txt
curl -b cookies.txt -c cookies.txt -X POST https://lore.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" -H "X-XSRF-TOKEN: <jeton>" \
  -d '{"email": "wilfried.kouakou@dada.group", "password": "<mot de passe>"}'
# 3. Appeler l’API
curl -b cookies.txt https://lore.example.com/api/v1/account
```

Des jetons d’accès personnels, pour les scripts et les intégrations, sont prévus après la version 0.1.

## Pagination

Les listes paginées (membres, documents d’un espace, versions d’un document) acceptent `page` (à partir de 0) et `size` (50 par défaut, 200 au maximum) :

```json title="Réponse"
{
  "items": [ … ],
  "page": 0,
  "size": 50,
  "total": 128
}
```

Le journal d’audit et l’activité d’un document avancent par curseur (`before`, `next`) ; la recherche a ses propres limites ; les autres listes sont renvoyées entières.

## Erreurs

Les erreurs suivent le format `application/problem+json`, avec un champ `code` stable : utilisez-le plutôt que le message.

| Code HTTP | Exemples de `code` | Signification |
| --- | --- | --- |
| 400 | `invalid_request` | Requête invalide. Le champ `errors` liste les champs en cause, chacun avec son code, par exemple `invalid_email`, `password_min_length` ou `common_words_only` |
| 401 | `unauthenticated`, `invalid_credentials` | Pas de session ouverte, ou identifiants refusés |
| 403 | `admin_only`, `owner_only`, `contributor_only`, `maintainer_only`, `maintainer_or_owner_only`, `account_disabled`, `csrf`, `forbidden` | Action réservée à un autre rôle, connexion d’un compte désactivé, ou jeton CSRF absent ou périmé |
| 404 | `not_found`, `invalid_link` | Introuvable, ou lien d’invitation ou de réinitialisation périmé |
| 409 | `last_owner`, `own_account`, `setup_done`, `space_archived`, `document_archived`, `same_content`, `folder_not_empty`, `not_retryable`, `extraction_pending`, `no_rendering`, `last_maintainer`, `already_space_member`, `account_disabled`, `setup_required` | L’action contredit l’état actuel, par exemple retirer le dernier propriétaire ou le dernier responsable d’un espace, créer un lien de réinitialisation pour un compte désactivé, se connecter avant la configuration initiale, ou lire le contenu d’un document encore en cours d’extraction |
| 410 | `file_missing` | Le fichier d’un document est introuvable sur le disque du serveur |
| 413 | `file_too_large` | Le fichier dépasse la taille maximale, indiquée en mégaoctets dans `maxMegabytes` |
| 415 | `unsupported_media_type` | Le corps doit être en JSON |
| 429 | `login_locked`, `too_many_searches`, `export_running` | Trop d’échecs de connexion, mots de passe actuels faux de `PUT /api/v1/account/email` et `PUT /api/v1/account/password` compris : réessayez après le blocage ; deux de vos recherches sont déjà en cours ; ou l’un de vos exports du journal d’audit |
| 500 | `server_error` | Erreur inattendue : le détail est dans les journaux du serveur, pas dans la réponse |
| 503 | `search_timeout`, `server_busy` | La recherche a dépassé 5 secondes : précisez-la ; ou un calcul de mot de passe a attendu son tour plus de 10 secondes, à la connexion, à la configuration initiale, à l’acceptation d’une invitation, à la réinitialisation ou dans *Mon compte* |
| 507 | `storage_full` | Il resterait moins de 100 Mo libres sur le disque du serveur |

Le téléchargement d’un fichier répond aussi `206` pour une partie du fichier, `304` quand le navigateur l’a déjà, et `416` pour une plage hors du fichier, sans corps d’erreur. Voir [Télécharger l’original](api-documents.md#télécharger-loriginal).

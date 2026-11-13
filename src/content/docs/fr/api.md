---
title: "Présentation de l’API"
description: "L’interface de Lore repose entièrement sur une API REST, décrite en OpenAPI. Elle couvre aujourd’hui la configuration, la connexion, le compte et l’administration de l’organisation."
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
- **Administration** : `/api/v1/admin/organization`, `/api/v1/admin/members` et `/api/v1/admin/invitations`, réservées aux propriétaires et aux administrateurs.

Les espaces, les documents et la recherche s’y ajouteront avec la version 0.1.

## Authentification

L’API utilise la même session que l’interface : `POST /api/v1/auth/login` l’ouvre et la garde dans un cookie. Les requêtes qui modifient quelque chose (`POST`, `PUT`, `PATCH`, `DELETE`) doivent aussi renvoyer le jeton CSRF : Lore le dépose dans le cookie `XSRF-TOKEN`, et la requête le renvoie dans l’en-tête `X-XSRF-TOKEN`.

```sh title="Exemple avec curl"
# 1. Recevoir le cookie XSRF-TOKEN
curl -c cookies.txt https://lore.example.com/api/v1/session
# 2. Se connecter, avec la valeur de XSRF-TOKEN lue dans cookies.txt
curl -b cookies.txt -c cookies.txt -X POST https://lore.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" -H "X-XSRF-TOKEN: <jeton>" \
  -d '{"email": "admin@example.com", "password": "<mot de passe>"}'
# 3. Appeler l’API
curl -b cookies.txt https://lore.example.com/api/v1/account
```

Des jetons d’accès personnels, pour les scripts et les intégrations, sont prévus après la version 0.1.

## Pagination

Les listes, comme celle des membres, acceptent `page` (à partir de 0) et `size` (50 par défaut, 200 au maximum) :

```json title="Réponse"
{
  "items": [ … ],
  "page": 0,
  "size": 50,
  "total": 128
}
```

## Erreurs

Les erreurs suivent le format `application/problem+json`, avec un champ `code` stable : utilisez-le plutôt que le message.

| Code HTTP | Exemples de `code` | Signification |
| --- | --- | --- |
| 400 | `invalid_request` | Requête invalide. Le champ `errors` liste les champs en cause, chacun avec son code, par exemple `invalid_email` ou `password_min_length` |
| 401 | `unauthenticated`, `invalid_credentials` | Pas de session ouverte, ou identifiants refusés |
| 403 | `admin_only`, `owner_only`, `csrf` | Action réservée à un autre rôle, ou jeton CSRF absent ou périmé |
| 404 | `not_found`, `invalid_link` | Introuvable, ou lien d’invitation ou de réinitialisation périmé |
| 409 | `last_owner`, `own_account`, `setup_done` | L’action contredit l’état actuel, par exemple retirer le dernier propriétaire |
| 415 | `unsupported_media_type` | Le corps doit être en JSON |
| 429 | `login_locked` | Trop d’échecs de connexion : réessayez après le blocage |

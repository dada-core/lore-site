---
title: "Sécurité et connexion"
description: "Comptes, sessions et connexion : les réglages par défaut et ce que vous pouvez ajuster."
---

## Mots de passe

Les mots de passe sont hachés avec Argon2id. Longueur minimale : 12 caractères, modifiable dans *Administration › Sécurité et connexion*.

## Tentatives de connexion

Par défaut, après 5 échecs, la connexion est bloquée 15 minutes. Les échecs sont comptés pour chaque couple adresse e-mail et adresse IP ; une adresse e-mail est aussi bloquée, quelle que soit l’adresse IP, après quatre fois plus d’échecs. Le nombre d’échecs et la durée du blocage se règlent dans *Administration › Sécurité et connexion*. Les échecs et les blocages sont inscrits au journal d’audit, consultable dans l’administration à partir de la v0.1.

## Sessions

| Réglage | Valeur par défaut |
| --- | --- |
| Stockage | Côté serveur, dans PostgreSQL |
| Cookie | `HttpOnly`, `SameSite=Lax`, et `Secure` quand l’adresse publique est en HTTPS |
| Expiration après inactivité | 8 heures, réglable dans *Administration › Sécurité et connexion*, sans dépasser `LORE_SESSION_TIMEOUT` |
| Protection CSRF | Activée |

Chaque personne voit ses sessions ouvertes dans *Mon compte*, et peut les fermer une à une, ou toutes les autres à la fois.

## Fournisseur d’identité <span class="vb">Après v0.1</span>

La connexion par OpenID Connect (Keycloak, Authentik, Google, GitLab, Entra ID…) fera partie de l’édition Community, gratuite.

## Signaler une vulnérabilité

Ne la signalez jamais dans un ticket public. Utilisez le [signalement privé de GitHub](https://github.com/dada-core/lore/security/advisories/new), comme le décrit le fichier [SECURITY.md](https://github.com/dada-core/lore/blob/main/SECURITY.md) du dépôt.

---
title: "Security and sign-in"
description: "Accounts, sessions and sign-in: the default settings and what you can adjust."
---

## Passwords

Passwords are hashed with Argon2id. Minimum length: 12 characters, which can be changed in *Administration › Security and sign-in*.

## Sign-in attempts

By default, after 5 failures, sign-in is locked for 15 minutes. Failures are counted for each pair of email address and IP address; an email address is also locked, whatever the IP address, after four times as many failures. The number of failures and the lockout duration are set in *Administration › Security and sign-in*. Failures and lockouts are recorded in the audit log, which can be browsed in the administration from v0.1.

## Sessions

| Setting | Default value |
| --- | --- |
| Storage | Server side, in PostgreSQL |
| Cookie | `HttpOnly`, `SameSite=Lax`, and `Secure` when the public address uses HTTPS |
| Expiry after inactivity | 8 hours, set in *Administration › Security and sign-in*, up to `LORE_SESSION_TIMEOUT` |
| CSRF protection | On |

Everyone sees their open sessions in *My account*, and can close them one by one, or all the others at once.

## Identity provider <span class="vb">After v0.1</span>

Sign-in with OpenID Connect (Keycloak, Authentik, Google, GitLab, Entra ID…) will be part of the free Community edition.

## Report a vulnerability

Never report it in a public issue. Use [GitHub’s private reporting](https://github.com/dada-core/lore/security/advisories/new), as described in the repository’s [SECURITY.md](https://github.com/dada-core/lore/blob/main/SECURITY.md) file.

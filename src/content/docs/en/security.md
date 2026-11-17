---
title: "Security and sign-in"
description: "Accounts, sessions, sign-in and reading documents: the default settings, what you can adjust, and what Lore protects."
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

## Reading documents

An imported file may be booby-trapped: Lore never runs it, and never serves it as a page.

- **Cleaned rendering.** A Markdown, Word or text document is shown from an HTML rendering produced by the extraction process, which only writes a closed list of layout elements. Lore does not rely on it: it cleans this rendering again, with OWASP Java HTML Sanitizer, before saving it. No script, style, event handler, frame, form, image or SVG gets through; links keep only `http`, `https` and `mailto`, and the only identifiers allowed are Lore’s own. On top of that, the content security policy of the interface forbids any script that does not come from Lore.
- **Images never loaded.** An image of a document, even one hosted elsewhere, is never loaded by the browser: reading a document calls no outside server.
- **PDF.** PDFs show in the page with pdf.js, served by Lore. The scripts and forms of a PDF are never run, and its links open in a new tab.
- **Originals as attachments.** An original is served as an attachment, under its original name. It carries the type Lore established at import, never the one announced by the browser, with the `X-Content-Type-Options: nosniff` header and a security policy that forbids it everything (`default-src 'none'; sandbox`). Only a PDF can be served to be shown, in the [viewer](reader.md#the-pdf-viewer) or in a new tab, with the same headers.
- **Access checked at each opening.** The content and the original are read only after access is checked. The browser may keep a file in its cache, but it asks again at each opening whether the person still has access to it.

### Log of views

Each opening of a document is recorded in the audit log, once an hour at most for the same person, as is each download: the log says who read what. This is personal data, kept for security, which only the organization’s owners and administrators can browse, in the administration from v0.1, and which is deleted after one year. Let the members of your organization know.

## Identity provider <span class="vb">After v0.1</span>

Sign-in with OpenID Connect (Keycloak, Authentik, Google, GitLab, Entra ID…) will be part of the free Community edition.

## Report a vulnerability

Never report it in a public issue. Use [GitHub’s private reporting](https://github.com/dada-core/lore/security/advisories/new), as described in the repository’s [SECURITY.md](https://github.com/dada-core/lore/blob/main/SECURITY.md) file.

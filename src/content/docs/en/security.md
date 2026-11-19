---
title: "Security and sign-in"
description: "Accounts, sessions, sign-in, reading documents and search: the default settings, what you can adjust, and what Lore protects."
---

## Passwords

Passwords are hashed with Argon2id. Minimum length: 12 characters, which can be set from 8 to 64 in *Administration › Security and sign-in*; 128 characters at most. Lore does not compare them with a list of common or leaked passwords.

Lore runs as many password computations at a time as the server has processors, within what its memory allows (one computation per 64 MB of Java memory), two at least and eight at most: at sign-in, at the initial setup, when accepting an invitation, at a password reset and in *My account*. A request that waits more than 10 seconds receives the `503` response, with the `server_busy` code; the interface shows “Lore is very busy right now. Try again in a few seconds.”

## Sign-in attempts

By default, after 5 failures within 15 minutes (the lockout duration), sign-in is locked for 15 minutes. Failures are counted for each pair of email address and IP address; an email address is also locked, whatever the IP address, after four times as many failures. The number of failures (from 3 to 20) and the lockout duration (from 1 minute to 24 hours) are set in *Administration › Security and sign-in*. Failures and lockouts are recorded in the audit log, which can be browsed in *Administration › Audit log*.

In *My account*, changing one’s password or email address asks for the current password. A wrong current password counts as a refused sign-in: the audit log records “Failed sign-in for wilfried.kouakou@dada.group”, with the person as the author. At the lockout threshold, the response is `429`, with the `login_locked` code, and sign-in from this computer is locked too. A session that has given as many wrong current passwords as sign-in allows is locked the same way, whatever IP address it sends them from: a stolen session gets no more guesses than the sign-in form. A lockout of the address from every computer, which a third party can cause by failing on purpose, does not keep the person already signed in from changing their password; a new password sets the counters back to zero.

The IP address is the one of the connection, or the one forwarded by a reverse proxy declared in `LORE_TRUSTED_PROXIES`. A proxy that is not declared gives its address to every request: see [HTTPS and reverse proxy](reverse-proxy.md#declare-the-proxy).

> [!WARNING]
> **The lockout protects one account, not all accounts.** The same machine can try a common password on each email address: only the minimum password length stands in the way.

## Sessions

| Setting | Default value |
| --- | --- |
| Storage | Server side, in PostgreSQL |
| Cookie | `HttpOnly`, `SameSite=Lax`, and `Secure` when `LORE_PUBLIC_URL` uses HTTPS; without it, when the request arrives over HTTPS, directly or through a declared proxy |
| Expiry after inactivity | 8 hours, set from 5 minutes to `LORE_SESSION_TIMEOUT` in *Administration › Security and sign-in* |
| CSRF protection | On |

When `LORE_PUBLIC_URL` uses HTTPS, the cookies are named `__Host-LORE_SESSION` and `__Host-XSRF-TOKEN`: they are secure and bound to Lore’s exact host name. Expiry only counts inactivity: a session used without a break stays open.

Everyone sees their open sessions in *My account*, and can close them one by one, or all the others at once.

## Reading documents

An imported file may be booby-trapped: Lore never runs it, and never serves it as a page.

- **Cleaned rendering.** A Markdown, Word or text document is shown from an HTML rendering produced by the extraction process, which only writes a closed list of layout elements. Lore does not rely on it: it cleans this rendering again, with OWASP Java HTML Sanitizer, before saving it. No script, style, event handler, frame, form, image or SVG gets through; links keep only `http`, `https` and `mailto`, and the only identifiers allowed are Lore’s own. On top of that, the content security policy of the interface forbids any script that does not come from Lore.
- **Images never loaded.** An image of a document, even one hosted elsewhere, is never loaded by the browser: reading a document calls no outside server.
- **PDF.** PDFs show in the page with pdf.js, served by Lore. The scripts and forms of a PDF are never run, and its links open in a new tab.
- **Originals as attachments.** An original is served as an attachment, under its original name. It carries the type Lore established at import, never the one announced by the browser, with the `X-Content-Type-Options: nosniff` header and a security policy that forbids it everything (`default-src 'none'; sandbox`). Only a PDF can be served to be shown, in the [viewer](reader.md#the-pdf-viewer) or in a new tab, with the same headers.
- **Access checked at each opening.** The content and the original are read only after access is checked. The browser may keep a file in its cache, but it asks again at each opening whether the person still has access to it.
- **Extraction kept apart.** The text is extracted in processes separate from the application, but under the same system account: see [Storage and extraction](storage.md#text-extraction) and its known limit.

### Log of views

Each opening of a document is recorded in the audit log, once an hour at most for the same person, as is each download: the log says who read what. This is personal data, kept for security, which only the organization’s owners and administrators can browse, in *Administration › Audit log*, and which is deleted after one year. Let the members of your organization know. It is never shown on the document: its *Activity* says what was changed, not who read it.

**Download opened from another site.** A page of another site that opens the download link of a document has a download recorded in the log, if the person is signed in and can read this document: the session cookie is `SameSite=Lax`. Lore sends the file to that person only.

### Audit log

*Administration › Audit log* shows the operations of the organization, filtered by category, person and period, and exports them as CSV with the same filters.

- **Who.** Owners and administrators only; the others are refused.
- **Export.** The file is written as it is read, without loading everything in memory, one export at a time per person. The export itself is recorded in the log, with its filters and its number of lines.
- **Formulas neutralized.** A value that starts with `=`, `+`, `-`, `@`, a tab or a carriage return, such as the title of a document written to trap a spreadsheet, is written after an apostrophe: opened in a spreadsheet, the file runs no formula.
- **People who left.** The screen shows the current name of the account of whoever acted, the export its name and email address, even after they left the organization.

## Search

- **Access applied in the query.** The results, their number, the filters and their numbers, the excerpts, the other passages and the titles of the palette only come from the documents the person can read, chosen in the query itself, before anything is ranked or counted. Access is read again at each search: access removed takes effect at the next search.
- **Searches never kept by the server.** No search is written down: neither in the audit log, nor in the server’s logs, even in `DEBUG` or `TRACE`. Each person’s last eight searches are kept in their browser, for their account, and cleared with *Clear*, as by signing out or by an expired session that Lore, while open, notices: kept per account, they do not show for the next person.
- **But present in addresses.** A search goes in the address: `/search?q=…` for the page, `/api/v1/search?q=…` and `/api/v1/search/titles?q=…` for the API, and `q` in the link of a result. It stays in the browser’s history, and may appear in the access logs of a reverse proxy. Lore sends the `Referrer-Policy: same-origin` header: a link to another site does not receive the address of the page, nor therefore the search.

A search may contain a name, or a secret pasted by mistake. To remove it from the proxy’s access logs, write them without the parameters of the addresses. With Nginx:

```nginx title="nginx.conf"
# In the http block: an access log without the parameters of the addresses
log_format without_parameters '$remote_addr [$time_local] "$request_method $uri $server_protocol" $status $body_bytes_sent';

# In the server block of Lore
access_log /var/log/nginx/lore.access.log without_parameters;
```

> [!WARNING]
> **Known limit.** Before setting aside the documents the person cannot see, search goes through the index of every document: a word present in many documents they cannot see makes the response time a little longer. In an extreme case, search goes beyond 5 seconds and answers `503 search_timeout`: this response may signal that a word is very frequent in documents the person cannot see. Neither the title nor the content of these documents appears.

## Identity provider <span class="vb">After v0.1</span>

Sign-in with OpenID Connect (Keycloak, Authentik, Google, GitLab, Entra ID…) will come after v0.1, free like the rest of Lore.

## Report a vulnerability

Never report it in a public issue. Use [GitHub’s private reporting](https://github.com/dada-core/lore/security/advisories/new), as described in the repository’s [SECURITY.md](https://github.com/dada-core/lore/blob/main/SECURITY.md) file.

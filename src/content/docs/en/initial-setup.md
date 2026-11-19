---
title: "Initial setup"
description: "On first launch, Lore shows a setup screen. It only appears once."
---

## The setup code

The screen first asks for a code, so that nobody else sets Lore up in your place. Until the setup is done, Lore draws a new code at each start and writes it to its logs: after a restart, take the latest one.

| Method | Where to read it |
| --- | --- |
| Docker Compose | `docker compose logs lore` |
| Packages | `sudo journalctl -u lore` |
| Archive | In the terminal where Lore runs |

For an automated installation, set it with the `LORE_SETUP_CODE` variable. A fixed code must have at least 12 characters, spaces and hyphens not counted: with a shorter one, Lore refuses to start until the setup is done, and its logs name the variable. An installation already set up starts as usual, since the code is no longer used.

Case, spaces and hyphens do not count. A fixed code never changes, and can be tried without limit until the setup is done. Choose one of at least 16 random characters, and do the setup right after starting Lore.

> [!WARNING]
> **A code that keeps changing.** A random code is replaced after 10 wrong codes. If it keeps changing, someone is trying codes, and yours changes before you can enter it. Close access to Lore’s port from outside for the time of the setup; otherwise, set with `LORE_SETUP_CODE` a code of at least 16 random characters, restart Lore and do the setup right away.

## The three steps

1. **Organization**
   Your organization’s name, Lore’s public address (shown and not editable when `LORE_PUBLIC_URL` sets it) and the default language of the interface. The public address is used in invitation and password reset links.
2. **Administrator account**
   Your name, your email and a password of at least 12 characters. This account becomes the owner of the organization.
3. **Done**
   Lore suggests inviting your team and reviewing security; the home page then also suggests checking the public address and setting up your account. See [First steps](first-steps.md).

[See this screen in the demo](https://lore.dada-core.com/en/demo/#/setup)

## If the screen does not appear

The screen only appears when no organization exists yet. After restoring a backup, sign in with an existing account.

> [!WARNING]
> **Wrong public address.** Invitation links would point to the wrong address. Fix the `LORE_PUBLIC_URL` variable, then restart Lore. See [Environment variables](variables.md).

---
title: "Initial setup"
description: "On first launch, Lore shows a setup screen. It only appears once."
---

## The setup code

The screen first asks for a code, so that nobody else sets Lore up in your place. Lore writes it to its logs every time it starts, until the setup is done:

| Method | Where to read it |
| --- | --- |
| Docker Compose | `docker compose logs lore` |
| Packages | `sudo journalctl -u lore` |
| Archive | In the terminal where Lore runs |

For an automated installation, set it with the `LORE_SETUP_CODE` variable.

## The three steps

1. **Organization**
   Your organization’s name, Lore’s public address and the default language of the interface. The public address is used in invitation and password reset links.
2. **Administrator account**
   Your name, your email and a password of at least 12 characters. This account becomes the owner of the organization.
3. **Done**
   Lore suggests inviting your team, adjusting security, checking the public address and setting up your account. See [First steps](first-steps.md).

[See this screen in the demo](https://lore.dada-core.com/en/demo/#/setup)

## If the screen does not appear

The screen only appears when no organization exists yet. After restoring a backup, sign in with an existing account.

> [!WARNING]
> **Wrong public address.** Invitation links would point to the wrong address. Fix the `LORE_PUBLIC_URL` variable, then restart Lore. See [Environment variables](variables.md).

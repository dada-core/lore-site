---
title: "Members and invitations"
description: "Owners and administrators invite members with a link, choose their role and can reset their password, without a mail server."
---

## Roles

| Role | What it allows |
| --- | --- |
| Owner | Everything, including granting or withdrawing the Owner role. The account created during the initial setup is an owner. |
| Administrator | Managing the organization: settings, members and invitations. |
| Member | Using Lore, without access to the administration. |

## Invite

1. **Create a link**
   Choose *Invite people* in the organization menu, at the top of the sidebar, or click *Invite* in *Administration › Members*, then choose the role. The person’s email address is optional: it reserves the link for that address, and it is required to bring a former member back with their account. Under *Spaces to join*, you can also choose spaces and a role in each: the person becomes a member of them on arrival. See [Roles and permissions](permissions.md).
2. **Send the link**
   By chat or by email. It works only once and is only shown when it is created. It expires after 7 days by default, a duration you can set from 1 hour to 30 days in *Administration › Security and sign-in*.
3. **The person creates their account**
   They enter their name, their email address (already filled in when the link is reserved to them) and their password, then arrive in Lore with the role chosen for them.

Unused invitations are listed under *Pending invitations*. Revoke a link that was lost or sent by mistake.

## Reset a password

In a member’s menu, *Generate a reset link* creates a single-use link, valid for 24 hours. A new link cancels the previous one. Send it through a safe channel. The operation is recorded in the audit log.

## Change a role, disable, remove

To change a member’s role, click their role in the *Role* column. A member’s menu also lets you:

- **disable their account**: the person can no longer sign in and their open sessions are closed. You can enable the account again at any time;
- **remove them from the organization**: they lose access to Lore, to their spaces and to the restricted documents they were chosen for; the documents they imported stay. To bring them back, invite them with the same email address.

An owner or an administrator who becomes a member, is disabled or is removed loses the invitations and reset links they created that are still pending: they are revoked, and their number is given in the details of the operation (`revokedLinks`, `details` column of the export), when there are any. Limit: the invitations and reset links created by an administrator demoted, disabled or removed before the [upgrade from the 0.1.0-beta.1 preview](upgrade.md#from-the-010-beta1-preview) stay valid until they expire, unless that person is later disabled or removed: revoke the pending invitations in *Administration › Members*; a reset link expires after 24 hours, or is cancelled by a new link created for the same person.

Good to know:

- **The person’s links.** Disabling or removing a member also cancels the pending reset links for their account, and no link is created for a disabled account.
- **Owners.** Only an owner acts on another owner, nobody disables or removes their own account, and the organization always keeps an active owner.
- **Link used.** Choosing a new password through a link closes the person’s other sessions and lifts the lockout of their address.
- **On the server.** `lore reset-password <email>` also creates a link, with *System* as the author in the log: see [Installation](installation.md).

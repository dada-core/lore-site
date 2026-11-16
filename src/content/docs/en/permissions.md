---
title: "Roles and permissions"
description: "Access is decided in the organization, then in each space. Lore applies it in every query: what you cannot see appears nowhere."
---

## Roles in the organization

| Role | Rights |
| --- | --- |
| Owner | Everything, including granting or withdrawing the Owner role. Access to every space, with the rights of a maintainer. |
| Administrator | Managing the organization: settings, members and invitations. Access to every space, with the rights of a maintainer. |
| Member | Creating spaces, and accessing the ones they belong to, according to their role in each. |

See [Members and invitations](members.md).

## Roles in a space

| Action | Reader | Contributor | Maintainer |
| --- | --- | --- | --- |
| See the space, its folders and its members | Yes | Yes | Yes |
| Create, rename and delete folders | No | Yes | Yes |
| Add members, change their role, remove them | No | No | Yes |
| Change the name, address, description and color | No | No | Yes |
| Archive, make active again and delete the space | No | No | Yes |
| See the space once archived | No | No | Yes |
| Leave the space | Yes | Yes | Yes, if another maintainer remains |

The *Members* page of each space shows what each role allows.

## Add members to a space

- **Someone already in the organization.** A maintainer of the space clicks *Add members*, searches for people by name or email address, ticks one or more, then chooses their role. Only active accounts are offered.
- **A new person.** Bringing someone into the organization is reserved for owners and administrators. Their invitation link can name *Spaces to join*, with a role for each: the person becomes a member on arrival. A space archived in the meantime is not joined.

On the *Members* page, a maintainer changes a member’s role by clicking it, and removes them with *Remove*. Anyone can also *Leave the space* from their own row. Removing someone from the organization removes them from all its spaces.

## A space always keeps a maintainer

The last maintainer of a space cannot be removed or given another role, and cannot leave it: appoint another maintainer first. A disabled account does not count as the maintainer who remains.

Disabling the account of the last maintainer, or removing them from the organization, remains possible: a security measure must not wait. The owners and administrators, who manage every space, then appoint a new maintainer.

## Not found rather than forbidden

A space you cannot see, or an archived space when you are not its maintainer and neither an owner nor an administrator of the organization, behaves like a space that does not exist: *This page cannot be found*. In a space you can see, an action your role does not allow is refused with a message that explains it.

> [!WARNING]
> **The name and address of a space are not secret.** An address is unique within the organization: someone who tries to take the address of a space they cannot see learns that it is in use, without seeing anything else. For a confidential subject, pick a neutral name. See [The address](spaces.md#the-address).

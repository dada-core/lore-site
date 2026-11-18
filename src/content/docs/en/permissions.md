---
title: "Roles and permissions"
description: "Access is decided in the organization, then in each space. Lore applies it in every query: what you cannot see appears nowhere."
---

## Roles in the organization

| Role | Rights |
| --- | --- |
| Owner | Everything, including granting or withdrawing the Owner role. Access to every space, with the rights of a maintainer. |
| Administrator | Managing the organization: settings, members and invitations; reading and exporting the audit log. Access to every space, with the rights of a maintainer. |
| Member | Creating spaces, and accessing the ones they belong to, according to their role in each. |

See [Members and invitations](members.md).

## Roles in a space

| Action | Reader | Contributor | Maintainer |
| --- | --- | --- | --- |
| See the space, its folders and its members | Yes | Yes | Yes |
| See the documents open to the whole space | Yes | Yes | Yes |
| See a restricted document | If they are among the people chosen, or the document’s owner | If they are among the people chosen, or the document’s owner | Yes |
| Read and download the documents they see | Yes | Yes | Yes |
| Search the documents they see | Yes | Yes | Yes |
| Import documents | No | Yes | Yes |
| Change the title, description and category of a document, move it from one folder to another | No | Yes | Yes |
| Change the language of a document | No | Yes | Yes |
| Import a new version of a document | No | Yes | Yes |
| Change the status of a document: Draft, Published, Outdated | No | Yes | Yes |
| Archive a document, or take it out of Archived | No | No | Yes |
| See an archived document | No | No | Yes |
| Retry a failed extraction | No | Yes | Yes |
| Restrict a document, or open it to the whole space again | No | The ones they own | Yes |
| Change the owner of a document | No | The ones they own | Yes |
| Delete a document | No | The ones they imported, as long as they have a single version | Yes |
| Create and rename folders, delete an empty folder | No | Yes | Yes |
| Add members, change their role, remove them | No | No | Yes |
| Change the name, address, description and color | No | No | Yes |
| Archive, make active again and delete the space | No | No | Yes |
| See the space once archived | No | No | Yes |
| Leave the space | Yes | Yes | Yes, if another maintainer remains |

The *Members* page of each space shows what each role allows. In an archived space, nothing can be changed any more: not its members, its folders or its documents. Search only shows its documents to those who still see the space, and only if they ask for them.

## Archived documents

An archived document is only seen by the maintainers of its space, and by the owners and administrators of the organization, as an archived space is. For everyone else, its owner included if they are only a contributor, it appears nowhere and answers as a document that does not exist. Those who see it do not find it in the lists, the counts or the palette either: they show it apart, in the Archived column of the board, at the bottom of the grid or with the Archived status of search.

An archived document is read only: no new version, no title, description, category, language, folder, access or owner. Only its status and its deletion remain possible.

The owner of a document is first the person who imported it. The space’s maintainers, and the document’s owner if they are at least a contributor, can hand it over to another active member of the space who has at least the Contributor role. A document whose owner left the organization can only be taken over by a maintainer of the space.

## Add members to a space

- **Someone already in the organization.** A maintainer of the space clicks *Add members*, searches for people by name or email address, ticks one or more, then chooses their role. Only active accounts are offered.
- **A new person.** Bringing someone into the organization is reserved for owners and administrators. Their invitation link can name *Spaces to join*, with a role for each: the person becomes a member on arrival. A space archived in the meantime is not joined.

On the *Members* page, a maintainer changes a member’s role by clicking it, and removes them with *Remove*. Anyone can also *Leave the space* from their own row. Removing someone from the organization removes them from all its spaces.

## A space always keeps a maintainer

The last maintainer of a space cannot be removed or given another role, and cannot leave it: appoint another maintainer first. A disabled account does not count as the maintainer who remains.

Disabling the account of the last maintainer, or removing them from the organization, remains possible: a security measure must not wait. The owners and administrators, who manage every space, then appoint a new maintainer.

## Restricted documents

A restricted document is only visible to:

- the people chosen, all members of the space;
- the space’s maintainers;
- the document’s owner, who therefore does not lose access to what they have just restricted;
- the organization’s owners and administrators.

For everyone else, it appears nowhere: not in the list of documents, not in the number of documents of a space or a folder, not in the search results, their number or their excerpts, not as a duplicate reported at import. Opened from its address, it behaves like a document that does not exist.

- **At import.** In the import window, tick *Restrict access to some people*: the list of the space’s members opens, with the maintainers and yourself already ticked. The documents are restricted as soon as they are created: they are never visible to the others, not even for a moment. See [Importing documents](import.md#import).
- **Later.** From the document, in *Document access*, you restrict it, change the people chosen, or open it to the whole space again, which removes the people chosen. This is reserved for the space’s maintainers and the document’s owner, if they are at least a contributor.
- **Only members of the space** can be chosen. Removing someone from the space, or from the organization, removes their access to its restricted documents; adding them to the space again does not give it back: they must be chosen again.
- **Changing the owner** of a restricted document lets the new owner see it. The former owner no longer sees it, unless they are among the people chosen, a maintainer of the space, or an owner or administrator of the organization.
- **Being chosen gives read access.** What a person can do with a restricted document depends on their role in the space: a reader who is chosen can read it and download its original, not change it. See [Reading a document](reader.md).

On the space’s *Members* page, its maintainers find the list of its restricted documents.

> [!WARNING]
> **Known limits.** A restricted document shows nothing of itself, but two clues remain visible to the other members of the space:
>
> - a folder that only holds restricted documents they cannot see cannot be deleted: they learn that it is not empty;
> - the last activity of the space takes all its documents into account: importing a restricted document updates it.
>
> Neither the title, the number nor the content of these documents appears. To leave no clue at all, keep these documents in a dedicated space, with chosen members, under a neutral name.

## Not found rather than forbidden

A space you cannot see, or an archived space when you are not its maintainer and neither an owner nor an administrator of the organization, behaves like a space that does not exist: *This page cannot be found*. The same goes for a document you cannot see. In a space you can see, an action your role does not allow is refused with a message that explains it.

> [!WARNING]
> **The name and address of a space are not secret.** An address is unique within the organization: someone who tries to take the address of a space they cannot see learns that it is in use, without seeing anything else. For a confidential subject, pick a neutral name. See [The address](spaces.md#the-address).

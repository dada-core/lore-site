---
title: "Membres et invitations"
description: "Les propriétaires et les administrateurs invitent les membres par un lien, choisissent leur rôle et peuvent réinitialiser leur mot de passe, sans serveur de messagerie."
---

## Rôles

| Rôle | Ce qu’il permet |
| --- | --- |
| Propriétaire | Tout, y compris attribuer ou retirer le rôle Propriétaire. Le compte créé à la configuration initiale est propriétaire. |
| Administrateur | Gérer l’organisation : réglages, membres et invitations. |
| Membre | Utiliser Lore, sans accès à l’administration. |

## Inviter

1. **Créer un lien**
   Choisissez *Inviter des personnes* dans le menu de l’organisation, en haut de la barre latérale, ou cliquez sur *Inviter* dans *Administration › Membres*, puis choisissez le rôle. L’adresse e-mail de la personne est facultative : elle réserve le lien à cette adresse, et elle est indispensable pour faire revenir un ancien membre avec son compte. Sous *Espaces à rejoindre*, choisissez aussi, si besoin, des espaces et un rôle dans chacun : la personne en devient membre dès son arrivée. Voir [Rôles et permissions](permissions.md).
2. **Transmettre le lien**
   Par messagerie ou par e-mail. Il ne sert qu’une fois et n’est affiché qu’à sa création. Il expire au bout de 7 jours par défaut, une durée réglable de 1 heure à 30 jours dans *Administration › Sécurité et connexion*.
3. **La personne crée son compte**
   Elle indique son nom, son adresse e-mail (déjà remplie si le lien lui est réservé) et son mot de passe, puis arrive dans Lore avec le rôle prévu.

Les invitations non utilisées apparaissent sous *Invitations en attente*. Révoquez un lien perdu ou envoyé par erreur.

## Réinitialiser un mot de passe

Dans le menu d’un membre, *Générer un lien de réinitialisation* crée un lien valable 24 heures, à usage unique. Un nouveau lien annule le précédent. Transmettez-le par un canal sûr. L’opération est inscrite au journal d’audit.

## Changer un rôle, désactiver, retirer

Pour changer le rôle d’un membre, cliquez sur son rôle, dans la colonne *Rôle*. Le menu d’un membre permet aussi de :

- **désactiver son compte** : la personne ne peut plus se connecter et ses sessions ouvertes sont fermées. Vous pouvez réactiver le compte à tout moment ;
- **la retirer de l’organisation** : elle perd l’accès à Lore, à ses espaces et aux documents restreints pour lesquels elle était choisie ; les documents qu’elle a importés restent. Pour la faire revenir, invitez-la avec la même adresse e-mail.

Un propriétaire ou un administrateur qui devient membre, est désactivé ou est retiré perd les invitations et les liens de réinitialisation qu’il a créés et qui sont encore en attente : ils sont révoqués, et leur nombre figure dans le détail de l’opération (`revokedLinks`, colonne `details` de l’export), quand il y en a. Limite : les invitations et les liens de réinitialisation créés par un administrateur rétrogradé, désactivé ou retiré avant la [mise à jour depuis la préversion 0.1.0-beta.1](upgrade.md#depuis-la-préversion-010-beta1) restent valables jusqu’à leur expiration, sauf si cette personne est ensuite désactivée ou retirée : révoquez les invitations en attente dans *Administration › Membres* ; un lien de réinitialisation expire au bout de 24 heures, ou est annulé par un nouveau lien créé pour la même personne.

À savoir :

- **Liens de la personne.** Désactiver ou retirer un membre annule aussi les liens de réinitialisation en attente pour son compte, et aucun lien ne se crée pour un compte désactivé.
- **Propriétaires.** Seul un propriétaire agit sur un autre propriétaire, personne ne désactive ni ne retire son propre compte, et l’organisation garde toujours un propriétaire actif.
- **Lien utilisé.** Choisir un nouveau mot de passe par un lien ferme les autres sessions de la personne et lève le blocage de son adresse.
- **Sur le serveur.** `lore reset-password <e-mail>` crée aussi un lien, avec *Système* comme auteur au journal : voir [Installation](installation.md).

---
title: "Contribuer au projet"
description: "Lore est open source. Retours, tickets, code, documentation et traductions sont les bienvenus."
---

## Avant de commencer

- Lisez le [code de conduite](https://github.com/dada-core/lore/blob/main/CODE_OF_CONDUCT.md) et le [guide de contribution](https://github.com/dada-core/lore/blob/main/CONTRIBUTING.md).
- Pour une modification importante, ouvrez d’abord un ticket pour en discuter.
- Les tickets et les discussions peuvent être rédigés en français ou en anglais ; le code et les messages de commit sont en anglais.

## Accord de contribution

Avant votre première contribution, vous signerez un accord de contribution (CLA), inspiré de celui de la fondation Apache ; son texte sera publié avant la première contribution externe. Vous resterez propriétaire de votre code ; l’accord permettra au projet de le distribuer aussi sous d’autres licences, ce qui finance son développement.

## Proposer une modification

1. **Créer une branche**
   À partir de `main`, dans votre copie du dépôt.
2. **Ajouter des tests**
   Toute modification des droits d’accès doit être couverte par des tests qui vérifient qui peut voir quoi.
3. **Ouvrir une demande de fusion**
   Décrivez le problème résolu et la façon de vérifier la modification.

## Améliorer la documentation

Chaque page se modifie depuis GitHub, avec le lien *Modifier cette page sur GitHub* en bas de page. La documentation vit avec le site, dans le dépôt [dada-core/lore-site](https://github.com/dada-core/lore-site) : des fichiers Markdown rangés dans `src/content/docs/`, `fr/` pour le français, `en/` pour l’anglais, un fichier par page et par langue. Les demandes de fusion visent la branche `develop`.

Modifiez de préférence les deux langues. Si vous n’en maîtrisez qu’une, indiquez-le dans la demande de fusion : la traduction sera faite avant la publication.

## Signaler une vulnérabilité

En privé uniquement, jamais dans un ticket public. Voir [Sécurité et connexion](security.md#signaler-une-vulnérabilité).

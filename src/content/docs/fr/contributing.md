---
title: "Contribuer au projet"
description: "Lore est open source. Retours, tickets, code, documentation et traductions sont les bienvenus."
---

## Avant de commencer

- Lisez le [code de conduite](https://github.com/dada-core/lore/blob/main/CODE_OF_CONDUCT.md) et le [guide de contribution](https://github.com/dada-core/lore/blob/main/CONTRIBUTING.md).
- Pour une modification importante, ouvrez d’abord un ticket pour en discuter.
- Les tickets et les discussions peuvent être rédigés en français ou en anglais ; le code et les messages de commit sont en anglais.

## Certificat d’origine

Lore ne demande aucun accord de contribution. Chaque commit est signé selon le [Developer Certificate of Origin](https://developercertificate.org/) : la ligne `Signed-off-by`, ajoutée par `git commit -s`, certifie que vous avez écrit la modification, ou que vous avez le droit de la proposer sous la licence du projet. Vous restez propriétaire de votre code, publié sous AGPL-3.0 comme le reste de Lore.

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

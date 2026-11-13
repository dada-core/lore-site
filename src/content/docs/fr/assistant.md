---
title: "Assistant"
description: "L’assistant répond en langage naturel à partir des documents auxquels vous avez accès, et cite toujours ses sources. Il est facultatif et désactivé par défaut."
release: v0.3
---

## Activer l’assistant

Un administrateur l’active dans *Administration › Assistant* et choisit le modèle de langage : un serveur hébergé par l’organisation, ou un fournisseur externe. Le reste de Lore fonctionne de la même façon, assistant activé ou non.

## Comment une réponse est construite

1. **Recherche**
   La question est transformée en recherche, avec vos droits : seuls les passages que vous pouvez lire sont retenus.
2. **Sélection**
   Les passages des documents obsolètes sont écartés.
3. **Rédaction**
   Le modèle rédige une réponse à partir de ces passages uniquement.
4. **Citations**
   Chaque affirmation renvoie au document, à la version et au passage utilisés.

## Quand il ne répond pas

Si les documents disponibles ne permettent pas de répondre de façon fiable, l’assistant le dit et propose les documents les plus proches, plutôt que d’inventer une procédure. Vous pouvez alors signaler une lacune documentaire.

## Confidentialité

> [!NOTE]
> **Ce qui est transmis au modèle.** Uniquement la question et les passages autorisés pour la personne qui la pose. Jamais les documents entiers, jamais ceux des autres.

Les conversations sont conservées 90 jours par défaut ; un administrateur peut réduire cette durée ou désactiver l’historique.

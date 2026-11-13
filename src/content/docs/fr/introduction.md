---
title: "Qu’est-ce que Lore ?"
description: "Lore est un environnement open source où les équipes techniques rassemblent, recherchent et entretiennent leur documentation : runbooks, procédures, documents d’architecture et rapports d’incident."
---

## Ce que fait Lore

- **Bibliothèque** <span class="vb">v0.1</span> : des espaces par équipe ou par domaine, des dossiers, et des documents importés en PDF, Word, texte ou Markdown.
- **Recherche** <span class="vb">v0.1</span> : une recherche plein texte qui retrouve les identifiants techniques tels quels et ouvre chaque document au bon passage.
- **Versions et statuts** <span class="vb">v0.1</span> : chaque import crée une version ; chaque document a un statut et un responsable.
- **Permissions** <span class="vb">v0.1</span> : des rôles par espace et des documents restreints, appliqués partout, y compris dans la recherche.
- **Base de connaissances** <span class="vb">v0.2</span> : des fiches problème et solution, validées par les responsables.
- **Assistant** <span class="vb">v0.3</span> : des réponses en langage naturel, sourcées et facultatives.

## Où en est Lore

Lore prépare sa version 0.1. Aujourd’hui, l’application fait la configuration initiale, la connexion, les invitations, la réinitialisation des mots de passe, *Mon compte* et l’administration de l’organisation : membres, rôles et réglages de sécurité. La bibliothèque, la recherche, les versions et les permissions sur les documents arrivent avec la version 0.1.

## Ce que Lore n’est pas

Lore n’est pas un chatbot. L’assistant est un module facultatif, désactivé par défaut : la bibliothèque, la recherche, les versions et les permissions fonctionneront entièrement sans intelligence artificielle.

## Principes

| Principe | Ce que cela signifie |
| --- | --- |
| Les permissions d’abord | Personne ne voit le contenu d’un document auquel il n’a pas accès : ni dans les listes, ni dans les résultats, ni dans les extraits, ni par l’assistant. |
| Sourcé et vérifiable | Chaque résultat renvoie au document, à la version et au passage d’origine. |
| Fonctionne sans IA | L’assistant est un module que chaque organisation active ou non. |
| Facile à héberger | Lore et PostgreSQL, rien d’autre : avec Docker, un paquet .deb ou .rpm, ou une archive, en moins de cinq minutes. |

## Par où commencer

- [Installation](installation.md) : installer Lore avec Docker, un paquet ou l’archive.
- [Premiers pas](first-steps.md) : inviter votre équipe, régler la sécurité et votre compte.
- [Membres et invitations](members.md) : rôles, invitations et réinitialisation des mots de passe.
- [Variables d’environnement](variables.md) : toutes les options de configuration.

Pour voir l’application sans rien installer, ouvrez la [démo](https://lore.dada-core.com/demo/#/), qui contient des données fictives.

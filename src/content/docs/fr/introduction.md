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

Lore prépare sa version 0.1. Aujourd’hui, l’application fait la configuration initiale, la connexion, les invitations, la réinitialisation des mots de passe, *Mon compte* et l’administration de l’organisation : membres et rôles, réglages de sécurité, stockage et import. Elle gère aussi les espaces, leurs dossiers et leurs rôles, l’import de documents PDF, Word, Markdown et texte, avec l’extraction de leur texte et des documents restreints à quelques personnes, leur lecture (contenu mis en forme, PDF affichés dans la page, liens vers une section ou une page), la recherche dans leur texte, filtrée par les droits, les versions de chaque document et leurs statuts, et le journal d’audit de l’organisation. Une préversion, 0.1.0-beta.1, contient toutes ces fonctions : voir les [notes de version](release-notes.md).

## Ce que Lore n’est pas

Lore n’est pas un chatbot. L’assistant est un module facultatif, désactivé par défaut : la bibliothèque, la recherche, les versions et les permissions fonctionnent entièrement sans intelligence artificielle.

## Principes

| Principe | Ce que cela signifie |
| --- | --- |
| Les permissions d’abord | Personne ne voit le contenu d’un document auquel il n’a pas accès : ni dans les listes, ni dans les résultats, ni dans les extraits, ni par l’assistant. |
| Sourcé et vérifiable | Chaque résultat renvoie au document, à la version et au passage d’origine. |
| Fonctionne sans IA | L’assistant est un module que chaque organisation active ou non. |
| Facile à héberger | Lore et PostgreSQL, rien d’autre. Avec Docker Compose, Lore s’installe en moins de cinq minutes. Il existe aussi en paquet .deb ou .rpm et en archive. |

## Accessibilité

Lore vise les WCAG 2.2, niveau AA.

- **Vérifications automatiques.** À chaque modification du code, neuf parcours de bout en bout tournent dans Chromium, et ceux de lecture, de recherche, de clavier et de téléphone aussi dans Firefox et WebKit. Chaque écran de la version 0.1, une cinquantaine avec les fenêtres, passe l’audit automatique axe, sans aucune violation, en thème clair, en thème sombre et sur un écran de 375 px. Les fenêtres principales se pilotent au clavier seul.
- **Vérification manuelle.** Un passage avec un lecteur d’écran, NVDA et Firefox sous Windows, aura lieu avant la version 0.1.0.
- **Limites.** Les pages numérisées d’un PDF ne sont que des images, et un PDF affiché dans la page offre son texte, pas sa structure (titres, tableaux). Une vue texte des PDF viendra après la version 0.1.

Les navigateurs pris en charge sont indiqués dans [Installation](installation.md#choisir-une-méthode).

## Par où commencer

- [Installation](installation.md) : installer Lore avec Docker, un paquet ou l’archive.
- [Premiers pas](first-steps.md) : inviter votre équipe, régler la sécurité et votre compte.
- [Membres et invitations](members.md) : rôles, invitations et réinitialisation des mots de passe.
- [Variables d’environnement](variables.md) : toutes les options de configuration.

Pour voir l’application sans rien installer, ouvrez la [démo](https://lore.dada-core.com/demo/#/), qui contient des données fictives.

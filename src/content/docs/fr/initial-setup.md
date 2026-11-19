---
title: "Configuration initiale"
description: "Au premier lancement, Lore affiche un écran de configuration. Il n’apparaît qu’une seule fois."
---

## Le code de configuration

L’écran demande d’abord un code, pour que personne d’autre ne configure Lore à votre place. Tant que la configuration n’est pas faite, Lore tire un nouveau code à chaque démarrage et l’écrit dans ses journaux : après un redémarrage, prenez le dernier.

| Méthode | Où le lire |
| --- | --- |
| Docker Compose | `docker compose logs lore` |
| Paquets | `sudo journalctl -u lore` |
| Archive | Dans le terminal où Lore tourne |

Pour une installation automatisée, fixez-le avec la variable `LORE_SETUP_CODE`. Un code fixé doit compter au moins 12 caractères, espaces et tirets non comptés : avec un code plus court, Lore refuse de démarrer tant que la configuration n’est pas faite, et ses journaux nomment la variable. Une installation déjà configurée démarre normalement : le code ne sert plus.

La casse, les espaces et les tirets ne comptent pas. Un code fixé ne change jamais, et peut être essayé sans limite tant que la configuration n’est pas faite. Choisissez-en un d’au moins 16 caractères tirés au hasard, et faites la configuration aussitôt après le démarrage.

> [!WARNING]
> **Un code qui change sans cesse.** Un code tiré au hasard est remplacé après 10 codes faux. S’il change sans cesse, quelqu’un essaie des codes, et le vôtre change avant que vous ne le saisissiez. Fermez l’accès au port de Lore depuis l’extérieur le temps de la configuration ; sinon, fixez avec `LORE_SETUP_CODE` un code d’au moins 16 caractères tirés au hasard, redémarrez Lore et faites la configuration aussitôt.

## Les trois étapes

1. **Organisation**
   Le nom de votre organisation, l’adresse publique de Lore (affichée sans pouvoir être modifiée quand `LORE_PUBLIC_URL` la fixe) et la langue par défaut de l’interface. L’adresse publique sert dans les liens d’invitation et de réinitialisation.
2. **Compte administrateur**
   Votre nom, votre e-mail et un mot de passe de 12 caractères au moins. Ce compte devient propriétaire de l’organisation.
3. **Terminé**
   Lore propose d’inviter votre équipe et de régler la sécurité ; l’accueil propose ensuite aussi de vérifier l’adresse publique et de régler votre compte. Voir [Premiers pas](first-steps.md).

[Voir cet écran dans la démo](https://lore.dada-core.com/demo/#/setup)

## Si l’écran ne s’affiche pas

L’écran n’apparaît que si aucune organisation n’existe encore. Après la restauration d’une sauvegarde, connectez-vous avec un compte existant.

> [!WARNING]
> **Adresse publique incorrecte.** Les liens d’invitation utiliseraient une mauvaise adresse. Corrigez la variable `LORE_PUBLIC_URL`, puis redémarrez Lore. Voir [Variables d’environnement](variables.md).

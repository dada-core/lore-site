---
title: "Configuration initiale"
description: "Au premier lancement, Lore affiche un écran de configuration. Il n’apparaît qu’une seule fois."
---

## Le code de configuration

L’écran demande d’abord un code, pour que personne d’autre ne configure Lore à votre place. Lore l’écrit dans ses journaux à chaque démarrage, tant que la configuration n’est pas faite :

| Méthode | Où le lire |
| --- | --- |
| Docker Compose | `docker compose logs lore` |
| Paquets | `sudo journalctl -u lore` |
| Archive | Dans le terminal où Lore tourne |

Pour une installation automatisée, fixez-le avec la variable `LORE_SETUP_CODE`.

## Les trois étapes

1. **Organisation**
   Le nom de votre organisation, l’adresse publique de Lore et la langue par défaut de l’interface. L’adresse publique sert dans les liens d’invitation et de réinitialisation.
2. **Compte administrateur**
   Votre nom, votre e-mail et un mot de passe de 12 caractères au moins. Ce compte devient propriétaire de l’organisation.
3. **Terminé**
   Lore propose d’inviter votre équipe, de régler la sécurité, de vérifier l’adresse publique et de régler votre compte. Voir [Premiers pas](first-steps.md).

[Voir cet écran dans la démo](https://lore.dada-core.com/demo/#/setup)

## Si l’écran ne s’affiche pas

L’écran n’apparaît que si aucune organisation n’existe encore. Après la restauration d’une sauvegarde, connectez-vous avec un compte existant.

> [!WARNING]
> **Adresse publique incorrecte.** Les liens d’invitation utiliseraient une mauvaise adresse. Corrigez la variable `LORE_PUBLIC_URL`, puis redémarrez Lore. Voir [Variables d’environnement](variables.md).

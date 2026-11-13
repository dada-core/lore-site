---
title: "Stockage et extraction"
description: "Où sont rangés les fichiers, comment leur texte est extrait, et comment ajouter un extracteur externe."
---

## Fichiers

Les fichiers importés sont rangés dans le volume `/var/lib/lore/files`, nommés d’après leur empreinte. Un même fichier importé deux fois dans une organisation n’est stocké qu’une fois.

## Taille et quotas

50 Mo par fichier par défaut. Aucun quota : le volume stocké par organisation est affiché dans *Administration › Stockage et import*.

## Extraction du texte

L’extraction est assurée par Apache Tika, dans un processus séparé de l’application : un fichier piégé ou trop lourd fait échouer son extraction, sans jamais faire tomber Lore. Chaque extraction est limitée en durée et en taille de texte.

## Extracteur externe

Pour la reconnaissance de texte (OCR) ou les PDF à mise en page complexe, vous pouvez brancher un service d’extraction externe, dans un conteneur à part. Indiquez son adresse dans `LORE_EXTERNAL_EXTRACTOR_URL`.

> [!WARNING]
> **Licence de l’extracteur.** Lore n’inclut que des composants sous licence libre utilisables par tous. La licence d’un extracteur externe relève de votre organisation : certains modèles d’OCR interdisent par exemple l’usage commercial au-delà d’un certain chiffre d’affaires.

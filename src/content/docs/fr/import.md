---
title: "Importer des documents"
description: "Lore importe les fichiers PDF, Word, texte et Markdown, en extrait le texte et le découpe en passages pour la recherche."
---

## Formats pris en charge

| Format | Ce qui est extrait | Découpage |
| --- | --- | --- |
| PDF | Le texte de chaque page | Par page |
| Word (DOCX) | Le texte et les titres | Par titre |
| Markdown | Le texte et les titres | Par titre |
| Texte | Le texte | Par taille |

Le découpage permet d’ouvrir un document directement à la page ou au titre trouvé.

## Importer

1. **Ouvrir la fenêtre d’import**
   Bouton *Importer*, ou touche <kbd>I</kbd>.
2. **Choisir la destination**
   L’espace, le dossier, le statut initial et la catégorie.
3. **Déposer les fichiers**
   Ils sont importés dès leur dépôt ; l’extraction se poursuit en arrière-plan.

## Taille maximale

50 Mo par fichier par défaut. Un administrateur peut modifier cette limite dans *Administration › Stockage et import*, ou avec la variable `LORE_MAX_UPLOAD_SIZE`.

## États de l’extraction

| État | Signification | Que faire |
| --- | --- | --- |
| Indexé | Le texte est extrait et cherchable. | Rien. |
| En cours | L’extraction se poursuit. | Patienter quelques secondes. |
| Numérisé | Le PDF ne contient que des images : seuls le titre et les métadonnées sont cherchables. | Ajouter une description, ou brancher un extracteur avec reconnaissance de texte. |
| Non importé | Le fichier dépasse la taille maximale. | Réduire le fichier, ou demander à relever la limite. |
| Échec | Fichier protégé par un mot de passe, ou illisible. | Retirer la protection, puis importer une nouvelle version. |

> [!NOTE]
> **Documents numérisés.** La reconnaissance de texte (OCR) n’est pas incluse dans la version 0.1. Voir [Stockage et extraction](storage.md).

## Importer une nouvelle version

Depuis un document, choisissez *Nouvelle version* et décrivez ce qui change. La version précédente reste consultable dans l’historique. Voir [Versions et statuts](versions.md).

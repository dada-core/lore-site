---
title: "Journal d’audit"
description: "Le journal d’audit trace les opérations sensibles de toute l’organisation. Les propriétaires et les administrateurs le consultent et l’exportent en CSV."
---

## Ce qui est tracé

Chaque opération appartient à une catégorie, celle du filtre de l’écran :

| Catégorie | Opérations |
| --- | --- |
| Consultation | Ouverture d’un document, ou d’une ancienne version, avec son numéro : une fois par heure au plus pour une même personne et un même document |
| Téléchargement | Téléchargement d’un original ou d’une ancienne version, avec son numéro, le nom et la taille du fichier |
| Import | Nouveau document, avec le nom et la taille de son fichier, son espace, son dossier et s’il est restreint ; nouvelle version, avec son numéro et celui de la version actuelle à son import, le nom et la taille du fichier, et le statut demandé |
| Statut | Changement de statut d’un document, avec l’ancien, le nouveau et, pour un document obsolète, le titre de son remplaçant |
| Modification | Titre, description, catégorie ou langue d’un document modifiés, avec les champs changés ; déplacement d’un dossier à l’autre |
| Suppression | Suppression définitive d’un document, avec son nombre de versions |
| Droits | Restriction d’un document ou retour à tout l’espace, personnes choisies ajoutées ou retirées ; changement du responsable d’un document, avec l’ancien et le nouveau ; changement de rôle, dans l’organisation ou dans un espace |
| Membres | Invitation créée ou révoquée ; arrivée, départ, désactivation et réactivation d’un compte ; lien de réinitialisation ; membre ajouté à un espace ou retiré |
| Connexion | Échec de connexion, blocage d’un compte ; changement de mot de passe ou d’adresse e-mail ; nouveau mot de passe choisi par un lien de réinitialisation |
| Organisation | Création, modification, archivage, réactivation ou suppression d’un espace, avec son nombre de documents ; création, renommage ou suppression d’un dossier ; changement d’un réglage, comme la taille maximale d’un fichier ; export du journal |
| Autre | Une opération qu’aucune autre catégorie ne classe |

Un changement de langue garde l’ancienne : dans l’événement `document.updated`, `changes` contient `language`, et `previousLanguage` donne l’ancienne langue. Ce qui change, écrit avec une nouvelle version, n’est pas repris dans le journal : il reste dans l’historique du document. L’extraction du texte n’est pas inscrite.

Les recherches ne sont jamais inscrites, ni dans ce journal, ni dans les journaux du serveur. Ouvrir un document depuis un résultat est une consultation, inscrite comme les autres. Voir [Rechercher](search.md#confidentialité).

Une page rouverte ou rechargée dans l’heure n’ajoute pas de consultation, et un document que la personne ne peut pas voir n’en inscrit jamais. Chaque téléchargement est inscrit ; la reprise d’un téléchargement interrompu ne l’est pas, ni la lecture d’un PDF dans la page ou dans un nouvel onglet, qui fait partie de la consultation.

Les consultations et les téléchargements ne s’affichent jamais sur le document : son *Activité* dit ce qui y a été changé, pas qui l’a lu. Chacun ne retrouve que ses propres consultations, dans *Reprendre*, sur son accueil.

Chaque événement garde le titre du document et le nom de son espace au moment de l’action : il reste lisible après une suppression.

## Consulter

*Administration › Journal d’audit*, réservé aux propriétaires et aux administrateurs, montre les opérations de toute l’organisation, la plus récente en haut, 50 à la fois, puis *Afficher plus*. La palette y mène aussi : *Aller à › Journal d’audit*.

| Colonne | Contenu |
| --- | --- |
| Date | Le jour et l’heure de l’opération |
| Personne | Qui a agi, nommé même après son départ de l’organisation ; *Système* pour une opération sans auteur, comme un échec de connexion |
| Catégorie | La catégorie de l’opération |
| Opération | Une phrase, comme « A importé la version 5 de « Plan de reprise d’activité 2026 » » ou « A changé le statut de « … » : Obsolète » |
| Adresse IP | Affichée seulement en cochant *Afficher l’adresse IP* |

Trois filtres réduisent la liste, et l’adresse de la page les garde :

- **Catégorie** : une des catégories ci-dessus, ou toutes.
- **Personne** : un membre de l’organisation, *Système*, ou tout le monde.
- **Période** : les 7 derniers jours, par défaut, les 30 derniers jours ou les 12 derniers mois.

Quand rien ne correspond : « Aucune opération avec ces filtres. »

[Voir dans la démo](https://lore.dada-core.com/demo/#/admin/audit)

## Exporter

*Exporter en CSV* télécharge toutes les opérations que retiennent les filtres, pas seulement les 50 affichées, dans un fichier comme `lore-audit-2026-11-18.csv`. La page reste ouverte pendant le téléchargement.

| Colonne | Contenu |
| --- | --- |
| `occurred_at` | La date et l’heure, en UTC, au format ISO 8601 |
| `actor_id`, `actor_name`, `actor_email` | Qui a agi ; vides pour une opération sans auteur |
| `action` | L’opération, comme `document.version_imported` |
| `category` | Sa catégorie, comme `import` |
| `resource_type`, `resource_id` | Ce sur quoi elle porte, comme un document et son identifiant |
| `title`, `space` | Le titre du document et le nom de son espace au moment de l’opération |
| `ip` | L’adresse IP |
| `details` | Le détail de l’opération, en JSON |

- **Format.** UTF-8 avec BOM, pour qu’un tableur reconnaisse les accents ; virgules, guillemets et fins de ligne selon la RFC 4180.
- **Formules neutralisées.** Une valeur qui commence par `=`, `+`, `-` ou `@` est précédée d’une apostrophe : ouvert dans un tableur, le fichier n’exécute aucune formule, même si le titre d’un document a été écrit pour cela. Une valeur qui contient un point-virgule est mise entre guillemets : un tableur réglé en français, qui coupe les cellules aux points-virgules, la garde entière.
- **Une à la fois.** Le fichier est écrit au fil de la lecture du journal. Une seconde exportation lancée par la même personne avant la fin de la première est refusée.
- **Inscrit au journal.** Chaque export est lui-même une opération, `audit.exported`, avec ses filtres et son nombre de lignes, dans la catégorie Organisation.

L’export passe aussi par l’API : voir [API des documents](api-documents.md).

## Conservation

Les événements sont conservés un an : chaque nuit, Lore efface ceux qui sont plus anciens. Si plusieurs instances de Lore partagent la même base, une seule s’en charge. Un fichier exporté échappe à cette règle : conservez-le avec le même soin.

## Données personnelles

Le journal dit qui a ouvert, téléchargé ou modifié quel document, et quand, avec l’adresse IP : ce sont des données personnelles. Elles servent à la sécurité, par exemple pour savoir qui a eu accès à un document. Seuls les propriétaires et les administrateurs de l’organisation les consultent et les exportent, et elles sont effacées au bout d’un an. Informez-en les membres de votre organisation.

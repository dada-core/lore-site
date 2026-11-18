---
title: "Sécurité et connexion"
description: "Comptes, sessions, connexion, lecture des documents et recherche : les réglages par défaut, ce que vous pouvez ajuster, et ce que Lore protège."
---

## Mots de passe

Les mots de passe sont hachés avec Argon2id. Longueur minimale : 12 caractères, modifiable dans *Administration › Sécurité et connexion*.

## Tentatives de connexion

Par défaut, après 5 échecs, la connexion est bloquée 15 minutes. Les échecs sont comptés pour chaque couple adresse e-mail et adresse IP ; une adresse e-mail est aussi bloquée, quelle que soit l’adresse IP, après quatre fois plus d’échecs. Le nombre d’échecs et la durée du blocage se règlent dans *Administration › Sécurité et connexion*. Les échecs et les blocages sont inscrits au journal d’audit, consultable dans l’administration à partir de la v0.1.

## Sessions

| Réglage | Valeur par défaut |
| --- | --- |
| Stockage | Côté serveur, dans PostgreSQL |
| Cookie | `HttpOnly`, `SameSite=Lax`, et `Secure` quand l’adresse publique est en HTTPS |
| Expiration après inactivité | 8 heures, réglable dans *Administration › Sécurité et connexion*, sans dépasser `LORE_SESSION_TIMEOUT` |
| Protection CSRF | Activée |

Chaque personne voit ses sessions ouvertes dans *Mon compte*, et peut les fermer une à une, ou toutes les autres à la fois.

## Lecture des documents

Un fichier importé peut être piégé : Lore ne l’exécute jamais, et ne le sert jamais comme une page.

- **Rendu nettoyé.** Un document Markdown, Word ou texte s’affiche à partir d’un rendu HTML produit par le processus d’extraction, qui n’écrit qu’une liste fermée d’éléments de mise en forme. Lore ne s’y fie pas : il nettoie de nouveau ce rendu, avec OWASP Java HTML Sanitizer, avant de l’enregistrer. Ni script, ni style, ni gestionnaire d’événement, ni cadre, formulaire, image ou SVG ne passent ; les liens ne gardent que `http`, `https` et `mailto`, et les seuls identifiants admis sont ceux de Lore. La politique de sécurité du contenu de l’interface interdit en plus tout script qui ne vient pas de Lore.
- **Images jamais chargées.** Une image d’un document, même hébergée ailleurs, n’est jamais chargée par le navigateur : lire un document n’appelle aucun serveur extérieur.
- **PDF.** Ils s’affichent dans la page avec pdf.js, servi par Lore. Les scripts et les formulaires d’un PDF ne sont jamais exécutés, et ses liens s’ouvrent dans un nouvel onglet.
- **Originaux en pièce jointe.** Un original est servi en pièce jointe, sous son nom d’origine. Il porte le type établi par Lore à l’import, jamais celui annoncé par le navigateur, avec l’en-tête `X-Content-Type-Options: nosniff` et une politique de sécurité qui lui interdit tout (`default-src 'none'; sandbox`). Seul un PDF peut être servi pour s’afficher, dans le [lecteur](reader.md#le-lecteur-pdf) ou dans un nouvel onglet, avec les mêmes en-têtes.
- **Droits vérifiés à chaque ouverture.** Le contenu et l’original ne sont lus qu’après le contrôle des droits. Le navigateur peut garder un fichier en cache, mais il redemande à chaque ouverture si la personne y a encore droit.

### Journal des consultations

Chaque ouverture d’un document est inscrite au journal d’audit, une fois par heure au plus pour une même personne, comme chaque téléchargement : le journal dit qui a lu quoi. Ce sont des données personnelles, gardées pour la sécurité, consultables par les seuls propriétaires et administrateurs de l’organisation, dans l’administration à partir de la v0.1, et effacées au bout d’un an. Informez-en les membres de votre organisation.

## Recherche

- **Droits appliqués dans la requête.** Les résultats, leur nombre, les filtres et leurs nombres, les extraits, les autres passages et les titres de la palette ne viennent que des documents que la personne peut lire, choisis dans la requête elle-même, avant tout classement ou décompte. Les droits sont relus à chaque recherche : un accès retiré prend effet à la recherche suivante.
- **Recherches jamais gardées par le serveur.** Aucune recherche n’est écrite : ni au journal d’audit, ni dans les journaux du serveur. Les huit dernières recherches de chacun sont gardées dans son navigateur, pour son compte, et effacées à la déconnexion ou par *Effacer*.
- **Mais présentes dans les adresses.** Une recherche part dans l’adresse : `/search?q=…` pour la page, `/api/v1/search?q=…` et `/api/v1/search/titles?q=…` pour l’API, et `q` dans le lien d’un résultat. Elle reste dans l’historique du navigateur, et peut apparaître dans les journaux d’accès d’un proxy inverse. Lore envoie l’en-tête `Referrer-Policy: same-origin` : un lien vers un autre site ne reçoit pas l’adresse de la page, ni donc la recherche.

Une recherche peut contenir un nom, ou un secret collé par erreur. Pour la retirer des journaux d’accès du proxy, écrivez-les sans les paramètres des adresses. Avec Nginx :

```nginx title="nginx.conf"
# Dans le bloc http : un journal d’accès sans les paramètres des adresses
log_format sans_parametres '$remote_addr [$time_local] "$request_method $uri $server_protocol" $status $body_bytes_sent';

# Dans le bloc server de Lore
access_log /var/log/nginx/lore.access.log sans_parametres;
```

> [!WARNING]
> **Limite connue.** Avant d’écarter les documents que la personne ne voit pas, la recherche parcourt l’index de tous les documents : un mot présent dans de nombreux documents qu’elle ne voit pas allonge un peu le temps de réponse. Ni le titre, ni le contenu de ces documents n’apparaissent.

## Fournisseur d’identité <span class="vb">Après v0.1</span>

La connexion par OpenID Connect (Keycloak, Authentik, Google, GitLab, Entra ID…) fera partie de l’édition Community, gratuite.

## Signaler une vulnérabilité

Ne la signalez jamais dans un ticket public. Utilisez le [signalement privé de GitHub](https://github.com/dada-core/lore/security/advisories/new), comme le décrit le fichier [SECURITY.md](https://github.com/dada-core/lore/blob/main/SECURITY.md) du dépôt.

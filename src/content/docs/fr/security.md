---
title: "Sécurité et connexion"
description: "Comptes, sessions, connexion, lecture des documents et recherche : les réglages par défaut, ce que vous pouvez ajuster, et ce que Lore protège."
---

## Mots de passe

Les mots de passe sont hachés avec Argon2id. Longueur minimale : 12 caractères, réglable de 8 à 64 dans *Administration › Sécurité et connexion* ; 128 caractères au plus. Lore ne les compare pas à une liste de mots de passe courants ou divulgués.

Lore fait autant de calculs de mots de passe à la fois que le serveur a de processeurs, dans la limite de sa mémoire (un calcul par 64 Mo de mémoire Java), deux au moins et huit au plus : à la connexion, à la configuration initiale, à l’acceptation d’une invitation, à la réinitialisation et dans *Mon compte*. Une requête qui attend plus de 10 secondes reçoit la réponse `503`, avec le code `server_busy` ; l’interface affiche « Lore est très sollicité en ce moment. Réessayez dans quelques secondes. »

## Tentatives de connexion

Par défaut, après 5 échecs en 15 minutes (la durée du blocage), la connexion est bloquée 15 minutes. Les échecs sont comptés pour chaque couple adresse e-mail et adresse IP ; une adresse e-mail est aussi bloquée, quelle que soit l’adresse IP, après quatre fois plus d’échecs. Le nombre d’échecs (de 3 à 20) et la durée du blocage (de 1 minute à 24 heures) se règlent dans *Administration › Sécurité et connexion*. Les échecs et les blocages sont inscrits au journal d’audit, consultable dans *Administration › Journal d’audit*.

Dans *Mon compte*, changer son mot de passe ou son adresse e-mail demande le mot de passe actuel. Un mot de passe actuel faux compte comme une connexion refusée : le journal d’audit inscrit « Échec de connexion pour wilfried.kouakou@dada.group », avec la personne comme auteur. Au seuil de blocage, la réponse est `429`, avec le code `login_locked`, et la connexion depuis ce poste est bloquée elle aussi. Une session qui a donné autant de mots de passe actuels faux que la connexion en permet est bloquée de même, de quelque adresse IP qu’elle les envoie : une session volée n’a pas plus d’essais que le formulaire de connexion. Un blocage de l’adresse depuis tous les postes, qu’un tiers peut provoquer en échouant exprès, n’empêche pas la personne déjà connectée de changer son mot de passe ; un nouveau mot de passe remet les compteurs à zéro.

L’adresse IP est celle de la connexion, ou celle que transmet un proxy inverse déclaré dans `LORE_TRUSTED_PROXIES`. Un proxy non déclaré donne son adresse à toutes les requêtes : voir [HTTPS et proxy inverse](reverse-proxy.md#déclarer-le-proxy).

> [!WARNING]
> **Le blocage protège un compte, pas l’ensemble des comptes.** Une même machine peut essayer un mot de passe courant sur chaque adresse e-mail : seule la longueur minimale des mots de passe s’y oppose.

## Sessions

| Réglage | Valeur par défaut |
| --- | --- |
| Stockage | Côté serveur, dans PostgreSQL |
| Cookie | `HttpOnly`, `SameSite=Lax`, et `Secure` quand `LORE_PUBLIC_URL` est en HTTPS ; sans elle, quand la requête arrive en HTTPS, directement ou par un proxy déclaré |
| Expiration après inactivité | 8 heures, réglable de 5 minutes à `LORE_SESSION_TIMEOUT` dans *Administration › Sécurité et connexion* |
| Protection CSRF | Activée |

Quand `LORE_PUBLIC_URL` est en HTTPS, les cookies s’appellent `__Host-LORE_SESSION` et `__Host-XSRF-TOKEN` : ils sont sécurisés et liés au nom d’hôte exact de Lore. L’expiration ne compte que l’inactivité : une session utilisée sans interruption reste ouverte.

Chaque personne voit ses sessions ouvertes dans *Mon compte*, et peut les fermer une à une, ou toutes les autres à la fois.

## Lecture des documents

Un fichier importé peut être piégé : Lore ne l’exécute jamais, et ne le sert jamais comme une page.

- **Rendu nettoyé.** Un document Markdown, Word ou texte s’affiche à partir d’un rendu HTML produit par le processus d’extraction, qui n’écrit qu’une liste fermée d’éléments de mise en forme. Lore ne s’y fie pas : il nettoie de nouveau ce rendu, avec OWASP Java HTML Sanitizer, avant de l’enregistrer. Ni script, ni style, ni gestionnaire d’événement, ni cadre, formulaire, image ou SVG ne passent ; les liens ne gardent que `http`, `https` et `mailto`, et les seuls identifiants admis sont ceux de Lore. La politique de sécurité du contenu de l’interface interdit en plus tout script qui ne vient pas de Lore.
- **Images jamais chargées.** Une image d’un document, même hébergée ailleurs, n’est jamais chargée par le navigateur : lire un document n’appelle aucun serveur extérieur.
- **PDF.** Ils s’affichent dans la page avec pdf.js, servi par Lore. Les scripts et les formulaires d’un PDF ne sont jamais exécutés, et ses liens s’ouvrent dans un nouvel onglet.
- **Originaux en pièce jointe.** Un original est servi en pièce jointe, sous son nom d’origine. Il porte le type établi par Lore à l’import, jamais celui annoncé par le navigateur, avec l’en-tête `X-Content-Type-Options: nosniff` et une politique de sécurité qui lui interdit tout (`default-src 'none'; sandbox`). Seul un PDF peut être servi pour s’afficher, dans le [lecteur](reader.md#le-lecteur-pdf) ou dans un nouvel onglet, avec les mêmes en-têtes.
- **Droits vérifiés à chaque ouverture.** Le contenu et l’original ne sont lus qu’après le contrôle des droits. Le navigateur peut garder un fichier en cache, mais il redemande à chaque ouverture si la personne y a encore droit.
- **Extraction à part.** Le texte est extrait dans des processus séparés de l’application, mais sous le même compte système : voir [Stockage et extraction](storage.md#extraction-du-texte) et sa limite connue.

### Journal des consultations

Chaque ouverture d’un document est inscrite au journal d’audit, une fois par heure au plus pour une même personne, comme chaque téléchargement : le journal dit qui a lu quoi. Ce sont des données personnelles, gardées pour la sécurité, consultables par les seuls propriétaires et administrateurs de l’organisation, dans *Administration › Journal d’audit*, et effacées au bout d’un an. Informez-en les membres de votre organisation. Elles ne s’affichent jamais sur le document : son *Activité* dit ce qui y a été changé, pas qui l’a lu.

**Téléchargement ouvert depuis un autre site.** Une page d’un autre site qui ouvre le lien de téléchargement d’un document fait inscrire un téléchargement au journal, si la personne est connectée et peut lire ce document : le cookie de session est `SameSite=Lax`. Lore n’envoie le fichier qu’à elle.

### Journal d’audit

*Administration › Journal d’audit* montre les opérations de l’organisation, filtrées par catégorie, par personne et par période, et les exporte en CSV avec les mêmes filtres.

- **Qui.** Les propriétaires et les administrateurs seulement ; les autres reçoivent un refus.
- **Export.** Le fichier est écrit au fil de la lecture, sans tout charger en mémoire, une exportation à la fois par personne. L’export est lui-même inscrit au journal, avec ses filtres et son nombre de lignes.
- **Formules neutralisées.** Une valeur qui commence par `=`, `+`, `-`, `@`, une tabulation ou un retour chariot, comme un titre de document écrit pour piéger un tableur, est précédée d’une apostrophe : ouvert dans un tableur, le fichier n’exécute aucune formule.
- **Personnes parties.** L’écran montre le nom actuel du compte de qui a agi, l’export son nom et son adresse e-mail, même après son départ de l’organisation.

## Recherche

- **Droits appliqués dans la requête.** Les résultats, leur nombre, les filtres et leurs nombres, les extraits, les autres passages et les titres de la palette ne viennent que des documents que la personne peut lire, choisis dans la requête elle-même, avant tout classement ou décompte. Les droits sont relus à chaque recherche : un accès retiré prend effet à la recherche suivante.
- **Recherches jamais gardées par le serveur.** Aucune recherche n’est écrite : ni au journal d’audit, ni dans les journaux du serveur, même en `DEBUG` ou en `TRACE`. Les huit dernières recherches de chacun sont gardées dans son navigateur, pour son compte, et effacées par *Effacer*, comme par la déconnexion ou une session expirée que Lore, ouvert, constate : rangées par compte, elles ne s’affichent pas pour la personne suivante.
- **Mais présentes dans les adresses.** Une recherche part dans l’adresse : `/search?q=…` pour la page, `/api/v1/search?q=…` et `/api/v1/search/titles?q=…` pour l’API, et `q` dans le lien d’un résultat. Elle reste dans l’historique du navigateur, et peut apparaître dans les journaux d’accès d’un proxy inverse. Lore envoie l’en-tête `Referrer-Policy: same-origin` : un lien vers un autre site ne reçoit pas l’adresse de la page, ni donc la recherche.

Une recherche peut contenir un nom, ou un secret collé par erreur. Pour la retirer des journaux d’accès du proxy, écrivez-les sans les paramètres des adresses. Avec Nginx :

```nginx title="nginx.conf"
# Dans le bloc http : un journal d’accès sans les paramètres des adresses
log_format sans_parametres '$remote_addr [$time_local] "$request_method $uri $server_protocol" $status $body_bytes_sent';

# Dans le bloc server de Lore
access_log /var/log/nginx/lore.access.log sans_parametres;
```

> [!WARNING]
> **Limite connue.** Avant d’écarter les documents que la personne ne voit pas, la recherche parcourt l’index de tous les documents : un mot présent dans de nombreux documents qu’elle ne voit pas allonge un peu le temps de réponse. Dans un cas extrême, la recherche dépasse 5 secondes et répond `503 search_timeout` : cette réponse peut signaler qu’un mot est très fréquent dans des documents que la personne ne voit pas. Ni le titre, ni le contenu de ces documents n’apparaissent.

## Fournisseur d’identité <span class="vb">Après v0.1</span>

La connexion par OpenID Connect (Keycloak, Authentik, Google, GitLab, Entra ID…) viendra après la v0.1, gratuite comme le reste de Lore.

## Signaler une vulnérabilité

Ne la signalez jamais dans un ticket public. Utilisez le [signalement privé de GitHub](https://github.com/dada-core/lore/security/advisories/new), comme le décrit le fichier [SECURITY.md](https://github.com/dada-core/lore/blob/main/SECURITY.md) du dépôt.

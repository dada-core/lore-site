/* Démo Lore : données fictives (organisation, espaces, documents, membres…). */
window.SL = (function () {
  'use strict';

  var people = {
    as: { name: 'Amenan Souaga', email: 'amenan.souaga@dada.group', color: '#13705E' },
    hc: { name: 'Hervé Coulibaly', email: 'herve.coulibaly@dada.group', color: '#3F6C9A' },
    ck: { name: 'Christ Koffi', email: 'christ.koffi@dada.group', color: '#6B5A8E' },
    ey: { name: 'Elfried Yaba', email: 'elfried.yaba@dada.group', color: '#8E4B44' },
    eb: { name: 'Eli Brou', email: 'eli.brou@dada.group', color: '#55636E' },
    wk: { name: 'Wilfried Kouakou', email: 'wilfried.kouakou@dada.group', color: '#3F5A73' }
  };

  var org = {
    name: 'DadaGroup',
    url: 'https://lore.dada.group',
    members: 48,
    docs: 844,
    scanned: 37,
    storage: '2,4 Go'
  };

  var spaces = [
    { id: 'infrastructure', name: 'Infrastructure', color: '#13705E', desc: 'Exploitation des serveurs, des bases de données et des sauvegardes.', docs: 9, members: 5, role: 'Responsable', activity: 'Aujourd’hui' },
    { id: 'reseau', name: 'Réseau', color: '#3F6C9A', desc: 'Architecture réseau, pare-feu, VPN et DNS.', docs: 214, members: 9, role: 'Contributeur', activity: 'Hier' },
    { id: 'support', name: 'Support N2', color: '#8A6A1F', desc: 'Procédures de diagnostic et réponses types du support.', docs: 486, members: 15, role: 'Lecteur', activity: 'Aujourd’hui' },
    { id: 'atlas', name: 'Projet Atlas', color: '#6B5A8E', desc: 'Refonte de la plateforme de facturation.', docs: 97, members: 11, role: 'Contributeur', activity: '8 nov.' },
    { id: 'securite', name: 'Sécurité', color: '#8E4B44', desc: 'Politiques, durcissement et réponse aux incidents de sécurité.', docs: 38, members: 4, role: 'Responsable', activity: '4 nov.' },
    { id: 'applications', name: 'Applications métier', color: '#4E7A5A', desc: 'Documentation des applications internes.', docs: 0, members: 1, role: 'Responsable', activity: 'Créé aujourd’hui', empty: true }
  ];

  var folders = {
    infrastructure: [
      { id: 'runbooks', name: 'Runbooks' },
      { id: 'procedures', name: 'Procédures' },
      { id: 'incidents', name: 'Rapports d’incident' },
      { id: 'architecture', name: 'Architecture' },
      { id: 'constructeur', name: 'Documentation constructeur' }
    ],
    atlas: [{ id: 'decisions', name: 'Décisions techniques' }]
  };

  /* Documents. age : jours depuis la dernière mise à jour (filtre de date de la recherche). */
  var docs = [
    {
      id: 'plan-reprise', title: 'Plan de reprise d’activité 2026', space: 'infrastructure', folder: 'procedures',
      format: 'Word', size: '1,2 Mo', category: 'Procédure d’exploitation', status: 'draft', owner: 'as',
      updated: 'Aujourd’hui', updatedRel: 'aujourd’hui', age: 0, version: 1, lang: 'fr', flags: { indexing: true },
      review: 'Aucune',
      versions: [{ n: 1, date: '11 nov. 2026', short: '11 nov.', by: 'as', note: 'Première version, en cours de relecture.', w: 50 }],
      passages: [
        { loc: 'Section Reprise de la base de facturation', text: 'En cas de perte du serveur principal, la base de facturation est remise en service sur pg-prod-03 à partir de la dernière sauvegarde complète.' }
      ]
    },
    {
      id: 'restaurer-pg', title: 'Restaurer une base PostgreSQL depuis une sauvegarde', space: 'infrastructure', folder: 'runbooks',
      format: 'Markdown', size: '18 Ko', category: 'Runbook', status: 'published', owner: 'as',
      updated: 'Hier', updatedRel: 'hier', age: 1, version: 4, lang: 'fr', body: 'restaurer', sections: 6,
      review: '10 mai 2027',
      versions: [
        { n: 4, date: '10 nov. 2026', short: '10 nov.', by: 'as', note: 'Ajout de la section « Erreurs fréquentes ».', w: 40 },
        { n: 3, date: '2 sept. 2026', short: '2 sept.', by: 'hc', note: 'Restauration parallèle avec --jobs=4.', w: 20 },
        { n: 2, date: '15 mai 2026', short: '15 mai', by: 'as', note: 'Nouveaux chemins des sauvegardes.', w: 28 },
        { n: 1, date: '3 févr. 2026', short: '3 févr.', by: 'as', note: 'Création du document.', w: 54 }
      ],
      passages: [
        { anchor: 's-4-2', loc: 'Section 4.2, Erreurs fréquentes', text: 'Si `pg_restore` signale `ERROR: role "app_rw" does not exist`, le rôle n’existe pas sur le serveur cible : créez-le, puis relancez la restauration.' },
        { anchor: 's-3', loc: 'Section 3, Restaurer la base', text: 'Créez une base vide, puis restaurez la sauvegarde avec `pg_restore` et quatre processus en parallèle (`--jobs=4`).' },
        { anchor: 's-1', loc: 'Section 1, Prérequis', text: 'Un accès SSH au serveur de restauration `pg-restore-01`, le rôle `dba` sur le cluster cible et un ticket de changement validé par l’astreinte.' },
        { anchor: 's-2', loc: 'Section 2, Identifier la sauvegarde', text: 'Les sauvegardes complètes de la base de facturation sont produites chaque nuit à 2 h dans `/backups/pg-prod/facturation/`.' },
        { anchor: 's-4-1', loc: 'Section 4.1, Contrôles', text: 'Comparez le nombre de lignes des tables principales avec celui de la production avant de rendre la base aux équipes.' }
      ]
    },
    {
      id: 'bascule-k8s', title: 'Bascule du cluster Kubernetes vers le site de secours', space: 'infrastructure', folder: 'runbooks',
      format: 'Markdown', size: '26 Ko', category: 'Runbook', status: 'published', owner: 'hc',
      updated: '8 nov.', updatedRel: 'le 8 nov. 2026', age: 3, version: 7, lang: 'fr', sections: 9,
      review: '1er nov. 2026 (dépassée)',
      versions: [
        { n: 7, date: '8 nov. 2026', short: '8 nov.', by: 'hc', note: 'Nouvelle vérification de la réplication des volumes.', w: 22 },
        { n: 6, date: '12 oct. 2026', short: '12 oct.', by: 'hc', note: 'Mise à jour des noms de nœuds.', w: 16 },
        { n: 5, date: '2 sept. 2026', short: '2 sept.', by: 'ey', note: 'Ajout du retour au site principal.', w: 30 },
        { n: 4, date: '18 juil. 2026', short: '18 juil.', by: 'hc', note: 'Corrections mineures.', w: 16 },
        { n: 3, date: '3 juin 2026', short: '3 juin', by: 'hc', note: 'Passage à Kubernetes 1.34.', w: 24 },
        { n: 2, date: '21 avr. 2026', short: '21 avr.', by: 'ey', note: 'Ajout des contrôles DNS.', w: 18 },
        { n: 1, date: '9 févr. 2026', short: '9 févr.', by: 'hc', note: 'Création du document.', w: 46 }
      ],
      passages: [
        { loc: 'Section 2, Vérifier le site de secours', text: 'Avant la bascule, vérifiez que le cluster `k8s-secours` est à jour avec `kubectl get nodes` et que la réplication des volumes est terminée.' },
        { loc: 'Section 5, Revenir au site principal', text: 'Le retour au site principal suit la même procédure, une fois l’incident clos et sa cause corrigée.' }
      ]
    },
    {
      id: 'inc-2291', title: 'Incident INC-2291 : disque saturé sur pg-prod-02', space: 'infrastructure', folder: 'incidents',
      format: 'Word', size: '96 Ko', category: 'Rapport d’incident', status: 'published', owner: 'ck',
      updated: '3 nov.', updatedRel: 'le 3 nov. 2026', age: 8, version: 2, lang: 'fr', body: 'incident', sections: 6,
      review: 'Aucune',
      versions: [
        { n: 2, date: '3 nov. 2026', short: '3 nov.', by: 'ck', note: 'Ajout des actions correctives.', w: 26 },
        { n: 1, date: '2 nov. 2026', short: '2 nov.', by: 'ck', note: 'Rapport initial.', w: 48 }
      ],
      passages: [
        { anchor: 'i-chrono', loc: 'Section Chronologie', text: '14 h 32 : la restauration sur pg-prod-03 échoue avec `pg_restore: error: role "reporting" does not exist`. Le rôle avait été supprimé lors du nettoyage du 28 octobre.' },
        { anchor: 'i-cause', loc: 'Section Cause', text: 'Les journaux de transactions (WAL) n’étaient plus archivés depuis la panne du montage NFS : le disque de pg-prod-02 s’est rempli en six heures.' },
        { anchor: 'i-resol', loc: 'Section Résolution', text: 'Le service a été remis en route après la purge des WAL archivés et le rétablissement du montage NFS. Durée totale de l’interruption : 1 h 48.' }
      ]
    },
    {
      id: 'rotation-tls', title: 'Rotation des certificats TLS internes', space: 'infrastructure', folder: 'procedures',
      format: 'Markdown', size: '9 Ko', category: 'Documentation de sécurité', status: 'draft', owner: 'ck',
      updated: '29 oct.', updatedRel: 'le 29 oct. 2026', age: 13, version: 1, lang: 'fr', body: 'tls', sections: 3,
      restricted: true, grants: ['ck', 'ey'], review: 'Aucune',
      versions: [{ n: 1, date: '29 oct. 2026', short: '29 oct.', by: 'ck', note: 'Première rédaction.', w: 44 }],
      passages: [
        { anchor: 't-1', loc: 'Section 1, Quand renouveler', text: 'Les certificats internes sont émis par l’autorité `dadagroup-int-ca` et renouvelés tous les 90 jours.' }
      ]
    },
    {
      id: 'guide-baie', title: 'Storage array administration guide', space: 'infrastructure', folder: 'constructeur',
      format: 'PDF', size: '24,8 Mo', pagesCount: 312, category: 'Documentation constructeur', status: 'published', owner: 'eb',
      updated: '21 oct.', updatedRel: 'le 21 oct. 2026', age: 21, version: 1, lang: 'en', body: 'pdf', sections: 312,
      review: 'Aucune',
      versions: [{ n: 1, date: '21 oct. 2026', short: '21 oct.', by: 'eb', note: 'Import du guide constructeur, édition 2026.1.', w: 56 }],
      passages: [
        { anchor: 'page-112', page: 112, loc: 'Page 112', text: 'To restore a snapshot to a new volume, select the snapshot, choose Restore, then map the new volume to the target host.' },
        { anchor: 'page-47', page: 47, loc: 'Page 47', text: 'Replication between arrays requires a dedicated network link with a round-trip latency below 5 ms.' }
      ],
      pages: {
        1: { cover: true, heading: 'Storage Array Administration Guide', sub: 'Release 2026.1' },
        47: { heading: '4.2 Remote replication', paras: ['Remote replication copies volumes from a primary array to a secondary array located in another site.', 'Replication between arrays requires a dedicated network link with a round-trip latency below 5 ms. Asynchronous replication tolerates higher latencies but increases the recovery point objective.', 'Replication groups keep several volumes consistent with each other during failover.'] },
        112: { heading: '8.4 Restoring a snapshot to a new volume', paras: ['Snapshots are read-only, point-in-time copies of a volume. Restoring a snapshot to a new volume leaves the original volume untouched.', 'To restore a snapshot to a new volume, select the snapshot, choose Restore, then map the new volume to the target host.', 'Check that the target host does not already mount a volume with the same identifier before mapping.'] }
      }
    },
    {
      id: 'archi-sauvegardes', title: 'Architecture du stockage des sauvegardes', space: 'infrastructure', folder: 'architecture',
      format: 'Word', size: '412 Ko', category: 'Documentation d’architecture', status: 'published', owner: 'hc',
      updated: '17 oct.', updatedRel: 'le 17 oct. 2026', age: 25, version: 3, lang: 'fr', sections: 8,
      review: '15 oct. 2026 (dépassée)',
      versions: [
        { n: 3, date: '17 oct. 2026', short: '17 oct.', by: 'hc', note: 'Nouvelle politique de rétention.', w: 24 },
        { n: 2, date: '30 juin 2026', short: '30 juin', by: 'hc', note: 'Ajout du stockage objet du site de secours.', w: 30 },
        { n: 1, date: '12 mars 2026', short: '12 mars', by: 'hc', note: 'Création du document.', w: 48 }
      ],
      passages: [
        { loc: 'Section Rétention', text: 'Les sauvegardes complètes sont conservées 35 jours sur la baie principale, puis 12 mois sur le stockage objet du site de secours.' },
        { loc: 'Section Flux de sauvegarde', text: 'Chaque nuit, les serveurs de bases de données envoient leurs sauvegardes complètes vers la baie principale, qui les réplique vers le site de secours.' }
      ]
    },
    {
      id: 'schema-cablage', title: 'Schéma de câblage de la salle serveurs B', space: 'infrastructure', folder: 'constructeur',
      format: 'PDF', size: '8,7 Mo', pagesCount: 4, category: 'Documentation technique', status: 'published', owner: 'ey',
      updated: '14 oct.', updatedRel: 'le 14 oct. 2026', age: 28, version: 1, lang: 'fr', body: 'scan', flags: { scanned: true },
      review: 'Aucune',
      versions: [{ n: 1, date: '14 oct. 2026', short: '14 oct.', by: 'ey', note: 'Numérisation du schéma papier.', w: 50 }],
      passages: []
    },
    {
      id: 'barman', title: 'Sauvegardes nocturnes avec Barman (ancienne procédure)', space: 'infrastructure', folder: 'runbooks',
      format: 'Markdown', size: '12 Ko', category: 'Runbook', status: 'obsolete', obsoleteSince: '10 nov. 2026', replacedBy: 'restaurer-pg', owner: 'hc',
      updated: '2 mars 2025', updatedRel: 'le 2 mars 2025', age: 619, version: 3, lang: 'fr', body: 'barman', sections: 4,
      review: 'Aucune',
      versions: [
        { n: 3, date: '2 mars 2025', short: '2 mars 2025', by: 'hc', note: 'Dernière mise à jour avant l’abandon de Barman.', w: 20 },
        { n: 2, date: '14 oct. 2024', short: '14 oct. 2024', by: 'hc', note: 'Ajout de la restauration manuelle.', w: 28 },
        { n: 1, date: '5 juin 2024', short: '5 juin 2024', by: 'hc', note: 'Création du document.', w: 44 }
      ],
      passages: [
        { anchor: 'b-2', loc: 'Section Restauration manuelle', text: 'En cas d’échec de `pg_restore` avec `role "barman_ro" does not exist`, recréer le rôle depuis le script d’initialisation.' }
      ]
    },
    {
      id: 'migration-pg18', title: 'Migration vers PostgreSQL 18', space: 'atlas', folder: 'decisions',
      format: 'PDF', size: '2,1 Mo', pagesCount: 18, category: 'Documentation d’architecture', status: 'published', owner: 'hc',
      updated: '24 sept.', updatedRel: 'le 24 sept. 2026', age: 48, version: 2, lang: 'fr', body: 'pdf', sections: 18,
      review: '24 mars 2027',
      versions: [
        { n: 2, date: '24 sept. 2026', short: '24 sept.', by: 'hc', note: 'Décision validée en comité d’architecture.', w: 22 },
        { n: 1, date: '8 sept. 2026', short: '8 sept.', by: 'hc', note: 'Proposition initiale.', w: 46 }
      ],
      passages: [
        { anchor: 'page-7', page: 7, loc: 'Page 7', text: 'Les rôles applicatifs doivent être recréés avant tout `pg_restore`, faute de quoi l’erreur `role … does not exist` interrompt la reprise des données.' }
      ],
      pages: {
        1: { cover: true, heading: 'Migration vers PostgreSQL 18', sub: 'Dossier de décision, Projet Atlas' },
        7: { heading: '3. Reprise des données', paras: ['La reprise s’effectue par sauvegarde logique et restauration sur les nouveaux serveurs, base par base.', 'Les rôles applicatifs doivent être recréés avant tout pg_restore, faute de quoi l’erreur role … does not exist interrompt la reprise des données.', 'Chaque base restaurée est comparée à la production avant la bascule des applications.'] }
      }
    }
  ];

  var spaceMembers = {
    infrastructure: [
      { id: 'as', role: 'Responsable', added: '3 févr. 2026' },
      { id: 'hc', role: 'Responsable', added: '3 févr. 2026' },
      { id: 'ck', role: 'Contributeur', added: '12 mars 2026' },
      { id: 'ey', role: 'Contributeur', added: '2 juin 2026' },
      { id: 'eb', role: 'Lecteur', added: '2 juin 2026' }
    ]
  };

  var orgMembers = [
    { id: 'wk', role: 'Propriétaire', spaces: 'Tous', state: 'Actif', last: 'Aujourd’hui' },
    { id: 'as', role: 'Administrateur', spaces: 'Tous', state: 'Actif', last: 'Aujourd’hui' },
    { id: 'hc', role: 'Membre', spaces: 'Infrastructure, Projet Atlas', state: 'Actif', last: 'Aujourd’hui' },
    { id: 'ck', role: 'Membre', spaces: 'Infrastructure, Support N2, Sécurité', state: 'Actif', last: 'Hier' },
    { id: 'ey', role: 'Membre', spaces: 'Infrastructure, Réseau, Support N2', state: 'Actif', last: '9 nov.' },
    { id: 'eb', role: 'Membre', spaces: 'Infrastructure', state: 'Actif', last: 'Aujourd’hui' }
  ];

  var audit = [
    { when: 'Aujourd’hui, 10 h 42', who: 'as', type: 'Droits', text: 'a restreint l’accès à « Rotation des certificats TLS internes » (2 personnes).' },
    { when: 'Aujourd’hui, 10 h 15', who: 'as', type: 'Import', text: 'a importé « Plan de reprise d’activité 2026 », version 1.' },
    { when: 'Aujourd’hui, 9 h 58', who: 'eb', type: 'Consultation', text: 'a consulté « Restaurer une base PostgreSQL depuis une sauvegarde ».' },
    { when: 'Aujourd’hui, 9 h 31', who: null, type: 'Connexion', text: '5 tentatives de connexion échouées pour herve.coulibaly@dada.group. Compte bloqué 15 minutes.' },
    { when: 'Aujourd’hui, 8 h 47', who: 'wk', type: 'Organisation', text: 'a créé l’espace « Applications métier ».' },
    { when: 'Hier, 18 h 04', who: 'as', type: 'Import', text: 'a importé la version 4 de « Restaurer une base PostgreSQL depuis une sauvegarde ».' },
    { when: 'Hier, 16 h 20', who: 'as', type: 'Membres', text: 'a changé le rôle d’Eli Brou dans Infrastructure : Lecteur, auparavant Contributeur.' },
    { when: 'Hier, 15 h 12', who: 'hc', type: 'Statut', text: 'a marqué « Sauvegardes nocturnes avec Barman » comme obsolète.' },
    { when: '9 nov., 8 h 15', who: 'ey', type: 'Téléchargement', text: 'a téléchargé l’original de « Schéma de câblage de la salle serveurs B ».' },
    { when: '8 nov., 17 h 40', who: 'as', type: 'Membres', text: 'a créé un lien d’invitation pour l’espace Infrastructure (rôle Contributeur).' }
  ];

  /* v0.2 : fiches de connaissances */
  var fiches = [
    {
      id: 'pg-role-manquant', title: 'pg_restore échoue : rôle inexistant sur le serveur cible', status: 'validated',
      tech: ['PostgreSQL'], space: 'infrastructure', author: 'ck', validator: 'as', updated: '4 nov.', validatedOn: '4 nov. 2026',
      origin: 'Créée à partir du rapport d’incident INC-2291.',
      context: 'Restauration d’une sauvegarde de la base de facturation sur un autre serveur que celui d’origine (reprise après incident, environnement de test).',
      symptoms: 'pg_restore s’interrompt avec ERROR: role "reporting" does not exist. Les tables sont créées mais les droits ne sont pas appliqués.',
      causes: 'Les droits (GRANT) et la propriété des objets font référence à des rôles qui n’existent pas sur le serveur cible, par exemple après un nettoyage des rôles.',
      solution: 'Recréer les rôles applicatifs avant la restauration, à partir du script d’initialisation du cluster, puis relancer pg_restore. Si les droits d’origine sont inutiles sur ce serveur, relancer avec --no-owner --no-privileges.',
      precautions: 'Ne jamais recréer un rôle avec des droits plus larges que ceux de production. Consigner la restauration dans le ticket de changement.',
      resources: ['restaurer-pg', 'inc-2291', 'migration-pg18']
    },
    {
      id: 'wal-disque', title: 'Disque saturé par des journaux WAL non archivés', status: 'validated',
      tech: ['PostgreSQL', 'NFS'], space: 'infrastructure', author: 'ck', validator: 'as', updated: '4 nov.', validatedOn: '4 nov. 2026',
      origin: 'Créée à partir du rapport d’incident INC-2291.', resources: ['inc-2291', 'archi-sauvegardes']
    },
    {
      id: 'vpn-mtu', title: 'Connexions VPN qui se figent après quelques minutes', status: 'review',
      tech: ['IPsec', 'Réseau'], space: 'reseau', author: 'ey', updated: 'Hier', resources: [],
      origin: 'Créée à partir d’une réponse de l’assistant.',
      context: 'Tunnels IPsec entre le siège et les entrepôts régionaux.',
      symptoms: 'Les sessions SSH et les transferts de fichiers se figent après 2 à 5 minutes ; les pings continuent de passer.',
      causes: 'Taille maximale des paquets (MTU) trop élevée sur le tunnel : les gros paquets sont fragmentés puis perdus.',
      solution: 'Abaisser la MTU du tunnel à 1 400 octets et activer l’ajustement du MSS TCP sur les pare-feu des deux extrémités.',
      precautions: 'Appliquer la modification en dehors des heures d’expédition ; les tunnels redémarrent.'
    },
    { id: 'k8s-pending', title: 'Pods bloqués en Pending après la bascule de site', status: 'draft', tech: ['Kubernetes'], space: 'infrastructure', author: 'hc', updated: '8 nov.', resources: ['bascule-k8s'] },
    { id: 'cert-api', title: 'Certificat interne expiré sur l’API de facturation', status: 'validated', tech: ['TLS'], space: 'securite', author: 'ck', validator: 'as', updated: '29 oct.', resources: ['rotation-tls'] },
    { id: 'ldap-delais', title: 'Délais de connexion à l’annuaire LDAP le lundi matin', status: 'review', tech: ['LDAP'], space: 'support', author: 'ey', updated: '6 nov.', resources: [] }
  ];

  /* v0.2 : tableau de bord */
  var dashboard = {
    weeks: [
      ['24 août', 148], ['31 août', 162], ['7 sept.', 171], ['14 sept.', 158], ['21 sept.', 190], ['28 sept.', 204],
      ['5 oct.', 187], ['12 oct.', 213], ['19 oct.', 226], ['26 oct.', 219], ['2 nov.', 241], ['9 nov.', 258]
    ],
    perSpace: [['Support N2', 486], ['Réseau', 214], ['Projet Atlas', 97], ['Sécurité', 38], ['Infrastructure', 9], ['Applications métier', 0]],
    topDocs: [['restaurer-pg', 64], ['bascule-k8s', 41], ['inc-2291', 33], ['guide-baie', 21], ['archi-sauvegardes', 17]],
    gaps: [['renouveler certificat vpn partenaires', 9], ['procédure astreinte week-end', 7], ['quota ceph', 5], ['rotation clés ssh bastion', 4]],
    overdue: [['bascule-k8s', '1er nov. 2026'], ['archi-sauvegardes', '15 oct. 2026']]
  };

  /* v0.3 : assistant */
  var conversations = [
    {
      id: 'c1', when: 'Aujourd’hui, 9 h 12', question: 'Comment restaurer la base de facturation si pg_restore signale un rôle manquant ?', kind: 'answer',
      sources: [
        { n: 1, doc: 'restaurer-pg', anchor: 's-4-2', loc: 'Section 4.2, Erreurs fréquentes', quote: 'Si pg_restore signale ERROR: role "app_rw" does not exist, le rôle n’existe pas sur le serveur cible : créez-le, puis relancez la restauration.' },
        { n: 2, doc: 'restaurer-pg', anchor: 's-3', loc: 'Section 3, Restaurer la base', quote: 'Créez une base vide, puis restaurez la sauvegarde avec pg_restore et quatre processus en parallèle.' },
        { n: 3, doc: 'inc-2291', anchor: 'i-chrono', loc: 'Section Chronologie', quote: 'La restauration sur pg-prod-03 échoue avec pg_restore: error: role "reporting" does not exist. Le rôle avait été supprimé lors du nettoyage du 28 octobre.' }
      ],
      ignored: [{ doc: 'barman', reason: 'obsolète' }]
    },
    {
      id: 'c2', when: 'Hier, 17 h 03', question: 'Quelle est la procédure pour renouveler le certificat du VPN partenaires ?', kind: 'none',
      near: ['rotation-tls']
    },
    {
      id: 'c3', when: '7 nov., 11 h 40', question: 'Combien de temps conserve-t-on les sauvegardes complètes ?', kind: 'answer', short: true,
      sources: [{ n: 1, doc: 'archi-sauvegardes', anchor: 'p-0', loc: 'Section Rétention', quote: 'Les sauvegardes complètes sont conservées 35 jours sur la baie principale, puis 12 mois sur le stockage objet du site de secours.' }],
      ignored: []
    }
  ];

  /* v0.2 : recherche par le sens, résultats d'exemple */
  var semantic = {
    question: 'Comment remettre en service une base après un crash ?',
    results: [
      { doc: 'inc-2291', anchor: 'i-resol', loc: 'Section Résolution', both: false, why: '« remis en route » est proche de « remettre en service »' },
      { doc: 'restaurer-pg', anchor: 's-3', loc: 'Section 3, Restaurer la base', both: true, why: '« restaurer une base » est proche de « remettre en service une base »' },
      { doc: 'bascule-k8s', anchor: 'p-1', loc: 'Section 5, Revenir au site principal', both: false, why: '« revenir au site principal une fois l’incident clos » évoque une reprise après panne' },
      { doc: 'archi-sauvegardes', anchor: 'p-1', loc: 'Section Flux de sauvegarde', both: false, why: 'Décrit d’où proviennent les sauvegardes utilisées pour une reprise' }
    ]
  };

  var sources = [
    { id: 'git-runbooks', kind: 'GitLab', name: 'infra/runbooks', detail: 'Branche main, fichiers Markdown', target: 'Infrastructure › Runbooks', files: 42, sync: 'il y a 12 minutes', state: 'ok' },
    { id: 'nas-support', kind: 'Dossier partagé', name: '\\\\nas01\\docs-support', detail: 'Fichiers PDF et Word', target: 'Support N2', files: 1203, sync: 'il y a 2 heures', state: 'warn', warn: '3 fichiers illisibles' }
  ];

  return {
    people: people, org: org, spaces: spaces, folders: folders, docs: docs,
    spaceMembers: spaceMembers, orgMembers: orgMembers, audit: audit,
    fiches: fiches, dashboard: dashboard, conversations: conversations,
    semantic: semantic, sources: sources
  };
})();

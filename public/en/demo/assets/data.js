/* Lore demo: sample data (organization, spaces, documents, members…).
   English version of site/public/demo/assets/data.js: both files must stay in sync
   (same ids, structure and numbers; only the language differs). */
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
    storage: '2.4 GB'
  };

  var spaces = [
    { id: 'infrastructure', name: 'Infrastructure', color: '#13705E', desc: 'Operation of the servers, databases and backups.', docs: 9, members: 5, role: 'Owner', activity: 'Today' },
    { id: 'reseau', name: 'Network', color: '#3F6C9A', desc: 'Network architecture, firewalls, VPN and DNS.', docs: 214, members: 9, role: 'Contributor', activity: 'Yesterday' },
    { id: 'support', name: 'L2 Support', color: '#8A6A1F', desc: 'Troubleshooting procedures and standard support answers.', docs: 486, members: 15, role: 'Reader', activity: 'Today' },
    { id: 'atlas', name: 'Atlas project', color: '#6B5A8E', desc: 'Rebuild of the billing platform.', docs: 97, members: 11, role: 'Contributor', activity: 'Nov 8' },
    { id: 'securite', name: 'Security', color: '#8E4B44', desc: 'Policies, hardening and security incident response.', docs: 38, members: 4, role: 'Owner', activity: 'Nov 4' },
    { id: 'applications', name: 'Business applications', color: '#4E7A5A', desc: 'Documentation of the internal applications.', docs: 0, members: 1, role: 'Owner', activity: 'Created today', empty: true }
  ];

  var folders = {
    infrastructure: [
      { id: 'runbooks', name: 'Runbooks' },
      { id: 'procedures', name: 'Procedures' },
      { id: 'incidents', name: 'Incident reports' },
      { id: 'architecture', name: 'Architecture' },
      { id: 'constructeur', name: 'Vendor documentation' }
    ],
    atlas: [{ id: 'decisions', name: 'Technical decisions' }]
  };

  /* Documents. age: days since the last update (date filter of the search). */
  var docs = [
    {
      id: 'plan-reprise', title: 'Disaster recovery plan 2026', space: 'infrastructure', folder: 'procedures',
      format: 'Word', size: '1.2 MB', category: 'Operating procedure', status: 'draft', owner: 'as',
      updated: 'Today', updatedRel: 'today', age: 0, version: 1, lang: 'en', flags: { indexing: true },
      review: 'None',
      versions: [{ n: 1, date: 'Nov 11, 2026', short: 'Nov 11', by: 'as', note: 'First version, under review.', w: 50 }],
      passages: [
        { loc: 'Section Recovering the billing database', text: 'If the main server is lost, the billing database is brought back online on pg-prod-03 from the latest full backup.' }
      ]
    },
    {
      id: 'restaurer-pg', title: 'Restore a PostgreSQL database from a backup', space: 'infrastructure', folder: 'runbooks',
      format: 'Markdown', size: '18 KB', category: 'Runbook', status: 'published', owner: 'as',
      updated: 'Yesterday', updatedRel: 'yesterday', age: 1, version: 4, lang: 'en', body: 'restaurer', sections: 6,
      review: 'May 10, 2027',
      versions: [
        { n: 4, date: 'Nov 10, 2026', short: 'Nov 10', by: 'as', note: 'Added the “Common errors” section.', w: 40 },
        { n: 3, date: 'Sep 2, 2026', short: 'Sep 2', by: 'hc', note: 'Parallel restore with --jobs=4.', w: 20 },
        { n: 2, date: 'May 15, 2026', short: 'May 15', by: 'as', note: 'New backup paths.', w: 28 },
        { n: 1, date: 'Feb 3, 2026', short: 'Feb 3', by: 'as', note: 'Document created.', w: 54 }
      ],
      passages: [
        { anchor: 's-4-2', loc: 'Section 4.2, Common errors', text: 'If `pg_restore` reports `ERROR: role "app_rw" does not exist`, the role does not exist on the target server: create it, then run the restore again.' },
        { anchor: 's-3', loc: 'Section 3, Restore the database', text: 'Create an empty database, then restore the backup with `pg_restore` and four parallel jobs (`--jobs=4`).' },
        { anchor: 's-1', loc: 'Section 1, Prerequisites', text: 'SSH access to the restore server `pg-restore-01`, the `dba` role on the target cluster and a change ticket approved by the on-call team.' },
        { anchor: 's-2', loc: 'Section 2, Find the backup', text: 'Full backups of the billing database are produced every night at 2 AM in `/backups/pg-prod/billing/`.' },
        { anchor: 's-4-1', loc: 'Section 4.1, Checks', text: 'Compare the row counts of the main tables with production before handing the database back to the teams.' }
      ]
    },
    {
      id: 'bascule-k8s', title: 'Fail the Kubernetes cluster over to the backup site', space: 'infrastructure', folder: 'runbooks',
      format: 'Markdown', size: '26 KB', category: 'Runbook', status: 'published', owner: 'hc',
      updated: 'Nov 8', updatedRel: 'on Nov 8, 2026', age: 3, version: 7, lang: 'en', sections: 9,
      review: 'Nov 1, 2026 (overdue)',
      versions: [
        { n: 7, date: 'Nov 8, 2026', short: 'Nov 8', by: 'hc', note: 'New check of the volume replication.', w: 22 },
        { n: 6, date: 'Oct 12, 2026', short: 'Oct 12', by: 'hc', note: 'Updated node names.', w: 16 },
        { n: 5, date: 'Sep 2, 2026', short: 'Sep 2', by: 'ey', note: 'Added the return to the main site.', w: 30 },
        { n: 4, date: 'Jul 18, 2026', short: 'Jul 18', by: 'hc', note: 'Minor fixes.', w: 16 },
        { n: 3, date: 'Jun 3, 2026', short: 'Jun 3', by: 'hc', note: 'Moved to Kubernetes 1.34.', w: 24 },
        { n: 2, date: 'Apr 21, 2026', short: 'Apr 21', by: 'ey', note: 'Added DNS checks.', w: 18 },
        { n: 1, date: 'Feb 9, 2026', short: 'Feb 9', by: 'hc', note: 'Document created.', w: 46 }
      ],
      passages: [
        { loc: 'Section 2, Check the backup site', text: 'Before the failover, check that the `k8s-backup` cluster is up to date with `kubectl get nodes` and that the volume replication is complete.' },
        { loc: 'Section 5, Return to the main site', text: 'The return to the main site follows the same procedure, once the incident is closed and its cause fixed.' }
      ]
    },
    {
      id: 'inc-2291', title: 'Incident INC-2291: full disk on pg-prod-02', space: 'infrastructure', folder: 'incidents',
      format: 'Word', size: '96 KB', category: 'Incident report', status: 'published', owner: 'ck',
      updated: 'Nov 3', updatedRel: 'on Nov 3, 2026', age: 8, version: 2, lang: 'en', body: 'incident', sections: 6,
      review: 'None',
      versions: [
        { n: 2, date: 'Nov 3, 2026', short: 'Nov 3', by: 'ck', note: 'Added the corrective actions.', w: 26 },
        { n: 1, date: 'Nov 2, 2026', short: 'Nov 2', by: 'ck', note: 'Initial report.', w: 48 }
      ],
      passages: [
        { anchor: 'i-chrono', loc: 'Section Timeline', text: '2:32 PM: the restore on pg-prod-03 fails with `pg_restore: error: role "reporting" does not exist`. The role had been deleted during the October 28 cleanup.' },
        { anchor: 'i-cause', loc: 'Section Cause', text: 'The transaction logs (WAL) had not been archived since the NFS mount failed: the disk of pg-prod-02 filled up in six hours.' },
        { anchor: 'i-resol', loc: 'Section Resolution', text: 'The service was brought back online after purging the archived WAL and restoring the NFS mount. Total downtime: 1 hr 48 min.' }
      ]
    },
    {
      id: 'rotation-tls', title: 'Rotating the internal TLS certificates', space: 'infrastructure', folder: 'procedures',
      format: 'Markdown', size: '9 KB', category: 'Security documentation', status: 'draft', owner: 'ck',
      updated: 'Oct 29', updatedRel: 'on Oct 29, 2026', age: 13, version: 1, lang: 'en', body: 'tls', sections: 3,
      restricted: true, grants: ['ck', 'ey'], review: 'None',
      versions: [{ n: 1, date: 'Oct 29, 2026', short: 'Oct 29', by: 'ck', note: 'First draft.', w: 44 }],
      passages: [
        { anchor: 't-1', loc: 'Section 1, When to renew', text: 'Internal certificates are issued by the `dadagroup-int-ca` authority and renewed every 90 days.' }
      ]
    },
    {
      id: 'guide-baie', title: 'Storage array administration guide', space: 'infrastructure', folder: 'constructeur',
      format: 'PDF', size: '24.8 MB', pagesCount: 312, category: 'Vendor documentation', status: 'published', owner: 'eb',
      updated: 'Oct 21', updatedRel: 'on Oct 21, 2026', age: 21, version: 1, lang: 'en', body: 'pdf', sections: 312,
      review: 'None',
      versions: [{ n: 1, date: 'Oct 21, 2026', short: 'Oct 21', by: 'eb', note: 'Import of the vendor guide, release 2026.1.', w: 56 }],
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
      id: 'archi-sauvegardes', title: 'Backup storage architecture', space: 'infrastructure', folder: 'architecture',
      format: 'Word', size: '412 KB', category: 'Architecture documentation', status: 'published', owner: 'hc',
      updated: 'Oct 17', updatedRel: 'on Oct 17, 2026', age: 25, version: 3, lang: 'en', sections: 8,
      review: 'Oct 15, 2026 (overdue)',
      versions: [
        { n: 3, date: 'Oct 17, 2026', short: 'Oct 17', by: 'hc', note: 'New retention policy.', w: 24 },
        { n: 2, date: 'Jun 30, 2026', short: 'Jun 30', by: 'hc', note: 'Added the object storage of the backup site.', w: 30 },
        { n: 1, date: 'Mar 12, 2026', short: 'Mar 12', by: 'hc', note: 'Document created.', w: 48 }
      ],
      passages: [
        { loc: 'Section Retention', text: 'Full backups are kept for 35 days on the main storage array, then 12 months on the object storage of the backup site.' },
        { loc: 'Section Backup flow', text: 'Every night, the database servers send their full backups to the main storage array, which replicates them to the backup site.' }
      ]
    },
    {
      id: 'schema-cablage', title: 'Server room B cabling diagram', space: 'infrastructure', folder: 'constructeur',
      format: 'PDF', size: '8.7 MB', pagesCount: 4, category: 'Technical documentation', status: 'published', owner: 'ey',
      updated: 'Oct 14', updatedRel: 'on Oct 14, 2026', age: 28, version: 1, lang: 'en', body: 'scan', flags: { scanned: true },
      review: 'None',
      versions: [{ n: 1, date: 'Oct 14, 2026', short: 'Oct 14', by: 'ey', note: 'Scan of the paper diagram.', w: 50 }],
      passages: []
    },
    {
      id: 'barman', title: 'Nightly backups with Barman (old procedure)', space: 'infrastructure', folder: 'runbooks',
      format: 'Markdown', size: '12 KB', category: 'Runbook', status: 'obsolete', obsoleteSince: 'Nov 10, 2026', replacedBy: 'restaurer-pg', owner: 'hc',
      updated: 'Mar 2, 2025', updatedRel: 'on Mar 2, 2025', age: 619, version: 3, lang: 'en', body: 'barman', sections: 4,
      review: 'None',
      versions: [
        { n: 3, date: 'Mar 2, 2025', short: 'Mar 2, 2025', by: 'hc', note: 'Last update before Barman was retired.', w: 20 },
        { n: 2, date: 'Oct 14, 2024', short: 'Oct 14, 2024', by: 'hc', note: 'Added the manual restore.', w: 28 },
        { n: 1, date: 'Jun 5, 2024', short: 'Jun 5, 2024', by: 'hc', note: 'Document created.', w: 44 }
      ],
      passages: [
        { anchor: 'b-2', loc: 'Section Manual restore', text: 'If `pg_restore` fails with `role "barman_ro" does not exist`, create the role again from the initialization script.' }
      ]
    },
    {
      id: 'migration-pg18', title: 'Migration to PostgreSQL 18', space: 'atlas', folder: 'decisions',
      format: 'PDF', size: '2.1 MB', pagesCount: 18, category: 'Architecture documentation', status: 'published', owner: 'hc',
      updated: 'Sep 24', updatedRel: 'on Sep 24, 2026', age: 48, version: 2, lang: 'en', body: 'pdf', sections: 18,
      review: 'Mar 24, 2027',
      versions: [
        { n: 2, date: 'Sep 24, 2026', short: 'Sep 24', by: 'hc', note: 'Decision approved by the architecture board.', w: 22 },
        { n: 1, date: 'Sep 8, 2026', short: 'Sep 8', by: 'hc', note: 'Initial proposal.', w: 46 }
      ],
      passages: [
        { anchor: 'page-7', page: 7, loc: 'Page 7', text: 'Application roles must be created again before any `pg_restore`, otherwise the error `role … does not exist` stops the data migration.' }
      ],
      pages: {
        1: { cover: true, heading: 'Migration to PostgreSQL 18', sub: 'Decision record, Atlas project' },
        7: { heading: '3. Data migration', paras: ['The migration uses a logical backup and a restore on the new servers, one database at a time.', 'Application roles must be created again before any pg_restore, otherwise the error role … does not exist stops the data migration.', 'Each restored database is compared with production before the applications are switched over.'] }
      }
    }
  ];

  var spaceMembers = {
    infrastructure: [
      { id: 'as', role: 'Owner', added: 'Feb 3, 2026' },
      { id: 'hc', role: 'Owner', added: 'Feb 3, 2026' },
      { id: 'ck', role: 'Contributor', added: 'Mar 12, 2026' },
      { id: 'ey', role: 'Contributor', added: 'Jun 2, 2026' },
      { id: 'eb', role: 'Reader', added: 'Jun 2, 2026' }
    ]
  };

  var orgMembers = [
    { id: 'wk', role: 'Owner', spaces: 'All', state: 'Active', last: 'Today' },
    { id: 'as', role: 'Administrator', spaces: 'All', state: 'Active', last: 'Today' },
    { id: 'hc', role: 'Member', spaces: 'Infrastructure, Atlas project', state: 'Active', last: 'Today' },
    { id: 'ck', role: 'Member', spaces: 'Infrastructure, L2 Support, Security', state: 'Active', last: 'Yesterday' },
    { id: 'ey', role: 'Member', spaces: 'Infrastructure, Network, L2 Support', state: 'Active', last: 'Nov 9' },
    { id: 'eb', role: 'Member', spaces: 'Infrastructure', state: 'Active', last: 'Today' }
  ];

  var audit = [
    { when: 'Today, 10:42 AM', who: 'as', type: 'Permissions', text: 'restricted access to “Rotating the internal TLS certificates” (2 people).' },
    { when: 'Today, 10:15 AM', who: 'as', type: 'Import', text: 'imported “Disaster recovery plan 2026”, version 1.' },
    { when: 'Today, 9:58 AM', who: 'eb', type: 'View', text: 'viewed “Restore a PostgreSQL database from a backup”.' },
    { when: 'Today, 9:31 AM', who: null, type: 'Sign-in', text: '5 failed sign-in attempts for herve.coulibaly@dada.group. Account locked for 15 minutes.' },
    { when: 'Today, 8:47 AM', who: 'wk', type: 'Organization', text: 'created the “Business applications” space.' },
    { when: 'Yesterday, 6:04 PM', who: 'as', type: 'Import', text: 'imported version 4 of “Restore a PostgreSQL database from a backup”.' },
    { when: 'Yesterday, 4:20 PM', who: 'as', type: 'Members', text: 'changed the role of Eli Brou in Infrastructure: Reader, previously Contributor.' },
    { when: 'Yesterday, 3:12 PM', who: 'hc', type: 'Status', text: 'marked “Nightly backups with Barman” as outdated.' },
    { when: 'Nov 9, 8:15 AM', who: 'ey', type: 'Download', text: 'downloaded the original of “Server room B cabling diagram”.' },
    { when: 'Nov 8, 5:40 PM', who: 'as', type: 'Members', text: 'created an invitation link for the Infrastructure space (Contributor role).' }
  ];

  /* v0.2: knowledge articles */
  var fiches = [
    {
      id: 'pg-role-manquant', title: 'pg_restore fails: role missing on the target server', status: 'validated',
      tech: ['PostgreSQL'], space: 'infrastructure', author: 'ck', validator: 'as', updated: 'Nov 4', validatedOn: 'Nov 4, 2026',
      origin: 'Created from incident report INC-2291.',
      context: 'Restoring a backup of the billing database on a server other than the original one (recovery after an incident, test environment).',
      symptoms: 'pg_restore stops with ERROR: role "reporting" does not exist. The tables are created but the permissions are not applied.',
      causes: 'The permissions (GRANT) and the ownership of the objects refer to roles that do not exist on the target server, for example after a cleanup of the roles.',
      solution: 'Create the application roles again before the restore, from the cluster initialization script, then run pg_restore again. If the original permissions are not needed on this server, run it again with --no-owner --no-privileges.',
      precautions: 'Never create a role with wider rights than in production. Record the restore in the change ticket.',
      resources: ['restaurer-pg', 'inc-2291', 'migration-pg18']
    },
    {
      id: 'wal-disque', title: 'Disk filled by unarchived WAL files', status: 'validated',
      tech: ['PostgreSQL', 'NFS'], space: 'infrastructure', author: 'ck', validator: 'as', updated: 'Nov 4', validatedOn: 'Nov 4, 2026',
      origin: 'Created from incident report INC-2291.', resources: ['inc-2291', 'archi-sauvegardes']
    },
    {
      id: 'vpn-mtu', title: 'VPN connections that freeze after a few minutes', status: 'review',
      tech: ['IPsec', 'Network'], space: 'reseau', author: 'ey', updated: 'Yesterday', resources: [],
      origin: 'Created from an assistant answer.',
      context: 'IPsec tunnels between the head office and the regional warehouses.',
      symptoms: 'SSH sessions and file transfers freeze after 2 to 5 minutes; pings still go through.',
      causes: 'Maximum packet size (MTU) too high on the tunnel: large packets are fragmented, then lost.',
      solution: 'Lower the tunnel MTU to 1,400 bytes and enable TCP MSS clamping on the firewalls at both ends.',
      precautions: 'Apply the change outside shipping hours; the tunnels restart.'
    },
    { id: 'k8s-pending', title: 'Pods stuck in Pending after the site failover', status: 'draft', tech: ['Kubernetes'], space: 'infrastructure', author: 'hc', updated: 'Nov 8', resources: ['bascule-k8s'] },
    { id: 'cert-api', title: 'Expired internal certificate on the billing API', status: 'validated', tech: ['TLS'], space: 'securite', author: 'ck', validator: 'as', updated: 'Oct 29', resources: ['rotation-tls'] },
    { id: 'ldap-delais', title: 'Slow sign-in to the LDAP directory on Monday mornings', status: 'review', tech: ['LDAP'], space: 'support', author: 'ey', updated: 'Nov 6', resources: [] }
  ];

  /* v0.2: dashboard */
  var dashboard = {
    weeks: [
      ['Aug 24', 148], ['Aug 31', 162], ['Sep 7', 171], ['Sep 14', 158], ['Sep 21', 190], ['Sep 28', 204],
      ['Oct 5', 187], ['Oct 12', 213], ['Oct 19', 226], ['Oct 26', 219], ['Nov 2', 241], ['Nov 9', 258]
    ],
    perSpace: [['L2 Support', 486], ['Network', 214], ['Atlas project', 97], ['Security', 38], ['Infrastructure', 9], ['Business applications', 0]],
    topDocs: [['restaurer-pg', 64], ['bascule-k8s', 41], ['inc-2291', 33], ['guide-baie', 21], ['archi-sauvegardes', 17]],
    gaps: [['renew partner vpn certificate', 9], ['weekend on-call procedure', 7], ['ceph quota', 5], ['bastion ssh key rotation', 4]],
    overdue: [['bascule-k8s', 'Nov 1, 2026'], ['archi-sauvegardes', 'Oct 15, 2026']]
  };

  /* v0.3: assistant */
  var conversations = [
    {
      id: 'c1', when: 'Today, 9:12 AM', question: 'How do I restore the billing database if pg_restore reports a missing role?', kind: 'answer',
      sources: [
        { n: 1, doc: 'restaurer-pg', anchor: 's-4-2', loc: 'Section 4.2, Common errors', quote: 'If pg_restore reports ERROR: role "app_rw" does not exist, the role does not exist on the target server: create it, then run the restore again.' },
        { n: 2, doc: 'restaurer-pg', anchor: 's-3', loc: 'Section 3, Restore the database', quote: 'Create an empty database, then restore the backup with pg_restore and four parallel jobs.' },
        { n: 3, doc: 'inc-2291', anchor: 'i-chrono', loc: 'Section Timeline', quote: 'The restore on pg-prod-03 fails with pg_restore: error: role "reporting" does not exist. The role had been deleted during the October 28 cleanup.' }
      ],
      ignored: [{ doc: 'barman', reason: 'outdated' }]
    },
    {
      id: 'c2', when: 'Yesterday, 5:03 PM', question: 'What is the procedure to renew the partner VPN certificate?', kind: 'none',
      near: ['rotation-tls']
    },
    {
      id: 'c3', when: 'Nov 7, 11:40 AM', question: 'How long do we keep full backups?', kind: 'answer', short: true,
      sources: [{ n: 1, doc: 'archi-sauvegardes', anchor: 'p-0', loc: 'Section Retention', quote: 'Full backups are kept for 35 days on the main storage array, then 12 months on the object storage of the backup site.' }],
      ignored: []
    }
  ];

  /* v0.2: search by meaning, sample results */
  var semantic = {
    question: 'How do I bring a database back online after a crash?',
    results: [
      { doc: 'inc-2291', anchor: 'i-resol', loc: 'Section Resolution', both: false, why: '“brought back online” is close to “bring back online”' },
      { doc: 'restaurer-pg', anchor: 's-3', loc: 'Section 3, Restore the database', both: true, why: '“restore the database” is close to “bring a database back online”' },
      { doc: 'bascule-k8s', anchor: 'p-1', loc: 'Section 5, Return to the main site', both: false, why: '“return to the main site once the incident is closed” suggests a recovery after an outage' },
      { doc: 'archi-sauvegardes', anchor: 'p-1', loc: 'Section Backup flow', both: false, why: 'Describes where the backups used for a recovery come from' }
    ]
  };

  var sources = [
    { id: 'git-runbooks', kind: 'GitLab', name: 'infra/runbooks', detail: 'Branch main, Markdown files', target: 'Infrastructure › Runbooks', files: 42, sync: '12 minutes ago', state: 'ok' },
    { id: 'nas-support', kind: 'Shared folder', name: '\\\\nas01\\docs-support', detail: 'PDF and Word files', target: 'L2 Support', files: 1203, sync: '2 hours ago', state: 'warn', warn: '3 unreadable files' }
  ];

  return {
    people: people, org: org, spaces: spaces, folders: folders, docs: docs,
    spaceMembers: spaceMembers, orgMembers: orgMembers, audit: audit,
    fiches: fiches, dashboard: dashboard, conversations: conversations,
    semantic: semantic, sources: sources
  };
})();

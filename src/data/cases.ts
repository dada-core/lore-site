/* Five situations where Lore helps, shown on the home page and on the use cases page. */
import type { Lang } from '../i18n/routes';
import type { IconName } from '../lib/icons';

export interface Case {
  id: string;
  icon: IconName;
  tab: string;
  title: string;
  who: string;
  text: string;
  before: string;
  after: string;
  query: string;
  result: string;
  where: string;
}

const CASES: Record<Lang, Case[]> = {
  fr: [
    { id: 'databases', icon: 'database', tab: 'Bases de données', title: 'Restaurer une base en pleine nuit', who: 'Administrateurs de bases de données',
      text: 'Une restauration échoue sur un message d’erreur. Il faut la bonne procédure, tout de suite, et être sûr qu’elle est à jour.',
      before: 'Fouiller trois wikis, appeler l’astreinte, espérer que la page trouvée soit encore valable.',
      after: 'Coller le message d’erreur, ouvrir la procédure au passage exact, vérifier qu’elle est publiée et à jour.',
      query: 'pg_restore role "does not exist"', result: 'Restaurer une base PostgreSQL', where: 'Section 4.2, Erreurs fréquentes' },
    { id: 'sysadmin', icon: 'server', tab: 'Administration système', title: 'Diagnostiquer une panne de serveur', who: 'Administrateurs systèmes',
      text: 'Un serveur ne démarre plus. L’équipe a peut-être déjà rencontré ce cas, mais qui s’en souvient ?',
      before: 'Interroger les collègues un par un et relire les anciens tickets.',
      after: 'Retrouver les rapports d’incident similaires, leurs causes et les actions correctives déjà appliquées.',
      query: 'disque plein wal', result: 'Incident INC-2291 : disque saturé sur pg-prod-02', where: 'Section Cause' },
    { id: 'support', icon: 'message', tab: 'Support', title: 'Répondre à une demande récurrente', who: 'Équipes de support',
      text: 'Le même problème de connexion revient chaque semaine. La solution existe, quelque part.',
      before: 'Recommencer l’investigation à chaque fois, ou attendre l’expert.',
      after: 'Chercher le symptôme et retrouver le document publié qui décrit la cause et la solution.',
      query: 'vpn se fige', result: 'Connexions VPN qui se figent après quelques minutes', where: 'Section Solution, document publié' },
    { id: 'development', icon: 'code', tab: 'Développement', title: 'Prendre ses marques dans un projet', who: 'Équipes de développement',
      text: 'Un développeur rejoint l’équipe et doit comprendre l’architecture d’une application existante.',
      before: 'Solliciter plusieurs collègues et parcourir des dépôts sans savoir quel document fait foi.',
      after: 'Un espace projet regroupe l’architecture et les décisions techniques, avec leur statut et leur responsable.',
      query: 'migration postgresql 18', result: 'Migration vers PostgreSQL 18', where: 'Projet Atlas, décisions techniques' },
    { id: 'departures', icon: 'users', tab: 'Départs', title: 'Garder les connaissances quand quelqu’un part', who: 'Responsables d’équipe',
      text: 'Un expert change de poste. Ses procédures et ses retours d’expérience ne doivent pas partir avec lui.',
      before: 'Une passation rapide, et des connaissances qui disparaissent avec la personne.',
      after: 'Les documents restent dans les espaces de l’équipe, avec un nouveau responsable désigné depuis la page de chaque document.',
      query: 'restauration', result: 'Restaurer une base PostgreSQL', where: 'Propriétés › Changer le responsable' }
  ],
  en: [
    { id: 'databases', icon: 'database', tab: 'Databases', title: 'Restoring a database in the middle of the night', who: 'Database administrators',
      text: 'A restore fails with an error message. You need the right procedure, right now, and you need to know it is up to date.',
      before: 'Digging through three wikis, calling whoever is on call, hoping the page you found is still valid.',
      after: 'Paste the error message, open the procedure at the exact passage, check that it is published and current.',
      query: 'pg_restore role "does not exist"', result: 'Restore a PostgreSQL database', where: 'Section 4.2, Common errors' },
    { id: 'sysadmin', icon: 'server', tab: 'System administration', title: 'Diagnosing a server outage', who: 'System administrators',
      text: 'A server no longer boots. The team may have seen this before, but who remembers?',
      before: 'Asking colleagues one by one and rereading old tickets.',
      after: 'Find similar incident reports, their causes and the corrective actions already taken.',
      query: 'disk full wal', result: 'Incident INC-2291: disk full on pg-prod-02', where: 'Cause section' },
    { id: 'support', icon: 'message', tab: 'Support', title: 'Answering a recurring request', who: 'Support teams',
      text: 'The same connection problem comes back every week. The fix exists, somewhere.',
      before: 'Starting the investigation over every time, or waiting for the expert.',
      after: 'Search for the symptom and find the published document that describes the cause and the fix.',
      query: 'vpn freezes', result: 'VPN connections that freeze after a few minutes', where: 'Solution section, published document' },
    { id: 'development', icon: 'code', tab: 'Development', title: 'Getting up to speed on a project', who: 'Development teams',
      text: 'A developer joins the team and needs to understand the architecture of an existing application.',
      before: 'Asking several colleagues and browsing repositories without knowing which document is authoritative.',
      after: 'A project space gathers the architecture and the technical decisions, each with its status and owner.',
      query: 'postgresql 18 migration', result: 'Migration to PostgreSQL 18', where: 'Atlas project, technical decisions' },
    { id: 'departures', icon: 'users', tab: 'Departures', title: 'Keeping knowledge when someone leaves', who: 'Team leads',
      text: 'An expert moves to another role. Their procedures and lessons learned must not leave with them.',
      before: 'A rushed handover, and knowledge that disappears with the person.',
      after: 'Documents stay in the team’s spaces, with a new owner assigned from the page of each document.',
      query: 'restore', result: 'Restore a PostgreSQL database', where: 'Properties › Change the owner' }
  ]
};

export const cases = (lang: Lang) => CASES[lang];

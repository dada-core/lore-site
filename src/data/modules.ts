/* The modules of Lore, as described on the features page. */
import type { Lang } from '../i18n/routes';
import type { IconName } from '../lib/icons';

export type Preview = 'grid' | 'search' | 'perms' | 'strata' | 'fiche' | 'chart' | 'answer' | 'sources';
export type Release = 'v0.1' | 'v0.2' | 'v0.3' | 'later';

export interface Module {
  id: string;
  icon: IconName;
  title: string;
  /* Shorter title for the menu of the features page, when the title is long. */
  short?: string;
  release: Release;
  text: string;
  items: string[];
  preview: Preview;
}

const MODULES: Record<Lang, Module[]> = {
  fr: [
    { id: 'library', icon: 'grid', title: 'Bibliothèque', release: 'v0.1', preview: 'grid',
      text: 'Le socle de Lore : des espaces par équipe ou par domaine, des dossiers, et des documents que l’on importe, consulte et télécharge.',
      items: ['Import de fichiers PDF, Word, texte et Markdown, jusqu’à 50 Mo', 'Vues en grille et en kanban, filtres, tri et regroupements', 'Lecteur intégré, ouvert au bon passage depuis la recherche', 'Métadonnées : catégorie, responsable, langue, statut'] },
    { id: 'search', icon: 'search', title: 'Recherche', release: 'v0.1', preview: 'search',
      text: 'Une recherche plein texte pensée pour la documentation technique, qui respecte strictement les droits de chacun.',
      items: ['Identifiants techniques retrouvés tels quels', 'Accents et pluriels pris en compte, en français et en anglais', 'Extraits surlignés et lien direct vers le passage', 'Recherche par le sens, en plus des mots-clés, en v0.2'] },
    { id: 'permissions', icon: 'lock', title: 'Permissions', release: 'v0.1', preview: 'perms',
      text: 'Les droits sont appliqués dans chaque requête, avant le tri et la pagination : rien ne fuit, ni un titre, ni un extrait, ni un nombre de résultats.',
      items: ['Rôles par espace : lecteur, contributeur, responsable', 'Documents restreints à quelques personnes', 'Un document inaccessible est introuvable, au sens strict', 'Les mêmes règles pour la recherche et pour l’assistant'] },
    { id: 'governance', icon: 'layers', title: 'Versions et gouvernance', short: 'Versions', release: 'v0.1', preview: 'strata',
      text: 'Savoir quelle version fait foi, qui en est responsable et depuis quand.',
      items: ['Chaque import crée une version consultable', 'Statuts : brouillon, publié, obsolète, archivé', 'Journal d’audit des opérations sensibles', 'Dates de révision et circuit de validation en v0.2'] },
    { id: 'knowledge', icon: 'book', title: 'Base de connaissances', short: 'Connaissances', release: 'v0.2', preview: 'fiche',
      text: 'Transformez une investigation ou un incident résolu en fiche réutilisable : problème, symptômes, causes, solution et précautions.',
      items: ['Fiches structurées, liées aux documents sources', 'Validation par les responsables de l’espace', 'Création à partir d’un document, d’un incident ou d’une réponse de l’assistant'] },
    { id: 'insights', icon: 'chart', title: 'Pilotage', release: 'v0.2', preview: 'chart',
      text: 'Voir ce qui est consulté, ce qui vieillit et ce qui manque.',
      items: ['Documents les plus consultés', 'Révisions en retard et documents obsolètes encore consultés', 'Recherches sans résultat : les lacunes de votre documentation'] },
    { id: 'assistant', icon: 'ask', title: 'Assistant', release: 'v0.3', preview: 'answer',
      text: 'Une porte d’entrée en langage naturel, facultative, qui passe par la recherche et en hérite les droits.',
      items: ['Réponses sourcées : document, version et passage', 'Documents obsolètes exclus des réponses', 'Désactivable à tout moment, modèle au choix de l’organisation'] },
    { id: 'sources', icon: 'plug', title: 'Sources connectées', short: 'Sources', release: 'later', preview: 'sources',
      text: 'Indexer la documentation là où elle vit déjà, sans tout migrer.',
      items: ['Fichiers Markdown de dépôts GitHub et GitLab', 'Dossiers partagés de l’entreprise', 'Confluence, SharePoint, Google Drive et OneDrive, avec reprise des permissions'] }
  ],
  en: [
    { id: 'library', icon: 'grid', title: 'Library', release: 'v0.1', preview: 'grid',
      text: 'The foundation of Lore: spaces for each team or domain, folders, and documents you import, read and download.',
      items: ['Import PDF, Word, text and Markdown files, up to 50 MB', 'Grid and kanban views, filters, sorting and grouping', 'Built-in viewer that opens at the right passage from search', 'Metadata: category, owner, language, status'] },
    { id: 'search', icon: 'search', title: 'Search', release: 'v0.1', preview: 'search',
      text: 'Full-text search designed for technical documentation, which strictly respects everyone’s permissions.',
      items: ['Technical identifiers found exactly as typed', 'Accents and plurals handled, in French and English', 'Highlighted excerpts and a direct link to the passage', 'Search by meaning, on top of keywords, in v0.2'] },
    { id: 'permissions', icon: 'lock', title: 'Permissions', release: 'v0.1', preview: 'perms',
      text: 'Permissions are enforced in every query, before sorting and pagination: nothing leaks, not a title, not an excerpt, not a result count.',
      items: ['Space roles: reader, contributor, owner', 'Documents restricted to a few people', 'An inaccessible document cannot be found, in the strictest sense', 'The same rules for search and for the assistant'] },
    { id: 'governance', icon: 'layers', title: 'Versions and governance', short: 'Versions', release: 'v0.1', preview: 'strata',
      text: 'Know which version is authoritative, who owns it, and since when.',
      items: ['Every import creates a version you can open', 'Statuses: draft, published, outdated, archived', 'Audit log of sensitive operations', 'Review dates and an approval workflow in v0.2'] },
    { id: 'knowledge', icon: 'book', title: 'Knowledge base', short: 'Knowledge', release: 'v0.2', preview: 'fiche',
      text: 'Turn an investigation or a resolved incident into a reusable record: problem, symptoms, causes, fix and precautions.',
      items: ['Structured records, linked to their source documents', 'Approval by the space owners', 'Created from a document, an incident or an assistant answer'] },
    { id: 'insights', icon: 'chart', title: 'Insights', release: 'v0.2', preview: 'chart',
      text: 'See what gets read, what is getting old and what is missing.',
      items: ['Most-read documents', 'Overdue reviews and outdated documents still being read', 'Searches with no results: the gaps in your documentation'] },
    { id: 'assistant', icon: 'ask', title: 'Assistant', release: 'v0.3', preview: 'answer',
      text: 'An optional way in, in natural language, that goes through search and inherits its permissions.',
      items: ['Sourced answers: document, version and passage', 'Outdated documents excluded from answers', 'Can be turned off at any time, with the model your organization chooses'] },
    { id: 'sources', icon: 'plug', title: 'Connected sources', short: 'Sources', release: 'later', preview: 'sources',
      text: 'Index documentation where it already lives, without migrating everything.',
      items: ['Markdown files from GitHub and GitLab repositories', 'Your organization’s shared folders', 'Confluence, SharePoint, Google Drive and OneDrive, with their permissions'] }
  ]
};

export const modules = (lang: Lang) => MODULES[lang];

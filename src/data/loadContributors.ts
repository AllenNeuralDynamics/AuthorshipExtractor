/**
 * Load paper metadata and contributor profiles from YAML files at runtime.
 * All content lives in public/ — no hardcoded data in source.
 *
 * Directories:
 *   - paper.yaml              — manuscript metadata (title, abstract, sections…)
 *   - contributors/simulated/ — fictional demo team
 *   - contributors/           — real project contributors
 */
import YAML from 'yaml';
import type {
  Paper,
  AuthorProfile,
  AuthorContribution,
  ManuscriptSection,
} from '../types';

const BASE = import.meta.env.BASE_URL;

interface RawIndex {
  contributors: string[];
}

interface RawContributor {
  profile: Omit<AuthorProfile, 'visibility'> & {
    visibility?: AuthorProfile['visibility'];
  };
  contribution: Omit<AuthorContribution, 'authorId'>;
}

const DEFAULT_VISIBILITY: AuthorProfile['visibility'] = {
  showPronouns: true,
  showBio: true,
  showFunding: true,
  showMetrics: true,
  showSocialLinks: true,
  showTechniques: true,
  showCareerStage: true,
};

/** Fetch and parse a YAML file from the public folder */
async function fetchYaml<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  const text = await res.text();
  return YAML.parse(text) as T;
}

/** Paper metadata loaded once and cached */
let paperMetadataCache: Omit<Paper, 'authors' | 'contributions'> | null = null;

/** Load paper metadata (title, abstract, sections, etc.) from paper.yaml */
export async function loadPaperMetadata(): Promise<Omit<Paper, 'authors' | 'contributions'>> {
  if (paperMetadataCache) return paperMetadataCache;
  const raw = await fetchYaml<Omit<Paper, 'authors' | 'contributions'>>('paper.yaml');
  paperMetadataCache = raw;
  return raw;
}

/**
 * Load contributors from a given directory and build a Paper object.
 * Loads paper metadata from paper.yaml, then overlays authors/contributions.
 */
async function loadContributorsFrom(dir: string, paperId: string): Promise<Paper> {
  const [paperMeta, index] = await Promise.all([
    loadPaperMetadata(),
    fetchYaml<RawIndex>(`${dir}/_index.yaml`),
  ]);

  const rawContributors = await Promise.all(
    index.contributors.map((file) =>
      fetchYaml<RawContributor>(`${dir}/${file}`),
    ),
  );

  const authors: AuthorProfile[] = [];
  const contributions: AuthorContribution[] = [];

  for (const raw of rawContributors) {
    const profile: AuthorProfile = {
      ...raw.profile,
      visibility: raw.profile.visibility ?? DEFAULT_VISIBILITY,
    };
    authors.push(profile);

    contributions.push({
      ...raw.contribution,
      authorId: profile.id,
      // Defaults for optional fields
      figureContributions: raw.contribution.figureContributions ?? [],
      sectionContributions: raw.contribution.sectionContributions ?? [],
      creditRoles: raw.contribution.creditRoles ?? [],
      isCorresponding: raw.contribution.isCorresponding ?? false,
    });
  }

  // Default sort: earliest joinedDate first, then alphabetical by last name
  const joinDate = (c: AuthorContribution) => c.timeline?.joinedDate ?? '9999';
  const lastName = (id: string) => authors.find(a => a.id === id)?.lastName ?? '';
  contributions.sort((a, b) => joinDate(a).localeCompare(joinDate(b)) || lastName(a.authorId).localeCompare(lastName(b.authorId)));
  const orderMap = new Map(contributions.map((c, i) => [c.authorId, i]));
  authors.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

  // Filter sections to only those with at least one contributor
  const contributedSectionIds = new Set(
    contributions.flatMap((c) => c.sectionContributions.map((s) => s.sectionId)),
  );

  function filterSections(secs: ManuscriptSection[]): ManuscriptSection[] {
    const result: ManuscriptSection[] = [];
    for (const s of secs) {
      const sub = s.subsections ? filterSections(s.subsections) : undefined;
      const hasContent =
        contributedSectionIds.has(s.id) || (sub && sub.length > 0);
      if (hasContent) {
        result.push({ ...s, subsections: sub });
      }
    }
    return result;
  }

  return {
    ...paperMeta,
    id: paperId,
    authors,
    contributions,
    sections: filterSections(paperMeta.sections),
  };
}

/** Load the simulated (fictional) 7-author team */
export function loadSimulatedContributors(): Promise<Paper> {
  return loadContributorsFrom('contributors/simulated', 'simulated-team');
}

/** Load real project contributors */
export function loadRealContributors(): Promise<Paper> {
  return loadContributorsFrom('contributors', 'real-contributors');
}

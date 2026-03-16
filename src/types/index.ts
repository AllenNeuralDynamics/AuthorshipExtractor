// ============================================================
// Core types for the Reimagined Authorship System
// ============================================================

/** CRediT (Contributor Roles Taxonomy) roles */
export type CreditRole =
  | 'Conceptualization'
  | 'Methodology'
  | 'Software'
  | 'Validation'
  | 'Formal Analysis'
  | 'Investigation'
  | 'Resources'
  | 'Data Curation'
  | 'Writing – Original Draft'
  | 'Writing – Review & Editing'
  | 'Visualization'
  | 'Supervision'
  | 'Project Administration'
  | 'Funding Acquisition';

export type ContributionLevel = 'lead' | 'equal' | 'supporting';

export type CareerStage =
  | 'Undergraduate'
  | 'Graduate Student'
  | 'PhD Candidate'
  | 'Postdoctoral Researcher'
  | 'Research Scientist'
  | 'Assistant Professor'
  | 'Associate Professor'
  | 'Full Professor'
  | 'Lab Manager'
  | 'Research Engineer'
  | 'Industry Researcher'
  | 'Emeritus';

export interface Affiliation {
  institution: string;
  department?: string;
  role?: string;
  country: string;
  startDate?: string;
  isCurrent: boolean;
  rorId?: string; // Research Organization Registry
}

export interface FundingSource {
  funder: string;
  grantId?: string;
  grantTitle?: string;
  role: 'PI' | 'Co-PI' | 'Co-I' | 'Trainee' | 'Consultant';
}

export interface SocialLink {
  platform: 'orcid' | 'google-scholar' | 'twitter' | 'github' | 'website' | 'bluesky' | 'mastodon' | 'researchgate' | 'linkedin' | 'email';
  url: string;
  username?: string;
}

export interface Technique {
  name: string;
  category: 'experimental' | 'computational' | 'analytical' | 'clinical' | 'imaging';
  proficiency?: 'expert' | 'proficient' | 'familiar';
}

export interface AuthorProfile {
  id: string;
  firstName: string;
  lastName: string;
  pronouns?: string;
  avatarUrl?: string;
  orcid?: string;
  careerStage: CareerStage;
  bio: string;
  affiliations: Affiliation[];
  socialLinks: SocialLink[];
  techniques: Technique[];
  fundingSources: FundingSource[];
  publicationCount?: number;
  hIndex?: number;
  // Author-controlled visibility settings
  visibility: {
    showPronouns: boolean;
    showBio: boolean;
    showFunding: boolean;
    showMetrics: boolean;
    showSocialLinks: boolean;
    showTechniques: boolean;
    showCareerStage: boolean;
  };
}

// ============================================================
// Manuscript structure
// ============================================================

export interface ManuscriptSection {
  id: string;
  title: string;
  type: 'abstract' | 'introduction' | 'methods' | 'results' | 'discussion' | 'supplementary' | 'data-availability' | 'acknowledgments';
  subsections?: ManuscriptSection[];
  /** Figures/tables belonging to this section */
  figures?: FigureReference[];
}

export interface FigureReference {
  id: string;
  label: string; // e.g. "Figure 3"
  title: string;
  thumbnailUrl?: string;
  /** Name of the React component to render this figure inline (if interactive). */
  component?: string;
}

// ============================================================
// Contribution mapping — the core innovation
// ============================================================

export interface CreditContribution {
  role: CreditRole;
  level: ContributionLevel;
}

export type EffortLevel = 'lead' | 'major' | 'minor';

export interface SectionContribution {
  sectionId: string;
  description: string;
  effortLevel?: EffortLevel;
}

export interface FigureContribution {
  figureId: string;
  description: string;
}

export interface AuthorContribution {
  authorId: string;
  creditRoles: CreditContribution[];
  sectionContributions: SectionContribution[];
  figureContributions: FigureContribution[];
  /** Free-text author statement */
  contributionStatement?: string;
  /** When the author joined/left the project */
  timeline?: {
    joinedDate: string;
    leftDate?: string;
    milestones?: { date: string; event: string }[];
  };
  isCorresponding: boolean;
}

// ============================================================
// Paper / Publication
// ============================================================

export interface Paper {
  id: string;
  doi: string;
  title: string;
  journal: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publishedDate: string;
  receivedDate: string;
  acceptedDate: string;
  abstract: string;
  keywords: string[];
  sections: ManuscriptSection[];
  authors: AuthorProfile[];
  contributions: AuthorContribution[];
  openAccess: boolean;
  license?: string;
  dataAvailability?: string;
  codeAvailability?: string;
}

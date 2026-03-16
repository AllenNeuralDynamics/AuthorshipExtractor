import type { ContributionLevel, CreditRole } from './types';

/** Generate consistent initials-based avatar color from name */
export function avatarColor(name: string): string {
  const colors = [
    'bg-journal-600', 'bg-accent-teal', 'bg-accent-violet',
    'bg-accent-amber', 'bg-accent-rose', 'bg-accent-emerald',
    'bg-journal-800', 'bg-indigo-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export function contributionColor(level: ContributionLevel): string {
  switch (level) {
    case 'lead': return 'bg-journal-700 text-white';
    case 'equal': return 'bg-journal-200 text-journal-900';
    case 'supporting': return 'bg-gray-200 text-gray-700';
    default: return 'bg-gray-200 text-gray-700';
  }
}

export function contributionDot(level: ContributionLevel): string {
  switch (level) {
    case 'lead': return 'bg-journal-700';
    case 'equal': return 'bg-journal-400';
    case 'supporting': return 'bg-gray-300';
    default: return 'bg-gray-300';
  }
}

export const CREDIT_ROLE_ICONS: Record<CreditRole, string> = {
  'Conceptualization': '💡',
  'Methodology': '🔬',
  'Software': '💻',
  'Validation': '✅',
  'Formal Analysis': '📊',
  'Investigation': '🔍',
  'Resources': '🧰',
  'Data Curation': '🗄️',
  'Writing – Original Draft': '✍️',
  'Writing – Review & Editing': '📝',
  'Visualization': '📈',
  'Supervision': '👥',
  'Project Administration': '📋',
  'Funding Acquisition': '💰',
};

export const ALL_CREDIT_ROLES: CreditRole[] = [
  'Conceptualization',
  'Methodology',
  'Software',
  'Validation',
  'Formal Analysis',
  'Investigation',
  'Resources',
  'Data Curation',
  'Writing – Original Draft',
  'Writing – Review & Editing',
  'Visualization',
  'Supervision',
  'Project Administration',
  'Funding Acquisition',
];

export function platformIcon(platform: string): string {
  switch (platform) {
    case 'orcid': return '🆔';
    case 'google-scholar': return '🎓';
    case 'twitter': return '𝕏';
    case 'github': return '🐙';
    case 'website': return '🌐';
    case 'bluesky': return '🦋';
    case 'mastodon': return '🦣';
    case 'researchgate': return '🔬';
    case 'linkedin': return '💼';
    case 'email': return '✉️';
    default: return '🔗';
  }
}

export function platformLabel(platform: string): string {
  switch (platform) {
    case 'orcid': return 'ORCID';
    case 'google-scholar': return 'Google Scholar';
    case 'twitter': return 'X / Twitter';
    case 'github': return 'GitHub';
    case 'website': return 'Personal Website';
    case 'bluesky': return 'Bluesky';
    case 'mastodon': return 'Mastodon';
    case 'researchgate': return 'ResearchGate';
    case 'linkedin': return 'LinkedIn';
    case 'email': return 'Email';
    default: return platform;
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatMonthYear(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

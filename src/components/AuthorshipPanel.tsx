import { useState, useMemo } from 'react';
import type { Paper, AuthorContribution, CreditRole } from '../types';
import { avatarColor, initials, contributionColor, ALL_CREDIT_ROLES, CREDIT_ROLE_ICONS } from '../utils';
import ContributionMatrix from './ContributionMatrix';
import SectionContributions from './SectionContributions';
import ProjectTimeline from './ProjectTimeline';
import CollaborationGraph from './CollaborationGraph';
import ApiPanel from './ApiPanel';

// ─── Sort Dimensions ───────────────────────────────────────────
// Authorship is NOT a 1D vector. We expose many lenses.

type SortKey =
  | 'alpha'
  | 'reverse-alpha'
  | 'career-senior'
  | 'career-junior'
  | 'most-roles'
  | 'most-sections'
  | 'most-figures'
  | 'joined-first'
  | 'joined-last'
  | 'institution'
  | `credit:${string}`;

interface SortOption {
  key: SortKey;
  label: string;
  description: string;
  icon: string;
  group: 'general' | 'activity' | 'timeline' | 'credit';
}

const MAIN_SORT_OPTIONS: SortOption[] = [
  { key: 'alpha', label: 'A → Z', description: 'Alphabetical by last name', icon: '🔤', group: 'general' },
  { key: 'reverse-alpha', label: 'Z → A', description: 'Reverse alphabetical', icon: '🔠', group: 'general' },
  { key: 'career-senior', label: 'Senior first', description: 'By career seniority (senior → junior)', icon: '🎓', group: 'general' },
  { key: 'career-junior', label: 'Junior first', description: 'By career seniority (junior → senior)', icon: '🌱', group: 'general' },
  { key: 'most-roles', label: 'Most roles', description: 'By number of CRediT roles', icon: '🏷️', group: 'activity' },
  { key: 'most-sections', label: 'Most sections', description: 'By number of sections contributed to', icon: '📑', group: 'activity' },
  { key: 'most-figures', label: 'Most figures', description: 'By number of figures contributed to', icon: '📊', group: 'activity' },
  { key: 'joined-first', label: 'Joined first', description: 'By project join date (earliest first)', icon: '⏳', group: 'timeline' },
  { key: 'joined-last', label: 'Joined last', description: 'By project join date (latest first)', icon: '🆕', group: 'timeline' },
  { key: 'institution', label: 'By institution', description: 'Grouped by primary institution', icon: '🏛️', group: 'general' },
];

// Build CRediT role sort options dynamically
const CREDIT_SORT_OPTIONS: SortOption[] = ALL_CREDIT_ROLES.map(role => ({
  key: `credit:${role}` as SortKey,
  label: role.replace('Writing – ', 'W: ').replace('Formal ', 'F. ').replace('Funding ', 'Fund. ').replace('Project ', 'Proj. '),
  description: `Sort by contribution to "${role}"`,
  icon: CREDIT_ROLE_ICONS[role],
  group: 'credit' as const,
}));

const ALL_SORT_OPTIONS = [...MAIN_SORT_OPTIONS, ...CREDIT_SORT_OPTIONS];

/**
 * Career stage seniority ranking — higher number = more senior.
 * Used for "Senior first" / "Junior first" sort dimensions.
 */
const CAREER_RANK: Record<string, number> = {
  'Undergraduate': 0, 'Graduate Student': 1, 'PhD Candidate': 2,
  'Postdoctoral Researcher': 3, 'Research Engineer': 4, 'Lab Manager': 5,
  'Research Scientist': 6, 'Assistant Professor': 7, 'Associate Professor': 8,
  'Full Professor': 9, 'Industry Researcher': 10, 'Emeritus': 11,
};

/** CRediT contribution level ranking — used for per-role sorting. */
const LEVEL_RANK: Record<string, number> = { lead: 3, equal: 2, supporting: 1 };

/**
 * Sort author contributions by the given sort key.
 * For CRediT role sorts ("credit:RoleName"), ranks by lead > equal > supporting.
 * Falls back to alphabetical for ties.
 */
function sortContributions(
  contributions: AuthorContribution[],
  authors: Paper['authors'],
  sortKey: SortKey,
): AuthorContribution[] {
  const sorted = [...contributions];
  const getAuthor = (c: AuthorContribution) => authors.find(x => x.id === c.authorId)!;

  // Handle credit role sorting
  if (sortKey.startsWith('credit:')) {
    const roleName = sortKey.slice(7) as CreditRole;
    return sorted.sort((a, b) => {
      const aRole = a.creditRoles.find(r => r.role === roleName);
      const bRole = b.creditRoles.find(r => r.role === roleName);
      const aRank = aRole ? (LEVEL_RANK[aRole.level] ?? 0) : 0;
      const bRank = bRole ? (LEVEL_RANK[bRole.level] ?? 0) : 0;
      if (bRank !== aRank) return bRank - aRank;
      return getAuthor(a).lastName.localeCompare(getAuthor(b).lastName);
    });
  }

  switch (sortKey) {
    case 'alpha':
      return sorted.sort((a, b) => getAuthor(a).lastName.localeCompare(getAuthor(b).lastName));
    case 'reverse-alpha':
      return sorted.sort((a, b) => getAuthor(b).lastName.localeCompare(getAuthor(a).lastName));
    case 'career-senior':
      return sorted.sort((a, b) => (CAREER_RANK[getAuthor(b).careerStage] ?? 0) - (CAREER_RANK[getAuthor(a).careerStage] ?? 0));
    case 'career-junior':
      return sorted.sort((a, b) => (CAREER_RANK[getAuthor(a).careerStage] ?? 0) - (CAREER_RANK[getAuthor(b).careerStage] ?? 0));
    case 'most-roles':
      return sorted.sort((a, b) => b.creditRoles.length - a.creditRoles.length);
    case 'most-sections':
      return sorted.sort((a, b) => b.sectionContributions.length - a.sectionContributions.length);
    case 'most-figures':
      return sorted.sort((a, b) => b.figureContributions.length - a.figureContributions.length);
    case 'joined-first':
      return sorted.sort((a, b) => (a.timeline?.joinedDate ?? '9999').localeCompare(b.timeline?.joinedDate ?? '9999'));
    case 'joined-last':
      return sorted.sort((a, b) => (b.timeline?.joinedDate ?? '0000').localeCompare(a.timeline?.joinedDate ?? '0000'));
    case 'institution':
      return sorted.sort((a, b) => {
        const aInst = getAuthor(a).affiliations.find(af => af.isCurrent)?.institution ?? '';
        const bInst = getAuthor(b).affiliations.find(af => af.isCurrent)?.institution ?? '';
        return aInst.localeCompare(bInst) || getAuthor(a).lastName.localeCompare(getAuthor(b).lastName);
      });
    default:
      return sorted;
  }
}

// ─── Tab types ─────────────────────────────────────────────────
type TabId = 'profiles' | 'matrix' | 'graph' | 'sections' | 'timeline' | 'api';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'profiles', label: 'Profiles', icon: '👤' },
  { id: 'matrix', label: 'CRediT Matrix', icon: '🔵' },
  { id: 'graph', label: 'Collaboration', icon: '🕸️' },
  { id: 'sections', label: 'Section Map', icon: '📑' },
  { id: 'timeline', label: 'Timeline', icon: '📅' },
  { id: 'api', label: 'API', icon: '⚡' },
];

// ─── Main Component ────────────────────────────────────────────
interface Props {
  paper: Paper;
  onAuthorSelect: (authorId: string) => void;
}

export default function AuthorshipPanel({ paper, onAuthorSelect }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('alpha');
  const [activeTab, setActiveTab] = useState<TabId>('profiles');
  const [showCreditMenu, setShowCreditMenu] = useState(false);

  const sortedContributions = useMemo(
    () => sortContributions(paper.contributions, paper.authors, sortKey),
    [paper, sortKey]
  );

  const currentSort = ALL_SORT_OPTIONS.find(o => o.key === sortKey) ?? MAIN_SORT_OPTIONS[0];

  const isCreditSort = sortKey.startsWith('credit:');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* ─── Prominent sort bar ─── */}
      <div className="px-6 pt-5 pb-3 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Authors</h2>
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-journal-100 text-journal-700">
            {paper.authors.length}
          </span>
          <span className="text-gray-200 mx-1">|</span>
          <span className="text-[11px] text-gray-400">Order by:</span>
        </div>

        {/* Sort chips — immediately visible and interactive */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {MAIN_SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              className={`px-2.5 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
                sortKey === opt.key
                  ? 'bg-journal-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-journal-300 hover:text-journal-700'
              }`}
            >
              <span className="mr-1">{opt.icon}</span>
              {opt.label}
            </button>
          ))}

          {/* CRediT Role dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setShowCreditMenu(!showCreditMenu)}
              className={`px-2.5 py-1.5 text-[11px] font-medium rounded-lg transition-all flex items-center gap-1 ${
                isCreditSort
                  ? 'bg-journal-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-journal-300 hover:text-journal-700'
              }`}
            >
              🏷️ CRediT Role
              <span className={`text-[9px] transition-transform duration-200 ${showCreditMenu ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {showCreditMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowCreditMenu(false)} />
                <div className="absolute left-0 top-full mt-1 z-40 w-72 bg-white rounded-xl border border-gray-200 shadow-xl py-1 tooltip-anim max-h-80 overflow-y-auto">
                  <div className="px-3 py-2 border-b border-gray-100 sticky top-0 bg-white">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Sort by specific CRediT role
                    </p>
                  </div>
                  {CREDIT_SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => { setSortKey(opt.key); setShowCreditMenu(false); }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-sm transition-colors ${
                        sortKey === opt.key
                          ? 'bg-journal-50 text-journal-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-base w-6 text-center">{opt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{opt.label}</p>
                      </div>
                      {sortKey === opt.key && <span className="ml-auto text-journal-500 flex-shrink-0">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active sort description */}
        <p className="text-[10px] text-gray-400 mt-2 italic">
          Sorted: {currentSort.description}
          {isCreditSort && ' — lead → equal → supporting → none'}
        </p>
      </div>

      {/* ─── Author names ─── */}
      <div className="px-6 py-4">
        <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5 text-[15px] leading-relaxed">
          {sortedContributions.map((c, i) => {
            const author = paper.authors.find(a => a.id === c.authorId)!;
            const isLast = i === sortedContributions.length - 1;

            // For credit sorts, show the level badge
            const creditLevel = isCreditSort
              ? c.creditRoles.find(r => r.role === sortKey.slice(7))?.level
              : null;

            return (
              <span key={c.authorId} className="inline-flex items-baseline">
                <button
                  onClick={() => onAuthorSelect(c.authorId)}
                  className="text-journal-700 hover:text-journal-900 hover:underline underline-offset-2 transition-colors font-medium"
                >
                  {author.firstName} {author.lastName}
                </button>
                {creditLevel && (
                  <span className={`text-[8px] ml-0.5 px-1 py-0 rounded-full font-bold align-super ${
                    creditLevel === 'lead' ? 'bg-journal-700 text-white' :
                    creditLevel === 'equal' ? 'bg-journal-200 text-journal-800' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {creditLevel === 'lead' ? 'L' : creditLevel === 'equal' ? 'E' : 'S'}
                  </span>
                )}
                {c.isCorresponding && (
                  <span className="text-[10px] text-amber-500 ml-0.5" title="Corresponding author">✉</span>
                )}
                {!isLast && <span className="text-gray-300 mr-0.5">,</span>}
              </span>
            );
          })}
        </div>

        {/* Affiliation line */}
        <div className="mt-2 text-xs text-gray-400">
          {[...new Set(paper.authors.flatMap(a => a.affiliations.filter(af => af.isCurrent).map(af => af.institution)))].join(' · ')}
        </div>

        {/* Legend + expand toggle */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            {isCreditSort && <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-journal-700 align-middle mr-0.5" />Lead <span className="inline-block w-2.5 h-2.5 rounded-full bg-journal-200 align-middle mx-0.5" />Equal <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-200 align-middle mx-0.5" />Supporting</span>}
            <span>✉ Corresponding</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 shadow-sm ${
              expanded
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-journal-600 text-white hover:bg-journal-700 hover:shadow-md animate-[pulse_3s_ease-in-out_2]'
            }`}
          >
            {expanded ? 'Collapse' : '✦ Explore contributions'}
            <span className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▾</span>
          </button>
        </div>
      </div>

      {/* ─── Expanded: full authorship exploration ─── */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Tab navigation */}
          <div className="flex border-b border-gray-100 px-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-journal-600 text-journal-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'profiles' && (
              <div className="space-y-2.5">
                {sortedContributions.map((c) => {
                  const author = paper.authors.find(a => a.id === c.authorId)!;
                  const bg = avatarColor(author.firstName + author.lastName);
                  const currentAffs = author.affiliations.filter(a => a.isCurrent);
                  const topRoles = c.creditRoles.slice(0, 4);
                  const orcidLink = author.socialLinks.find(l => l.platform === 'orcid');

                  return (
                    <button
                      key={c.authorId}
                      onClick={() => onAuthorSelect(c.authorId)}
                      className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group"
                    >
                      {/* Avatar */}
                      <div className={`relative flex-shrink-0 w-11 h-11 rounded-full ${bg} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                        {initials(author.firstName, author.lastName)}
                        {c.isCorresponding && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[8px] border-2 border-white">✉</span>
                        )}
                      </div>

                      {/* Name + affiliation */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-gray-900 group-hover:text-journal-700 transition-colors">
                            {author.firstName} {author.lastName}
                          </span>
                          {author.visibility.showCareerStage && (
                            <span className="text-[10px] text-gray-400">{author.careerStage}</span>
                          )}
                          {orcidLink && (
                            <span
                              className="text-[10px] text-emerald-600 font-mono hidden sm:inline cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); window.open(orcidLink.url, '_blank', 'noopener,noreferrer'); }}
                              role="link"
                            >
                              🆔
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {currentAffs.map(a => `${a.department ? a.department + ', ' : ''}${a.institution}`).join(' · ')}
                        </p>
                      </div>

                      {/* CRediT role badges */}
                      <div className="flex-shrink-0 hidden md:flex flex-wrap gap-1 max-w-[260px] justify-end">
                        {topRoles.map(({ role, level }) => (
                          <span
                            key={role}
                            className={`px-1.5 py-0.5 text-[9px] font-medium rounded-full ${contributionColor(level)}`}
                          >
                            {role.replace('Writing – ', '').replace('Formal ', '')}
                          </span>
                        ))}
                        {c.creditRoles.length > 4 && (
                          <span className="px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-gray-100 text-gray-500">
                            +{c.creditRoles.length - 4}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'matrix' && (
              <ContributionMatrix paper={paper} onAuthorSelect={onAuthorSelect} />
            )}

            {activeTab === 'graph' && (
              <CollaborationGraph paper={paper} onAuthorSelect={onAuthorSelect} />
            )}

            {activeTab === 'sections' && (
              <SectionContributions paper={paper} onAuthorSelect={onAuthorSelect} />
            )}

            {activeTab === 'timeline' && (
              <ProjectTimeline paper={paper} onAuthorSelect={onAuthorSelect} />
            )}

            {activeTab === 'api' && (
              <ApiPanel />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

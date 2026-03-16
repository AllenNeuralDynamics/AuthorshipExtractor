import { useEffect } from 'react';
import type { AuthorProfile, AuthorContribution, Paper } from '../types';
import {
  avatarColor, initials, contributionColor, platformIcon, platformLabel,
  formatMonthYear, CREDIT_ROLE_ICONS,
} from '../utils';

interface Props {
  author: AuthorProfile;
  contribution: AuthorContribution;
  paper: Paper;
  onClose: () => void;
}

export default function AuthorDetailModal({ author, contribution, paper, onClose }: Props) {
  const bgColor = avatarColor(author.firstName + author.lastName);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Map section IDs to titles
  const sectionMap = new Map<string, string>();
  for (const s of paper.sections) {
    sectionMap.set(s.id, s.title);
    if (s.subsections) {
      for (const sub of s.subsections) {
        sectionMap.set(sub.id, sub.title);
      }
    }
  }

  // Map figure IDs to labels
  const figureMap = new Map<string, string>();
  for (const s of paper.sections) {
    for (const fig of s.figures ?? []) {
      figureMap.set(fig.id, `${fig.label}: ${fig.title}`);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="fixed inset-0 flex items-start justify-center pt-12 pb-12 px-4 overflow-y-auto z-50">
        <div
          className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-8 pb-6" style={{ background: 'var(--color-journal-gradient)' }}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-5">
              <div className={`flex-shrink-0 w-20 h-20 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-2xl border-4 border-white/30 shadow-lg`}>
                {initials(author.firstName, author.lastName)}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">
                  {author.firstName} {author.lastName}
                  {author.visibility.showPronouns && author.pronouns && (
                    <span className="text-white/60 text-base font-normal ml-2">({author.pronouns})</span>
                  )}
                </h2>
                {author.visibility.showCareerStage && (
                  <p className="text-white/80 mt-1">{author.careerStage}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-white/70">
                  {author.affiliations.filter(a => a.isCurrent).map((aff, i) => (
                    <span key={i}>
                      {aff.department ? `${aff.department}, ` : ''}{aff.institution}
                    </span>
                  ))}
                </div>
                {/* Metrics */}
                {author.visibility.showMetrics && (
                  <div className="flex gap-4 mt-3 text-sm">
                    {author.publicationCount && (
                      <span className="text-white/80">
                        <span className="text-white font-semibold">{author.publicationCount}</span> publications
                      </span>
                    )}
                    {author.hIndex && (
                      <span className="text-white/80">
                        h-index: <span className="text-white font-semibold">{author.hIndex}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Badges - corresponding, equal contribution */}
            <div className="flex gap-2 mt-4">
              {contribution.isCorresponding && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-amber-400/20 text-amber-100 border border-amber-400/30">
                  ✉ Corresponding Author
                </span>
              )}
              {contribution.equalContribution && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-white/20 text-white border border-white/30">
                  = Equal Contribution
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-8">
            {/* Social links */}
            {author.visibility.showSocialLinks && author.socialLinks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Links & Profiles</h3>
                <div className="flex flex-wrap gap-2">
                  {author.socialLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-50 hover:bg-journal-50 text-gray-700 hover:text-journal-700 border border-gray-200 hover:border-journal-200 transition-colors"
                    >
                      <span>{platformIcon(link.platform)}</span>
                      <span>{link.username || platformLabel(link.platform)}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* CRediT roles */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">CRediT Roles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {contribution.creditRoles.map(({ role, level }) => (
                  <div
                    key={role}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <span className="text-lg">{CREDIT_ROLE_ICONS[role]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{role}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase ${contributionColor(level)}`}>
                      {level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section contributions */}
            {contribution.sectionContributions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Section-Level Contributions</h3>
                <div className="space-y-2">
                  {contribution.sectionContributions.map((sc) => (
                    <div key={sc.sectionId} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-journal-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {sectionMap.get(sc.sectionId) || sc.sectionId}
                        </p>
                        <p className="text-sm text-gray-700 mt-0.5">{sc.description}</p>
                      </div>
                      {sc.effortLevel && (
                        <span className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          sc.effortLevel === 'lead' ? 'bg-journal-100 text-journal-700' :
                          sc.effortLevel === 'major' ? 'bg-journal-50 text-journal-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {sc.effortLevel}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Figure contributions */}
            {contribution.figureContributions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Figure Contributions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {contribution.figureContributions.map((fc) => (
                    <div key={fc.figureId} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-xs font-semibold text-journal-700">{figureMap.get(fc.figureId) || fc.figureId}</p>
                      <p className="text-xs text-gray-600 mt-1">{fc.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {contribution.timeline && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Project Timeline</h3>
                <div className="timeline-line pl-10 space-y-4 pb-2">
                  {contribution.timeline.milestones?.map((ms, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-journal-500 border-2 border-white shadow" />
                      <p className="text-xs font-mono text-gray-400">{formatMonthYear(ms.date)}</p>
                      <p className="text-sm text-gray-700">{ms.event}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Funding */}
            {author.visibility.showFunding && author.fundingSources.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Funding</h3>
                <div className="space-y-2">
                  {author.fundingSources.map((fs, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                      <span className="text-lg">💰</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{fs.funder}{fs.grantId ? ` (${fs.grantId})` : ''}</p>
                        {fs.grantTitle && <p className="text-xs text-gray-500">{fs.grantTitle}</p>}
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-200 text-gray-600 uppercase">
                        {fs.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

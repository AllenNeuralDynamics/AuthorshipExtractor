import { useState } from 'react';
import type { Paper } from '../types';
import { avatarColor, initials } from '../utils';

interface Props {
  paper: Paper;
  onAuthorSelect: (authorId: string) => void;
}

export default function AuthorListCompact({ paper, onAuthorSelect }: Props) {
  const [expanded, setExpanded] = useState(false);

  const sortedContributions = paper.contributions;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Compact inline list — always visible */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Authors</h2>
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-journal-100 text-journal-700">
            {paper.authors.length}
          </span>
        </div>

        {/* Inline author names — like a real paper */}
        <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5 text-[15px] leading-relaxed">
          {sortedContributions.map((c, i) => {
            const author = paper.authors.find(a => a.id === c.authorId)!;
            const isLast = i === sortedContributions.length - 1;
            return (
              <span key={c.authorId} className="inline-flex items-baseline">
                <button
                  onClick={() => onAuthorSelect(c.authorId)}
                  className="text-journal-700 hover:text-journal-900 hover:underline underline-offset-2 transition-colors font-medium"
                >
                  {author.firstName} {author.lastName}
                </button>
                {c.isCorresponding && (
                  <span className="text-[10px] text-amber-500 ml-0.5" title="Corresponding author">✉</span>
                )}
                {!isLast && <span className="text-gray-300 mr-0.5">,</span>}
              </span>
            );
          })}
        </div>

        {/* Minimal affiliation line */}
        <div className="mt-2 text-xs text-gray-400">
          {[...new Set(paper.authors.flatMap(a => a.affiliations.filter(af => af.isCurrent).map(af => af.institution)))].join(' · ')}
        </div>

        {/* Legend + expand toggle */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            <span>✉ Corresponding author</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-journal-600 hover:text-journal-800 hover:bg-journal-50 rounded-lg transition-colors"
          >
            {expanded ? 'Collapse' : 'Expand author details'}
            <span className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▾</span>
          </button>
        </div>
      </div>

      {/* Expanded: avatar chips with affiliation + ORCID */}
      {expanded && (
        <div className="border-t border-gray-100 px-6 py-4 space-y-2.5">
          {sortedContributions.map((c) => {
            const author = paper.authors.find(a => a.id === c.authorId)!;
            const bg = avatarColor(author.firstName + author.lastName);
            const currentAffs = author.affiliations.filter(a => a.isCurrent);
            const topRoles = c.creditRoles.slice(0, 3);
            const orcidLink = author.socialLinks.find(l => l.platform === 'orcid');

            return (
              <button
                key={c.authorId}
                onClick={() => onAuthorSelect(c.authorId)}
                className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                {/* Avatar */}
                <div className={`relative flex-shrink-0 w-10 h-10 rounded-full ${bg} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                  {initials(author.firstName, author.lastName)}
                  {c.isCorresponding && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[8px] border-2 border-white">✉</span>
                  )}
                </div>

                {/* Name + affiliation */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900 group-hover:text-journal-700 transition-colors">
                      {author.firstName} {author.lastName}
                    </span>
                    {author.visibility.showCareerStage && (
                      <span className="text-[10px] text-gray-400 hidden sm:inline">{author.careerStage}</span>
                    )}
                    {orcidLink && (
                      <span
                        className="text-[10px] text-emerald-600 font-mono hidden sm:inline"
                        onClick={(e) => { e.stopPropagation(); window.open(orcidLink.url, '_blank', 'noopener,noreferrer'); }}
                        role="link"
                      >
                        🆔 ORCID
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {currentAffs.map(a => `${a.department ? a.department + ', ' : ''}${a.institution}`).join(' · ')}
                  </p>
                </div>

                {/* Top CRediT roles */}
                <div className="flex-shrink-0 hidden md:flex gap-1">
                  {topRoles.map(({ role, level }) => (
                    <span
                      key={role}
                      className={`px-1.5 py-0.5 text-[9px] font-medium rounded-full ${
                        level === 'lead' ? 'bg-journal-700 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {role.replace('Writing – ', '').replace('Formal ', '')}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

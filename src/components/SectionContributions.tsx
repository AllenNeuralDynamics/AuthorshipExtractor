import { useState } from 'react';
import type { Paper, ManuscriptSection } from '../types';
import { avatarColor, initials } from '../utils';

interface Props {
  paper: Paper;
  onAuthorSelect: (authorId: string) => void;
}

export default function SectionContributions({ paper, onAuthorSelect }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['results', 'methods']));

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Gather all sections flat for looking up contributions
  const allSections: ManuscriptSection[] = [];
  for (const s of paper.sections) {
    allSections.push(s);
    if (s.subsections) allSections.push(...s.subsections);
  }

  const renderSection = (section: ManuscriptSection, depth: number = 0) => {
    const hasSubsections = section.subsections && section.subsections.length > 0;
    const isExpanded = expandedSections.has(section.id);

    // Find authors who contributed to this section
    const sectionAuthors = paper.contributions
      .filter(c => c.sectionContributions.some(sc => sc.sectionId === section.id))
      .sort((a, b) => {
        const aName = paper.authors.find(au => au.id === a.authorId)?.lastName ?? '';
        const bName = paper.authors.find(au => au.id === b.authorId)?.lastName ?? '';
        return aName.localeCompare(bName);
      });

    // Find figure contributions for this section
    const sectionFigures = section.figures || [];
    const figureContributions = sectionFigures.map(fig => {
      const authors = paper.contributions
        .filter(c => c.figureContributions.some(fc => fc.figureId === fig.id))
        .map(c => ({
          contribution: c,
          author: paper.authors.find(a => a.id === c.authorId)!,
          description: c.figureContributions.find(fc => fc.figureId === fig.id)!.description,
        }));
      return { figure: fig, authors };
    });

    const typeIcon: Record<string, string> = {
      abstract: '📄',
      introduction: '📖',
      methods: '🔬',
      results: '📊',
      discussion: '💬',
      supplementary: '📎',
      'data-availability': '📦',
      acknowledgments: '🙏',
    };

    return (
      <div key={section.id} className={depth === 0 ? 'mb-3' : 'mb-1'}>
        <button
          onClick={() => hasSubsections && toggleSection(section.id)}
          className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            depth === 0
              ? 'bg-white border border-gray-200 hover:border-journal-300 hover:bg-journal-50/30'
              : 'bg-gray-50/50 hover:bg-gray-100/50 rounded-lg'
          } ${hasSubsections ? 'cursor-pointer' : 'cursor-default'}`}
        >
          {/* Expand/collapse indicator */}
          {hasSubsections && (
            <span className={`text-gray-400 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
          )}

          {/* Section icon and title */}
          <span className="text-base">{typeIcon[section.type] || '📄'}</span>
          <span className={`font-medium ${depth === 0 ? 'text-gray-900' : 'text-gray-700 text-sm'}`}>
            {section.title}
          </span>

          {/* Author avatars for this section */}
          <div className="ml-auto flex items-center">
            {sectionAuthors.length > 0 && (
              <div className="flex -space-x-2">
                {sectionAuthors.map((c) => {
                  const author = paper.authors.find(a => a.id === c.authorId)!;
                  const bg = avatarColor(author.firstName + author.lastName);
                  const sc = c.sectionContributions.find(s => s.sectionId === section.id);
                  return (
                    <div
                      key={c.authorId}
                      className={`relative w-7 h-7 rounded-full ${bg} flex items-center justify-center text-white text-[9px] font-bold border-2 border-white cursor-pointer hover:z-10 hover:scale-110 transition-transform`}
                      title={`${author.firstName} ${author.lastName}: ${sc?.description || ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAuthorSelect(c.authorId);
                      }}
                    >
                      {initials(author.firstName, author.lastName)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className={`mt-1 ${depth === 0 ? 'ml-4' : 'ml-6'}`}>
            {/* Individual contributions for this section */}
            {sectionAuthors.length > 0 && !hasSubsections && (
              <div className="space-y-1 mb-2 ml-6">
                {sectionAuthors.map((c) => {
                  const author = paper.authors.find(a => a.id === c.authorId)!;
                  const sc = c.sectionContributions.find(s => s.sectionId === section.id)!;
                  const bg = avatarColor(author.firstName + author.lastName);
                  return (
                    <div key={c.authorId} className="flex items-start gap-2 py-1.5">
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full ${bg} flex items-center justify-center text-white text-[8px] font-bold cursor-pointer`}
                        onClick={() => onAuthorSelect(c.authorId)}
                      >
                        {initials(author.firstName, author.lastName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-gray-500">{author.firstName} {author.lastName}:</span>
                        <span className="text-xs text-gray-700 ml-1">{sc.description}</span>
                      </div>
                      {sc.effortLevel && (
                        <span className={`flex-shrink-0 px-1.5 py-0.5 text-[9px] font-semibold rounded-full ${
                          sc.effortLevel === 'lead' ? 'bg-journal-100 text-journal-700' :
                          sc.effortLevel === 'major' ? 'bg-journal-50 text-journal-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {sc.effortLevel}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Subsections */}
            {hasSubsections && section.subsections!.map(sub => renderSection(sub, depth + 1))}

            {/* Figures for this section */}
            {figureContributions.length > 0 && (
              <div className="mt-2 space-y-1.5 ml-6 mb-3">
                {figureContributions.map(({ figure, authors }) => (
                  <div key={figure.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-amber-50/50 border border-amber-100">
                    <span className="text-sm">🖼️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-amber-800">
                        {figure.label}: {figure.title}
                      </p>
                      <div className="mt-1 space-y-0.5">
                        {authors.map(({ author, description }) => (
                          <p key={author.id} className="text-[11px] text-amber-700">
                            <button
                              onClick={() => onAuthorSelect(author.id)}
                              className="font-medium hover:underline"
                            >
                              {author.firstName} {author.lastName}
                            </button>
                            : {description}
                          </p>
                        ))}
                      </div>
                    </div>
                    {/* Mini avatars */}
                    <div className="flex -space-x-1.5 flex-shrink-0">
                      {authors.map(({ author }) => {
                        const bg = avatarColor(author.firstName + author.lastName);
                        return (
                          <div
                            key={author.id}
                            className={`w-5 h-5 rounded-full ${bg} flex items-center justify-center text-white text-[7px] font-bold border border-white`}
                          >
                            {initials(author.firstName, author.lastName)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {paper.sections.map(section => renderSection(section))}
    </div>
  );
}

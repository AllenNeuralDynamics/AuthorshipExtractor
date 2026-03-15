import { useState } from 'react';
import type { Paper } from '../types';
import { PAPER_BODY } from '../data/paperContent';
import { avatarColor, initials } from '../utils';

interface Props {
  paper: Paper;
  onAuthorSelect: (authorId: string) => void;
}

/** Get all authors who contributed to a given sectionId, sorted by effort */
function getSectionContributors(paper: Paper, sectionId: string) {
  const contributors: {
    authorId: string;
    description: string;
    effortPercent?: number;
  }[] = [];

  for (const c of paper.contributions) {
    for (const sc of c.sectionContributions) {
      if (sc.sectionId === sectionId) {
        contributors.push({
          authorId: c.authorId,
          description: sc.description,
          effortPercent: sc.effortPercent,
        });
      }
    }
  }

  // Sort by effort descending (highest first)
  return contributors.sort((a, b) => (b.effortPercent ?? 0) - (a.effortPercent ?? 0));
}

/** Small avatar dot for inline display */
function AuthorDot({
  author,
  description,
  effortPercent,
  onClick,
}: {
  author: Paper['authors'][0];
  description: string;
  effortPercent?: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const bg = avatarColor(author.firstName + author.lastName);

  return (
    <span className="relative inline-block">
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center text-white text-[9px] font-bold shadow-sm hover:ring-2 hover:ring-journal-300 transition-all cursor-pointer`}
        title={`${author.firstName} ${author.lastName}`}
      >
        {initials(author.firstName, author.lastName)}
      </button>
      {hovered && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 bg-gray-900 text-white text-[11px] rounded-lg px-3 py-2 shadow-xl pointer-events-none tooltip-anim">
          <span className="font-semibold">{author.firstName} {author.lastName}</span>
          {effortPercent != null && (
            <span className="ml-1 text-gray-400">({effortPercent}% effort)</span>
          )}
          <br />
          <span className="text-gray-300">{description}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}

export default function PaperBody({ paper, onAuthorSelect }: Props) {
  return (
    <article className="max-w-5xl mx-auto px-6 pb-16">
      {PAPER_BODY.map((section) => {
        const contributors = getSectionContributors(paper, section.id);

        return (
          <section key={section.id} id={section.id} className="mb-8">
            {/* Section heading */}
            {section.level === 1 ? (
              <h2 className="font-serif text-2xl font-bold text-gray-900 mt-10 mb-4 border-b border-gray-200 pb-2">
                {section.title}
              </h2>
            ) : (
              <h3 className="font-serif text-lg font-semibold text-gray-800 mt-8 mb-3">
                {section.title}
              </h3>
            )}

            {/* Content with author sidebar */}
            <div className="flex gap-4">
              {/* Author contribution indicators — left margin */}
              {contributors.length > 0 && (
                <div className="flex-shrink-0 w-10 pt-1">
                  <div className="flex flex-col gap-1 sticky top-4">
                    {contributors.map(({ authorId, description, effortPercent }) => {
                      const author = paper.authors.find(a => a.id === authorId);
                      if (!author) return null;
                      return (
                        <AuthorDot
                          key={authorId}
                          author={author}
                          description={description}
                          effortPercent={effortPercent}
                          onClick={() => onAuthorSelect(authorId)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Paragraphs */}
              <div className={`flex-1 ${contributors.length > 0 ? 'border-l-2 border-journal-100 pl-4' : ''}`}>
                {section.paragraphs.map((text, i) => (
                  <p
                    key={i}
                    className="text-gray-700 leading-relaxed text-[15px] mb-4 last:mb-0"
                  >
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </article>
  );
}

import { useState, useEffect, type ReactNode, type ComponentType, lazy, Suspense } from 'react';
import type { Paper } from '../types';
import { parsePaperMarkdown, type PaperSection } from '../data/paperContent';
import { avatarColor, initials } from '../utils';

/** Registry mapping figure component names to lazy-loaded React components. */
const FIGURE_COMPONENTS: Record<string, ComponentType> = {
  AuthorCountGrowth: lazy(() => import('./figures/AuthorCountGrowth')),
};

interface Props {
  paper: Paper;
  onAuthorSelect: (authorId: string) => void;
}

/** Get all authors who contributed to a given sectionId, sorted by effort */
function getSectionContributors(paper: Paper, sectionId: string) {
  const contributors: {
    authorId: string;
    description: string;
    effortLevel?: string;
  }[] = [];

  for (const c of paper.contributions) {
    for (const sc of c.sectionContributions) {
      if (sc.sectionId === sectionId) {
        contributors.push({
          authorId: c.authorId,
          description: sc.description,
          effortLevel: sc.effortLevel,
        });
      }
    }
  }

  // Sort by effort descending (highest first)
  const rank = { lead: 3, major: 2, minor: 1 } as const;
  return contributors.sort((a, b) => (rank[b.effortLevel as keyof typeof rank] ?? 0) - (rank[a.effortLevel as keyof typeof rank] ?? 0));
}

/** Small avatar dot for inline display */
function AuthorDot({
  author,
  description,
  effortLevel,
  onClick,
}: {
  author: Paper['authors'][0];
  description: string;
  effortLevel?: string;
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
          {effortLevel && (
            <span className="ml-1 text-gray-400">({effortLevel})</span>
          )}
          <br />
          <span className="text-gray-300">{description}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}

/** Render inline Markdown: **bold**, *italic*, and URLs */
function renderInline(text: string): ReactNode[] {
  // Process bold, italic, and links via a single pass
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|(https?:\/\/[^\s]+))/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      // **bold**
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={key++}>{match[3]}</em>);
    } else if (match[4]) {
      // URL
      const url = match[4];
      const isDoi = url.startsWith('https://doi.org/');
      parts.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-journal-600 hover:text-journal-800 underline underline-offset-2 break-all"
        >
          {isDoi ? url.replace('https://doi.org/', 'doi:') : url}
        </a>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export default function PaperBody({ paper, onAuthorSelect }: Props) {
  const [sections, setSections] = useState<PaperSection[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}paper.md`)
      .then((res) => res.text())
      .then((md) => setSections(parsePaperMarkdown(md)))
      .catch((err) => console.error('Failed to load paper.md:', err));
  }, []);

  if (sections.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center text-gray-400">
        Loading paper…
      </div>
    );
  }

  // Build a lookup of figure metadata from all sections
  const figureMap = new Map<string, { label: string; title: string; component?: string }>();
  function walkSections(secs: Paper['sections']) {
    for (const s of secs) {
      for (const fig of s.figures ?? []) {
        figureMap.set(fig.id, { label: fig.label, title: fig.title, component: fig.component });
      }
      if (s.subsections) walkSections(s.subsections);
    }
  }
  walkSections(paper.sections);

  return (
    <article className="max-w-5xl mx-auto px-6 pb-16">
      {sections.map((section) => {
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
                    {contributors.map(({ authorId, description, effortLevel }) => {
                      const author = paper.authors.find(a => a.id === authorId);
                      if (!author) return null;
                      return (
                        <AuthorDot
                          key={authorId}
                          author={author}
                          description={description}
                          effortLevel={effortLevel}
                          onClick={() => onAuthorSelect(authorId)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Content blocks: paragraphs + inline figures */}
              <div className={`flex-1 ${contributors.length > 0 ? 'border-l-2 border-journal-100 pl-4' : ''}`}>
                {section.content.map((block, i) => {
                  if (block.type === 'paragraph') {
                    return (
                      <p
                        key={i}
                        className="text-gray-700 leading-relaxed text-[15px] mb-4 last:mb-0"
                      >
                        {renderInline(block.text)}
                      </p>
                    );
                  }

                  // Figure placeholder
                  const meta = figureMap.get(block.figureId);
                  const FigComponent = meta?.component ? FIGURE_COMPONENTS[meta.component] : undefined;

                  return (
                    <figure
                      key={i}
                      id={block.figureId}
                      className="my-8 mx-auto bg-gray-50 rounded-xl border border-gray-200 p-6"
                    >
                      {FigComponent ? (
                        <Suspense fallback={<div className="h-48 flex items-center justify-center text-gray-400 text-sm">Loading figure…</div>}>
                          <FigComponent />
                        </Suspense>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg">
                          [{meta?.label ?? block.figureId}]
                        </div>
                      )}
                      {meta && (
                        <figcaption className="mt-4 text-sm text-gray-600">
                          <span className="font-semibold text-gray-800">{meta.label}.</span>{' '}
                          {meta.title}
                        </figcaption>
                      )}
                    </figure>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </article>
  );
}

// Paper content is loaded from public/paper.md at runtime.
// The Markdown uses <!-- section: id --> comments to map sections
// to contribution data from the YAML files.
// <!-- figure: id --> comments insert inline figure placeholders.

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'figure'; figureId: string };

export interface PaperSection {
  id: string;
  title: string;
  level: 1 | 2;
  content: ContentBlock[];
}

/**
 * Parse the paper Markdown into structured sections.
 * Headings become section titles (# = level 1, ## = level 2).
 * <!-- section: id --> comments set the section id for contribution mapping.
 * <!-- figure: id --> comments insert figure placeholders.
 */
export function parsePaperMarkdown(md: string): PaperSection[] {
  const lines = md.split('\n');
  const sections: PaperSection[] = [];
  let current: PaperSection | null = null;
  let currentParagraphLines: string[] = [];

  function flushParagraph() {
    if (currentParagraphLines.length > 0 && current) {
      const text = currentParagraphLines.join(' ').trim();
      if (text) {
        current.content.push({ type: 'paragraph', text });
      }
      currentParagraphLines = [];
    }
  }

  for (const line of lines) {
    // Section id marker
    const sectionMatch = line.match(/^<!--\s*section:\s*(\S+)\s*-->/);
    if (sectionMatch) {
      flushParagraph();
      if (current) sections.push(current);
      current = { id: sectionMatch[1], title: '', level: 1, content: [] };
      continue;
    }

    // Figure placeholder
    const figureMatch = line.match(/^<!--\s*figure:\s*(\S+)\s*-->/);
    if (figureMatch) {
      flushParagraph();
      if (current) {
        current.content.push({ type: 'figure', figureId: figureMatch[1] });
      }
      continue;
    }

    // Heading
    const h1Match = line.match(/^# (.+)$/);
    const h2Match = line.match(/^## (.+)$/);
    if (h1Match || h2Match) {
      flushParagraph();
      if (current && !current.title) {
        current.title = (h1Match ?? h2Match)![1];
        current.level = h1Match ? 1 : 2;
      } else {
        if (current) sections.push(current);
        const title = (h1Match ?? h2Match)![1];
        current = {
          id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title,
          level: h1Match ? 1 : 2,
          content: [],
        };
      }
      continue;
    }

    // Blank line → paragraph break
    if (line.trim() === '') {
      flushParagraph();
      continue;
    }

    // Content line
    currentParagraphLines.push(line);
  }

  flushParagraph();
  if (current && current.title) sections.push(current);

  return sections;
}


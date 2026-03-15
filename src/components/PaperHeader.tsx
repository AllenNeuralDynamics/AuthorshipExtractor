import type { Paper } from '../types';
import { formatDate } from '../utils';

interface Props {
  paper: Paper;
}

export default function PaperHeader({ paper }: Props) {
  return (
    <header className="relative overflow-hidden">
      {/* Gradient bar */}
      <div className="h-2 w-full" style={{ background: 'var(--color-journal-gradient)' }} />

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-8">
        {/* Title */}
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {paper.title}
        </h1>

        {/* DOI and dates */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
            DOI: {paper.doi}
          </span>
          <span>Published {formatDate(paper.publishedDate)}</span>
          <span className="text-gray-300">|</span>
          <span>Received {formatDate(paper.receivedDate)}</span>
          <span className="text-gray-300">|</span>
          <span>Accepted {formatDate(paper.acceptedDate)}</span>
        </div>


      </div>
    </header>
  );
}

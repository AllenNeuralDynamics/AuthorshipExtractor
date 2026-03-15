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
        {/* Journal branding */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ background: 'var(--color-journal-gradient)' }}>
            N
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-journal-900 tracking-tight">NeuroJournal</h2>
            <p className="text-xs text-gray-500 tracking-wide uppercase">Reimagining Scientific Authorship</p>
          </div>
        </div>

        {/* Article metadata badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Open Access
          </span>
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-journal-50 text-journal-700 border border-journal-200">
            Research Article
          </span>
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            Vol. {paper.volume} · Issue {paper.issue} · pp {paper.pages}
          </span>
        </div>

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

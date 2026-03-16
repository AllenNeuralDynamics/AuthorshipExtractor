import type { Paper } from '../types';

interface Props {
  paper: Paper;
}

export default function PaperHeader({ paper }: Props) {
  return (
    <header className="relative overflow-hidden">
      {/* Gradient bar */}
      <div className="h-2 w-full" style={{ background: 'var(--color-journal-gradient)' }} />

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-4">
        {/* Title */}
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {paper.title}
        </h1>
      </div>
    </header>
  );
}

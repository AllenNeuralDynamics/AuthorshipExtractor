import { useState, useEffect, useCallback } from 'react';
import type { Paper } from './types';
import { api } from './api/mockApi';
import PaperHeader from './components/PaperHeader';
import AuthorshipPanel from './components/AuthorshipPanel';
import AuthorDetailModal from './components/AuthorDetailModal';
import PaperBody from './components/PaperBody';

export default function App() {
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);

  useEffect(() => {
    api.getPaper('nj-2026-0142').then(p => {
      setPaper(p);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load paper:', err);
      setLoading(false);
    });
  }, []);

  const handleAuthorSelect = useCallback((authorId: string) => {
    setSelectedAuthorId(authorId);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedAuthorId(null);
  }, []);

  // Selected author data — must be above early return to keep hook order stable
  const selectedAuthor = selectedAuthorId && paper ? paper.authors.find(a => a.id === selectedAuthorId) : null;
  const selectedContribution = selectedAuthorId && paper ? paper.contributions.find(c => c.authorId === selectedAuthorId) : null;

  if (loading || !paper) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9fafb' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg animate-pulse" style={{ background: 'var(--color-journal-gradient)' }}>
            N
          </div>
          <p className="text-sm text-gray-400">Loading paper...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <PaperHeader paper={paper} />

      {/* Authorship panel — right after header, above the article */}
      <div className="max-w-5xl mx-auto px-6 pt-6 pb-2">
        <AuthorshipPanel paper={paper} onAuthorSelect={handleAuthorSelect} />
      </div>

      {/* Abstract */}
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Abstract</h2>
          <p className="text-gray-700 leading-relaxed text-[15px]">{paper.abstract}</p>
        </div>
      </div>

      {/* Full paper body with inline author contribution highlights */}
      <PaperBody paper={paper} onAuthorSelect={handleAuthorSelect} />

      {/* Footer note */}
      <div className="max-w-5xl mx-auto px-6 pb-16 pt-4">
        <div className="text-center">
          <p className="text-xs text-gray-400">
            This page is itself the proof of concept described in the paper above.
            Built with React, TypeScript, and Tailwind CSS.
          </p>
          <p className="text-xs text-gray-300 mt-1">
            All authors, data, and the paper are fictional and for demonstration purposes only.
          </p>
        </div>
      </div>

      {/* Author detail modal */}
      {selectedAuthor && selectedContribution && (
        <AuthorDetailModal
          author={selectedAuthor}
          contribution={selectedContribution}
          paper={paper}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

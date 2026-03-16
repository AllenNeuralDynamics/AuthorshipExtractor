import { useState, useEffect, useCallback } from 'react';
import type { Paper } from './types';
import { loadSimulatedContributors, loadRealContributors } from './data/loadContributors';
import PaperHeader from './components/PaperHeader';
import AuthorshipPanel from './components/AuthorshipPanel';
import AuthorDetailModal from './components/AuthorDetailModal';
import PaperBody from './components/PaperBody';

type AuthorMode = 'simulated' | 'real';

export default function App() {
  const [simulatedPaper, setSimulatedPaper] = useState<Paper | null>(null);
  const [realPaper, setRealPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthorMode>('simulated');
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      loadSimulatedContributors().catch((err) => {
        console.error('Failed to load simulated contributors:', err);
        return null;
      }),
      loadRealContributors().catch((err) => {
        console.error('Failed to load real contributors:', err);
        return null;
      }),
    ]).then(([sim, real]) => {
      setSimulatedPaper(sim);
      setRealPaper(real);
      if (!sim && !real) setError('Failed to load contributor data. Please try refreshing.');
      setLoading(false);
    });
  }, []);

  const paper = mode === 'real' && realPaper ? realPaper : simulatedPaper;

  const handleAuthorSelect = useCallback((authorId: string) => {
    setSelectedAuthorId(authorId);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedAuthorId(null);
  }, []);

  const handleModeSwitch = useCallback((newMode: AuthorMode) => {
    setMode(newMode);
    setSelectedAuthorId(null);
  }, []);

  // Selected author data — must be above early return to keep hook order stable
  const selectedAuthor = selectedAuthorId && paper ? paper.authors.find(a => a.id === selectedAuthorId) : null;
  const selectedContribution = selectedAuthorId && paper ? paper.contributions.find(c => c.authorId === selectedAuthorId) : null;

  if (loading || !paper) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9fafb' }}>
        <div className="flex flex-col items-center gap-3">
          {error ? (
            <>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100 text-red-600 text-lg">!</div>
              <p className="text-sm text-red-600 max-w-xs text-center">{error}</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg animate-pulse" style={{ background: 'var(--color-journal-gradient)' }}>
                N
              </div>
              <p className="text-sm text-gray-400">Loading paper...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <PaperHeader paper={paper} />

      {/* Author mode toggle */}
      <div className="max-w-5xl mx-auto px-6 pt-4 pb-1">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center rounded-full bg-gray-100 p-0.5 text-sm">
            <button
              onClick={() => handleModeSwitch('simulated')}
              className={`px-4 py-1.5 rounded-full font-medium transition-all duration-200 ${
                mode === 'simulated'
                  ? 'bg-white text-journal-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Simulated team
            </button>
            <button
              onClick={() => handleModeSwitch('real')}
              className={`px-4 py-1.5 rounded-full font-medium transition-all duration-200 ${
                mode === 'real'
                  ? 'bg-white text-journal-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Real contributors
            </button>
          </div>
          <span className="text-xs text-gray-400">
            {mode === 'simulated'
              ? 'Showing fictional 7-author team'
              : `${paper.authors.length} real contributor${paper.authors.length === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>

      {/* Authorship panel — right after header, above the article */}
      <div className="max-w-5xl mx-auto px-6 pt-3 pb-2">
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
          {mode === 'simulated' ? (
            <p className="text-xs text-gray-300 mt-1">
              The simulated team and their contributions are fictional, for demonstration purposes only.
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">
              Want to contribute? Add yourself via a
              {' '}
              <a
                href="https://github.com/jeromelecoq/AuthorshipExtractor/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-journal-600 hover:text-journal-800 underline"
              >
                pull request
              </a>.
            </p>
          )}
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

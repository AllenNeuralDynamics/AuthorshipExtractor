import { apiEndpoints } from '../api/mockApi';

export default function ApiPanel() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 leading-relaxed">
        This proof of concept includes a mock REST API layer that demonstrates how a real journal platform
        would expose rich authorship data. Each endpoint returns structured JSON with full author profiles,
        granular contribution mapping, and author-controlled visibility settings.
      </p>

      <div className="space-y-2">
        {apiEndpoints.map((ep) => (
          <div key={ep.path} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                ep.method === 'GET' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {ep.method}
              </span>
              <code className="text-sm font-mono text-gray-800">{ep.path}</code>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">{ep.description}</p>
            <p className="text-[10px] text-gray-400 mt-1 font-mono">→ {ep.response}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-journal-50/50 border border-journal-100 mt-4">
        <h4 className="text-xs font-semibold text-journal-800 uppercase tracking-wider mb-2">
          Key Design Principles
        </h4>
        <ul className="text-xs text-journal-900/70 space-y-1.5 list-disc list-inside">
          <li><strong>Author sovereignty</strong> — Authors control what information is visible via the visibility endpoint</li>
          <li><strong>Granular contributions</strong> — Section-level and figure-level attribution, not just CRediT roles</li>
          <li><strong>Rich profiles</strong> — Techniques, career stage, funding, ORCID, social links all in one place</li>
          <li><strong>Timeline tracking</strong> — When each person joined, milestones they achieved during the project</li>
          <li><strong>Machine-readable</strong> — All data structured as JSON, ready for aggregation and cross-paper analysis</li>
        </ul>
      </div>
    </div>
  );
}

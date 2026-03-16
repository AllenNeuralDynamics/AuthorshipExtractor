import { useState, useMemo } from 'react';
import type { Paper, CreditRole, ManuscriptSection } from '../types';
import { initials } from '../utils';

// ─── Colors ────────────────────────────────────────────────────
// Consistent author palette (hex for SVG)
const NODE_COLORS = [
  '#4c6ef5', '#0d9488', '#7c3aed', '#d97706',
  '#e11d48', '#059669', '#3b5bdb', '#6366f1',
  '#ca8a04', '#0891b2', '#dc2626', '#16a34a',
];

// CRediT role → category color
const ROLE_CAT: Record<string, { color: string; category: string }> = {
  'Conceptualization':            { color: '#4c6ef5', category: 'Thinking' },
  'Methodology':                  { color: '#4c6ef5', category: 'Thinking' },
  'Formal Analysis':              { color: '#4c6ef5', category: 'Thinking' },
  'Software':                     { color: '#10b981', category: 'Doing' },
  'Validation':                   { color: '#10b981', category: 'Doing' },
  'Investigation':                { color: '#10b981', category: 'Doing' },
  'Data Curation':                { color: '#10b981', category: 'Doing' },
  'Resources':                    { color: '#10b981', category: 'Doing' },
  'Writing – Original Draft':     { color: '#f59e0b', category: 'Writing' },
  'Writing – Review & Editing':   { color: '#f59e0b', category: 'Writing' },
  'Visualization':                { color: '#f59e0b', category: 'Writing' },
  'Supervision':                  { color: '#8b5cf6', category: 'Leading' },
  'Project Administration':       { color: '#8b5cf6', category: 'Leading' },
  'Funding Acquisition':          { color: '#8b5cf6', category: 'Leading' },
};

const LEVEL_OPACITY = { lead: 1.0, equal: 0.7, supporting: 0.4 } as const;

// Section type → edge strand color
const SECTION_TYPE_COLORS: Record<string, string> = {
  introduction: '#4c6ef5',  // blue
  methods:      '#10b981',  // green
  results:      '#f59e0b',  // amber
  discussion:   '#8b5cf6',  // purple
  abstract:     '#94a3b8',  // gray
  supplementary:'#94a3b8',
};

const SECTION_TYPE_LABELS: { type: string; label: string; color: string }[] = [
  { type: 'introduction', label: 'Introduction', color: '#4c6ef5' },
  { type: 'methods', label: 'Methods', color: '#10b981' },
  { type: 'results', label: 'Results', color: '#f59e0b' },
  { type: 'discussion', label: 'Discussion', color: '#8b5cf6' },
];

/** Flatten the nested manuscript sections into a sectionId → type map */
function buildSectionTypeMap(sections: ManuscriptSection[]): Map<string, string> {
  const map = new Map<string, string>();
  function walk(secs: ManuscriptSection[]) {
    for (const s of secs) {
      map.set(s.id, s.type);
      if (s.subsections) walk(s.subsections);
    }
  }
  walk(sections);
  return map;
}

const LEGEND_CATEGORIES = [
  { label: 'Thinking', color: '#4c6ef5', roles: 'Concept · Method · Analysis' },
  { label: 'Doing', color: '#10b981', roles: 'Software · Validation · Investigation · Data · Resources' },
  { label: 'Writing', color: '#f59e0b', roles: 'Drafting · Editing · Visualization' },
  { label: 'Leading', color: '#8b5cf6', roles: 'Supervision · Administration · Funding' },
];

// ─── Geometry helpers ──────────────────────────────────────────
function polarToXY(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function arcPath(cx: number, cy: number, r: number, a1: number, a2: number): string {
  const s = polarToXY(cx, cy, r, a1);
  const e = polarToXY(cx, cy, r, a2);
  const large = a2 - a1 > Math.PI ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

// ─── Data computation ──────────────────────────────────────────
interface GraphNode {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  careerStage: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  roles: { role: CreditRole; level: string; color: string; opacity: number }[];
  roleCount: number;
  sectionCount: number;
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number; // total shared sections
  sharedSections: string[];
  /** Count of shared sections per section type */
  typeCounts: { type: string; count: number; color: string }[];
}

function computeGraph(paper: Paper, cx: number, cy: number, orbitR: number) {
  const authors = paper.authors;
  const n = authors.length;
  const sectionTypeMap = buildSectionTypeMap(paper.sections);

  // Compute per-author stats
  const authorRoles = new Map<string, GraphNode['roles']>();
  const authorSectionIds = new Map<string, Set<string>>();

  for (const c of paper.contributions) {
    const roles = c.creditRoles.map((cr) => ({
      role: cr.role,
      level: cr.level,
      color: ROLE_CAT[cr.role]?.color ?? '#94a3b8',
      opacity: LEVEL_OPACITY[cr.level] ?? 0.4,
    }));
    authorRoles.set(c.authorId, roles);

    const secs = new Set<string>();
    for (const sc of c.sectionContributions) secs.add(sc.sectionId);
    authorSectionIds.set(c.authorId, secs);
  }

  // Compute collaboration edges (shared sections)
  const sectionAuthors = new Map<string, string[]>();
  for (const c of paper.contributions) {
    for (const sc of c.sectionContributions) {
      const arr = sectionAuthors.get(sc.sectionId) ?? [];
      arr.push(c.authorId);
      sectionAuthors.set(sc.sectionId, arr);
    }
  }

  const edgeMap = new Map<string, Set<string>>();
  for (const [secId, authIds] of sectionAuthors) {
    for (let i = 0; i < authIds.length; i++) {
      for (let j = i + 1; j < authIds.length; j++) {
        const key = [authIds[i], authIds[j]].sort().join('::');
        const set = edgeMap.get(key) ?? new Set();
        set.add(secId);
        edgeMap.set(key, set);
      }
    }
  }

  const edges: GraphEdge[] = [];
  for (const [key, secs] of edgeMap) {
    const [source, target] = key.split('::');
    const secArr = [...secs];
    // Group shared sections by type
    const typeMap = new Map<string, number>();
    for (const sid of secArr) {
      const t = sectionTypeMap.get(sid) ?? 'other';
      typeMap.set(t, (typeMap.get(t) ?? 0) + 1);
    }
    const typeCounts = [...typeMap.entries()]
      .map(([type, count]) => ({ type, count, color: SECTION_TYPE_COLORS[type] ?? '#94a3b8' }))
      .sort((a, b) => b.count - a.count);
    edges.push({ source, target, weight: secs.size, sharedSections: secArr, typeCounts });
  }

  // Max weight for normalization
  const maxWeight = Math.max(1, ...edges.map((e) => e.weight));

  // Build nodes in circular layout
  const maxRoles = Math.max(1, ...authors.map((a) => authorRoles.get(a.id)?.length ?? 0));
  const nodes: GraphNode[] = authors.map((a, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2; // start from top
    const roles = authorRoles.get(a.id) ?? [];
    const sectionCount = authorSectionIds.get(a.id)?.size ?? 0;
    const weight = roles.length + sectionCount;
    const minR = 22;
    const maxR = 54;
    const radius = minR + ((weight / (maxRoles + 13)) * (maxR - minR));

    return {
      id: a.id,
      name: `${a.firstName} ${a.lastName}`,
      firstName: a.firstName,
      lastName: a.lastName,
      careerStage: a.careerStage,
      x: cx + orbitR * Math.cos(angle),
      y: cy + orbitR * Math.sin(angle),
      radius,
      color: NODE_COLORS[i % NODE_COLORS.length],
      roles,
      roleCount: roles.length,
      sectionCount,
    };
  });

  return { nodes, edges, maxWeight };
}

// ─── Component ─────────────────────────────────────────────────
interface Props {
  paper: Paper;
  onAuthorSelect: (authorId: string) => void;
}

export default function CollaborationGraph({ paper, onAuthorSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const W = 720;
  const H = 520;
  const CX = W / 2;
  const CY = H / 2 - 10;
  const ORBIT = Math.min(W, H) * 0.34;

  const { nodes, edges, maxWeight } = useMemo(
    () => computeGraph(paper, CX, CY, ORBIT),
    [paper, CX, CY, ORBIT],
  );

  const nodeMap = useMemo(() => {
    const m = new Map<string, GraphNode>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  return (
    <div className="space-y-3">
      {/* Graph */}
      <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          style={{ maxHeight: '520px' }}
        >
          <defs>
            {/* Subtle radial gradient for background */}
            <radialGradient id="bg-glow" cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#dbe4ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background glow */}
          <circle cx={CX} cy={CY} r={ORBIT + 60} fill="url(#bg-glow)" />

          {/* Edges — parallel colored strands per section type */}
          {edges.map(({ source, target, weight, typeCounts }) => {
            const s = nodeMap.get(source);
            const t = nodeMap.get(target);
            if (!s || !t) return null;

            const midX = (s.x + t.x) / 2;
            const midY = (s.y + t.y) / 2;
            const cpX = midX + (CX - midX) * 0.4;
            const cpY = midY + (CY - midY) * 0.4;

            const isHighlighted = hovered === source || hovered === target;
            const isDimmed = hovered && !isHighlighted;
            const baseOpacity = isDimmed ? 0.05 : isHighlighted ? 0.7 : 0.3;

            // Perpendicular offset direction for parallel strands
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = -dy / len; // normal x
            const ny = dx / len;  // normal y

            const strandWidth = 2.2;
            const strandGap = strandWidth + 0.8;
            const totalStrands = typeCounts.reduce((sum, tc) => sum + tc.count, 0);
            const bandWidth = totalStrands * strandGap;
            let offset = -bandWidth / 2 + strandGap / 2;

            return (
              <g key={`${source}-${target}`}>
                {typeCounts.flatMap((tc) =>
                  Array.from({ length: tc.count }, (_, i) => {
                    const ox = nx * offset;
                    const oy = ny * offset;
                    offset += strandGap;
                    return (
                      <path
                        key={`${tc.type}-${i}`}
                        d={`M ${s.x + ox} ${s.y + oy} Q ${cpX + ox} ${cpY + oy} ${t.x + ox} ${t.y + oy}`}
                        stroke={tc.color}
                        strokeWidth={strandWidth}
                        fill="none"
                        opacity={baseOpacity}
                        strokeLinecap="round"
                        className="transition-opacity duration-200"
                      />
                    );
                  }),
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isHovered = hovered === node.id;
            const isDimmed = hovered && !isHovered;

            // Role ring: segmented arcs around the node
            const ringR = node.radius + 6;
            const gap = 0.06; // radians gap between segments
            const totalAngle = 2 * Math.PI - node.roles.length * gap;
            const segAngle = node.roles.length > 0 ? totalAngle / node.roles.length : 0;

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onAuthorSelect(node.id)}
                opacity={isDimmed ? 0.3 : 1}
                style={{ transition: 'opacity 0.2s' }}
              >
                {/* Role ring segments */}
                {node.roles.map((role, i) => {
                  const startA = -Math.PI / 2 + i * (segAngle + gap);
                  const endA = startA + segAngle;
                  return (
                    <path
                      key={i}
                      d={arcPath(node.x, node.y, ringR, startA, endA)}
                      stroke={role.color}
                      strokeWidth={4}
                      strokeLinecap="round"
                      fill="none"
                      opacity={role.opacity}
                    >
                      <title>{`${role.role} (${role.level})`}</title>
                    </path>
                  );
                })}

                {/* Shadow */}
                <circle
                  cx={node.x}
                  cy={node.y + 2}
                  r={node.radius}
                  fill="black"
                  opacity={0.08}
                />

                {/* Main circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  fill={node.color}
                  stroke="white"
                  strokeWidth={3}
                  className={isHovered ? 'drop-shadow-lg' : ''}
                />
                {isHovered && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + 2}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={2}
                    opacity={0.4}
                  />
                )}

                {/* Initials */}
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={node.radius * 0.55}
                  fontWeight="700"
                  fontFamily="Inter, system-ui, sans-serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {initials(node.firstName, node.lastName)}
                </text>

                {/* Name label */}
                <text
                  x={node.x}
                  y={node.y + node.radius + 20}
                  textAnchor="middle"
                  fill={isHovered ? '#1e3a5f' : '#64748b'}
                  fontSize="11"
                  fontWeight={isHovered ? '600' : '400'}
                  fontFamily="Inter, system-ui, sans-serif"
                  style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
                >
                  {node.firstName} {node.lastName}
                </text>

                {/* Career stage (shown on hover) */}
                {isHovered && (
                  <text
                    x={node.x}
                    y={node.y + node.radius + 33}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9.5"
                    fontFamily="Inter, system-ui, sans-serif"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.careerStage}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover info card */}
        {hovered && (() => {
          const node = nodeMap.get(hovered);
          if (!node) return null;
          const authorEdges = edges.filter(
            (e) => e.source === hovered || e.target === hovered,
          );
          const totalShared = authorEdges.reduce((s, e) => s + e.weight, 0);

          return (
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100 p-3 w-52 text-xs pointer-events-none">
              <p className="font-semibold text-gray-900 text-sm">{node.name}</p>
              <p className="text-gray-500 mt-0.5">{node.careerStage}</p>
              <div className="mt-2 space-y-1 text-gray-600">
                <p><span className="font-medium text-gray-800">{node.roleCount}</span> CRediT roles</p>
                <p><span className="font-medium text-gray-800">{node.sectionCount}</span> sections</p>
                <p><span className="font-medium text-gray-800">{totalShared}</span> shared section links</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {node.roles.map((r, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                    style={{ backgroundColor: r.color, opacity: r.opacity }}
                  >
                    {r.role.replace('Writing – ', '').replace('Formal ', '').slice(0, 12)}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-1 text-[11px] text-gray-500">
        <span className="font-medium text-gray-600 mr-1">Role ring:</span>
        {LEGEND_CATEGORIES.map((cat) => (
          <span key={cat.label} className="flex items-center gap-1" title={cat.roles}>
            <span
              className="inline-block w-3 h-1 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            {cat.label}
          </span>
        ))}
        <span className="ml-2 border-l border-gray-200 pl-3 font-medium text-gray-600">Lines:</span>
        {SECTION_TYPE_LABELS.map((st) => (
          <span key={st.type} className="flex items-center gap-1">
            <span
              className="inline-block w-5 h-[2.5px] rounded-full"
              style={{ backgroundColor: st.color }}
            />
            {st.label}
          </span>
        ))}
      </div>
    </div>
  );
}

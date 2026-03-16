import { useState, useEffect } from 'react';
import YAML from 'yaml';

const BASE = import.meta.env.BASE_URL;

interface DataPoint {
  year: number;
  mean: number;
  median: number;
}

interface ChartData {
  title: string;
  xLabel: string;
  yLabel: string;
  source?: string;
  data: DataPoint[];
}

/**
 * Inline SVG line chart showing the growth of author counts over time.
 * Shows both median (solid) and mean (dashed) lines.
 * Data loaded from public/figures/author-count-growth.yaml.
 */
export default function AuthorCountGrowth() {
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    fetch(`${BASE}figures/author-count-growth.yaml`)
      .then((res) => res.text())
      .then((text) => setChartData(YAML.parse(text) as ChartData))
      .catch((err) => console.error('Failed to load figure data:', err));
  }, []);

  if (!chartData) return null;

  const { data, xLabel, yLabel, source } = chartData;

  // Chart dimensions
  const W = 620;
  const H = 340;
  const pad = { top: 24, right: 28, bottom: 56, left: 56 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  // Scales
  const xMin = data[0].year;
  const xMax = data[data.length - 1].year;
  const yMin = 0;
  const allVals = data.flatMap((d) => [d.mean, d.median]);
  const yMax = Math.ceil(Math.max(...allVals) / 5) * 5; // round up to nearest 5

  const sx = (year: number) =>
    pad.left + ((year - xMin) / (xMax - xMin)) * plotW;
  const sy = (val: number) =>
    pad.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  // Build paths
  const buildPath = (accessor: (d: DataPoint) => number) =>
    data
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${sx(d.year).toFixed(1)},${sy(accessor(d)).toFixed(1)}`)
      .join(' ');

  const medianPath = buildPath((d) => d.median);
  const meanPath = buildPath((d) => d.mean);

  // Area fill under median
  const medianArea = `${medianPath} L${sx(xMax).toFixed(1)},${sy(yMin).toFixed(1)} L${sx(xMin).toFixed(1)},${sy(yMin).toFixed(1)} Z`;

  // Y-axis ticks
  const yTicks: number[] = [];
  for (let v = 0; v <= yMax; v += 5) yTicks.push(v);

  // X-axis ticks — every 4 years
  const xTicks: number[] = [];
  for (let yr = Math.ceil(xMin / 4) * 4; yr <= xMax; yr += 4) xTicks.push(yr);

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[620px] mx-auto"
        role="img"
        aria-label={`Line chart: ${chartData.title}`}
      >
        {/* Grid lines */}
        {yTicks.map((v) => (
          <line
            key={`grid-${v}`}
            x1={pad.left}
            y1={sy(v)}
            x2={W - pad.right}
            y2={sy(v)}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}

        {/* Area fill under median */}
        <path d={medianArea} fill="rgba(59, 130, 246, 0.06)" />

        {/* Mean line (dashed, lighter) */}
        <path
          d={meanPath}
          fill="none"
          stroke="#93c5fd"
          strokeWidth={2}
          strokeDasharray="6 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Median line (solid, primary) */}
        <path
          d={medianPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Median data points */}
        {data.map((d) => (
          <circle
            key={`med-${d.year}`}
            cx={sx(d.year)}
            cy={sy(d.median)}
            r={3.5}
            fill="#fff"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        ))}

        {/* Mean data points */}
        {data.map((d) => (
          <circle
            key={`mean-${d.year}`}
            cx={sx(d.year)}
            cy={sy(d.mean)}
            r={2.5}
            fill="#fff"
            stroke="#93c5fd"
            strokeWidth={1.5}
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((v) => (
          <text
            key={`ylabel-${v}`}
            x={pad.left - 8}
            y={sy(v) + 4}
            textAnchor="end"
            className="fill-gray-500"
            fontSize={11}
          >
            {v}
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((yr) => (
          <text
            key={`xlabel-${yr}`}
            x={sx(yr)}
            y={pad.top + plotH + 20}
            textAnchor="middle"
            className="fill-gray-500"
            fontSize={11}
          >
            {yr}
          </text>
        ))}

        {/* Axis labels */}
        <text
          x={pad.left + plotW / 2}
          y={H - 8}
          textAnchor="middle"
          className="fill-gray-600"
          fontSize={12}
          fontWeight={500}
        >
          {xLabel}
        </text>
        <text
          x={14}
          y={pad.top + plotH / 2}
          textAnchor="middle"
          className="fill-gray-600"
          fontSize={12}
          fontWeight={500}
          transform={`rotate(-90, 14, ${pad.top + plotH / 2})`}
        >
          {yLabel}
        </text>

        {/* Axes */}
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="#9ca3af" strokeWidth={1} />
        <line x1={pad.left} y1={pad.top + plotH} x2={W - pad.right} y2={pad.top + plotH} stroke="#9ca3af" strokeWidth={1} />

        {/* Legend */}
        <g transform={`translate(${pad.left + 12}, ${pad.top + 8})`}>
          <line x1={0} y1={0} x2={20} y2={0} stroke="#3b82f6" strokeWidth={2.5} />
          <circle cx={10} cy={0} r={3} fill="#fff" stroke="#3b82f6" strokeWidth={2} />
          <text x={26} y={4} className="fill-gray-600" fontSize={11}>Median</text>

          <line x1={0} y1={18} x2={20} y2={18} stroke="#93c5fd" strokeWidth={2} strokeDasharray="6 4" />
          <circle cx={10} cy={18} r={2.5} fill="#fff" stroke="#93c5fd" strokeWidth={1.5} />
          <text x={26} y={22} className="fill-gray-600" fontSize={11}>Mean</text>
        </g>
      </svg>

      {source && (
        <p className="text-[10px] text-gray-400 mt-2 text-center leading-tight">
          Source: {source}
        </p>
      )}
    </div>
  );
}

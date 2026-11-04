import React, { useState } from 'react';
import { BloodPressureRecord, BloodSugarRecord, BMIRecord } from '../../types/health';
import { Activity, Droplets, Scale } from 'lucide-react';
import { parseDateToMs, formatDateLabel } from '../../lib/medicalCalculations';
import {
  GLUCOSE_SERIES_META,
  BP_CONDITION_META,
  normalizeGlucoseType,
  normalizeBPCondition,
  timeScaleX,
  chartTimeTicks,
  type GlucoseSeriesKey,
  type BPConditionKey,
} from '../../lib/chartSeries';

/** Epoch ms for a record, trying date, then timestamp, then createdAt. */
const recordMs = (r: { date?: string; timestamp?: string; createdAt?: string }) =>
  parseDateToMs(r.date || r.timestamp || r.createdAt);

/** Per-condition normal-standard text, matching calculateGlucoseStatus. */
const GLUCOSE_STANDARD_TEXT: Record<GlucoseSeriesKey, string> = {
  fasting: 'FBS 70–99',
  before_meal: 'အစာမစားမီ 70–140',
  post_meal_2h: 'အစာစားပြီး ၂ နာရီ <140',
  random: 'အချိန်မရွေး <140',
  bedtime: 'အိပ်ရာဝင် <140',
  hba1c: 'HbA1c <5.7%',
  unknown: 'အခြေအနေ မသိပါ',
};

/** Canonical series order for buttons / lines / legend. */
const GLUCOSE_SERIES_ORDER: GlucoseSeriesKey[] = [
  'fasting',
  'before_meal',
  'post_meal_2h',
  'random',
  'bedtime',
  'hba1c',
  'unknown',
];

/** Short button labels for BP conditions (meta labelMm is the long form). */
const BP_BUTTON_LABEL: Record<BPConditionKey, string> = {
  morning: 'မနက်',
  night: 'ည',
  resting: 'နားနေ',
  after_exercise: 'လှုပ်ရှား',
  stress: 'စိတ်ဖိစီး',
  unknown: 'မသိပါ',
};

const BP_CONDITION_ORDER: BPConditionKey[] = [
  'morning',
  'night',
  'resting',
  'after_exercise',
  'stress',
  'unknown',
];

const buildPath = (pts: { x: number; y: number }[]) =>
  pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

interface BloodPressureChartProps {
  records: BloodPressureRecord[];
  className?: string;
}

export const BloodPressureChart: React.FC<BloodPressureChartProps> = ({ records, className = '' }) => {
  const [hoveredPoint, setHoveredPoint] = useState<BloodPressureRecord | null>(null);
  const [filterCond, setFilterCond] = useState<'all' | BPConditionKey>('all');

  if (!records || records.length === 0) {
    return (
      <div className={`p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center ${className}`}>
        <Activity className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-xs font-bold text-slate-800">
          သွေးပေါင်ချိန် မှတ်တမ်းမရှိသေးပါ။ Chart ပြသရန် အနည်းဆုံး မှတ်တမ်း ၁ ခု ထည့်သွင်းပါ။
        </p>
      </div>
    );
  }

  const condOf = (r: BloodPressureRecord) => normalizeBPCondition(r.condition);

  // Conditions actually present, in canonical order ('unknown' has no button).
  const presentConds = BP_CONDITION_ORDER.filter((k) => records.some((r) => condOf(r) === k));
  const buttonConds = presentConds.filter((k) => k !== 'unknown');

  // Explicitly sort records chronologically ascending (oldest on left, newest/latest on right)
  const sortedRecords = [...records].sort((a, b) => recordMs(a) - recordMs(b));
  const visibleRecords =
    filterCond === 'all' ? sortedRecords : sortedRecords.filter((r) => condOf(r) === filterCond);

  // Dimensions & Coordinates
  const width = 640;
  const height = 270;
  const padding = { top: 30, right: 30, bottom: 45, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minY = 40;
  const maxY = 200;

  const getY = (val: number) => {
    const clamped = Math.min(maxY, Math.max(minY, val));
    return padding.top + chartH - ((clamped - minY) / (maxY - minY)) * chartH;
  };

  // Time-based X axis (real timestamps, not record index).
  const times = visibleRecords.map(recordMs);
  const tMin = times.length ? Math.min(...times) : 0;
  const tMax = times.length ? Math.max(...times) : 0;
  const getX = (ms: number) => timeScaleX(ms, tMin, tMax, chartW, padding.left);
  const xTicks = chartTimeTicks(tMin, tMax, 5);

  const isSingle = filterCond !== 'all';
  const showValueLabels = isSingle;
  const showPulse = isSingle;

  // Group visible records by condition (already time-sorted).
  const condGroups = new Map<BPConditionKey, BloodPressureRecord[]>();
  visibleRecords.forEach((r) => {
    const k = condOf(r);
    const arr = condGroups.get(k) ?? [];
    arr.push(r);
    condGroups.set(k, arr);
  });

  const pointsFor = (rs: BloodPressureRecord[], pick: (r: BloodPressureRecord) => number) =>
    rs.map((r) => ({ x: getX(recordMs(r)), y: getY(pick(r)) }));

  // Normal range guidelines: Systolic 120, Diastolic 80
  const ySys120 = getY(120);
  const yDia80 = getY(80);
  const ySys140 = getY(140);

  return (
    <div className="relative bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            သွေးပေါင်ချိန် ပြောင်းလဲမှု Trend (Blood Pressure Chart)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            စံနှုန်း: 120/80 mmHg (ပုံမှန်) / ≥ 140/90 mmHg (သွေးတိုးအဆင့် ၂)
          </p>
        </div>

        {/* Condition filter buttons — only conditions present in the records */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setFilterCond('all')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${filterCond === 'all' ? 'bg-white dark:bg-slate-700 shadow-xs font-medium text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}
          >
            အားလုံး
          </button>
          {buttonConds.map((k) => (
            <button
              key={k}
              onClick={() => setFilterCond(k)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${filterCond === k ? 'bg-white dark:bg-slate-700 shadow-xs font-medium' : 'text-slate-600 dark:text-slate-400'}`}
              style={filterCond === k ? { color: BP_CONDITION_META[k].color } : undefined}
            >
              {BP_BUTTON_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      {/* Legend: condition colours (dynamic) + line-style key */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3 text-xs">
        {presentConds.map((k) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BP_CONDITION_META[k].color }} />
            <span className="text-slate-600 dark:text-slate-400">{BP_CONDITION_META[k].labelMm}</span>
          </div>
        ))}
        <span className="text-slate-400 dark:text-slate-500">
          အပေါ်သွေး (SYS) အစိုင်း · အောက်သွေး (DIA) အစက်ချ · နှလုံးခုန် (Pulse) အစက်အစက်
        </span>
      </div>

      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-w-full select-none">
          {/* Target Zone Box (Systolic < 120, Diastolic < 80) */}
          <rect
            x={padding.left}
            y={ySys120}
            width={chartW}
            height={Math.abs(yDia80 - ySys120)}
            fill="currentColor"
            className="text-emerald-500/10 dark:text-emerald-500/15"
          />

          {/* Grid lines */}
          {[60, 80, 100, 120, 140, 160, 180].map((val) => {
            const y = getY(val);
            const isTarget = val === 120 || val === 80;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray={isTarget ? '4 2' : '2 4'}
                  className={isTarget ? 'text-emerald-400/60 dark:text-emerald-500/40' : 'text-slate-200 dark:text-slate-800'}
                  strokeWidth={isTarget ? 1.2 : 0.8}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* High Danger Line (Systolic 140) */}
          <line
            x1={padding.left}
            y1={ySys140}
            x2={width - padding.right}
            y2={ySys140}
            stroke="#ef4444"
            strokeDasharray="3 3"
            strokeWidth="0.9"
            opacity="0.6"
          />
          <text
            x={width - padding.right - 4}
            y={ySys140 - 4}
            textAnchor="end"
            className="text-[9px] fill-rose-500 font-medium"
          >
            သွေးတိုးအဆင့် (≥140)
          </text>

          {/* Per-condition SYS (solid) + DIA (dashed) lines. 'unknown' = dots only. */}
          {[...condGroups.entries()].map(([cond, rs]) => {
            if (cond === 'unknown') return null;
            const color = BP_CONDITION_META[cond].color;
            const sysPath = buildPath(pointsFor(rs, (r) => r.systolic || 120));
            const diaPath = buildPath(pointsFor(rs, (r) => r.diastolic || 80));
            return (
              <g key={cond}>
                <path
                  d={diaPath}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={sysPath}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* Pulse line — single-condition view only (in 'all' view it would be noise) */}
          {showPulse && (
            <path
              d={buildPath(pointsFor(visibleRecords, (r) => r.pulse || r.pulseRate || 75))}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="2 3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.75"
            />
          )}

          {/* Data Points and Value Labels */}
          {visibleRecords.map((r, i) => {
            const x = getX(recordMs(r));
            const ySys = getY(r.systolic || 120);
            const yDia = getY(r.diastolic || 80);
            const yPls = getY(r.pulse || r.pulseRate || 75);
            const isHovered = hoveredPoint?.id === r.id;
            const color = BP_CONDITION_META[condOf(r)].color;

            return (
              <g key={r.id || i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(r)} onMouseLeave={() => setHoveredPoint(null)}>
                {/* Vertical hover line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    className="text-slate-400 dark:text-slate-600"
                  />
                )}

                {/* Systolic Value Label above dot — single-condition view only */}
                {showValueLabels && (
                  <text
                    x={x}
                    y={ySys - 8}
                    textAnchor="middle"
                    className="text-[10px] font-extrabold font-mono"
                    fill={color}
                  >
                    {r.systolic}
                  </text>
                )}

                {/* Systolic dot (filled, condition colour) */}
                <circle
                  cx={x}
                  cy={ySys}
                  r={isHovered ? 5.5 : 4}
                  fill={color}
                  className="stroke-white dark:stroke-slate-900 transition-all"
                  strokeWidth="2"
                />

                {/* Diastolic dot (hollow, condition colour) */}
                <circle
                  cx={x}
                  cy={yDia}
                  r={isHovered ? 5.5 : 4}
                  fill="white"
                  stroke={color}
                  className="dark:fill-slate-900 transition-all"
                  strokeWidth="2"
                />

                {/* Diastolic Value Label below dot — single-condition view only */}
                {showValueLabels && (
                  <text
                    x={x}
                    y={yDia + 14}
                    textAnchor="middle"
                    className="text-[10px] font-extrabold font-mono"
                    fill={color}
                  >
                    {r.diastolic}
                  </text>
                )}

                {/* Pulse dot — single-condition view only */}
                {showPulse && (
                  <circle
                    cx={x}
                    cy={yPls}
                    r={isHovered ? 4 : 3}
                    className="fill-slate-400 stroke-white dark:stroke-slate-900 transition-all"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}

          {/* X axis time ticks (max 5) — no per-point date labels */}
          {xTicks.map((t) => (
            <text
              key={t}
              x={getX(t)}
              y={height - padding.bottom + 16}
              textAnchor="middle"
              className="text-[9.5px] fill-slate-700 dark:fill-slate-300 font-bold font-mono"
            >
              {formatDateLabel(t).date}
            </text>
          ))}
        </svg>
      </div>

      {/* Hover Info Tooltip */}
      {hoveredPoint && (
        <div className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              ရက်စွဲ: {formatDateLabel(hoveredPoint.date || hoveredPoint.timestamp || hoveredPoint.createdAt).date} {formatDateLabel(hoveredPoint.date || hoveredPoint.timestamp || hoveredPoint.createdAt).time}
            </span>
            <span className="text-slate-500 dark:text-slate-400 ml-2">
              ({BP_CONDITION_META[condOf(hoveredPoint)].labelMm})
            </span>
            {hoveredPoint.notes && (
              <span className="text-slate-500 dark:text-slate-400 ml-2">
                ({hoveredPoint.notes})
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span className="font-bold" style={{ color: BP_CONDITION_META[condOf(hoveredPoint)].color }}>
              SYS: {hoveredPoint.systolic} mmHg
            </span>
            <span className="font-bold" style={{ color: BP_CONDITION_META[condOf(hoveredPoint)].color }}>
              DIA: {hoveredPoint.diastolic} mmHg
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-bold">
              Pulse: {hoveredPoint.pulse || hoveredPoint.pulseRate || '-'} bpm
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

interface BloodSugarChartProps {
  records: BloodSugarRecord[];
  className?: string;
}

export const BloodSugarChart: React.FC<BloodSugarChartProps> = ({ records, className = '' }) => {
  const [hoveredPoint, setHoveredPoint] = useState<BloodSugarRecord | null>(null);
  const [filterType, setFilterType] = useState<'all' | GlucoseSeriesKey>('all');

  if (!records || records.length === 0) {
    return (
      <div className={`p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center ${className}`}>
        <Droplets className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-xs font-bold text-slate-800">
          သွေးတွင်းသကြားဓာတ် မှတ်တမ်းမရှိသေးပါ။ Chart ပြသရန် အနည်းဆုံး မှတ်တမ်း ၁ ခု ထည့်သွင်းပါ။
        </p>
      </div>
    );
  }

  const seriesOf = (r: BloodSugarRecord) => normalizeGlucoseType(r.type || r.timing);

  // Series actually present (with a value), in canonical order.
  const presentSeries = GLUCOSE_SERIES_ORDER.filter((k) =>
    records.some((r) => (r.value ?? r.glucoseValue) != null && seriesOf(r) === k),
  );
  // Filter buttons: 'all' + every present series except 'unknown'.
  const buttonSeries = presentSeries.filter((k) => k !== 'unknown');

  // Filter and sort chronologically ascending.
  // 'all' view is mg/dL only — HbA1c (%) never lands on the mg/dL chart.
  const filtered = records
    .filter((r) => {
      // Skip records with no glucose value — never plot a fabricated 100.
      if ((r.value ?? r.glucoseValue) == null) return false;
      const s = seriesOf(r);
      if (filterType === 'all') return s !== 'hba1c';
      return s === filterType;
    })
    .sort((a, b) => recordMs(a) - recordMs(b));

  const isHbA1c = filterType === 'hba1c';
  const isSingle = filterType !== 'all';
  const activeKey: GlucoseSeriesKey | null = filterType === 'all' ? null : filterType;
  const activeMeta = activeKey ? GLUCOSE_SERIES_META[activeKey] : null;

  const width = 640;
  const height = 270;
  const padding = { top: 30, right: 30, bottom: 45, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minY = isHbA1c ? 4 : 40;
  const maxY = isHbA1c ? 14 : 300;

  const getY = (val: number) => {
    const clamped = Math.min(maxY, Math.max(minY, val));
    return padding.top + chartH - ((clamped - minY) / (maxY - minY)) * chartH;
  };

  // Time-based X axis (real timestamps, not record index).
  const times = filtered.map(recordMs);
  const tMin = times.length ? Math.min(...times) : 0;
  const tMax = times.length ? Math.max(...times) : 0;
  const getX = (ms: number) => timeScaleX(ms, tMin, tMax, chartW, padding.left);
  const xTicks = chartTimeTicks(tMin, tMax, 5);

  // Group visible points by series (already time-sorted).
  const seriesPoints = new Map<GlucoseSeriesKey, { x: number; y: number }[]>();
  filtered.forEach((r) => {
    const k = seriesOf(r);
    const arr = seriesPoints.get(k) ?? [];
    arr.push({ x: getX(recordMs(r)), y: getY((r.value ?? r.glucoseValue)!) });
    seriesPoints.set(k, arr);
  });

  // Normal band — single-condition view only (bands differ per condition,
  // so 'all' view has none). Matches calculateGlucoseStatus ranges.
  const bandLow = activeMeta?.bandLow ?? null;
  const bandHigh = activeMeta?.bandHigh ?? null;
  const yNormalLow = bandLow != null ? getY(bandLow) : 0;
  const yNormalHigh = bandHigh != null ? getY(bandHigh) : 0;
  const yHighLine = getY(isHbA1c ? 6.5 : 140);

  // Caption: per-condition standards.
  const caption = isHbA1c
    ? 'စံနှုန်း: ပုံမှန် < 5.7% / ဆီးချို ≥ 6.5%'
    : isSingle && activeMeta && activeKey
      ? `စံနှုန်း: ${GLUCOSE_STANDARD_TEXT[activeKey]} mg/dL (ပုံမှန်)`
      : (() => {
          const parts = presentSeries
            .filter((k) => k !== 'hba1c' && k !== 'unknown')
            .map((k) => GLUCOSE_STANDARD_TEXT[k]);
          return parts.length
            ? `စံနှုန်း: ${parts.join(' · ')} mg/dL`
            : 'စံနှုန်း: အခြေအနေအလိုက် ကွာခြားပါသည်';
        })();

  return (
    <div className="relative bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            သွေးတွင်းသကြားဓာတ် ပြောင်းလဲမှု Trend (Blood Glucose)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{caption}</p>
        </div>

        {/* Filter buttons — only series present in the records (plus အားလုံး) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${filterType === 'all' ? 'bg-white dark:bg-slate-700 shadow-xs font-medium text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}
          >
            အားလုံး
          </button>
          {buttonSeries.map((k) => (
            <button
              key={k}
              onClick={() => setFilterType(k)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${filterType === k ? 'bg-white dark:bg-slate-700 shadow-xs font-medium' : 'text-slate-600 dark:text-slate-400'}`}
              style={filterType === k ? { color: GLUCOSE_SERIES_META[k].color } : undefined}
            >
              {GLUCOSE_SERIES_META[k].shortLabelMm}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            ဤအခြေအနေအတွက် မှတ်တမ်းမရှိပါ။
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-w-full select-none">
            {/* Normal Target Range Box — single-condition view only */}
            {bandLow != null && bandHigh != null && (
              <rect
                x={padding.left}
                y={yNormalHigh}
                width={chartW}
                height={Math.abs(yNormalLow - yNormalHigh)}
                fill="currentColor"
                className="text-emerald-500/10 dark:text-emerald-500/15"
              />
            )}

            {/* Grid lines */}
            {(isHbA1c ? [5, 6, 7, 8, 9, 10, 12] : [70, 100, 140, 180, 220, 260]).map((val) => {
              const y = getY(val);
              const isTarget = isHbA1c ? val === 6 : (val === 100 || val === 140);
              return (
                <g key={val}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="currentColor"
                    strokeDasharray={isTarget ? '4 2' : '2 4'}
                    className={isTarget ? 'text-emerald-400/60 dark:text-emerald-500/40' : 'text-slate-200 dark:text-slate-800'}
                    strokeWidth={isTarget ? 1.2 : 0.8}
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono"
                  >
                    {val}{isHbA1c ? '%' : ''}
                  </text>
                </g>
              );
            })}

            {/* High threshold line */}
            <line
              x1={padding.left}
              y1={yHighLine}
              x2={width - padding.right}
              y2={yHighLine}
              stroke="#ef4444"
              strokeDasharray="3 3"
              strokeWidth="0.9"
              opacity="0.6"
            />
            <text
              x={width - padding.right - 4}
              y={yHighLine - 4}
              textAnchor="end"
              className="text-[9px] fill-rose-500 font-medium"
            >
              {isHbA1c ? 'ဆီးချိုစံချိန် (≥6.5%)' : 'မြင့်မားသောအဆင့် (≥140)'}
            </text>

            {/* One coloured line per series present. 'unknown' = dots only. */}
            {[...seriesPoints.entries()].map(([key, pts]) => {
              if (key === 'unknown') return null;
              return (
                <path
                  key={key}
                  d={buildPath(pts)}
                  fill="none"
                  stroke={GLUCOSE_SERIES_META[key].color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* Points — dot colour = series colour (status-colour coding dropped:
                it conflicted with series colours). Value labels in single views only. */}
            {filtered.map((r, i) => {
              const x = getX(recordMs(r));
              const val = (r.value ?? r.glucoseValue)!;
              const y = getY(val);
              const isHovered = hoveredPoint?.id === r.id;
              const seriesKey = seriesOf(r);
              const color = GLUCOSE_SERIES_META[seriesKey].color;

              return (
                <g key={r.id || i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(r)} onMouseLeave={() => setHoveredPoint(null)}>
                  {isHovered && (
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={height - padding.bottom}
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      className="text-slate-400 dark:text-slate-600"
                    />
                  )}

                  {/* Sugar Value Label above dot — single-condition view only */}
                  {isSingle && (
                    <text
                      x={x}
                      y={y - 8}
                      textAnchor="middle"
                      className="text-[10px] font-extrabold font-mono"
                      fill={color}
                    >
                      {val}
                    </text>
                  )}

                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 4.5}
                    fill={color}
                    className="stroke-white dark:stroke-slate-900 transition-all"
                    strokeWidth="2"
                  />
                </g>
              );
            })}

            {/* X axis time ticks (max 5) — no per-point date labels */}
            {xTicks.map((t) => (
              <text
                key={t}
                x={getX(t)}
                y={height - padding.bottom + 16}
                textAnchor="middle"
                className="text-[9.5px] fill-slate-700 dark:fill-slate-300 font-bold font-mono"
              >
                {formatDateLabel(t).date}
              </text>
            ))}
          </svg>
        </div>
      )}

      {hoveredPoint && (
        <div className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              ရက်စွဲ: {formatDateLabel(hoveredPoint.date || hoveredPoint.timestamp || hoveredPoint.createdAt).date} {formatDateLabel(hoveredPoint.date || hoveredPoint.timestamp || hoveredPoint.createdAt).time}
            </span>
            <span className="text-slate-500 dark:text-slate-400 ml-2">
              ({GLUCOSE_SERIES_META[seriesOf(hoveredPoint)].labelMm})
            </span>
            {hoveredPoint.mealInfo && (
              <span className="text-slate-500 dark:text-slate-400 ml-2">
                ({hoveredPoint.mealInfo})
              </span>
            )}
            {hoveredPoint.notes && (
              <span className="text-slate-500 dark:text-slate-400 ml-2">
                ({hoveredPoint.notes})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span className="font-bold text-slate-900 dark:text-white">
              {hoveredPoint.value || hoveredPoint.glucoseValue} {seriesOf(hoveredPoint) === 'hba1c' ? '%' : 'mg/dL'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

interface BMIWeightChartProps {
  records: BMIRecord[];
  className?: string;
}

export const BMIWeightChart: React.FC<BMIWeightChartProps> = ({ records, className = '' }) => {
  const [hoveredPoint, setHoveredPoint] = useState<BMIRecord | null>(null);

  if (!records || records.length === 0) {
    return (
      <div className={`p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center ${className}`}>
        <Scale className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-xs font-bold text-slate-800">
          ကိုယ်အလေးချိန် & BMI မှတ်တမ်းမရှိသေးပါ။ Chart ပြသရန် အနည်းဆုံး မှတ်တမ်း ၁ ခု ထည့်သွင်းပါ။
        </p>
      </div>
    );
  }

  // Sort chronologically ascending
  const sortedRecords = [...records].sort((a, b) => recordMs(a) - recordMs(b));

  const width = 640;
  const height = 270;
  const padding = { top: 30, right: 30, bottom: 45, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Weight scale (kg) & BMI scale
  const minWeight = Math.min(...sortedRecords.map(r => r.weightKg || 50));
  const maxWeight = Math.max(...sortedRecords.map(r => r.weightKg || 80));
  const minY = Math.max(30, Math.floor(minWeight - 10));
  const maxY = Math.min(160, Math.ceil(maxWeight + 15));

  const getY = (val: number) => {
    const clamped = Math.min(maxY, Math.max(minY, val));
    return padding.top + chartH - ((clamped - minY) / (maxY - minY)) * chartH;
  };

  // Time-based X axis (real timestamps, not record index).
  const times = sortedRecords.map(recordMs);
  const tMin = times.length ? Math.min(...times) : 0;
  const tMax = times.length ? Math.max(...times) : 0;
  const getX = (ms: number) => timeScaleX(ms, tMin, tMax, chartW, padding.left);
  const xTicks = chartTimeTicks(tMin, tMax, 5);

  const weightPoints = sortedRecords.map((r) => ({
    x: getX(recordMs(r)),
    y: getY(r.weightKg || 60),
    record: r,
  }));

  const weightPath = buildPath(weightPoints);

  return (
    <div className="relative bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            ကိုယ်အလေးချိန် & BMI ပြောင်းလဲမှု Trend (Weight & BMI Chart)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            စံနှုန်း: BMI 18.5 - 24.9 kg/m² (ပုံမှန် ကိုယ်အလေးချိန်) / ≥ 25 (အဝလွန်)
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span className="text-slate-600 dark:text-slate-400">ကိုယ်အလေးချိန် (kg)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-600 dark:text-slate-400">BMI (kg/m²)</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-w-full select-none">
          {/* Grid lines */}
          {[40, 50, 60, 70, 80, 90, 100, 120].filter(v => v >= minY && v <= maxY).map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="2 4"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="0.8"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono"
                >
                  {val}kg
                </text>
              </g>
            );
          })}

          {/* Weight Line (Teal) */}
          <path
            d={weightPath}
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Value Labels */}
          {sortedRecords.map((r, i) => {
            const x = getX(recordMs(r));
            const y = getY(r.weightKg || 60);
            const isHovered = hoveredPoint?.id === r.id;

            return (
              <g key={r.id || i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(r)} onMouseLeave={() => setHoveredPoint(null)}>
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    className="text-slate-400 dark:text-slate-600"
                  />
                )}

                {/* Weight and BMI Value Label */}
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  className="text-[10px] font-extrabold fill-teal-700 dark:fill-teal-300 font-mono"
                >
                  {r.weightKg}kg ({r.bmi?.toFixed(1)})
                </text>

                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4.5}
                  className="fill-teal-600 stroke-white dark:stroke-slate-900 transition-all"
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* X axis time ticks (max 5) — no per-point date labels */}
          {xTicks.map((t) => (
            <text
              key={t}
              x={getX(t)}
              y={height - padding.bottom + 16}
              textAnchor="middle"
              className="text-[9.5px] fill-slate-700 dark:fill-slate-300 font-bold font-mono"
            >
              {formatDateLabel(t).date}
            </text>
          ))}
        </svg>
      </div>

      {hoveredPoint && (
        <div className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              ရက်စွဲ: {formatDateLabel(hoveredPoint.date || hoveredPoint.timestamp || hoveredPoint.createdAt).date} {formatDateLabel(hoveredPoint.date || hoveredPoint.timestamp || hoveredPoint.createdAt).time}
            </span>
            <span className="text-slate-500 dark:text-slate-400 ml-2">
              အရပ်: {hoveredPoint.heightCm} cm
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span className="font-bold text-teal-700 dark:text-teal-300">
              အလေးချိန်: {hoveredPoint.weightKg} kg
            </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              BMI: {hoveredPoint.bmi?.toFixed(1)} kg/m² ({hoveredPoint.category || 'ပုံမှန်'})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

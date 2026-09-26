import React, { useState } from 'react';
import { BloodPressureRecord, BloodSugarRecord } from '../../types/health';
import { Activity, Droplets, Calendar, Filter } from 'lucide-react';

interface BloodPressureChartProps {
  records: BloodPressureRecord[];
  className?: string;
}

export const BloodPressureChart: React.FC<BloodPressureChartProps> = ({ records, className = '' }) => {
  const [hoveredPoint, setHoveredPoint] = useState<BloodPressureRecord | null>(null);

  if (!records || records.length === 0) {
    return (
      <div className={`p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center ${className}`}>
        <Activity className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          သွေးပေါင်ချိန် မှတ်တမ်းမရှိသေးပါ။ Chart ပြသရန် အနည်းဆုံး မှတ်တမ်း ၁ ခု ထည့်သွင်းပါ။
        </p>
      </div>
    );
  }

  // Dimensions & Coordinates
  const width = 640;
  const height = 260;
  const padding = { top: 25, right: 30, bottom: 45, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minY = 40;
  const maxY = 200;

  const getY = (val: number) => {
    const clamped = Math.min(maxY, Math.max(minY, val));
    return padding.top + chartH - ((clamped - minY) / (maxY - minY)) * chartH;
  };

  const getX = (idx: number, total: number) => {
    if (total <= 1) return padding.left + chartW / 2;
    return padding.left + (idx / (total - 1)) * chartW;
  };

  const systolicPoints = records.map((r, i) => ({
    x: getX(i, records.length),
    y: getY(r.systolic || 120),
    record: r,
  }));

  const diastolicPoints = records.map((r, i) => ({
    x: getX(i, records.length),
    y: getY(r.diastolic || 80),
    record: r,
  }));

  const pulsePoints = records.map((r, i) => ({
    x: getX(i, records.length),
    y: getY(r.pulse || r.pulseRate || 75),
    record: r,
  }));

  const systolicPath = systolicPoints.reduce((acc, p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');

  const diastolicPath = diastolicPoints.reduce((acc, p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');

  const pulsePath = pulsePoints.reduce((acc, p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');

  // Normal range guidelines: Systolic 120, Diastolic 80
  const ySys120 = getY(120);
  const yDia80 = getY(80);
  const ySys140 = getY(140);

  return (
    <div className="relative bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            သွေးပေါင်ချိန် ပြောင်းလဲမှု Trend (Blood Pressure)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            စံနှုန်း: 120/80 mmHg (ပုံမှန်) / ≥ 140/90 mmHg (သွေးတိုးအဆင့် ၂)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600 dark:text-slate-400">အပေါ်သွေး (SYS)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-600 dark:text-slate-400">အောက်သွေး (DIA)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-400">နှလုံးခုန် (Pulse)</span>
          </div>
        </div>
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

          {/* Diastolic Line (Blue) */}
          <path
            d={diastolicPath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Pulse Line (Amber dashed) */}
          <path
            d={pulsePath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
          />

          {/* Systolic Line (Rose) */}
          <path
            d={systolicPath}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {records.map((r, i) => {
            const x = getX(i, records.length);
            const ySys = getY(r.systolic || 120);
            const yDia = getY(r.diastolic || 80);
            const yPls = getY(r.pulse || r.pulseRate || 75);
            const isHovered = hoveredPoint?.id === r.id;
            const dateStr = r.date || r.timestamp || '';

            return (
              <g key={r.id} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(r)} onMouseLeave={() => setHoveredPoint(null)}>
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

                {/* Systolic dot */}
                <circle
                  cx={x}
                  cy={ySys}
                  r={isHovered ? 5.5 : 4}
                  className="fill-rose-500 stroke-white dark:stroke-slate-900 transition-all"
                  strokeWidth="2"
                />

                {/* Diastolic dot */}
                <circle
                  cx={x}
                  cy={yDia}
                  r={isHovered ? 5.5 : 4}
                  className="fill-blue-500 stroke-white dark:stroke-slate-900 transition-all"
                  strokeWidth="2"
                />

                {/* Pulse dot */}
                <circle
                  cx={x}
                  cy={yPls}
                  r={isHovered ? 4 : 3}
                  className="fill-amber-500 stroke-white dark:stroke-slate-900 transition-all"
                  strokeWidth="1.5"
                />

                {/* X axis Date label */}
                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  className="text-[9.5px] fill-slate-500 dark:fill-slate-400 font-sans"
                >
                  {dateStr.includes('T') ? dateStr.split('T')[0].substring(5) : dateStr.substring(5)}
                </text>
                <text
                  x={x}
                  y={height - padding.bottom + 27}
                  textAnchor="middle"
                  className="text-[8px] fill-slate-400 font-mono"
                >
                  {dateStr.includes('T') ? dateStr.split('T')[1]?.substring(0, 5) : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover Info Tooltip */}
      {hoveredPoint && (
        <div className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              ရက်စွဲ: {(hoveredPoint.date || hoveredPoint.timestamp || '').replace('T', ' ')}
            </span>
            {hoveredPoint.notes && (
              <span className="text-slate-500 dark:text-slate-400 ml-2">
                ({hoveredPoint.notes})
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              SYS: {hoveredPoint.systolic} mmHg
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              DIA: {hoveredPoint.diastolic} mmHg
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
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
  const [filterType, setFilterType] = useState<string>('all');

  if (!records || records.length === 0) {
    return (
      <div className={`p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center ${className}`}>
        <Droplets className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          သွေးတွင်းသကြားဓာတ် မှတ်တမ်းမရှိသေးပါ။ Chart ပြသရန် အနည်းဆုံး မှတ်တမ်း ၁ ခု ထည့်သွင်းပါ။
        </p>
      </div>
    );
  }

  // Filter records based on selected type
  const filtered = records.filter(r => {
    const t = r.type || r.timing;
    if (filterType === 'all') return true;
    if (filterType === 'fasting') return t === 'fasting';
    if (filterType === 'post_prandial') return t === 'post_meal_2h' || t === 'post_prandial';
    if (filterType === 'hba1c') return t === 'hba1c';
    return true;
  });

  const isHbA1c = filterType === 'hba1c';

  const width = 640;
  const height = 260;
  const padding = { top: 25, right: 30, bottom: 45, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minY = isHbA1c ? 4 : 40;
  const maxY = isHbA1c ? 14 : 300;

  const getY = (val: number) => {
    const clamped = Math.min(maxY, Math.max(minY, val));
    return padding.top + chartH - ((clamped - minY) / (maxY - minY)) * chartH;
  };

  const getX = (idx: number, total: number) => {
    if (total <= 1) return padding.left + chartW / 2;
    return padding.left + (idx / (total - 1)) * chartW;
  };

  const points = filtered.map((r, i) => ({
    x: getX(i, filtered.length),
    y: getY(r.value || r.glucoseValue || 100),
    record: r,
  }));

  const linePath = points.reduce((acc, p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');

  // Normal guidelines
  const normalLow = isHbA1c ? 4.0 : 70;
  const normalHigh = isHbA1c ? 5.7 : 100;
  const yNormalLow = getY(normalLow);
  const yNormalHigh = getY(normalHigh);
  const yHighLine = getY(isHbA1c ? 6.5 : 140);

  return (
    <div className="relative bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            သွေးတွင်းသကြားဓာတ် ပြောင်းလဲမှု Trend (Blood Glucose)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isHbA1c ? 'စံနှုန်း: ပုံမှန် < 5.7% / ဆီးချို ≥ 6.5%' : 'စံနှုန်း: အစာမစားမီ 70 - 99 mg/dL / အစာစားပြီး < 140 mg/dL'}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${filterType === 'all' ? 'bg-white dark:bg-slate-700 shadow-xs font-medium text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}
          >
            အားလုံး
          </button>
          <button
            onClick={() => setFilterType('fasting')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${filterType === 'fasting' ? 'bg-white dark:bg-slate-700 shadow-xs font-medium text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}
          >
            အစာမစားမီ
          </button>
          <button
            onClick={() => setFilterType('post_prandial')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${filterType === 'post_prandial' ? 'bg-white dark:bg-slate-700 shadow-xs font-medium text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}
          >
            အစာစားပြီး
          </button>
          <button
            onClick={() => setFilterType('hba1c')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${filterType === 'hba1c' ? 'bg-white dark:bg-slate-700 shadow-xs font-medium text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'}`}
          >
            HbA1c (၃လပတ်)
          </button>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-w-full select-none">
          {/* Normal Target Range Box */}
          <rect
            x={padding.left}
            y={yNormalHigh}
            width={chartW}
            height={Math.abs(yNormalLow - yNormalHigh)}
            fill="currentColor"
            className="text-emerald-500/10 dark:text-emerald-500/15"
          />

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

          {/* Line Path */}
          <path
            d={linePath}
            fill="none"
            stroke={isHbA1c ? '#8b5cf6' : '#10b981'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {filtered.map((r, i) => {
            const x = getX(i, filtered.length);
            const val = r.value || r.glucoseValue || 100;
            const y = getY(val);
            const isHovered = hoveredPoint?.id === r.id;
            const dateStr = r.date || r.timestamp || '';
            const tType = r.type || r.timing;

            let dotColor = '#10b981'; // normal
            if (r.status === 'pre_diabetic') dotColor = '#f59e0b';
            if (r.status === 'high' || r.status === 'critical' || r.status === 'diabetic' || r.status === 'high_danger') dotColor = '#ef4444';
            if (r.status === 'low') dotColor = '#3b82f6';
            if (tType === 'hba1c') dotColor = '#8b5cf6';

            return (
              <g key={r.id} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(r)} onMouseLeave={() => setHoveredPoint(null)}>
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

                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4.5}
                  fill={dotColor}
                  className="stroke-white dark:stroke-slate-900 transition-all"
                  strokeWidth="2"
                />

                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  className="text-[9.5px] fill-slate-500 dark:fill-slate-400 font-sans"
                >
                  {dateStr.includes('T') ? dateStr.split('T')[0].substring(5) : dateStr.substring(5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {hoveredPoint && (
        <div className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              ရက်စွဲ: {(hoveredPoint.date || hoveredPoint.timestamp || '').replace('T', ' ')}
            </span>
            {hoveredPoint.mealInfo && (
              <span className="text-slate-500 dark:text-slate-400 ml-2">
                ({hoveredPoint.mealInfo})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span className="font-bold text-slate-900 dark:text-white">
              {hoveredPoint.value || hoveredPoint.glucoseValue} {(hoveredPoint.type || hoveredPoint.timing) === 'hba1c' ? '%' : 'mg/dL'}
            </span>
            <span className="text-slate-400">
              ({hoveredPoint.type || hoveredPoint.timing})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

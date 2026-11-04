/**
 * chartSeries.ts (v2.4.17)
 *
 * Per-condition series definitions + time-axis helpers shared by the
 * HealthCharts SVG charts.
 *
 * Clinical bands here MUST match calculateGlucoseStatus in
 * medicalCalculations.ts — never invent new cutoffs:
 *   fasting: normal 70–99 (<=125 pre, >=126 diabetic)
 *   all other mg/dL types: normal <=139 (140–199 pre, >=200 diabetic)
 *   HbA1c: normal <5.7% (<=6.4 pre, >=6.5 diabetic)
 *
 * BloodPressureRecord.condition may hold a LEGACY BP category
 * ('stage1', 'elevated', ...) instead of a measurement condition
 * (pre-v2.4.11 overwrite bug). normalizeBPCondition() treats any
 * non-condition value as 'unknown' — never plot a category as a
 * condition.
 */

export type GlucoseSeriesKey =
  | 'fasting'
  | 'before_meal'
  | 'post_meal_2h'
  | 'random'
  | 'bedtime'
  | 'hba1c'
  | 'unknown';

export interface GlucoseSeriesMeta {
  key: GlucoseSeriesKey;
  labelMm: string;
  shortLabelMm: string;
  color: string;
  bandLow: number | null;
  bandHigh: number | null;
}

export const GLUCOSE_SERIES_META: Record<GlucoseSeriesKey, GlucoseSeriesMeta> = {
  fasting: {
    key: 'fasting',
    labelMm: 'အစာမစားမီ (FBS)',
    shortLabelMm: 'FBS',
    color: '#10b981',
    bandLow: 70,
    bandHigh: 99,
  },
  before_meal: {
    key: 'before_meal',
    labelMm: 'အစာမစားမီ',
    shortLabelMm: 'အစာမစားမီ',
    color: '#06b6d4',
    bandLow: 70,
    bandHigh: 140,
  },
  post_meal_2h: {
    key: 'post_meal_2h',
    labelMm: 'အစာစားပြီး ၂ နာရီ',
    shortLabelMm: '၂ နာရီ',
    color: '#f59e0b',
    bandLow: 70,
    bandHigh: 140,
  },
  random: {
    key: 'random',
    labelMm: 'အချိန်မရွေး (RBS)',
    shortLabelMm: 'အချိန်မရွေး',
    color: '#0ea5e9',
    bandLow: 70,
    bandHigh: 140,
  },
  bedtime: {
    key: 'bedtime',
    labelMm: 'အိပ်ရာဝင်',
    shortLabelMm: 'အိပ်ရာဝင်',
    color: '#8b5cf6',
    bandLow: 70,
    bandHigh: 140,
  },
  hba1c: {
    key: 'hba1c',
    labelMm: 'HbA1c (၃လပတ်)',
    shortLabelMm: 'HbA1c',
    color: '#a855f7',
    bandLow: 4.0,
    bandHigh: 5.7,
  },
  unknown: {
    key: 'unknown',
    labelMm: 'အခြေအနေ မသိပါ',
    shortLabelMm: 'မသိပါ',
    color: '#64748b',
    bandLow: null,
    bandHigh: null,
  },
};

const GLUCOSE_TYPE_ALIASES: Record<string, GlucoseSeriesKey> = {
  fasting: 'fasting',
  before_meal: 'before_meal',
  post_meal_2h: 'post_meal_2h',
  // Legacy entry-form value (pre-v2.4.17): same 2h post-meal reading.
  post_prandial: 'post_meal_2h',
  postprandial: 'post_meal_2h',
  random: 'random',
  bedtime: 'bedtime',
  hba1c: 'hba1c',
};

/** Map a stored glucose type/timing value to its chart series. */
export function normalizeGlucoseType(t?: string | null): GlucoseSeriesKey {
  if (!t) return 'unknown';
  return GLUCOSE_TYPE_ALIASES[String(t).trim().toLowerCase()] ?? 'unknown';
}

export type BPConditionKey =
  | 'morning'
  | 'night'
  | 'resting'
  | 'after_exercise'
  | 'stress'
  | 'unknown';

export interface BPConditionMeta {
  key: BPConditionKey;
  labelMm: string;
  color: string;
}

export const BP_CONDITION_META: Record<BPConditionKey, BPConditionMeta> = {
  morning: { key: 'morning', labelMm: 'မနက်နိုးနိုးချင်း', color: '#f59e0b' },
  night: { key: 'night', labelMm: 'ညအိပ်ရာဝင်', color: '#6366f1' },
  resting: { key: 'resting', labelMm: 'နားနေချိန်', color: '#10b981' },
  after_exercise: { key: 'after_exercise', labelMm: 'လှုပ်ရှားပြီးစ', color: '#8b5cf6' },
  stress: { key: 'stress', labelMm: 'စိတ်ဖိစီးချိန်', color: '#f43f5e' },
  unknown: { key: 'unknown', labelMm: 'အခြေအနေ မသိပါ', color: '#64748b' },
};

const BP_CONDITIONS: ReadonlySet<string> = new Set([
  'morning',
  'night',
  'resting',
  'after_exercise',
  'stress',
]);

/**
 * Map a stored BP condition to its chart condition. Only the 5 real
 * measurement conditions pass through — legacy category values
 * ('stage1', 'elevated', ...) and missing values become 'unknown'.
 */
export function normalizeBPCondition(c?: string | null): BPConditionKey {
  if (!c) return 'unknown';
  const v = String(c).trim().toLowerCase();
  return (BP_CONDITIONS.has(v) ? v : 'unknown') as BPConditionKey;
}

/**
 * Map a timestamp (ms) to an x coordinate on a time axis.
 * Zero span (single point / identical timestamps) centres the point.
 */
export function timeScaleX(
  ms: number,
  tMin: number,
  tMax: number,
  chartW: number,
  padLeft: number,
): number {
  if (tMax <= tMin) return padLeft + chartW / 2;
  return padLeft + ((ms - tMin) / (tMax - tMin)) * chartW;
}

/** Evenly spaced tick timestamps from tMin to tMax (inclusive). */
export function chartTimeTicks(tMin: number, tMax: number, count = 5): number[] {
  if (tMax <= tMin) return [tMin];
  const n = Math.max(2, Math.floor(count));
  const step = (tMax - tMin) / (n - 1);
  const ticks: number[] = [];
  for (let i = 0; i < n; i++) {
    ticks.push(i === n - 1 ? tMax : tMin + step * i);
  }
  return ticks;
}

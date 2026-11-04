import { describe, it, expect } from 'vitest';
import {
  GLUCOSE_SERIES_META,
  BP_CONDITION_META,
  normalizeGlucoseType,
  normalizeBPCondition,
  timeScaleX,
  chartTimeTicks,
} from './chartSeries';

describe('normalizeGlucoseType', () => {
  it('maps each valid type to itself', () => {
    expect(normalizeGlucoseType('fasting')).toBe('fasting');
    expect(normalizeGlucoseType('before_meal')).toBe('before_meal');
    expect(normalizeGlucoseType('post_meal_2h')).toBe('post_meal_2h');
    expect(normalizeGlucoseType('random')).toBe('random');
    expect(normalizeGlucoseType('bedtime')).toBe('bedtime');
    expect(normalizeGlucoseType('hba1c')).toBe('hba1c');
  });

  it("maps legacy 'post_prandial' and 'postprandial' to 'post_meal_2h'", () => {
    expect(normalizeGlucoseType('post_prandial')).toBe('post_meal_2h');
    expect(normalizeGlucoseType('postprandial')).toBe('post_meal_2h');
  });

  it("maps missing / empty / unknown values to 'unknown'", () => {
    expect(normalizeGlucoseType(undefined)).toBe('unknown');
    expect(normalizeGlucoseType(null)).toBe('unknown');
    expect(normalizeGlucoseType('')).toBe('unknown');
    expect(normalizeGlucoseType('   ')).toBe('unknown');
    expect(normalizeGlucoseType('something-else')).toBe('unknown');
  });

  it('has a band matching calculateGlucoseStatus for every known series', () => {
    // fasting normal 70–99; other mg/dL types normal <=139; HbA1c <5.7.
    expect(GLUCOSE_SERIES_META.fasting.bandLow).toBe(70);
    expect(GLUCOSE_SERIES_META.fasting.bandHigh).toBe(99);
    for (const k of ['before_meal', 'post_meal_2h', 'random', 'bedtime'] as const) {
      expect(GLUCOSE_SERIES_META[k].bandLow).toBe(70);
      expect(GLUCOSE_SERIES_META[k].bandHigh).toBe(140);
    }
    expect(GLUCOSE_SERIES_META.hba1c.bandLow).toBe(4.0);
    expect(GLUCOSE_SERIES_META.hba1c.bandHigh).toBe(5.7);
    expect(GLUCOSE_SERIES_META.unknown.bandLow).toBeNull();
    expect(GLUCOSE_SERIES_META.unknown.bandHigh).toBeNull();
  });
});

describe('normalizeBPCondition', () => {
  it('passes each valid measurement condition through', () => {
    expect(normalizeBPCondition('morning')).toBe('morning');
    expect(normalizeBPCondition('night')).toBe('night');
    expect(normalizeBPCondition('resting')).toBe('resting');
    expect(normalizeBPCondition('after_exercise')).toBe('after_exercise');
    expect(normalizeBPCondition('stress')).toBe('stress');
  });

  it('maps legacy BP categories to unknown, never treats them as conditions', () => {
    expect(normalizeBPCondition('stage1')).toBe('unknown');
    expect(normalizeBPCondition('stage2')).toBe('unknown');
    expect(normalizeBPCondition('elevated')).toBe('unknown');
    expect(normalizeBPCondition('normal')).toBe('unknown');
    expect(normalizeBPCondition('crisis')).toBe('unknown');
  });

  it('maps missing / empty / unknown values to unknown', () => {
    expect(normalizeBPCondition(undefined)).toBe('unknown');
    expect(normalizeBPCondition(null)).toBe('unknown');
    expect(normalizeBPCondition('')).toBe('unknown');
    expect(normalizeBPCondition('sitting')).toBe('unknown');
  });

  it('has a meta entry (label + colour) for every condition key', () => {
    for (const k of ['morning', 'night', 'resting', 'after_exercise', 'stress', 'unknown'] as const) {
      expect(BP_CONDITION_META[k].labelMm.length).toBeGreaterThan(0);
      expect(BP_CONDITION_META[k].color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('timeScaleX', () => {
  const padLeft = 45;
  const chartW = 565;

  it('centres the point when the span is 0', () => {
    expect(timeScaleX(1000, 1000, 1000, chartW, padLeft)).toBe(padLeft + chartW / 2);
    expect(timeScaleX(500, 1000, 1000, chartW, padLeft)).toBe(padLeft + chartW / 2);
  });

  it('maps tMin to padLeft and tMax to padLeft + chartW', () => {
    expect(timeScaleX(0, 0, 1000, chartW, padLeft)).toBe(padLeft);
    expect(timeScaleX(1000, 0, 1000, chartW, padLeft)).toBe(padLeft + chartW);
  });

  it('maps the midpoint to the centre', () => {
    expect(timeScaleX(500, 0, 1000, chartW, padLeft)).toBe(padLeft + chartW / 2);
  });
});

describe('chartTimeTicks', () => {
  it('returns `count` values, monotonic, first=tMin, last=tMax', () => {
    const ticks = chartTimeTicks(0, 1000, 5);
    expect(ticks).toHaveLength(5);
    expect(ticks[0]).toBe(0);
    expect(ticks[4]).toBe(1000);
    for (let i = 1; i < ticks.length; i++) {
      expect(ticks[i]).toBeGreaterThan(ticks[i - 1]);
    }
    expect(ticks).toEqual([0, 250, 500, 750, 1000]);
  });

  it('returns a single value when the span is 0', () => {
    expect(chartTimeTicks(1000, 1000)).toEqual([1000]);
    expect(chartTimeTicks(1000, 500)).toEqual([1000]);
  });

  it('respects a custom count', () => {
    expect(chartTimeTicks(0, 100, 3)).toEqual([0, 50, 100]);
  });
});

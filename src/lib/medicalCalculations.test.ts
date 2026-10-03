import { describe, it, expect } from 'vitest';
import {
  calculateBMI,
  calculateBPCategory,
  calculateGlucoseStatus,
  calculateAge,
  evaluateLabParam,
} from './medicalCalculations';

describe('calculateBMI', () => {
  // Height 100 cm (1.0 m) for simple math: weight = BMI
  it('handles invalid inputs (0, negative, NaN)', () => {
    expect(calculateBMI(0, 170)).toBeNull();
    expect(calculateBMI(-50, 170)).toBeNull();
    expect(calculateBMI(60, 0)).toBeNull();
    expect(calculateBMI(60, -170)).toBeNull();
  });

  it('evaluates underweight (< 18.5)', () => {
    const res = calculateBMI(18.4, 100);
    expect(res?.bmi).toBe(18.4);
    expect(res?.category).toBe('underweight');
  });

  it('evaluates normal weight boundary (18.5 to 22.9)', () => {
    const at18_5 = calculateBMI(18.5, 100);
    expect(at18_5?.category).toBe('normal');

    const at22_9 = calculateBMI(22.9, 100);
    expect(at22_9?.category).toBe('normal');
  });

  it('evaluates overweight boundary (23.0 to 24.9)', () => {
    const at23 = calculateBMI(23.0, 100);
    expect(at23?.category).toBe('overweight');

    const at24_9 = calculateBMI(24.9, 100);
    expect(at24_9?.category).toBe('overweight');
  });

  it('evaluates obese class 1 boundary (25.0 to 29.9)', () => {
    const at25 = calculateBMI(25.0, 100);
    expect(at25?.category).toBe('obese1');

    const at29_9 = calculateBMI(29.9, 100);
    expect(at29_9?.category).toBe('obese1');
  });

  it('evaluates obese class 2 (>= 30)', () => {
    const at30 = calculateBMI(30.0, 100);
    expect(at30?.category).toBe('obese2');
  });

  it('identifies pediatric patients (< 18 yrs) and avoids adult classification', () => {
    const res = calculateBMI(26, 150, 12);
    expect(res?.isPediatric).toBe(true);
    expect(res?.labelMm).toContain('ကလေး/ဆယ်ကျော်သက်');
  });
});

describe('calculateBPCategory', () => {
  it('evaluates normal BP (119/79)', () => {
    const res = calculateBPCategory(119, 79);
    expect(res.category).toBe('normal');
  });

  it('evaluates elevated BP (120/79 and 129/79)', () => {
    expect(calculateBPCategory(120, 79).category).toBe('elevated');
    expect(calculateBPCategory(129, 79).category).toBe('elevated');
  });

  it('evaluates Stage 1 Hypertension (130/80 and 139/89)', () => {
    expect(calculateBPCategory(130, 80).category).toBe('stage1');
    expect(calculateBPCategory(139, 89).category).toBe('stage1');
    expect(calculateBPCategory(135, 75).category).toBe('stage1');
  });

  it('evaluates Stage 2 Hypertension (140/90 and 179/119)', () => {
    expect(calculateBPCategory(140, 90).category).toBe('stage2');
    expect(calculateBPCategory(179, 119).category).toBe('stage2');
  });

  it('evaluates Hypertensive Crisis (180/120)', () => {
    expect(calculateBPCategory(180, 120).category).toBe('crisis');
    expect(calculateBPCategory(185, 110).category).toBe('crisis');
    expect(calculateBPCategory(160, 125).category).toBe('crisis');
  });

  it('evaluates mixed cases by highest severity (e.g. 118/92 is Stage 2)', () => {
    const mixed = calculateBPCategory(118, 92);
    expect(mixed.category).toBe('stage2');
  });

  it('handles pregnancy safety warning for BP >= 140/90', () => {
    const res = calculateBPCategory(140, 90, undefined, true);
    expect(res.isPregnancyAlert).toBe(true);
    expect(res.labelMm).toContain('ကိုယ်ဝန်ဆောင် သွေးတိုး');
  });

  it('handles pediatric safety check for age < 18', () => {
    const res = calculateBPCategory(135, 85, 14);
    expect(res.isPediatric).toBe(true);
    expect(res.labelMm).toContain('ကလေး/ဆယ်ကျော်သက်');
  });
});

describe('calculateGlucoseStatus', () => {
  it('evaluates Fasting blood sugar thresholds', () => {
    expect(calculateGlucoseStatus(65, 'fasting').status).toBe('low');
    expect(calculateGlucoseStatus(70, 'fasting').status).toBe('normal');
    expect(calculateGlucoseStatus(99, 'fasting').status).toBe('normal');
    expect(calculateGlucoseStatus(100, 'fasting').status).toBe('pre_diabetic');
    expect(calculateGlucoseStatus(125, 'fasting').status).toBe('pre_diabetic');
    expect(calculateGlucoseStatus(126, 'fasting').status).toBe('high');
  });

  it('evaluates Random / Post-prandial blood sugar thresholds', () => {
    expect(calculateGlucoseStatus(60, 'random').status).toBe('low');
    expect(calculateGlucoseStatus(70, 'random').status).toBe('normal');
    expect(calculateGlucoseStatus(139, 'random').status).toBe('normal');
    expect(calculateGlucoseStatus(140, 'random').status).toBe('pre_diabetic');
    expect(calculateGlucoseStatus(199, 'random').status).toBe('pre_diabetic');
    expect(calculateGlucoseStatus(200, 'random').status).toBe('critical');
  });

  it('evaluates HbA1c thresholds', () => {
    expect(calculateGlucoseStatus(5.5, 'hba1c').status).toBe('normal');
    expect(calculateGlucoseStatus(5.7, 'hba1c').status).toBe('pre_diabetic');
    expect(calculateGlucoseStatus(6.4, 'hba1c').status).toBe('pre_diabetic');
    expect(calculateGlucoseStatus(6.5, 'hba1c').status).toBe('high');
  });
});

describe('calculateAge', () => {
  it('calculates age for valid past birth dates', () => {
    const now = new Date();
    const dob = `${now.getFullYear() - 25}-01-01`;
    const res = calculateAge(dob);
    expect(res).not.toBeNull();
    expect(res?.years).toBeGreaterThanOrEqual(24);
  });

  it('handles leap day birth dates', () => {
    const res = calculateAge('2000-02-29');
    expect(res).not.toBeNull();
    expect(res?.years).toBeGreaterThan(0);
  });

  it('returns null for future dates', () => {
    const now = new Date();
    const futureDob = `${now.getFullYear() + 2}-01-01`;
    const res = calculateAge(futureDob);
    expect(res).toBeNull();
  });

  it('returns null for invalid strings', () => {
    expect(calculateAge('invalid-date')).toBeNull();
    expect(calculateAge('')).toBeNull();
    expect(calculateAge(undefined)).toBeNull();
  });
});

describe('evaluateLabParam', () => {
  it('evaluates hemoglobin values', () => {
    expect(evaluateLabParam('hemoglobin', 7.5).status).toBe('critical');
    expect(evaluateLabParam('hemoglobin', 10.0).status).toBe('low');
    expect(evaluateLabParam('hemoglobin', 14.0).status).toBe('normal');
    expect(evaluateLabParam('hemoglobin', 18.0).status).toBe('high');
  });

  it('evaluates WBC counts', () => {
    expect(evaluateLabParam('wbc', 3500).status).toBe('low');
    expect(evaluateLabParam('wbc', 7500).status).toBe('normal');
    expect(evaluateLabParam('wbc', 12000).status).toBe('high');
    expect(evaluateLabParam('wbc', 16000).status).toBe('critical');
  });

  it('evaluates platelets counts', () => {
    expect(evaluateLabParam('platelets', 40000).status).toBe('critical');
    expect(evaluateLabParam('platelets', 120000).status).toBe('low');
    expect(evaluateLabParam('platelets', 250000).status).toBe('normal');
    expect(evaluateLabParam('platelets', 500000).status).toBe('high');
  });
});

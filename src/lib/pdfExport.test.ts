import { describe, it, expect } from 'vitest';
import {
  sanitizePdfFilenamePart,
  buildPdfFilename,
  dateStamp,
  computeA4PageSlices,
  PDF_CONTENT_WIDTH_MM,
  PDF_CONTENT_HEIGHT_MM,
  PDF_MARGIN_MM,
  isStandalonePwa,
} from './pdfExport';

describe('sanitizePdfFilenamePart', () => {
  it('keeps Burmese letters and digits untouched', () => {
    expect(sanitizePdfFilenamePart('မောင်မောင်')).toBe('မောင်မောင်');
    expect(sanitizePdfFilenamePart('အောင်လှိုင်123')).toBe('အောင်လှိုင်123');
  });

  it('turns whitespace runs into a single hyphen', () => {
    expect(sanitizePdfFilenamePart('မောင်  မောင်   အောင်')).toBe('မောင်-မောင်-အောင်');
    expect(sanitizePdfFilenamePart('John Doe')).toBe('John-Doe');
  });

  it('strips every forbidden filename character', () => {
    expect(sanitizePdfFilenamePart('a/b\\c:d*e?f"g<h>i|j')).toBe('abcdefghij');
    expect(sanitizePdfFilenamePart('name/with:illegal*chars?')).toBe('namewithillegalchars');
  });

  it('strips control characters and trims leading/trailing hyphens and dots', () => {
    expect(sanitizePdfFilenamePart('  --မောင်--  ')).toBe('မောင်');
    expect(sanitizePdfFilenamePart('.မောင်.')).toBe('မောင်');
    expect(sanitizePdfFilenamePart('a\u0001b\u007fc')).toBe('abc');
  });

  it('returns empty when nothing usable is left', () => {
    expect(sanitizePdfFilenamePart('')).toBe('');
    expect(sanitizePdfFilenamePart('   ')).toBe('');
    expect(sanitizePdfFilenamePart('///:::')).toBe('');
  });
});

describe('dateStamp', () => {
  it('formats a local YYYY-MM-DD with zero padding', () => {
    // Constructed with local components so no timezone shift applies.
    expect(dateStamp(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(dateStamp(new Date(2026, 10, 4))).toBe('2026-11-04');
  });
});

describe('buildPdfFilename', () => {
  it('builds the passport filename with the sanitised name and date', () => {
    expect(buildPdfFilename('health-passport', 'မောင်မောင်', new Date(2026, 10, 4))).toBe(
      'health-passport-မောင်မောင်-2026-11-04.pdf',
    );
    expect(buildPdfFilename('emergency-id', 'Aung Aung', new Date(2026, 0, 5))).toBe(
      'emergency-id-Aung-Aung-2026-01-05.pdf',
    );
  });

  it('falls back to "user" when the name sanitises to nothing', () => {
    expect(buildPdfFilename('health-passport', '///', new Date(2026, 10, 4))).toBe(
      'health-passport-user-2026-11-04.pdf',
    );
    expect(buildPdfFilename('emergency-id', '', new Date(2026, 10, 4))).toBe(
      'emergency-id-user-2026-11-04.pdf',
    );
  });
});

describe('computeA4PageSlices', () => {
  it('is a single page for a short image', () => {
    const slices = computeA4PageSlices(800, 600);
    expect(slices).toHaveLength(1);
    expect(slices[0].pageCount).toBe(1);
    expect(slices[0].imageWidthMm).toBe(PDF_CONTENT_WIDTH_MM);
    expect(slices[0].offsetYmm).toBe(PDF_MARGIN_MM);
    // 600/800 * 190 = 142.5mm tall — fits one 277mm page.
    expect(slices[0].imageHeightMm).toBeCloseTo(142.5, 6);
  });

  it('splits a tall passport image into 277mm strips', () => {
    // 800 x 4000 px -> 190mm wide, 950mm tall -> ceil(950/277) = 4 pages.
    const slices = computeA4PageSlices(800, 4000);
    expect(slices).toHaveLength(4);
    expect(slices.map((s) => s.pageCount)).toEqual([4, 4, 4, 4]);
    expect(slices[0].offsetYmm).toBe(PDF_MARGIN_MM);
    expect(slices[1].offsetYmm).toBeCloseTo(PDF_MARGIN_MM - PDF_CONTENT_HEIGHT_MM, 6);
    expect(slices[3].offsetYmm).toBeCloseTo(PDF_MARGIN_MM - 3 * PDF_CONTENT_HEIGHT_MM, 6);
    // The last strip still starts above the page bottom: 950 - 3*277 = 119mm shown.
    expect(slices[3].imageHeightMm - 3 * PDF_CONTENT_HEIGHT_MM).toBeCloseTo(119, 6);
  });

  it('is exactly one page when the image is just under one page tall', () => {
    // Height that maps to exactly 277mm: h = 277 / 190 * 800 px.
    // Floating point makes the exact value land a hair over 277mm, so
    // test 1px under (one page) and 1px over (two pages) instead.
    const exactPx = (PDF_CONTENT_HEIGHT_MM / PDF_CONTENT_WIDTH_MM) * 800;
    expect(computeA4PageSlices(800, exactPx - 1)).toHaveLength(1);
    expect(computeA4PageSlices(800, exactPx + 1)).toHaveLength(2);
  });

  it('rejects non-positive or non-finite sizes instead of producing a bad PDF', () => {
    expect(() => computeA4PageSlices(0, 600)).toThrow();
    expect(() => computeA4PageSlices(800, 0)).toThrow();
    expect(() => computeA4PageSlices(NaN, 600)).toThrow();
  });
});

describe('isStandalonePwa', () => {
  it('is false outside a browser (vitest node environment)', () => {
    expect(isStandalonePwa()).toBe(false);
  });
});

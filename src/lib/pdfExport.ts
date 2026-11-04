// v2.4.18 (Track A) — real PDF download for the Health Passport and the
// Emergency ID card.
//
// WHY THIS EXISTS: both print paths used to call window.print() only, and
// window.print() silently does NOTHING in an installed PWA (standalone
// mode) on iOS and is unreliable on Android — the user tapped
// "Print / PDF ထုတ်မည်" and nothing happened at all. There was no PDF
// library in the app at all. This module builds a real .pdf file instead.
//
// WHY html-to-image + jsPDF (raster), NOT html2canvas:
// The project uses Tailwind v4 (@tailwindcss/vite ^4.3.3), whose theme
// emits oklch() colours everywhere (see node_modules/tailwindcss/theme.css
// and the built dist CSS — every --color-* is oklch(...)). html2canvas
// 1.4.1 cannot parse oklch() and throws "unsupported color function", so
// it would fail on every Tailwind-coloured element. html-to-image renders
// via SVG foreignObject in the browser itself, so oklch colours AND the
// system Burmese fonts (Padauk / Noto Sans Myanmar / Pyidaungsu) render
// exactly as on screen. jsPDF built-in fonts cannot render Burmese at
// all, so a text-based jsPDF (with an embedded font) is NOT an option
// either — no Myanmar font file with a verifiable licence is shipped.
//
// LAZY LOADING: jspdf + html-to-image are loaded with dynamic import()
// INSIDE exportElementToPdf() — never top-level — so the main bundle does
// not grow; Vite emits them as a separate lazy chunk fetched only when
// the user taps a PDF button.

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
/** Print margin on every side; the image is scaled to the width inside it. */
export const PDF_MARGIN_MM = 10;
export const PDF_CONTENT_WIDTH_MM = A4_WIDTH_MM - PDF_MARGIN_MM * 2; // 190
export const PDF_CONTENT_HEIGHT_MM = A4_HEIGHT_MM - PDF_MARGIN_MM * 2; // 277
/** 1 CSS px = 25.4 / 96 mm. */
export const PX_TO_MM = 25.4 / 96;

/** One A4 page of a tall captured image, as jsPDF draw offsets. */
export interface PdfPageSlice {
  /** 0-based page number. */
  pageIndex: number;
  /** Total pages the image spans. */
  pageCount: number;
  /** Image width on the page, mm (always the content width). */
  imageWidthMm: number;
  /** Full image height, mm (same on every page — the image is drawn once
      per page, shifted up so only that page's strip shows). */
  imageHeightMm: number;
  /** Y offset (mm) at which to draw the image's top on this page. */
  offsetYmm: number;
}

/**
 * A4 page-slicing math for a captured PNG of `imageWidthPx` x
 * `imageHeightPx` CSS px. The image is scaled to the A4 content width
 * (190mm) and split into content-height (277mm) strips; each slice tells
 * jsPDF where to draw the full image so only that strip lands on the page.
 */
export function computeA4PageSlices(
  imageWidthPx: number,
  imageHeightPx: number,
): PdfPageSlice[] {
  if (!Number.isFinite(imageWidthPx) || !Number.isFinite(imageHeightPx) || imageWidthPx <= 0 || imageHeightPx <= 0) {
    throw new Error('PDF အတွက် ပုံအရွယ်အစား မမှန်ပါ');
  }
  const imageWidthMm = PDF_CONTENT_WIDTH_MM;
  const imageHeightMm = (imageHeightPx / imageWidthPx) * imageWidthMm;
  const pageCount = Math.max(1, Math.ceil(imageHeightMm / PDF_CONTENT_HEIGHT_MM));
  const slices: PdfPageSlice[] = [];
  for (let i = 0; i < pageCount; i++) {
    slices.push({
      pageIndex: i,
      pageCount,
      imageWidthMm,
      imageHeightMm,
      offsetYmm: PDF_MARGIN_MM - i * PDF_CONTENT_HEIGHT_MM,
    });
  }
  return slices;
}

/**
 * Sanitise one filename part (a person's name): strips the characters
 * Windows / Android / iOS forbid in filenames (`/ \ : * ? " < > |` and
 * control characters), collapses whitespace runs to a single `-`, and
 * trims leading/trailing `-` and `.`. Burmese letters, digits and `-`
 * survive untouched. Returns '' when nothing usable is left.
 */
export function sanitizePdfFilenamePart(name: string): string {
  return (name || '')
    .replace(/[/\\:*?"<>|\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
}

/** Local YYYY-MM-DD (never UTC — the date on the file is the user's date). */
export function dateStamp(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * health-passport-<name>-<YYYY-MM-DD>.pdf / emergency-id-<name>-<YYYY-MM-DD>.pdf.
 * A name that sanitises to nothing falls back to 'user' so the filename
 * is never a bare generic name that overwrites another person's file.
 */
export function buildPdfFilename(
  prefix: 'health-passport' | 'emergency-id',
  personName: string,
  date: Date = new Date(),
): string {
  const safeName = sanitizePdfFilenamePart(personName) || 'user';
  return `${prefix}-${safeName}-${dateStamp(date)}.pdf`;
}

/**
 * True when the app runs as an installed PWA (standalone display mode).
 * window.print() silently does nothing there — callers must hide (not
 * merely relabel) the desktop Print button in that case.
 */
export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  return (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

export type PdfShareResult = 'shared' | 'downloaded' | 'cancelled';

/**
 * Deliver a finished PDF blob: on phones prefer the native share sheet
 * (navigator.share with a File — the user can save to Files / Drive /
 * send it on), otherwise fall back to a plain anchor download.
 * A share sheet the user dismisses ('cancelled') is NOT an error — the
 * caller must not show a failure toast for it.
 */
export async function shareOrDownloadPdf(
  blob: Blob,
  filename: string,
): Promise<PdfShareResult> {
  const file = new File([blob], filename, { type: 'application/pdf' });
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  if (nav && typeof nav.canShare === 'function') {
    try {
      if (nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: filename });
        return 'shared';
      }
    } catch (err) {
      // The user dismissed the share sheet — not a failure.
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
      if (err instanceof Error && err.name === 'AbortError') return 'cancelled';
      // Any other share failure falls through to the download below.
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    return 'downloaded';
  } finally {
    // Give the browser a tick to pick the blob up before revoking.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export interface ExportElementToPdfOptions {
  filename: string;
  /** Image sharpness; 2 keeps small Burmese text legible. Default 2. */
  pixelRatio?: number;
}

export interface ExportElementToPdfResult {
  filename: string;
  pages: number;
  outcome: PdfShareResult;
}

/** Wait for `frames` animation frames plus `ms` — lets React finish
    rendering the full (printMode) content before the capture runs. */
function waitForRender(frames = 2, ms = 300): Promise<void> {
  return new Promise((resolve) => {
    let remaining = frames;
    const step = () => {
      if (--remaining <= 0) {
        setTimeout(resolve, ms);
      } else {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  });
}

/**
 * Capture `element` at its FULL scroll size (not just the visible slice —
 * the passport lives in a max-h-[90vh] scroll container and its tables
 * have max-h-60 inner scrollers) and build a multi-page A4 PDF from it.
 *
 * Callers must add the `pdf-capture` class to the element first (and
 * remove it afterwards): the app's print stylesheet only unsets the
 * scroll containers under @media print, so the capture needs the same
 * unsetting on screen — see the `.pdf-capture` rules in the callers'
 * <style> blocks. The `no-print` toggle rows are hidden the same way.
 *
 * The PDF libs are lazy-loaded here (dynamic import), so this is the only
 * place jspdf / html-to-image are ever imported.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportElementToPdfOptions,
): Promise<ExportElementToPdfResult> {
  const { filename, pixelRatio = 2 } = options;
  await waitForRender();
  const width = element.scrollWidth;
  const height = element.scrollHeight;
  if (!width || !height) {
    throw new Error('PDF ထုတ်ရန် အကြောင်းအရာ မတွေ့ပါ');
  }
  const [{ toPng }, { jsPDF }] = await Promise.all([
    import('html-to-image'),
    import('jspdf'),
  ]);
  const dataUrl = await toPng(element, {
    pixelRatio,
    width,
    height,
    // Expand the clone to the element's full scroll size — the on-screen
    // node is height-clipped by its scroll container.
    style: {
      width: `${width}px`,
      height: `${height}px`,
      maxHeight: 'none',
      overflow: 'visible',
    },
    // The page background must be white, not transparent, in the PDF.
    backgroundColor: '#ffffff',
    cacheBust: true,
  });
  const slices = computeA4PageSlices(width, height);
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  slices.forEach((slice, i) => {
    if (i > 0) doc.addPage('a4', 'portrait');
    doc.addImage(dataUrl, 'PNG', PDF_MARGIN_MM, slice.offsetYmm, slice.imageWidthMm, slice.imageHeightMm);
  });
  const blob = doc.output('blob');
  const outcome = await shareOrDownloadPdf(blob, filename);
  return { filename, pages: slices.length, outcome };
}

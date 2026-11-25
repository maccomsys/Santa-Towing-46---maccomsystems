import { ASSET_PATH_MAP } from '@/assets/images';

export const MAX_BACKUP_BYTES = 5 * 1024 * 1024; // 5 MB

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F]/g;

const BUNDLED_ASSET_KEYS = new Set(Object.keys(ASSET_PATH_MAP));
const BUNDLED_ASSET_VALUES = new Set(Object.values(ASSET_PATH_MAP));

const ALLOWED_RASTER_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

const ALLOWED_RASTER_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif']);

/**
 * Checks whether an object key can trigger prototype pollution.
 */
export function isDangerousKey(key: string): boolean {
  return DANGEROUS_KEYS.has(key);
}

/**
 * Deep-clones plain objects and arrays while stripping prototype-pollution keys
 * (__proto__, constructor, prototype).
 */
export function sanitizeObjectTree<T>(input: T, seen = new WeakSet<object>()): T {
  if (input === null || typeof input !== 'object') {
    return input;
  }

  if (seen.has(input as object)) {
    return undefined as unknown as T;
  }
  seen.add(input as object);

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObjectTree(item, seen)) as unknown as T;
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (isDangerousKey(k)) {
      continue;
    }
    out[k] = sanitizeObjectTree(v, seen);
  }
  return out as T;
}

/**
 * Parses a JSON string safely with size limits and prototype-pollution stripping.
 */
export function safeJsonParse<T = unknown>(
  raw: string | null | undefined,
  maxBytes: number = MAX_BACKUP_BYTES
): T | null {
  if (typeof raw !== 'string' || !raw.trim()) {
    return null;
  }
  if (raw.length > maxBytes) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    return sanitizeObjectTree(parsed) as T;
  } catch {
    return null;
  }
}

/**
 * Escapes HTML special characters for safe interpolation.
 */
export function escapeHtml(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Serializes JSON-LD safely inside <script type="application/ld+json">
 * preventing </script> breakout and HTML parser interference.
 */
export function safeJsonLdStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Validates and normalizes an http/https URL. Returns fallback if invalid or unsafe.
 */
export function sanitizeHttpUrl(url: string | null | undefined, fallback = ''): string {
  if (typeof url !== 'string') return fallback;
  const cleaned = url.replace(CONTROL_CHARS_RE, '').trim();
  if (!cleaned) return fallback;

  try {
    const parsed = new URL(cleaned);
    if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname) {
      return parsed.toString();
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Checks if a navigation path or URL is safe (internal `/` path, `#anchor`, or `http(s)://`).
 */
export function isValidNavigationTarget(target: string | null | undefined): boolean {
  if (typeof target !== 'string') return false;
  const cleaned = target.replace(CONTROL_CHARS_RE, '').trim();
  if (!cleaned || cleaned.length > 500) return false;

  if (cleaned.startsWith('/')) {
    // Reject protocol-relative URLs (//evil.com) or backslash tricks (/\evil.com)
    if (cleaned.startsWith('//') || cleaned.includes('\\')) return false;
    return true;
  }

  if (cleaned.startsWith('#')) {
    return /^#[a-zA-Z0-9_-]{1,100}$/.test(cleaned);
  }

  return sanitizeHttpUrl(cleaned, '') !== '';
}

/**
 * Returns a safe navigation target or the fallback.
 */
export function sanitizeNavigationTarget(
  target: string | null | undefined,
  fallback = '/'
): string {
  if (typeof target !== 'string') return fallback;
  const cleaned = target.replace(CONTROL_CHARS_RE, '').trim();
  return isValidNavigationTarget(cleaned) ? cleaned : fallback;
}

/**
 * Restricts post-login redirect paths strictly to internal /admin routes.
 */
export function isValidAdminPath(path: string | null | undefined): boolean {
  if (typeof path !== 'string') return false;
  const cleaned = path.replace(CONTROL_CHARS_RE, '').trim();
  if (!cleaned.startsWith('/admin')) return false;
  if (cleaned.startsWith('//') || cleaned.includes('\\') || cleaned.includes('..')) {
    return false;
  }
  return cleaned.length <= 200;
}

/**
 * Validates and formats a tel: link safely.
 */
export function sanitizeTelUrl(
  value: string | null | undefined,
  fallback = 'tel:0244753849'
): string {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.replace(CONTROL_CHARS_RE, '').trim();
  if (!cleaned) return fallback;

  const rawNumber = cleaned.toLowerCase().startsWith('tel:')
    ? cleaned.slice(4).trim()
    : cleaned;

  if (!/^[0-9+() .-]{5,25}$/.test(rawNumber)) {
    return fallback;
  }
  const digitsOnly = rawNumber.replace(/[^0-9+]/g, '');
  if (digitsOnly.length < 5) return fallback;
  return `tel:${digitsOnly}`;
}

/**
 * Validates and formats a mailto: link safely.
 */
export function sanitizeMailtoUrl(email: string | null | undefined, fallback = ''): string {
  if (typeof email !== 'string') return fallback;
  const cleaned = email.replace(CONTROL_CHARS_RE, '').trim();
  const rawEmail = cleaned.toLowerCase().startsWith('mailto:')
    ? cleaned.slice(7).trim()
    : cleaned;
  return isValidEmail(rawEmail) ? `mailto:${rawEmail}` : fallback;
}

/**
 * Validates an image URL. Allows bundled static assets, safe relative paths,
 * blob URLs, http(s) URLs, and strictly raster base64 data URLs (PNG/JPG/WebP/GIF).
 * Blocks arbitrary SVG data URLs and javascript:/vbscript:/text: schemes.
 */
export function sanitizeImageUrl(url: string | null | undefined, fallback = ''): string {
  if (typeof url !== 'string') return fallback;
  const cleaned = url.replace(CONTROL_CHARS_RE, '').trim();
  if (!cleaned) return fallback;

  if (BUNDLED_ASSET_KEYS.has(cleaned)) {
    return ASSET_PATH_MAP[cleaned];
  }
  if (BUNDLED_ASSET_VALUES.has(cleaned)) {
    return cleaned;
  }

  if (cleaned.startsWith('/')) {
    if (cleaned.startsWith('//') || cleaned.includes('\\')) return fallback;
    return cleaned;
  }

  if (cleaned.toLowerCase().startsWith('blob:')) {
    try {
      const parsed = new URL(cleaned);
      return parsed.protocol === 'blob:' ? cleaned : fallback;
    } catch {
      return fallback;
    }
  }

  if (cleaned.toLowerCase().startsWith('data:')) {
    const isRasterBase64 = /^data:image\/(png|jpeg|jpg|webp|gif);base64,[a-zA-Z0-9+/=\s]+$/i.test(
      cleaned
    );
    return isRasterBase64 ? cleaned : fallback;
  }

  return sanitizeHttpUrl(cleaned, fallback);
}

/**
 * Sanitizes rich HTML for safe rendering using DOMParser allowlisting.
 * Strips active elements (<script>, <iframe>, <svg>, <object>, <form>, etc.),
 * inline event handlers (on*), and unsafe href/src/style values.
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string' || !html.trim()) return '';
  if (typeof DOMParser === 'undefined') {
    return escapeHtml(html);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const blockedTags = new Set([
    'SCRIPT',
    'STYLE',
    'IFRAME',
    'OBJECT',
    'EMBED',
    'APPLET',
    'BASE',
    'LINK',
    'META',
    'FORM',
    'INPUT',
    'BUTTON',
    'TEXTAREA',
    'SELECT',
    'SVG',
    'MATH',
    'TEMPLATE',
    'NOSCRIPT',
  ]);

  const removeQueue: Element[] = [];
  const allElements = doc.body.querySelectorAll('*');

  allElements.forEach((el) => {
    if (blockedTags.has(el.tagName.toUpperCase())) {
      removeQueue.push(el);
      return;
    }

    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const val = attr.value;

      if (
        name.startsWith('on') ||
        name === 'srcdoc' ||
        name === 'formaction' ||
        name === 'xlink:href'
      ) {
        el.removeAttribute(attr.name);
        continue;
      }

      if (name === 'style') {
        const lowerStyle = val.toLowerCase();
        if (
          lowerStyle.includes('expression(') ||
          lowerStyle.includes('javascript:') ||
          lowerStyle.includes('url(') ||
          lowerStyle.includes('@import')
        ) {
          el.removeAttribute(attr.name);
        }
        continue;
      }

      if (name === 'href' || name === 'action') {
        const safeHref = sanitizeNavigationTarget(val, '');
        if (!safeHref) {
          el.removeAttribute(attr.name);
        } else {
          el.setAttribute('href', safeHref);
        }
        continue;
      }

      if (name === 'src') {
        const safeSrc = sanitizeImageUrl(val, '');
        if (!safeSrc) {
          el.removeAttribute(attr.name);
        } else {
          el.setAttribute('src', safeSrc);
        }
      }
    }

    if (el.tagName.toUpperCase() === 'A' && el.getAttribute('target') === '_blank') {
      el.setAttribute('rel', 'noopener noreferrer');
    }
  });

  removeQueue.forEach((node) => node.remove());
  return doc.body.innerHTML;
}

export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (!trimmed || trimmed.length > 120) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function isValidPhone(phone: string): boolean {
  if (typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  if (!/^[0-9+() .-]{7,25}$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function isValidHexColor(hex: string): boolean {
  if (typeof hex !== 'string') return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(hex.trim());
}

export function sanitizeHexColor(hex: string | null | undefined, fallback: string): string {
  if (typeof hex !== 'string') return fallback;
  const trimmed = hex.trim();
  return isValidHexColor(trimmed) ? trimmed : fallback;
}

/**
 * Neutralizes spreadsheet formula injection (=, +, -, @, \t, \r) and escapes quotes.
 */
export function sanitizeCsvCell(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  let raw = String(val);
  if (/^\s*[=+\-@\t\r]/.test(raw)) {
    raw = `'${raw}`;
  }
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Produces a safe alphanumeric filename stem for PDF downloads.
 */
export function sanitizePdfFilename(
  docNumber: string | null | undefined,
  fallback = 'Santa-Document'
): string {
  if (typeof docNumber !== 'string') return fallback;
  const cleaned = docNumber.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  return cleaned || fallback;
}

/**
 * Validates raster image file uploads (PNG, JPG, WebP, GIF) and rejects SVGs/scripts.
 */
export function validateRasterImageFile(
  file: File | null | undefined,
  maxSizeBytes: number = 10 * 1024 * 1024
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Please select an image file.' };
  }
  if (file.size <= 0) {
    return { valid: false, error: 'Selected image file is empty.' };
  }
  if (file.size > maxSizeBytes) {
    const maxMb = Math.round((maxSizeBytes / (1024 * 1024)) * 10) / 10;
    return { valid: false, error: `Image file exceeds the ${maxMb} MB maximum size limit.` };
  }

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const mime = (file.type || '').toLowerCase();

  if (mime === 'image/svg+xml' || ext === 'svg') {
    return {
      valid: false,
      error: 'SVG uploads are disabled for security. Please upload PNG, JPG, WebP, or GIF.',
    };
  }

  if (mime && !ALLOWED_RASTER_MIMES.has(mime)) {
    return {
      valid: false,
      error: 'Unsupported image type. Please upload PNG, JPG, WebP, or GIF.',
    };
  }

  if (!ext || !ALLOWED_RASTER_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: 'Unsupported image file extension. Please use .png, .jpg, .webp, or .gif.',
    };
  }

  return { valid: true };
}

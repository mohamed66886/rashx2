/**
 * RASHX — Certificate Document Validation & Security Helpers
 *
 * Enforces magic-byte inspection and size limits for commercial registration
 * certificates uploaded to private Firebase Storage.
 */

export const ALLOWED_CERTIFICATE_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

export const MAX_CERTIFICATE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export type AllowedCertificateMime = 'application/pdf' | 'image/jpeg' | 'image/png';

/**
 * Inspects buffer magic bytes (file signature) to detect authentic MIME type.
 * Prevents MIME spoofing and executable uploads disguised with arbitrary extensions.
 */
export function detectMimeFromBytes(
  buffer: Uint8Array | Buffer
): AllowedCertificateMime | null {
  if (buffer.length < 4) return null;

  // PDF magic numbers: %PDF (0x25, 0x50, 0x44, 0x46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return 'application/pdf';
  }

  // JPEG magic numbers: 0xFF, 0xD8, 0xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG magic numbers: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  return null;
}


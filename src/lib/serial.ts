/**
 * Serial-number normalisation + key helpers for the stolen-bike registry.
 *
 * Frame serials are wildly inconsistent across manufacturers:
 *   - Whitespace and dashes appear randomly in manual transcription.
 *   - O/0 and I/1 get confused constantly.
 *   - Case matters to nobody except the reader.
 *
 * We normalise to uppercase, strip non-alphanumeric characters, and fold
 * O→0 + I→1 so a serial written "WTU-10I23-ABCO" matches "WTU1012 3ABC0".
 *
 * Brand + serial is the lookup key because serials are NOT globally unique;
 * two manufacturers can legitimately use the same string. Include brand to
 * disambiguate.
 */

export function normaliseSerial(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[\s\-_/]/g, '')
    .replace(/O/g, '0')
    .replace(/I/g, '1')
    .replace(/[^A-Z0-9]/g, '')
}

export function normaliseBrand(raw: string): string {
  return raw.toLowerCase().trim().replace(/\s+/g, ' ')
}

export function brandSerialKey(brand: string, serial: string): string {
  return `${normaliseBrand(brand)}:${normaliseSerial(serial)}`
}

/** Quick sanity check — avoids looking up garbage like "N/A" or "-". */
export function isPlausibleSerial(raw: string): boolean {
  const n = normaliseSerial(raw)
  return n.length >= 4 && n.length <= 30 && /[A-Z0-9]/.test(n)
}

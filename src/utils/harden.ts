/**
 * Removes any spaces between/inside, capitalizations or special characters from string.
 *
 * @param value String to raw as much as possible.
 *
 * @example
 * harden('  234ERwrew_324++-fds') // returns '234erwrew324fds'
 *
 * @returns The raw string formatted.
 */

export function harden(value: string) {
  const raw = value
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-ZÀ-ÿ0-9\s]/gi, '')
    .replace(/\s+/g, '')

  return raw
}

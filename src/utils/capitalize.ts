/**
 * Capitalizes a string.
 *
 * @param str String to be capitalized.
 *
 * @example
 * capitalize(' tEst+ fUNction ') // returns 'Test Function'
 *
 * @returns The string capitalized.
 */

export function capitalize(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-ZÀ-ÿ0-9\s]/gi, '')
    .replace(/(?<!\p{L})\p{L}/gu, function (char) {
      return char.toUpperCase()
    })
}

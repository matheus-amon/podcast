/**
 * Date Utilities
 */

const ISO_DATE_LENGTH = 10; // "YYYY-MM-DD"

/**
 * Formats a Date as `YYYY-MM-DD` in UTC.
 *
 * The previous spelling was `date.toISOString().split('T')[0]`. `split`
 * returns `string[]`, and under noUncheckedIndexedAccess the `[0]` is typed
 * `string | undefined` even though `toISOString()` always contains a `T` — so
 * every call site had to feed a possibly-undefined value into a Drizzle
 * comparison, which is what produced 16 TS2769/TS2345 errors. `slice` returns
 * a plain `string` and states the intent directly.
 */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, ISO_DATE_LENGTH);
}

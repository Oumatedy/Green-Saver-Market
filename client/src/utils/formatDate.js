/**
 * Format a date string or object into a readable format.
 * @param {string|Date} date - The date to format.
 * @param {Object} options - Formatting options. Example: { dateStyle: 'medium', timeStyle: 'short' }
 * @param {string} locale - Locale string, defaults to 'en-US'
 * @returns {string} Formatted date
 */
export function formatDate(date, options = { dateStyle: "medium" }, locale = "en-US") {
  if (!date) return "";
  const dateObj = typeof date === "string" || date instanceof String ? new Date(date) : date;

  if (isNaN(dateObj)) return "";

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Format a date as YYYY-MM-DD (ISO) string.
 * Useful for inputs or API payloads.
 */
export function formatDateISO(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

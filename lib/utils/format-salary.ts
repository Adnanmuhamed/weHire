/**
 * Salary formatting utility.
 *
 * The database stores raw annual amounts in INR (e.g. 300000).
 * The candidate-facing UI displays values in LPA (Lakhs Per Annum).
 *
 * 1 LPA = 1,00,000 (100 000) INR
 */

const LPA_DIVISOR = 100_000;

function toLPA(value: number): string {
  const lpa = value / LPA_DIVISOR;
  // Show one decimal only if it's not a whole number
  return lpa % 1 === 0 ? `${lpa}` : `${lpa.toFixed(1)}`;
}

/**
 * Format a min/max salary pair into a human-readable LPA string.
 *
 * @example
 * formatToLPA(300000, 600000)  // "3 LPA - 6 LPA"
 * formatToLPA(null, 1000000)   // "Up to 10 LPA"
 * formatToLPA(500000, null)    // "5 LPA+"
 * formatToLPA(null, null)      // "Not specified"
 */
export function formatToLPA(
  min: number | null | undefined,
  max: number | null | undefined
): string {
  const hasMin = min !== null && min !== undefined;
  const hasMax = max !== null && max !== undefined;

  if (!hasMin && !hasMax) return 'Not specified';
  if (!hasMin) return `Up to ${toLPA(max!)} LPA`;
  if (!hasMax) return `${toLPA(min)} LPA+`;
  if (min === max) return `${toLPA(min)} LPA`;
  return `${toLPA(min)} LPA - ${toLPA(max!)} LPA`;
}

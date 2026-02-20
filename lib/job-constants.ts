/**
 * Job-related constants and pure helpers (no server action).
 * Used by server actions and pages for salary presets etc.
 */

const LPA = 100_000;

/** Salary ranges in rupees (LPA: 1 LPA = 100_000) */
export const SALARY_PRESETS = {
  '0-3': { min: 0, max: 3 * LPA },
  '3-6': { min: 3 * LPA, max: 6 * LPA },
  '6-10': { min: 6 * LPA, max: 10 * LPA },
  '10+': { min: 10 * LPA, max: null as number | null },
} as const;

/** Get salary range in rupees for a preset key (e.g. "3-6" for 3-6 LPA) */
export function getSalaryRangeForPreset(
  preset: keyof typeof SALARY_PRESETS
): { min: number; max: number | null } {
  const p = SALARY_PRESETS[preset];
  return { min: p.min, max: p.max };
}

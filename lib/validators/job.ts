import { z } from 'zod';

export const QUALIFICATION_OPTIONS = [
  '12th Pass',
  'Diploma',
  'Graduate',
  'Post Graduate',
] as const;

export type Qualification = (typeof QUALIFICATION_OPTIONS)[number];

/**
 * Zod schema for job creation / editing validation.
 */
export const CreateJobSchema = z
  .object({
    title: z
      .string()
      .min(2, 'Job title must be at least 2 characters long'),

    description: z
      .string()
      .min(10, 'Job description must be at least 10 characters long'),

    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'REMOTE'], {
      errorMap: () => ({ message: 'Please select a valid job type' }),
    }),

    workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE'], {
      errorMap: () => ({ message: 'Please select a valid work mode' }),
    }),

    location: z
      .string()
      .min(2, 'Location must be at least 2 characters long'),

    industryType: z
      .string()
      .max(200)
      .optional()
      .nullable(),

    department: z
      .string()
      .max(200)
      .optional()
      .nullable(),

    // ── New fields ──────────────────────────────────────

    /** Replaces the old single `experience` field */
    minExperience: z
      .number({ invalid_type_error: 'Min experience must be a number' })
      .int('Min experience must be a whole number')
      .min(0, 'Min experience cannot be negative')
      .optional()
      .nullable(),

    maxExperience: z
      .number({ invalid_type_error: 'Max experience must be a number' })
      .int('Max experience must be a whole number')
      .min(0, 'Max experience cannot be negative')
      .optional()
      .nullable(),

    skillsRequired: z
      .array(z.string().min(1))
      .optional()
      .default([]),

    qualification: z
      .enum(QUALIFICATION_OPTIONS, {
        errorMap: () => ({ message: 'Please select a valid qualification' }),
      })
      .optional()
      .nullable(),

    degreeRequired: z
      .string()
      .max(200, 'Degree must be at most 200 characters')
      .optional()
      .nullable(),

    jobRole: z
      .string()
      .max(200, 'Job role must be at most 200 characters')
      .optional()
      .nullable(),

    languagesKnown: z
      .array(z.string().min(1))
      .optional()
      .default([]),

    // ── Salary ──────────────────────────────────────────
    salaryMin: z
      .number()
      .positive('Salary minimum must be a positive number')
      .optional()
      .nullable(),

    salaryMax: z
      .number()
      .positive('Salary maximum must be a positive number')
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    // Salary max >= salary min
    if (data.salaryMin != null && data.salaryMax != null) {
      if (data.salaryMax < data.salaryMin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Salary maximum must be ≥ salary minimum',
          path: ['salaryMax'],
        });
      }
    }

    // Max experience >= min experience
    if (data.minExperience != null && data.maxExperience != null) {
      if (data.maxExperience < data.minExperience) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Max experience must be ≥ min experience',
          path: ['maxExperience'],
        });
      }
    }
  });

export type CreateJobInput = z.infer<typeof CreateJobSchema>;

export const UpdateJobSchema = CreateJobSchema.innerType().extend({
  status: z.enum(['DRAFT', 'OPEN', 'PAUSED', 'CLOSED']).optional().nullable(),
}).superRefine((data, ctx) => {
  // Re-apply refinement
  if (data.salaryMin != null && data.salaryMax != null) {
    if (data.salaryMax < data.salaryMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Salary maximum must be ≥ salary minimum',
        path: ['salaryMax'],
      });
    }
  }
  if (data.minExperience != null && data.maxExperience != null) {
    if (data.maxExperience < data.minExperience) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Max experience must be ≥ min experience',
        path: ['maxExperience'],
      });
    }
  }
});
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>;

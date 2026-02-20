import { z } from 'zod';

/**
 * Zod schema for job creation validation
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
    degree: z
      .string()
      .max(200, 'Degree must be at most 200 characters')
      .optional()
      .nullable(),
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
    experience: z
      .number()
      .int('Experience must be a whole number (years)')
      .min(0, 'Experience cannot be negative')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.salaryMin != null && data.salaryMax != null) {
        return data.salaryMax >= data.salaryMin;
      }
      return true;
    },
    {
      message: 'Salary maximum must be greater than or equal to salary minimum',
      path: ['salaryMax'],
    }
  );

export type CreateJobInput = z.infer<typeof CreateJobSchema>;

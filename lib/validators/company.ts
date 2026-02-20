import { z } from 'zod';

const COMPANY_TYPES = [
  'CORPORATE',
  'FOREIGN_MNC',
  'STARTUP',
  'INDIAN_MNC',
  'GOVT',
  'OTHERS',
] as const;

export const UpdateCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional()
    .nullable(),
  website: z
    .union([z.string().url('Please enter a valid URL'), z.literal('')])
    .optional()
    .nullable(),
  location: z.string().min(1, 'Location is required'),
  logoUrl: z
    .union([z.string().url('Please enter a valid URL'), z.literal('')])
    .optional()
    .nullable(),
  type: z.enum(COMPANY_TYPES, {
    errorMap: () => ({ message: 'Please select a valid company type' }),
  }),
  size: z.string().max(50).optional().nullable().or(z.literal('')),
});

export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;

import { z } from 'zod';

export const JobSeekerSignUpSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
  mobileNumber: z
    .string()
    .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
  workStatus: z.enum(['EXPERIENCED', 'FRESHER']),
});

export type JobSeekerSignUpInput = z.infer<typeof JobSeekerSignUpSchema>;


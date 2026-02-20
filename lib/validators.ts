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

export const RecruiterSignUpSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters long'),
  mobileNumber: z
    .string()
    .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
});

export type RecruiterSignUpInput = z.infer<typeof RecruiterSignUpSchema>;

/** Profile form validation for candidate profile management */
export const ProfileFormSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters long'),
  headline: z.string().optional(),
  bio: z
    .string()
    .max(500, 'Bio must be at most 500 characters')
    .optional(),
  skills: z.string(), // comma-separated, split in action
  experience: z.number().min(0, 'Experience cannot be negative'),
  resumeUrl: z.string().optional(),
  location: z.string().optional(),
  mobile: z.string().optional(),
});

export type ProfileFormInput = z.infer<typeof ProfileFormSchema>;



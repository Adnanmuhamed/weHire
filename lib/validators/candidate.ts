import { z } from 'zod';

export const AddEducationSchema = z.object({
  degree: z.string().min(1, "Degree is required").max(100, "Degree shouldn't exceed 100 characters"),
  college: z.string().min(1, "College/University is required").max(150, "College shouldn't exceed 150 characters"),
  stream: z.string().max(100).optional().nullable(),
  startYear: z.number().int().min(1950).max(new Date().getFullYear() + 10).optional().nullable(),
  endYear: z.number().int().min(1950).max(new Date().getFullYear() + 10).optional().nullable(),
  isFullTime: z.boolean().optional().nullable(),
}).refine(data => {
  if (data.startYear && data.endYear) {
    return data.startYear <= data.endYear;
  }
  return true;
}, {
  message: "Start year must be before or equal to end year",
  path: ["endYear"],
});

export const AddEmploymentSchema = z.object({
  designation: z.string().min(1, "Designation is required").max(100),
  company: z.string().min(1, "Company is required").max(100),
  location: z.string().max(100).optional().nullable(),
  startYear: z.number().int().min(1950).max(new Date().getFullYear() + 5).optional().nullable(),
  endYear: z.number().int().min(1950).max(new Date().getFullYear() + 5).optional().nullable(),
  isCurrent: z.boolean().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
}).refine(data => {
  if (data.startYear && data.endYear && !data.isCurrent) {
    return data.startYear <= data.endYear;
  }
  return true;
}, {
  message: "Start year must be before or equal to end year",
  path: ["endYear"],
});

export const UpdateHeaderDetailsSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100).optional().nullable(),
  mobile: z.string().max(20).optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  currentLocation: z.string().max(100).optional().nullable(),
  availability: z.string().max(50).optional().nullable(),
  linkedinUrl: z.string().url("Invalid URL").max(200).optional().nullable().or(z.literal("")),
  githubUrl: z.string().url("Invalid URL").max(200).optional().nullable().or(z.literal("")),
  portfolioUrl: z.string().url("Invalid URL").max(200).optional().nullable().or(z.literal("")),
});

export const AddProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  description: z.string().max(3000).optional().nullable(),
  role: z.string().max(100).optional().nullable(),
  projectLink: z.string().url("Invalid URL").max(300).optional().nullable().or(z.literal("")),
  startDate: z.string().optional().nullable(), // ISO date
  endDate: z.string().optional().nullable(),
});

export const AddCertificateSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  issuer: z.string().max(100).optional().nullable(),
  issueDate: z.string().optional().nullable(), // ISO date
  url: z.string().url("Invalid URL").max(300).optional().nullable().or(z.literal("")),
});

export const UpdatePersonalDetailsSchema = z.object({
  dob: z.string().optional().nullable(), // ISO date
  gender: z.string().max(30).optional().nullable(),
  maritalStatus: z.string().max(30).optional().nullable(),
  availability: z.string().max(50).optional().nullable(),
  resumeHeadline: z.string().max(200).optional().nullable(),
  profileSummary: z.string().max(3000).optional().nullable(),
  currentLocation: z.string().max(100).optional().nullable(),
  languages: z.array(z.string().max(50)).optional(),
  careerBreak: z.boolean().optional().nullable(),
  differentlyAbled: z.boolean().optional().nullable(),
});

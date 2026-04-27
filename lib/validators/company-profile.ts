import { z } from 'zod';

export const UpdateCompanyProfileSchema = z.object({
  industryType: z.string().max(100, "Industry type shouldn't exceed 100 characters").optional().nullable(),
  websiteUrl: z.string().url("Invalid URL").max(200).optional().nullable().or(z.literal("")),
  designation: z.string().max(100).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().max(20).optional().nullable(),
  gstin: z.string().max(50).optional().nullable(),
  about: z.string().max(3000).optional().nullable(),
  foundedYear: z.string().max(4).optional().nullable(),
  companyType: z.string().max(50).optional().nullable(),
  companySize: z.string().max(50).optional().nullable(),
  headquarters: z.string().max(100).optional().nullable(),
  logoUrl: z.string().url("Invalid URL").max(1000).optional().nullable().or(z.literal("")),
});

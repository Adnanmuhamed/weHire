import { INDUSTRY_LIST } from './industries';
import { MIDDLE_EAST_LOCATIONS } from './locations';

export const COMPANY_TYPE_OPTIONS = [
  'Startup',
  'Private Company',
  'Public Company',
  'MNC',
  'Government',
  'Non-profit',
  'Others',
] as const;

export const COMPANY_SIZE_OPTIONS = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000-5000',
  '5000+',
] as const;

export const INDUSTRY_OPTIONS = [...INDUSTRY_LIST] as const;

export const LOCATION_OPTIONS = [...MIDDLE_EAST_LOCATIONS, 'Others'] as const;

export type CompanyTypeOption = (typeof COMPANY_TYPE_OPTIONS)[number];
export type CompanySizeOption = (typeof COMPANY_SIZE_OPTIONS)[number];
export type IndustryOption = (typeof INDUSTRY_OPTIONS)[number];
export type LocationOption = (typeof LOCATION_OPTIONS)[number];

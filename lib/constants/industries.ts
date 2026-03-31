/**
 * Industry → Department taxonomy
 * Used in: job post form, preferences form, job search filters.
 */

export const INDUSTRIES: Record<string, string[]> = {
  'IT & Software': [
    'Software Development',
    'Data Engineering',
    'DevOps & Cloud',
    'Quality Assurance',
    'IT Support',
    'Cybersecurity',
    'AI & Machine Learning',
    'Product Management',
  ],
  'Banking & Finance': [
    'Investment Banking',
    'Retail Banking',
    'Insurance',
    'Accounting & Auditing',
    'Financial Advisory',
    'Risk Management',
  ],
  'Oil, Gas & Energy': [
    'Petroleum Engineering',
    'Renewable Energy',
    'Power & Utilities',
    'Mining',
    'HSE (Health, Safety & Environment)',
  ],
  'Construction & Real Estate': [
    'Civil Engineering',
    'Architecture',
    'Project Management',
    'Property Management',
    'Interior Design',
  ],
  'Healthcare & Pharma': [
    'Medical',
    'Nursing',
    'Pharmaceutical',
    'Clinical Research',
    'Hospital Administration',
    'Biomedical Engineering',
  ],
  'Retail & E-Commerce': [
    'Store Operations',
    'Merchandising',
    'Supply Chain',
    'E-Commerce Operations',
    'Customer Experience',
  ],
  'Hospitality & Tourism': [
    'Hotel Management',
    'Food & Beverage',
    'Travel & Tourism',
    'Event Management',
  ],
  'Education & Training': [
    'Teaching & Academics',
    'Curriculum Development',
    'EdTech',
    'Corporate Training',
  ],
  'Manufacturing': [
    'Production',
    'Quality Control',
    'Plant Management',
    'Industrial Engineering',
    'Procurement',
  ],
  'Logistics & Supply Chain': [
    'Warehousing',
    'Freight & Shipping',
    'Fleet Management',
    'Import & Export',
  ],
  'Media & Entertainment': [
    'Content & Editorial',
    'Film & TV',
    'Digital Media',
    'Public Relations',
    'Advertising',
  ],
  'Telecom': [
    'Network Engineering',
    'RF Engineering',
    'Telecom Operations',
    'Telecom Sales',
  ],
  'Consulting': [
    'Management Consulting',
    'IT Consulting',
    'Strategy Consulting',
    'HR Consulting',
  ],
  'Legal': [
    'Corporate Law',
    'Compliance & Regulatory',
    'Litigation',
    'Intellectual Property',
  ],
  'Government & Public Sector': [
    'Administration',
    'Public Policy',
    'Defence & Security',
  ],
  'Others': [
    'General Management',
    'Operations',
    'Administration',
    'Other',
  ],
} as const;

/** Flat list of industry names for dropdowns */
export const INDUSTRY_LIST = Object.keys(INDUSTRIES);

/** Get departments for a given industry; returns empty array if not found */
export function getDepartments(industry: string): string[] {
  return INDUSTRIES[industry] ?? [];
}

/** Flat list of all departments (de-duplicated) */
export const ALL_DEPARTMENTS: string[] = [
  ...new Set(Object.values(INDUSTRIES).flat()),
];

/**
 * Static constants for job posting form fields.
 * Centralised here so they can be imported by forms, filters, and validators.
 */

// ── Qualification ────────────────────────────────────────────────────────────
export const QUALIFICATION_OPTIONS = [
  '12th Pass',
  'Diploma',
  'Graduate',
  'Post Graduate',
] as const;

// ── Common skills for tag-input suggestions ──────────────────────────────────
export const COMMON_SKILLS: string[] = [
  // Tech
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'Java',
  'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
  'Git', 'Linux', 'REST API', 'GraphQL', 'Microservices',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
  // Business / Generic
  'Microsoft Excel', 'Power BI', 'Tableau', 'Salesforce', 'SAP',
  'Project Management', 'Agile', 'Scrum', 'Lean', 'Six Sigma',
  'Communication', 'Leadership', 'Team Management', 'Negotiation',
  'Digital Marketing', 'SEO', 'Content Writing', 'Social Media',
  'AutoCAD', 'Revit', 'SolidWorks', 'MATLAB',
  'Accounting', 'Tally', 'Financial Analysis', 'Budgeting',
  // Healthcare
  'Patient Care', 'Clinical Research', 'Pharmacy', 'Nursing',
];

// ── Languages ────────────────────────────────────────────────────────────────
export const LANGUAGE_OPTIONS: string[] = [
  'English', 'Hindi', 'Arabic', 'French', 'German', 'Mandarin',
  'Spanish', 'Portuguese', 'Russian', 'Japanese', 'Korean',
  'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi',
  'Bengali', 'Gujarati', 'Punjabi', 'Urdu', 'Odia',
];

// ── Job Roles by Industry ────────────────────────────────────────────────────
// Keys match INDUSTRY_LIST from lib/constants/industries.ts
export const JOB_ROLES_BY_INDUSTRY: Record<string, string[]> = {
  'IT & Software': [
    'Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Mobile Developer', 'Data Engineer',
    'Data Scientist', 'ML Engineer', 'DevOps Engineer', 'Cloud Architect',
    'SRE / Platform Engineer', 'QA Engineer', 'Automation Engineer',
    'Security Engineer', 'Product Manager', 'Scrum Master',
    'IT Support Engineer', 'Database Administrator', 'Others',
  ],
  'Banking & Finance': [
    'Investment Banker', 'Financial Analyst', 'Risk Analyst',
    'Credit Analyst', 'Compliance Officer', 'Auditor',
    'Retail Banker', 'Insurance Advisor', 'Actuary',
    'Portfolio Manager', 'Treasury Analyst', 'Others',
  ],
  'Oil, Gas & Energy': [
    'Petroleum Engineer', 'Reservoir Engineer', 'Production Engineer',
    'HSE Officer', 'Drilling Engineer', 'Process Engineer',
    'Renewable Energy Engineer', 'Electrical Engineer', 'Others',
  ],
  'Construction & Real Estate': [
    'Civil Engineer', 'Site Supervisor', 'Project Manager',
    'Quantity Surveyor', 'Architect', 'Interior Designer',
    'Property Consultant', 'MEP Engineer', 'Others',
  ],
  'Healthcare & Pharma': [
    'Doctor / Physician', 'Nurse', 'Pharmacist', 'Lab Technician',
    'Clinical Research Associate', 'Medical Representative',
    'Hospital Administrator', 'Biomedical Engineer', 'Others',
  ],
  'Retail & E-Commerce': [
    'Store Manager', 'Sales Executive', 'Merchandiser',
    'Supply Chain Analyst', 'Category Manager', 'E-Commerce Executive',
    'Customer Support Executive', 'Visual Merchandiser', 'Others',
  ],
  'Hospitality & Tourism': [
    'Hotel Manager', 'Front Desk Executive', 'Chef / Cook',
    'F&B Manager', 'Travel Consultant', 'Event Coordinator', 'Others',
  ],
  'Education & Training': [
    'Teacher / Lecturer', 'Curriculum Developer', 'Academic Coordinator',
    'EdTech Developer', 'Corporate Trainer', 'Counsellor', 'Others',
  ],
  'Manufacturing': [
    'Production Engineer', 'Plant Manager', 'Quality Inspector',
    'Industrial Engineer', 'Maintenance Engineer', 'Procurement Officer', 'Others',
  ],
  'Logistics & Supply Chain': [
    'Logistics Coordinator', 'Warehouse Manager', 'Fleet Manager',
    'Import/Export Executive', 'Supply Chain Analyst', 'Others',
  ],
  'Media & Entertainment': [
    'Content Writer', 'Video Editor', 'Journalist', 'PR Manager',
    'Social Media Manager', 'Graphic Designer', 'Copywriter', 'Others',
  ],
  'Telecom': [
    'Network Engineer', 'RF Engineer', 'Telecom Sales Executive',
    'NOC Engineer', 'Field Technician', 'Others',
  ],
  'Consulting': [
    'Management Consultant', 'IT Consultant', 'Strategy Analyst',
    'HR Consultant', 'Business Analyst', 'Others',
  ],
  'Legal': [
    'Corporate Lawyer', 'Compliance Manager', 'Legal Counsel',
    'Paralegal', 'IP Attorney', 'Others',
  ],
  'Government & Public Sector': [
    'Administrative Officer', 'Policy Analyst', 'Defence Personnel',
    'Public Relations Officer', 'Others',
  ],
  Others: ['General Manager', 'Operations Manager', 'Admin Executive', 'Others'],
};

/** Get roles for a given industry; always ends with "Others" */
export function getJobRoles(industry: string): string[] {
  const roles = JOB_ROLES_BY_INDUSTRY[industry];
  if (!roles) return ['Others'];
  // Ensure "Others" is always last
  const filtered = roles.filter((r) => r !== 'Others');
  return [...filtered, 'Others'];
}

/**
 * Curated Middle East city list for location autocomplete.
 * Used across: job post form, preferences form, companies filter.
 */

export const MIDDLE_EAST_LOCATIONS = [
  // UAE
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
  // Saudi Arabia
  'Riyadh',
  'Jeddah',
  'Mecca',
  'Medina',
  'Dammam',
  'Khobar',
  'Dhahran',
  'Tabuk',
  'Taif',
  'Abha',
  'Jubail',
  'Yanbu',
  // Qatar
  'Doha',
  'Al Wakrah',
  'Al Rayyan',
  'Lusail',
  // Kuwait
  'Kuwait City',
  'Ahmadi',
  'Hawalli',
  'Salmiya',
  // Bahrain
  'Manama',
  'Muharraq',
  'Riffa',
  // Oman
  'Muscat',
  'Salalah',
  'Sohar',
  'Nizwa',
  // Jordan
  'Amman',
  'Zarqa',
  'Irbid',
  'Aqaba',
  // Lebanon
  'Beirut',
  'Tripoli',
  'Sidon',
  // Egypt
  'Cairo',
  'Alexandria',
  'Giza',
  'New Cairo',
  // Iraq
  'Baghdad',
  'Erbil',
  'Basra',
  // Yemen
  'Sana\'a',
  'Aden',
  // Remote
  'Remote',
] as const;

export type MiddleEastLocation = (typeof MIDDLE_EAST_LOCATIONS)[number];

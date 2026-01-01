import bcrypt from 'bcrypt';

/**
 * Password Hashing & Verification Utilities
 * 
 * Uses bcrypt with a cost factor of 12 (recommended for production).
 * Higher cost = more secure but slower. Cost 12 is a good balance.
 */

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hash
 * @param password - Plain text password
 * @param hash - Hashed password from database
 * @returns true if passwords match, false otherwise
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}



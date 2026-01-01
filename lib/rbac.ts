import { Role } from '@prisma/client';

/**
 * Role-Based Access Control (RBAC) Guards
 * 
 * Centralized RBAC logic for enforcing role-based permissions.
 * These guards throw errors that should be caught and handled appropriately.
 * 
 * Role Hierarchy:
 * - USER: Basic user (job seeker)
 * - EMPLOYER: Can post jobs (includes USER permissions)
 * - ADMIN: Platform admin (includes all permissions)
 */

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
}

/**
 * Custom error for authentication failures
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Custom error for authorization failures
 */
export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Require that a user is authenticated
 * @param user - User object or null
 * @returns Authenticated user
 * @throws AuthenticationError if user is not authenticated
 */
export function requireAuth(user: AuthenticatedUser | null): AuthenticatedUser {
  if (!user) {
    throw new AuthenticationError('You must be logged in to access this resource');
  }
  return user;
}

/**
 * Require USER role or higher (USER, EMPLOYER, ADMIN)
 * This is the most permissive check - any authenticated user can access
 * @param user - Authenticated user
 * @returns Authenticated user
 * @throws AuthorizationError if user doesn't have required role
 */
export function requireUser(user: AuthenticatedUser | null): AuthenticatedUser {
  const authenticatedUser = requireAuth(user);
  
  // All roles (USER, EMPLOYER, ADMIN) have user-level access
  if (
    authenticatedUser.role === Role.USER ||
    authenticatedUser.role === Role.EMPLOYER ||
    authenticatedUser.role === Role.ADMIN
  ) {
    return authenticatedUser;
  }

  throw new AuthorizationError('User role required');
}

/**
 * Require EMPLOYER role or higher (EMPLOYER, ADMIN)
 * @param user - Authenticated user
 * @returns Authenticated user
 * @throws AuthorizationError if user doesn't have required role
 */
export function requireEmployer(user: AuthenticatedUser | null): AuthenticatedUser {
  const authenticatedUser = requireAuth(user);

  if (
    authenticatedUser.role === Role.EMPLOYER ||
    authenticatedUser.role === Role.ADMIN
  ) {
    return authenticatedUser;
  }

  throw new AuthorizationError('Employer role required to perform this action');
}

/**
 * Require ADMIN role only
 * @param user - Authenticated user
 * @returns Authenticated user
 * @throws AuthorizationError if user doesn't have required role
 */
export function requireAdmin(user: AuthenticatedUser | null): AuthenticatedUser {
  const authenticatedUser = requireAuth(user);

  if (authenticatedUser.role === Role.ADMIN) {
    return authenticatedUser;
  }

  throw new AuthorizationError('Admin role required to perform this action');
}

/**
 * Check if user has a specific role or higher
 * Returns boolean instead of throwing (useful for conditional logic)
 * @param user - Authenticated user or null
 * @param role - Minimum required role
 * @returns true if user has required role or higher
 */
export function hasRole(
  user: AuthenticatedUser | null,
  role: Role
): boolean {
  if (!user) return false;

  const roleHierarchy: Record<Role, number> = {
    [Role.USER]: 1,
    [Role.EMPLOYER]: 2,
    [Role.ADMIN]: 3,
  };

  return roleHierarchy[user.role] >= roleHierarchy[role];
}

/**
 * Check if user has exactly a specific role
 * @param user - Authenticated user or null
 * @param role - Required role
 * @returns true if user has exactly the required role
 */
export function hasExactRole(
  user: AuthenticatedUser | null,
  role: Role
): boolean {
  return user?.role === role;
}


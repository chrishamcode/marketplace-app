import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Role definitions
export const ROLES = {
  USER: 'user',
  SELLER: 'seller',
  ADMIN: 'admin'
};

/**
 * Get the current authenticated user session
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<Object|null>} The session object or null if not authenticated
 */
export const getSession = async (req, res) => {
  return await getServerSession(req, res, authOptions);
};

/**
 * Check if the user is authenticated
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
export const isAuthenticated = async (req, res) => {
  const session = await getSession(req, res);
  return !!session;
};

/**
 * Check if the user has the required role
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {string|string[]} roles - Required role(s)
 * @returns {Promise<boolean>} True if user has the required role, false otherwise
 */
export const hasRole = async (req, res, roles) => {
  const session = await getSession(req, res);
  
  if (!session || !session.user) {
    return false;
  }
  
  // Convert single role to array for consistent handling
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  
  // Check if user has any of the required roles
  return requiredRoles.some(role => session.user.roles?.includes(role));
};

/**
 * Check if the user is the owner of a resource
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {string} userId - The user ID to check against
 * @returns {Promise<boolean>} True if user is the owner, false otherwise
 */
export const isOwner = async (req, res, userId) => {
  const session = await getSession(req, res);
  
  if (!session || !session.user) {
    return false;
  }
  
  return session.user.id === userId;
};

/**
 * Check if the user is an admin
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<boolean>} True if user is an admin, false otherwise
 */
export const isAdmin = async (req, res) => {
  return hasRole(req, res, ROLES.ADMIN);
};

/**
 * Check if the user is a seller
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<boolean>} True if user is a seller, false otherwise
 */
export const isSeller = async (req, res) => {
  return hasRole(req, res, ROLES.SELLER);
};

/**
 * Middleware to protect routes that require authentication
 * @param {Function} handler - The route handler
 * @returns {Function} The protected route handler
 */
export const withAuth = (handler) => {
  return async (req, res) => {
    if (!(await isAuthenticated(req, res))) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return handler(req, res);
  };
};

/**
 * Middleware to protect routes that require specific roles
 * @param {Function} handler - The route handler
 * @param {string|string[]} roles - Required role(s)
 * @returns {Function} The protected route handler
 */
export const withRoles = (handler, roles) => {
  return async (req, res) => {
    if (!(await isAuthenticated(req, res))) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (!(await hasRole(req, res, roles))) {
      return Response.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    return handler(req, res);
  };
};

/**
 * Middleware to protect routes that require resource ownership
 * @param {Function} handler - The route handler
 * @param {Function} getUserId - Function to extract the user ID from the request
 * @returns {Function} The protected route handler
 */
export const withOwnership = (handler, getUserId) => {
  return async (req, res) => {
    if (!(await isAuthenticated(req, res))) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = await getUserId(req);
    const session = await getSession(req, res);
    
    // Allow admins to bypass ownership check
    if (session.user.roles?.includes(ROLES.ADMIN)) {
      return handler(req, res);
    }
    
    if (!(await isOwner(req, res, userId))) {
      return Response.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    return handler(req, res);
  };
};

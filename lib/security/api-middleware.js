import { NextResponse } from 'next/server';
import { withAuth, withRoles, withOwnership, ROLES } from '@/lib/security/authorization';

/**
 * Middleware to apply role-based access control to API routes
 * @param {Function} handler - The route handler
 * @param {Object} options - Configuration options
 * @returns {Function} The protected route handler
 */
export function withApiAuth(handler, options = {}) {
  const { 
    roles = null,
    ownership = null,
    methods = null 
  } = options;
  
  return async (req, { params }) => {
    // Check if the HTTP method is allowed
    if (methods && !methods.includes(req.method)) {
      return NextResponse.json(
        { error: `Method ${req.method} not allowed` },
        { status: 405 }
      );
    }
    
    // Create a context object to pass to the handler
    const context = { params };
    
    // Apply ownership check if specified
    if (ownership) {
      const getUserId = typeof ownership === 'function' 
        ? ownership 
        : (req) => {
            // Default implementation for common patterns
            if (params?.id && ownership === 'params.id') {
              return params.id;
            }
            
            if (ownership === 'body.userId') {
              return req.json().then(body => body.userId);
            }
            
            return null;
          };
      
      return withOwnership(
        () => handler(req, context),
        getUserId
      )(req);
    }
    
    // Apply role check if specified
    if (roles) {
      return withRoles(
        () => handler(req, context),
        roles
      )(req);
    }
    
    // Apply basic auth check
    return withAuth(
      () => handler(req, context)
    )(req);
  };
}

/**
 * Middleware to protect admin-only routes
 * @param {Function} handler - The route handler
 * @param {Object} options - Additional options
 * @returns {Function} The protected route handler
 */
export function withAdminAuth(handler, options = {}) {
  return withApiAuth(handler, {
    ...options,
    roles: ROLES.ADMIN
  });
}

/**
 * Middleware to protect seller routes
 * @param {Function} handler - The route handler
 * @param {Object} options - Additional options
 * @returns {Function} The protected route handler
 */
export function withSellerAuth(handler, options = {}) {
  return withApiAuth(handler, {
    ...options,
    roles: [ROLES.SELLER, ROLES.ADMIN]
  });
}

/**
 * Middleware to protect routes requiring resource ownership
 * @param {Function} handler - The route handler
 * @param {string|Function} ownershipCheck - How to determine resource ownership
 * @returns {Function} The protected route handler
 */
export function withOwnerAuth(handler, ownershipCheck) {
  return withApiAuth(handler, {
    ownership: ownershipCheck
  });
}

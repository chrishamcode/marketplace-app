import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { NextResponse } from 'next/server';

/**
 * Configures security headers using Helmet
 * @returns {Function} Middleware function to set security headers
 */
export const securityHeaders = () => {
  return (req, res, next) => {
    // Set security headers
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.stripe.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
          connectSrc: ["'self'", 'https://api.stripe.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com']
        }
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      xssFilter: true,
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true
      },
      frameguard: {
        action: 'deny'
      },
      dnsPrefetchControl: {
        allow: false
      },
      permittedCrossDomainPolicies: {
        permittedPolicies: 'none'
      },
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
      }
    })(req, res, next);
  };
};

/**
 * Configures rate limiting to prevent abuse
 * @param {Object} options - Rate limiting options
 * @returns {Function} Middleware function to apply rate limiting
 */
export const rateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again later'
  };

  const limiterOptions = { ...defaultOptions, ...options };
  const limiter = rateLimit(limiterOptions);

  return (req, res, next) => {
    return limiter(req, res, next);
  };
};

/**
 * Configures MongoDB query sanitization to prevent NoSQL injection
 * @returns {Function} Middleware function to sanitize MongoDB queries
 */
export const sanitizeMongo = () => {
  return (req, res, next) => {
    return mongoSanitize()(req, res, next);
  };
};

/**
 * Configures HTTP Parameter Pollution protection
 * @returns {Function} Middleware function to prevent parameter pollution
 */
export const preventParameterPollution = () => {
  return (req, res, next) => {
    return hpp()(req, res, next);
  };
};

/**
 * Configures CSRF protection
 * @returns {Function} Middleware function to prevent CSRF attacks
 */
export const csrfProtection = () => {
  return (req, res, next) => {
    // Check if the request is a mutation (not GET, HEAD, OPTIONS)
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      // Get the CSRF token from the request header
      const csrfToken = req.headers['x-csrf-token'];
      
      // Get the CSRF token from the cookie
      const cookies = req.headers.cookie || '';
      const csrfCookie = cookies
        .split(';')
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith('csrf='));
      
      const cookieToken = csrfCookie ? csrfCookie.split('=')[1] : null;
      
      // Validate the CSRF token
      if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        );
      }
    }
    
    return next();
  };
};

/**
 * Configures secure error handling
 * @returns {Function} Middleware function for secure error handling
 */
export const secureErrorHandler = () => {
  return (err, req, res, next) => {
    // Log the error internally
    console.error(err);
    
    // Send a generic error message to the client
    return NextResponse.json(
      { 
        error: 'An error occurred',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Please try again later'
      },
      { status: err.statusCode || 500 }
    );
  };
};

/**
 * Applies all security middleware
 * @returns {Function} Combined middleware function with all security measures
 */
export const applySecurityMiddleware = () => {
  return (req, res, next) => {
    // Apply security headers
    securityHeaders()(req, res, (err) => {
      if (err) return next(err);
      
      // Apply rate limiting
      rateLimiter()(req, res, (err) => {
        if (err) return next(err);
        
        // Apply MongoDB sanitization
        sanitizeMongo()(req, res, (err) => {
          if (err) return next(err);
          
          // Apply parameter pollution protection
          preventParameterPollution()(req, res, (err) => {
            if (err) return next(err);
            
            // Apply CSRF protection
            csrfProtection()(req, res, (err) => {
              if (err) return next(err);
              
              // Continue to the next middleware or handler
              return next();
            });
          });
        });
      });
    });
  };
};

/**
 * Generates a CSRF token
 * @returns {string} A random CSRF token
 */
export const generateCsrfToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Sets a CSRF token cookie and returns the token
 * @param {Object} res - The response object
 * @returns {string} The generated CSRF token
 */
export const setCsrfToken = (res) => {
  const token = generateCsrfToken();
  
  // Set the CSRF token as a cookie
  res.setHeader('Set-Cookie', [
    `csrf=${token}; Path=/; HttpOnly; SameSite=Strict; ${
      process.env.NODE_ENV === 'production' ? 'Secure;' : ''
    } Max-Age=3600`
  ]);
  
  return token;
};

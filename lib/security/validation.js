import validator from 'validator';

/**
 * Validates user input data
 * @param {Object} data - The data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result with errors and isValid flag
 */
export const validateInput = (data, rules) => {
  const errors = {};
  
  // Process each field according to its rules
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    
    // Check required fields
    if (fieldRules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      return;
    }
    
    // Skip validation for undefined optional fields
    if (value === undefined || value === null) {
      return;
    }
    
    // Type validation
    if (fieldRules.type) {
      const type = fieldRules.type.toLowerCase();
      
      switch (type) {
        case 'string':
          if (typeof value !== 'string') {
            errors[field] = `${field} must be a string`;
          }
          break;
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors[field] = `${field} must be a number`;
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors[field] = `${field} must be a boolean`;
          }
          break;
        case 'array':
          if (!Array.isArray(value)) {
            errors[field] = `${field} must be an array`;
          }
          break;
        case 'object':
          if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            errors[field] = `${field} must be an object`;
          }
          break;
        case 'date':
          if (!(value instanceof Date) && isNaN(Date.parse(value))) {
            errors[field] = `${field} must be a valid date`;
          }
          break;
      }
    }
    
    // Skip further validation if there's already an error for this field
    if (errors[field]) {
      return;
    }
    
    // String-specific validations
    if (typeof value === 'string') {
      // Min length
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `${field} must be at least ${fieldRules.minLength} characters`;
        return;
      }
      
      // Max length
      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = `${field} must be at most ${fieldRules.maxLength} characters`;
        return;
      }
      
      // Email format
      if (fieldRules.isEmail && !validator.isEmail(value)) {
        errors[field] = `${field} must be a valid email address`;
        return;
      }
      
      // URL format
      if (fieldRules.isURL && !validator.isURL(value, fieldRules.urlOptions)) {
        errors[field] = `${field} must be a valid URL`;
        return;
      }
      
      // Alphanumeric
      if (fieldRules.isAlphanumeric && !validator.isAlphanumeric(value)) {
        errors[field] = `${field} must contain only letters and numbers`;
        return;
      }
      
      // Matches pattern
      if (fieldRules.pattern && !new RegExp(fieldRules.pattern).test(value)) {
        errors[field] = fieldRules.patternMessage || `${field} format is invalid`;
        return;
      }
      
      // Enum values
      if (fieldRules.enum && !fieldRules.enum.includes(value)) {
        errors[field] = `${field} must be one of: ${fieldRules.enum.join(', ')}`;
        return;
      }
    }
    
    // Number-specific validations
    if (typeof value === 'number') {
      // Min value
      if (fieldRules.min !== undefined && value < fieldRules.min) {
        errors[field] = `${field} must be at least ${fieldRules.min}`;
        return;
      }
      
      // Max value
      if (fieldRules.max !== undefined && value > fieldRules.max) {
        errors[field] = `${field} must be at most ${fieldRules.max}`;
        return;
      }
      
      // Integer
      if (fieldRules.isInt && !Number.isInteger(value)) {
        errors[field] = `${field} must be an integer`;
        return;
      }
      
      // Positive
      if (fieldRules.isPositive && value <= 0) {
        errors[field] = `${field} must be positive`;
        return;
      }
    }
    
    // Array-specific validations
    if (Array.isArray(value)) {
      // Min items
      if (fieldRules.minItems !== undefined && value.length < fieldRules.minItems) {
        errors[field] = `${field} must have at least ${fieldRules.minItems} items`;
        return;
      }
      
      // Max items
      if (fieldRules.maxItems !== undefined && value.length > fieldRules.maxItems) {
        errors[field] = `${field} must have at most ${fieldRules.maxItems} items`;
        return;
      }
      
      // Item validation
      if (fieldRules.items && value.length > 0) {
        const itemErrors = [];
        
        value.forEach((item, index) => {
          const itemValidation = validateInput({ item }, { item: fieldRules.items });
          
          if (!itemValidation.isValid) {
            itemErrors.push({
              index,
              errors: itemValidation.errors.item
            });
          }
        });
        
        if (itemErrors.length > 0) {
          errors[field] = itemErrors;
          return;
        }
      }
    }
    
    // Custom validation
    if (fieldRules.custom && typeof fieldRules.custom === 'function') {
      const customError = fieldRules.custom(value, data);
      
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

/**
 * Sanitizes user input data to prevent XSS and other injection attacks
 * @param {Object} data - The data to sanitize
 * @returns {Object} Sanitized data
 */
export const sanitizeInput = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const sanitized = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (typeof value === 'string') {
      // Sanitize strings to prevent XSS
      sanitized[key] = validator.escape(value);
    } else if (Array.isArray(value)) {
      // Recursively sanitize arrays
      sanitized[key] = value.map(item => {
        if (typeof item === 'string') {
          return validator.escape(item);
        } else if (typeof item === 'object' && item !== null) {
          return sanitizeInput(item);
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeInput(value);
    } else {
      // Pass through other types unchanged
      sanitized[key] = value;
    }
  });
  
  return sanitized;
};

/**
 * Middleware to validate request data
 * @param {Object} schema - Validation schema
 * @param {string} source - Source of data to validate (body, query, params)
 * @returns {Function} Validation middleware
 */
export const validateRequest = (schema, source = 'body') => {
  return async (req, res, next) => {
    let data;
    
    // Get data from the specified source
    switch (source) {
      case 'body':
        data = await req.json();
        break;
      case 'query':
        const url = new URL(req.url);
        data = Object.fromEntries(url.searchParams);
        break;
      case 'params':
        data = req.params;
        break;
      default:
        data = await req.json();
    }
    
    // Validate the data
    const validation = validateInput(data, schema);
    
    if (!validation.isValid) {
      return Response.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }
    
    // Sanitize the validated data
    const sanitized = sanitizeInput(data);
    
    // Attach sanitized data to request
    req[source] = sanitized;
    
    // Continue to the next middleware or handler
    return next();
  };
};

/**
 * Common validation schemas for reuse
 */
export const validationSchemas = {
  // User registration schema
  userRegistration: {
    name: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    email: {
      type: 'string',
      required: true,
      isEmail: true
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      patternMessage: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  
  // Login schema
  login: {
    email: {
      type: 'string',
      required: true,
      isEmail: true
    },
    password: {
      type: 'string',
      required: true
    }
  },
  
  // Listing creation schema
  listingCreation: {
    title: {
      type: 'string',
      required: true,
      minLength: 5,
      maxLength: 100
    },
    description: {
      type: 'string',
      required: true,
      minLength: 20,
      maxLength: 2000
    },
    price: {
      type: 'number',
      required: true,
      min: 0
    },
    category: {
      type: 'string',
      required: true
    },
    condition: {
      type: 'string',
      required: true,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
    },
    location: {
      type: 'string',
      required: true
    },
    images: {
      type: 'array',
      required: true,
      minItems: 1,
      maxItems: 10
    }
  },
  
  // Message creation schema
  messageCreation: {
    content: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 1000
    },
    recipientId: {
      type: 'string',
      required: true
    },
    listingId: {
      type: 'string',
      required: false
    }
  },
  
  // Offer creation schema
  offerCreation: {
    listingId: {
      type: 'string',
      required: true
    },
    amount: {
      type: 'number',
      required: true,
      min: 0
    },
    message: {
      type: 'string',
      required: false,
      maxLength: 500
    }
  }
};

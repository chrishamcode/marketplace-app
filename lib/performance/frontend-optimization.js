import { useEffect } from 'react';
import dynamic from 'next/dynamic';

/**
 * Code splitting utility to dynamically import components
 * @param {Function} importFunc - Import function
 * @param {Object} options - Additional options
 * @returns {React.Component} Dynamically loaded component
 */
export const lazyLoad = (importFunc, options = {}) => {
  return dynamic(importFunc, {
    loading: () => <div>Loading...</div>,
    ssr: false,
    ...options
  });
};

/**
 * Optimizes image loading with lazy loading and proper sizing
 * @param {string} src - Image source URL
 * @param {Object} options - Image options
 * @returns {Object} Optimized image props
 */
export const optimizeImage = (src, options = {}) => {
  const {
    width,
    height,
    quality = 75,
    priority = false,
    loading = 'lazy'
  } = options;
  
  return {
    src,
    width,
    height,
    quality,
    priority,
    loading: priority ? 'eager' : loading
  };
};

/**
 * Debounce function to limit the rate at which a function can fire
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit the rate at which a function can fire
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Memoize function to cache expensive function calls
 * @param {Function} func - Function to memoize
 * @returns {Function} Memoized function
 */
export const memoize = (func) => {
  const cache = new Map();
  
  return function memoized(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  };
};

/**
 * Custom hook for intersection observer to implement lazy loading
 * @param {Object} options - Intersection observer options
 * @returns {Object} Intersection observer ref and entry
 */
export const useIntersectionObserver = (options = {}) => {
  const [ref, setRef] = useState(null);
  const [entry, setEntry] = useState(null);
  
  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);
    
    observer.observe(ref);
    
    return () => {
      observer.disconnect();
    };
  }, [ref, options]);
  
  return { ref: setRef, entry };
};

/**
 * Optimizes rendering of large lists with virtualization
 * @param {Array} items - List items
 * @param {Function} renderItem - Function to render each item
 * @param {Object} options - Additional options
 * @returns {React.Component} Virtualized list component
 */
export const VirtualizedList = ({ items, renderItem, options = {} }) => {
  const {
    itemHeight = 50,
    overscan = 5,
    containerHeight = 400
  } = options;
  
  const [scrollTop, setScrollTop] = useState(0);
  
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: offsetY, width: '100%' }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Optimizes form submissions with form state management
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Submit handler
 * @param {Function} validate - Validation function
 * @returns {Object} Form state and handlers
 */
export const useOptimizedForm = (initialValues = {}, onSubmit, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues
  };
};

/**
 * Optimizes re-renders with memoization
 * @param {Function} Component - Component to optimize
 * @param {Function} propsAreEqual - Function to compare props
 * @returns {React.Component} Memoized component
 */
export const optimizeComponent = (Component, propsAreEqual) => {
  return React.memo(Component, propsAreEqual);
};

/**
 * Prefetches data for faster page loads
 * @param {string} url - URL to prefetch
 * @param {Object} options - Fetch options
 */
export const prefetchData = (url, options = {}) => {
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    
    fetch(url, { ...options, signal })
      .then(response => response.json())
      .then(data => {
        // Store in cache or state management
        console.log('Prefetched data for:', url);
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Prefetch error:', error);
        }
      });
    
    return () => {
      controller.abort();
    };
  }, [url]);
};

/**
 * Optimizes event handlers with passive event listeners
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler
 * @param {Element} element - DOM element
 * @param {Object} options - Event listener options
 */
export const usePassiveEventListener = (eventType, handler, element = window, options = {}) => {
  useEffect(() => {
    const eventListener = event => handler(event);
    const eventOptions = { passive: true, ...options };
    
    element.addEventListener(eventType, eventListener, eventOptions);
    
    return () => {
      element.removeEventListener(eventType, eventListener, eventOptions);
    };
  }, [eventType, element, handler, options]);
};

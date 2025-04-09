import { useState, useEffect } from 'react';

/**
 * Analytics tracking service for user activity
 */
export class AnalyticsService {
  constructor() {
    this.events = [];
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.initialized = false;
  }

  /**
   * Initialize the analytics service
   * @param {string} userId - User ID for tracking
   */
  initialize(userId = null) {
    this.userId = userId;
    this.initialized = true;
    
    // Track page view on initialization
    this.trackPageView();
    
    // Set up event listeners
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });
    
    console.log('Analytics service initialized');
  }

  /**
   * Generate a unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Track a page view
   * @param {string} path - Page path
   */
  trackPageView(path = null) {
    if (!this.initialized) return;
    
    const currentPath = path || window.location.pathname;
    
    this.trackEvent('page_view', {
      path: currentPath,
      title: document.title,
      referrer: document.referrer
    });
  }

  /**
   * Track a user interaction
   * @param {string} action - Action name
   * @param {Object} data - Additional data
   */
  trackInteraction(action, data = {}) {
    if (!this.initialized) return;
    
    this.trackEvent('interaction', {
      action,
      ...data
    });
  }

  /**
   * Track a conversion event
   * @param {string} type - Conversion type
   * @param {Object} data - Additional data
   */
  trackConversion(type, data = {}) {
    if (!this.initialized) return;
    
    this.trackEvent('conversion', {
      type,
      ...data
    });
  }

  /**
   * Track a custom event
   * @param {string} category - Event category
   * @param {Object} data - Event data
   */
  trackEvent(category, data = {}) {
    if (!this.initialized) return;
    
    const event = {
      category,
      data,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    this.events.push(event);
    
    // Flush events if we have accumulated enough
    if (this.events.length >= 10) {
      this.flushEvents();
    }
  }

  /**
   * Send accumulated events to the server
   */
  async flushEvents() {
    if (!this.initialized || this.events.length === 0) return;
    
    const eventsToSend = [...this.events];
    this.events = [];
    
    try {
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events: eventsToSend })
      });
      
      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }
      
      console.log(`Sent ${eventsToSend.length} analytics events`);
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Put events back in the queue
      this.events = [...eventsToSend, ...this.events];
    }
  }
}

// Create a singleton instance
export const analyticsService = new AnalyticsService();

/**
 * Hook to use analytics in components
 * @returns {Object} Analytics methods
 */
export const useAnalytics = () => {
  const [isInitialized, setIsInitialized] = useState(analyticsService.initialized);
  
  useEffect(() => {
    if (!isInitialized) {
      // Get user ID from session or localStorage
      const userId = localStorage.getItem('userId') || null;
      analyticsService.initialize(userId);
      setIsInitialized(true);
    }
    
    // Track page view when route changes
    const trackPageChange = () => {
      analyticsService.trackPageView();
    };
    
    // Listen for route changes
    window.addEventListener('popstate', trackPageChange);
    
    return () => {
      window.removeEventListener('popstate', trackPageChange);
      analyticsService.flushEvents();
    };
  }, [isInitialized]);
  
  return {
    trackPageView: (path) => analyticsService.trackPageView(path),
    trackInteraction: (action, data) => analyticsService.trackInteraction(action, data),
    trackConversion: (type, data) => analyticsService.trackConversion(type, data),
    trackEvent: (category, data) => analyticsService.trackEvent(category, data)
  };
};

/**
 * Higher-order component to add analytics tracking to a component
 * @param {React.Component} Component - Component to wrap
 * @param {Object} options - Tracking options
 * @returns {React.Component} Component with analytics tracking
 */
export const withAnalytics = (Component, options = {}) => {
  const { trackPageView = true, trackProps = [] } = options;
  
  return (props) => {
    const analytics = useAnalytics();
    
    useEffect(() => {
      if (trackPageView) {
        analytics.trackPageView();
      }
      
      // Track specific props if configured
      if (trackProps.length > 0) {
        const trackedData = {};
        trackProps.forEach(propName => {
          if (props[propName] !== undefined) {
            trackedData[propName] = props[propName];
          }
        });
        
        if (Object.keys(trackedData).length > 0) {
          analytics.trackEvent('component_props', trackedData);
        }
      }
    }, []);
    
    return <Component {...props} analytics={analytics} />;
  };
};

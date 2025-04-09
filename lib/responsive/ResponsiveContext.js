import React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

// Responsive context to provide viewport information throughout the app
const ResponsiveContext = React.createContext({
  isMobile: false,
  isTablet: false,
  isDesktop: false,
  isLargeDesktop: false
});

// Provider component that will wrap the app
export const ResponsiveProvider = ({ children }) => {
  const theme = useTheme();
  
  // Define breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600px - 900px
  const isDesktop = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 900px - 1200px
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg')); // >= 1200px
  
  // Create value object
  const value = {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    // Helper functions
    isTouchDevice: isMobile || isTablet,
    isLargeScreen: isDesktop || isLargeDesktop
  };
  
  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

// Custom hook to use the responsive context
export const useResponsive = () => {
  const context = React.useContext(ResponsiveContext);
  if (context === undefined) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
};

export default ResponsiveContext;

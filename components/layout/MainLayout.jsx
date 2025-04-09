import React from 'react';
import { Box } from '@mui/material';
import ResponsiveNavbar from '@/components/layout/ResponsiveNavbar';
import MobileBottomNavigation from '@/components/layout/MobileBottomNavigation';
import ResponsiveThemeProvider from '@/lib/responsive/ResponsiveThemeProvider';

// Main layout component that wraps the entire application
const MainLayout = ({ children }) => {
  return (
    <ResponsiveThemeProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <ResponsiveNavbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        <MobileBottomNavigation />
      </Box>
    </ResponsiveThemeProvider>
  );
};

export default MainLayout;

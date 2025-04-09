import React from 'react';
import { Box, Container, Grid, useTheme } from '@mui/material';
import { useResponsive } from '@/lib/responsive/ResponsiveContext';

// Responsive layout component that adapts to different screen sizes
const ResponsiveLayout = ({ children, sidebar, fullWidth = false }) => {
  const { isMobile, isTablet } = useResponsive();
  const theme = useTheme();
  
  // Determine layout based on screen size and whether sidebar is provided
  const renderContent = () => {
    // Full width layout (no sidebar)
    if (fullWidth || !sidebar) {
      return (
        <Container 
          maxWidth="lg" 
          sx={{ 
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 1, sm: 2, md: 3 }
          }}
        >
          {children}
        </Container>
      );
    }
    
    // Mobile layout (stacked)
    if (isMobile) {
      return (
        <Container 
          maxWidth="lg" 
          sx={{ 
            py: 2,
            px: 1
          }}
        >
          <Box sx={{ mb: 2 }}>
            {sidebar}
          </Box>
          {children}
        </Container>
      );
    }
    
    // Tablet and desktop layout (side by side)
    return (
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: { sm: 3, md: 4 },
          px: { sm: 2, md: 3 }
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} lg={3}>
            {sidebar}
          </Grid>
          <Grid item xs={12} md={9} lg={9}>
            {children}
          </Grid>
        </Grid>
      </Container>
    );
  };
  
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        pt: { xs: 7, sm: 8 }, // Account for fixed navbar
        pb: { xs: 7, sm: 2 }  // Account for mobile bottom navigation
      }}
    >
      {renderContent()}
    </Box>
  );
};

export default ResponsiveLayout;

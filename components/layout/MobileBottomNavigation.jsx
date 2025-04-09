import React from 'react';
import { Box, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home, Search, AddCircleOutline, Message, Person } from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useResponsive } from '@/lib/responsive/ResponsiveContext';

// Mobile bottom navigation component
const MobileBottomNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, isTablet } = useResponsive();
  
  // Only show on mobile and tablet
  if (!isMobile && !isTablet) {
    return null;
  }
  
  // Get current value based on pathname
  const getCurrentValue = () => {
    if (pathname === '/') return 0;
    if (pathname === '/listings' || pathname.startsWith('/listings/search')) return 1;
    if (pathname === '/listings/create') return 2;
    if (pathname === '/messages' || pathname.startsWith('/messages/')) return 3;
    if (pathname === '/profile' || pathname.startsWith('/profile/')) return 4;
    return -1;
  };
  
  const handleChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        router.push('/');
        break;
      case 1:
        router.push('/listings');
        break;
      case 2:
        router.push('/listings/create');
        break;
      case 3:
        router.push('/messages');
        break;
      case 4:
        router.push('/profile');
        break;
      default:
        break;
    }
  };
  
  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 1100,
        borderRadius: 0,
        boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)'
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={handleChange}
        showLabels
      >
        <BottomNavigationAction label="Home" icon={<Home />} />
        <BottomNavigationAction label="Search" icon={<Search />} />
        <BottomNavigationAction 
          label="Sell" 
          icon={
            <Box sx={{ 
              backgroundColor: 'primary.main', 
              borderRadius: '50%', 
              p: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translateY(-10px)',
              boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)'
            }}>
              <AddCircleOutline sx={{ color: 'white' }} />
            </Box>
          } 
        />
        <BottomNavigationAction label="Messages" icon={<Message />} />
        <BottomNavigationAction label="Profile" icon={<Person />} />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNavigation;

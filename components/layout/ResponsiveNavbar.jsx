import React from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, Badge, useMediaQuery, useTheme, Divider } from '@mui/material';
import { Menu as MenuIcon, Home, Search, AddCircleOutline, Person, Notifications, Message, ShoppingBag, Favorite, Settings, ExitToApp, ArrowBack, Close } from '@mui/icons-material';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useResponsive } from '@/lib/responsive/ResponsiveContext';
import Link from 'next/link';

const ResponsiveNavbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, isTablet } = useResponsive();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleSignOut = () => {
    handleMenuClose();
    signOut({ callbackUrl: '/' });
  };
  
  const handleNavigation = (path) => {
    router.push(path);
    if (isMobile || isTablet) {
      setDrawerOpen(false);
    }
  };
  
  const isMenuOpen = Boolean(anchorEl);
  
  // Navigation items
  const navItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Search', icon: <Search />, path: '/listings' },
    { text: 'Sell', icon: <AddCircleOutline />, path: '/listings/create' },
    { text: 'Messages', icon: <Message />, path: '/messages', badge: 3 },
    { text: 'Orders', icon: <ShoppingBag />, path: '/orders' },
    { text: 'Favorites', icon: <Favorite />, path: '/favorites' },
  ];
  
  // Drawer content
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={handleDrawerToggle}>
            <Close />
          </IconButton>
        </Box>
      )}
      
      {session ? (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={session.user.image} 
            alt={session.user.name}
            sx={{ width: 40, height: 40, mr: 2 }}
          />
          <Box>
            <Typography variant="subtitle1" noWrap>
              {session.user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {session.user.email}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={() => handleNavigation('/auth/signin')}
          >
            Sign In
          </Button>
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={() => handleNavigation('/auth/signup')}
            sx={{ mt: 1 }}
          >
            Sign Up
          </Button>
        </Box>
      )}
      
      <Divider />
      
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={pathname === item.path}
            sx={{
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon>
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      {session && (
        <>
          <Divider />
          <List>
            <ListItem 
              button 
              onClick={() => handleNavigation('/profile')}
              selected={pathname === '/profile'}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
            <ListItem 
              button 
              onClick={handleSignOut}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );
  
  // Profile menu
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => {
        handleMenuClose();
        router.push('/profile');
      }}>
        <ListItemIcon>
          <Person fontSize="small" />
        </ListItemIcon>
        Profile
      </MenuItem>
      <MenuItem onClick={() => {
        handleMenuClose();
        router.push('/orders');
      }}>
        <ListItemIcon>
          <ShoppingBag fontSize="small" />
        </ListItemIcon>
        My Orders
      </MenuItem>
      <MenuItem onClick={() => {
        handleMenuClose();
        router.push('/settings');
      }}>
        <ListItemIcon>
          <Settings fontSize="small" />
        </ListItemIcon>
        Settings
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleSignOut}>
        <ListItemIcon>
          <ExitToApp fontSize="small" />
        </ListItemIcon>
        Sign Out
      </MenuItem>
    </Menu>
  );
  
  // Back button for mobile
  const renderBackButton = () => {
    if (isMobile && pathname !== '/') {
      return (
        <IconButton
          edge="start"
          color="inherit"
          aria-label="back"
          onClick={() => router.back()}
          sx={{ mr: 1 }}
        >
          <ArrowBack />
        </IconButton>
      );
    }
    return null;
  };
  
  return (
    <>
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar>
          {renderBackButton()}
          
          {(isMobile || isTablet) && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' }, cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            Marketplace
          </Typography>
          
          {/* Desktop navigation */}
          {!isMobile && !isTablet && (
            <Box sx={{ display: 'flex', mx: 'auto' }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  startIcon={item.icon}
                  color={pathname === item.path ? 'primary' : 'inherit'}
                  onClick={() => handleNavigation(item.path)}
                  sx={{ mx: 1 }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Notification and profile icons */}
          <Box sx={{ display: 'flex' }}>
            {!isMobile && (
              <IconButton color="inherit" onClick={() => router.push('/notifications')}>
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            )}
            
            {session ? (
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar 
                  src={session.user.image} 
                  alt={session.user.name}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
            ) : (
              !isMobile && !isTablet && (
                <Box sx={{ display: 'flex' }}>
                  <Button 
                    color="inherit" 
                    onClick={() => router.push('/auth/signin')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => router.push('/auth/signup')}
                    sx={{ ml: 1 }}
                  >
                    Sign Up
                  </Button>
                </Box>
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Mobile drawer */}
      <Drawer
        variant={isMobile || isTablet ? "temporary" : "permanent"}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {renderMenu}
      
      {/* Toolbar spacer */}
      <Toolbar />
    </>
  );
};

export default ResponsiveNavbar;

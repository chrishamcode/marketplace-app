import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Grid, Paper, Typography, Snackbar, Alert, Badge } from '@mui/material';
import { Notifications, NotificationsActive, Close } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const NotificationItem = ({ notification, onRead, onDelete }) => {
  const router = useRouter();
  
  const handleClick = () => {
    onRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'message') {
      router.push(`/messages?conversation=${notification.conversationId}`);
    } else if (notification.type === 'listing') {
      router.push(`/listings/${notification.listingId}`);
    } else if (notification.type === 'offer') {
      router.push(`/offers/${notification.offerId}`);
    }
  };
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mb: 2, 
        display: 'flex', 
        alignItems: 'flex-start',
        backgroundColor: notification.isRead ? 'inherit' : 'rgba(25, 118, 210, 0.08)',
        transition: 'background-color 0.3s',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
        cursor: 'pointer'
      }}
      onClick={handleClick}
    >
      <Box sx={{ mr: 2, mt: 0.5 }}>
        {notification.type === 'message' && <NotificationsActive color="primary" />}
        {notification.type === 'listing' && <Notifications color="secondary" />}
        {notification.type === 'offer' && <Notifications color="success" />}
      </Box>
      
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}>
          {notification.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {notification.message}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {new Date(notification.timestamp).toLocaleString()}
        </Typography>
      </Box>
      
      <Button 
        size="small" 
        color="error" 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
        sx={{ minWidth: 'auto' }}
      >
        <Close fontSize="small" />
      </Button>
    </Paper>
  );
};

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      
      try {
        // In a real implementation, this would be an API call
        // For demo purposes, we'll create mock notifications
        const mockNotifications = [
          {
            id: '1',
            type: 'message',
            title: 'New message from John Doe',
            message: 'Hi, is this item still available?',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
            isRead: false,
            conversationId: '123'
          },
          {
            id: '2',
            type: 'listing',
            title: 'Your listing is popular!',
            message: 'Your "Vintage Camera" listing has been viewed 15 times today.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
            isRead: true,
            listingId: '456'
          },
          {
            id: '3',
            type: 'message',
            title: 'New message from Jane Smith',
            message: 'Would you accept $50 for this item?',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            isRead: false,
            conversationId: '789'
          },
          {
            id: '4',
            type: 'offer',
            title: 'Offer received',
            message: 'You received an offer of $75 for your "Bluetooth Speaker"',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
            isRead: false,
            offerId: '101'
          }
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Set up polling for new notifications
    const intervalId = setInterval(() => {
      // In a real implementation, this would check for new notifications
      // For demo purposes, we'll randomly add a new notification
      if (Math.random() < 0.3) { // 30% chance of new notification
        const newNotification = {
          id: Date.now().toString(),
          type: Math.random() < 0.7 ? 'message' : 'listing',
          title: Math.random() < 0.7 ? 'New message received' : 'Listing update',
          message: Math.random() < 0.7 ? 'You have a new message about your listing' : 'Your listing has new views',
          timestamp: new Date().toISOString(),
          isRead: false,
          conversationId: Math.random() < 0.7 ? '123' : null,
          listingId: Math.random() >= 0.7 ? '456' : null
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setShowSnackbar(true);
        setSnackbarMessage('New notification received');
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Mark notification as read
  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };
  
  // Delete notification
  const handleDelete = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
    setShowSnackbar(true);
    setSnackbarMessage('Notification deleted');
  };
  
  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setShowSnackbar(true);
    setSnackbarMessage('All notifications marked as read');
  };
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge badgeContent={unreadCount} color="primary" sx={{ mr: 2 }}>
              <NotificationsActive fontSize="large" color="primary" />
            </Badge>
            <Typography variant="h4" component="h1">
              Notifications
            </Typography>
          </Box>
          
          {unreadCount > 0 && (
            <Button 
              variant="outlined" 
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </Button>
          )}
        </Box>
        
        {isLoading ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography>Loading notifications...</Typography>
          </Paper>
        ) : error ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Paper>
        ) : notifications.length === 0 ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography>You have no notifications</Typography>
          </Paper>
        ) : (
          <Box>
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </Box>
        )}
      </Box>
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NotificationSystem;

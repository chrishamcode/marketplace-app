import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Grid, Paper, Typography, Tabs, Tab, Divider, Chip, Avatar, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Snackbar, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ArrowBack, LocalShipping, Check, Close, Receipt, LocationOn, Inventory, CalendarMonth } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const OrderItem = ({ order, onViewDetails }) => {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'returned':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Inventory fontSize="small" />;
      case 'processing':
        return <Inventory fontSize="small" />;
      case 'shipped':
        return <LocalShipping fontSize="small" />;
      case 'delivered':
        return <Check fontSize="small" />;
      case 'completed':
        return <Check fontSize="small" />;
      case 'cancelled':
        return <Close fontSize="small" />;
      case 'returned':
        return <ArrowBack fontSize="small" />;
      default:
        return <Inventory fontSize="small" />;
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mb: 2, 
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        }
      }}
      onClick={() => onViewDetails(order.id)}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={2}>
          <Box 
            sx={{ 
              width: '100%', 
              height: 80, 
              backgroundColor: '#f5f5f5', 
              borderRadius: 1,
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {order.listing.image ? (
              <img 
                src={order.listing.image} 
                alt={order.listing.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <Inventory color="action" />
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {order.listing.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Amount: ${order.payment.amount.toFixed(2)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              {order.isUserBuyer ? 'Seller:' : 'Buyer:'}
            </Typography>
            <Avatar 
              src={order.isUserBuyer ? order.seller.image : order.buyer.image} 
              alt={order.isUserBuyer ? order.seller.name : order.buyer.name}
              sx={{ width: 24, height: 24, mr: 1 }}
            />
            <Typography variant="body2">
              {order.isUserBuyer ? order.seller.name : order.buyer.name}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Chip 
            label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            color={getStatusColor(order.status)}
            icon={getStatusIcon(order.status)}
            sx={{ mb: 1 }}
          />
          
          <Typography variant="body2" color="text.secondary" display="block">
            Order Date: {formatDate(order.createdAt)}
          </Typography>
          
          {order.status === 'shipped' && (
            <Typography variant="body2" color="text.secondary">
              Shipped: {formatDate(order.shippedDate)}
            </Typography>
          )}
          
          {order.status === 'delivered' && (
            <Typography variant="body2" color="text.secondary">
              Delivered: {formatDate(order.actualDeliveryDate)}
            </Typography>
          )}
          
          {order.status === 'cancelled' && (
            <Typography variant="body2" color="text.secondary">
              Cancelled: {formatDate(order.cancelledDate)}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

const OrderManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [carrier, setCarrier] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const router = useRouter();
  
  // Fetch orders based on active tab
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Determine role based on active tab
        let role = 'all';
        if (activeTab === 1) {
          role = 'buyer';
        } else if (activeTab === 2) {
          role = 'seller';
        }
        
        // Fetch orders
        const response = await fetch(`/api/orders?role=${role}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [activeTab]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle view order details
  const handleViewOrderDetails = async (orderId) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      setSelectedOrder(data.order);
      setIsOrderDialogOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load order details',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle mark as shipped
  const handleOpenShippingDialog = () => {
    setTrackingNumber('');
    setTrackingUrl('');
    setCarrier('');
    setEstimatedDeliveryDate(null);
    setNotes('');
    setIsShippingDialogOpen(true);
  };
  
  const handleMarkAsShipped = async () => {
    if (!selectedOrder || !trackingNumber || !carrier) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'ship',
          trackingNumber,
          trackingUrl,
          carrier,
          estimatedDeliveryDate: estimatedDeliveryDate ? estimatedDeliveryDate.toISOString() : null,
          notes
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      
      const data = await response.json();
      
      // Update orders list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id
            ? { ...order, status: 'shipped', trackingNumber, trackingUrl, carrier, estimatedDeliveryDate, shippedDate: new Date() }
            : order
        )
      );
      
      // Close shipping dialog
      setIsShippingDialogOpen(false);
      
      // Update selected order
      setSelectedOrder(prev => ({ 
        ...prev, 
        status: 'shipped', 
        trackingNumber, 
        trackingUrl, 
        carrier, 
        estimatedDeliveryDate,
        shippedDate: new Date()
      }));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Order marked as shipped',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update order',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle mark as delivered
  const handleMarkAsDelivered = async () => {
    if (!selectedOrder) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deliver'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      
      const data = await response.json();
      
      // Update orders list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id
            ? { ...order, status: 'delivered', actualDeliveryDate: new Date() }
            : order
        )
      );
      
      // Update selected order
      setSelectedOrder(prev => ({ 
        ...prev, 
        status: 'delivered', 
        actualDeliveryDate: new Date()
      }));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Order marked as delivered',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update order',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle mark as completed
  const handleMarkAsCompleted = async () => {
    if (!selectedOrder) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'complete'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      
      const data = await response.json();
      
      // Update orders list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id
            ? { ...order, status: 'completed' }
            : order
        )
      );
      
      // Update selected order
      setSelectedOrder(prev => ({ 
        ...prev, 
        status: 'completed'
      }));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Order marked as completed',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update order',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel order
  const handleOpenCancelDialog = () => {
    setCancelReason('');
    setNotes('');
    setIsCancelDialogOpen(true);
  };
  
  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
          cancelReason,
          notes
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }
      
      const data = await response.json();
      
      // Update orders list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id
            ? { ...order, status: 'cancelled', cancelReason, cancelledDate: new Date() }
            : order
        )
      );
      
      // Close cancel dialog
      setIsCancelDialogOpen(false);
      
      // Update selected order
      setSelectedOrder(prev => ({ 
        ...prev, 
        status: 'cancelled', 
        cancelReason,
        cancelledDate: new Date()
      }));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Order cancelled successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to cancel order',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle return order
  const handleOpenReturnDialog = () => {
    setReturnReason('');
    setNotes('');
    setIsReturnDialogOpen(true);
  };
  
  const handleReturnOrder = async () => {
    if (!selectedOrder || !returnReason) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'return',
          returnReason,
          notes
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to return order');
      }
      
      const data = await response.json();
      
      // Update orders list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id
            ? { ...order, status: 'returned', returnReason, returnDate: new Date() }
            : order
        )
      );
      
      // Close return dialog
      setIsReturnDialogOpen(false);
      
      // Update selected order
      setSelectedOrder(prev => ({ 
        ...prev, 
        status: 'returned', 
        returnReason,
        returnDate: new Date()
      }));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Return request submitted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error returning order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit return request',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => router.push('/')}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" component="h1">
              Orders
            </Typography>
          </Box>
          
          <Paper elevation={3} sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="All Orders" />
              <Tab label="Purchases" />
              <Tab label="Sales" />
            </Tabs>
          </Paper>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
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
          ) : orders.length === 0 ? (
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                {activeTab === 0 ? 'No orders found' : 
                 activeTab === 1 ? 'You haven\'t made any purchases yet' : 
                 'You haven\'t sold any items yet'}
              </Typography>
              {activeTab === 1 && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => router.push('/listings')}
                  sx={{ mt: 2 }}
                >
                  Browse Listings
                </Button>
              )}
            </Paper>
          ) : (
            <Box>
              {orders.map((order) => (
                <OrderItem 
                  key={order.id} 
                  order={order} 
                  onViewDetails={handleViewOrderDetails} 
                />
              ))}
            </Box>
          )}
        </Box>
        
        {/* Order Details Dialog */}
        <Dialog
          open={isOrderDialogOpen}
          onClose={() => !isSubmitting && setIsOrderDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedOrder && (
            <>
              <DialogTitle>
                Order Details
                <Chip 
                  label={selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  color={
                    selectedOrder.status === 'pending' ? 'warning' :
                    selectedOrder.status === 'processing' ? 'info' :
                    selectedOrder.status === 'shipped' ? 'primary' :
                    selectedOrder.status === 'delivered' ? 'success' :
                    selectedOrder.status === 'completed' ? 'success' :
                    selectedOrder.status === 'cancelled' ? 'error' :
                    'default'
                  }
                  sx={{ ml: 2 }}
                />
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Item Information
                    </Typography>
                    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6">{selectedOrder.listing.title}</Typography>
                      <Typography variant="body1" color="primary" gutterBottom>
                        Amount: ${selectedOrder.payment.amount.toFixed(2)}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => router.push(`/listings/${selectedOrder.listing.id}`)}
                      >
                        View Listing
                      </Button>
                    </Paper>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Shipping Information
                    </Typography>
                    <Paper elevation={2} sx={{ p: 2 }}>
                      {selectedOrder.shippingAddress ? (
                        <>
                          <Typography variant="body1" gutterBottom>
                            <strong>Ship To:</strong> {selectedOrder.shippingAddress.name}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {selectedOrder.shippingAddress.street}<br />
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br />
                            {selectedOrder.shippingAddress.country}
                          </Typography>
                          {selectedOrder.shippingAddress.phone && (
                            <Typography variant="body2" gutterBottom>
                              Phone: {selectedOrder.shippingAddress.phone}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No shipping information available
                        </Typography>
                      )}
                      
                      {selectedOrder.status === 'shipped' && (
                        <Box sx={{ mt: 2 }}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2">
                            <strong>Tracking Number:</strong> {selectedOrder.trackingNumber}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Carrier:</strong> {selectedOrder.carrier}
                          </Typography>
                          {selectedOrder.trackingUrl && (
                            <Button 
                              variant="text" 
                              size="small" 
                              href={selectedOrder.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ mt: 1 }}
                            >
                              Track Package
                            </Button>
                          )}
                          {selectedOrder.estimatedDeliveryDate && (
                            <Typography variant="body2">
                              <strong>Estimated Delivery:</strong> {formatDate(selectedOrder.estimatedDeliveryDate)}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      {selectedOrder.isUserBuyer ? 'Seller Information' : 'Buyer Information'}
                    </Typography>
                    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={selectedOrder.isUserBuyer ? selectedOrder.seller.image : selectedOrder.buyer.image}
                          alt={selectedOrder.isUserBuyer ? selectedOrder.seller.name : selectedOrder.buyer.name}
                          sx={{ width: 50, height: 50, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="h6">
                            {selectedOrder.isUserBuyer ? selectedOrder.seller.name : selectedOrder.buyer.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedOrder.isUserBuyer ? selectedOrder.seller.email : selectedOrder.buyer.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Order Timeline
                    </Typography>
                    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Order Created:</strong> {formatDate(selectedOrder.createdAt)}
                      </Typography>
                      
                      {selectedOrder.shippedDate && (
                        <Typography variant="body2">
                          <strong>Shipped:</strong> {formatDate(selectedOrder.shippedDate)}
                        </Typography>
                      )}
                      
                      {selectedOrder.actualDeliveryDate && (
                        <Typography variant="body2">
                          <strong>Delivered:</strong> {formatDate(selectedOrder.actualDeliveryDate)}
                        </Typography>
                      )}
                      
                      {selectedOrder.cancelledDate && (
                        <Typography variant="body2">
                          <strong>Cancelled:</strong> {formatDate(selectedOrder.cancelledDate)}
                        </Typography>
                      )}
                      
                      {selectedOrder.returnDate && (
                        <Typography variant="body2">
                          <strong>Returned:</strong> {formatDate(selectedOrder.returnDate)}
                        </Typography>
                      )}
                    </Paper>
                    
                    {/* Order Actions */}
                    {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing' || 
                      selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && (
                      <>
                        <Typography variant="subtitle1" gutterBottom>
                          Actions
                        </Typography>
                        <Paper elevation={2} sx={{ p: 2 }}>
                          <Grid container spacing={2}>
                            {/* Seller Actions */}
                            {selectedOrder.isUserSeller && (
                              <>
                                {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                                  <Grid item xs={12}>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      startIcon={<LocalShipping />}
                                      onClick={handleOpenShippingDialog}
                                      fullWidth
                                    >
                                      Mark as Shipped
                                    </Button>
                                  </Grid>
                                )}
                                
                                {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                                  <Grid item xs={12}>
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      startIcon={<Close />}
                                      onClick={handleOpenCancelDialog}
                                      fullWidth
                                    >
                                      Cancel Order
                                    </Button>
                                  </Grid>
                                )}
                              </>
                            )}
                            
                            {/* Buyer Actions */}
                            {selectedOrder.isUserBuyer && (
                              <>
                                {selectedOrder.status === 'shipped' && (
                                  <Grid item xs={12}>
                                    <Button
                                      variant="contained"
                                      color="success"
                                      startIcon={<Check />}
                                      onClick={handleMarkAsDelivered}
                                      fullWidth
                                    >
                                      Mark as Delivered
                                    </Button>
                                  </Grid>
                                )}
                                
                                {selectedOrder.status === 'delivered' && (
                                  <Grid item xs={12}>
                                    <Button
                                      variant="contained"
                                      color="success"
                                      startIcon={<Check />}
                                      onClick={handleMarkAsCompleted}
                                      fullWidth
                                    >
                                      Complete Order
                                    </Button>
                                  </Grid>
                                )}
                                
                                {(selectedOrder.status === 'delivered' || selectedOrder.status === 'completed') && (
                                  <Grid item xs={12}>
                                    <Button
                                      variant="outlined"
                                      color="warning"
                                      startIcon={<ArrowBack />}
                                      onClick={handleOpenReturnDialog}
                                      fullWidth
                                    >
                                      Request Return
                                    </Button>
                                  </Grid>
                                )}
                                
                                {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                                  <Grid item xs={12}>
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      startIcon={<Close />}
                                      onClick={handleOpenCancelDialog}
                                      fullWidth
                                    >
                                      Cancel Order
                                    </Button>
                                  </Grid>
                                )}
                              </>
                            )}
                          </Grid>
                        </Paper>
                      </>
                    )}
                    
                    {/* Additional Information */}
                    {(selectedOrder.cancelReason || selectedOrder.returnReason || selectedOrder.notes) && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Additional Information
                        </Typography>
                        <Paper elevation={2} sx={{ p: 2 }}>
                          {selectedOrder.cancelReason && (
                            <Typography variant="body2" gutterBottom>
                              <strong>Cancellation Reason:</strong> {selectedOrder.cancelReason}
                            </Typography>
                          )}
                          
                          {selectedOrder.returnReason && (
                            <Typography variant="body2" gutterBottom>
                              <strong>Return Reason:</strong> {selectedOrder.returnReason}
                            </Typography>
                          )}
                          
                          {selectedOrder.notes && (
                            <Typography variant="body2" gutterBottom>
                              <strong>Notes:</strong> {selectedOrder.notes}
                            </Typography>
                          )}
                        </Paper>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={() => setIsOrderDialogOpen(false)} 
                  disabled={isSubmitting}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
        
        {/* Shipping Dialog */}
        <Dialog
          open={isShippingDialogOpen}
          onClose={() => !isSubmitting && setIsShippingDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Mark Order as Shipped</DialogTitle>
          <DialogContent>
            <Typography variant="body2" paragraph>
              Please enter the shipping information for this order.
            </Typography>
            
            <TextField
              label="Tracking Number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              fullWidth
              margin="normal"
              required
              error={!trackingNumber}
              helperText={!trackingNumber ? 'Tracking number is required' : ''}
            />
            
            <TextField
              label="Tracking URL (Optional)"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="https://..."
            />
            
            <FormControl fullWidth margin="normal" required error={!carrier}>
              <InputLabel>Carrier</InputLabel>
              <Select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                label="Carrier"
              >
                <MenuItem value="USPS">USPS</MenuItem>
                <MenuItem value="UPS">UPS</MenuItem>
                <MenuItem value="FedEx">FedEx</MenuItem>
                <MenuItem value="DHL">DHL</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {!carrier && (
                <Typography variant="caption" color="error">
                  Carrier is required
                </Typography>
              )}
            </FormControl>
            
            <Box sx={{ mt: 2 }}>
              <DatePicker
                label="Estimated Delivery Date (Optional)"
                value={estimatedDeliveryDate}
                onChange={(newValue) => setEstimatedDeliveryDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                minDate={new Date()}
              />
            </Box>
            
            <TextField
              label="Additional Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              placeholder="Any additional information about the shipment..."
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setIsShippingDialogOpen(false)} 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleMarkAsShipped} 
              variant="contained" 
              color="primary"
              disabled={isSubmitting || !trackingNumber || !carrier}
            >
              {isSubmitting ? 'Processing...' : 'Mark as Shipped'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Cancel Order Dialog */}
        <Dialog
          open={isCancelDialogOpen}
          onClose={() => !isSubmitting && setIsCancelDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogContent>
            <Typography variant="body2" paragraph>
              Are you sure you want to cancel this order?
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone. The order will be permanently cancelled.
            </Alert>
            
            <FormControl fullWidth margin="normal" required error={!cancelReason}>
              <InputLabel>Reason for Cancellation</InputLabel>
              <Select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                label="Reason for Cancellation"
              >
                <MenuItem value="Out of stock">Item is out of stock</MenuItem>
                <MenuItem value="Shipping issues">Shipping issues</MenuItem>
                <MenuItem value="Payment issues">Payment issues</MenuItem>
                <MenuItem value="Customer request">Customer requested cancellation</MenuItem>
                <MenuItem value="Other">Other reason</MenuItem>
              </Select>
              {!cancelReason && (
                <Typography variant="caption" color="error">
                  Cancellation reason is required
                </Typography>
              )}
            </FormControl>
            
            <TextField
              label="Additional Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              placeholder="Provide more details about the cancellation..."
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setIsCancelDialogOpen(false)} 
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button 
              onClick={handleCancelOrder} 
              variant="contained" 
              color="error"
              disabled={isSubmitting || !cancelReason}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Cancellation'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Return Order Dialog */}
        <Dialog
          open={isReturnDialogOpen}
          onClose={() => !isSubmitting && setIsReturnDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Request Return</DialogTitle>
          <DialogContent>
            <Typography variant="body2" paragraph>
              Please provide details about why you want to return this item.
            </Typography>
            
            <FormControl fullWidth margin="normal" required error={!returnReason}>
              <InputLabel>Reason for Return</InputLabel>
              <Select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                label="Reason for Return"
              >
                <MenuItem value="Damaged">Item arrived damaged</MenuItem>
                <MenuItem value="Defective">Item is defective</MenuItem>
                <MenuItem value="Wrong item">Received wrong item</MenuItem>
                <MenuItem value="Not as described">Item not as described</MenuItem>
                <MenuItem value="No longer needed">No longer needed</MenuItem>
                <MenuItem value="Other">Other reason</MenuItem>
              </Select>
              {!returnReason && (
                <Typography variant="caption" color="error">
                  Return reason is required
                </Typography>
              )}
            </FormControl>
            
            <TextField
              label="Additional Details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              placeholder="Please provide more details about the return request..."
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setIsReturnDialogOpen(false)} 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReturnOrder} 
              variant="contained" 
              color="primary"
              disabled={isSubmitting || !returnReason}
            >
              {isSubmitting ? 'Processing...' : 'Submit Return Request'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default OrderManagement;

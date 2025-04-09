import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Grid, Paper, Typography, Tabs, Tab, Divider, Chip, Avatar, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Snackbar } from '@mui/material';
import { ArrowBack, Payment as PaymentIcon, Check, Close, Receipt, MonetizationOn } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51NxSampleTestKeyForDevelopmentOnly');

// Payment Form Component
const PaymentForm = ({ clientSecret, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }
    
    setIsProcessing(true);
    setCardError(null);
    
    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });
      
      if (result.error) {
        // Show error to customer
        setCardError(result.error.message);
        onError(result.error.message);
      } else {
        // Payment succeeded
        if (result.paymentIntent.status === 'succeeded') {
          onSuccess(result.paymentIntent);
        } else {
          onError('Payment processing failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setCardError('An unexpected error occurred. Please try again.');
      onError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>
      
      <Typography variant="body1" color="primary" gutterBottom>
        Amount: ${amount.toFixed(2)}
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </Box>
      
      {cardError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {cardError}
        </Alert>
      )}
      
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!stripe || isProcessing}
        fullWidth
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
};

// Payment Item Component
const PaymentItem = ({ payment, onViewDetails }) => {
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
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'default';
      default:
        return 'default';
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
      onClick={() => onViewDetails(payment.id)}
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
            {payment.listing.image ? (
              <img 
                src={payment.listing.image} 
                alt={payment.listing.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <PaymentIcon color="action" />
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {payment.listing.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Amount:
            </Typography>
            <Chip 
              label={`$${payment.amount.toFixed(2)}`}
              color="primary"
              size="small"
              icon={<MonetizationOn />}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              {payment.isUserBuyer ? 'Seller:' : 'Buyer:'}
            </Typography>
            <Avatar 
              src={payment.isUserBuyer ? payment.seller.image : payment.buyer.image} 
              alt={payment.isUserBuyer ? payment.seller.name : payment.buyer.name}
              sx={{ width: 24, height: 24, mr: 1 }}
            />
            <Typography variant="body2">
              {payment.isUserBuyer ? payment.seller.name : payment.buyer.name}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Chip 
            label={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            color={getStatusColor(payment.status)}
            sx={{ mb: 1 }}
          />
          
          <Typography variant="body2" color="text.secondary" display="block">
            {payment.status === 'completed' ? 'Paid on:' : 'Created:'} {formatDate(payment.status === 'completed' ? payment.paymentDate : payment.createdAt)}
          </Typography>
          
          {payment.status === 'refunded' && (
            <Typography variant="body2" color="text.secondary">
              Refunded: {formatDate(payment.refundDate)}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const router = useRouter();
  
  // Fetch payments based on active tab
  useEffect(() => {
    const fetchPayments = async () => {
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
        
        // Fetch payments
        const response = await fetch(`/api/payments?role=${role}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        
        const data = await response.json();
        setPayments(data.payments);
      } catch (error) {
        console.error('Error fetching payments:', error);
        setError('Failed to load payments. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayments();
  }, [activeTab]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle view payment details
  const handleViewPaymentDetails = async (paymentId) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/payments/${paymentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }
      
      const data = await response.json();
      setSelectedPayment(data.payment);
      setIsPaymentDialogOpen(true);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load payment details',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle payment for an offer
  const handleInitiatePayment = async (offerId) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offerId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
      setIsPaymentFormOpen(true);
    } catch (error) {
      console.error('Error initiating payment:', error);
      setSnackbar({
        open: true,
        message: 'Failed to initiate payment',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle payment success
  const handlePaymentSuccess = (paymentIntent) => {
    setSnackbar({
      open: true,
      message: 'Payment successful!',
      severity: 'success'
    });
    
    // Close payment form
    setIsPaymentFormOpen(false);
    
    // Refresh payments list
    const fetchPayments = async () => {
      try {
        const response = await fetch(`/api/payments?role=${activeTab === 1 ? 'buyer' : activeTab === 2 ? 'seller' : 'all'}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        
        const data = await response.json();
        setPayments(data.payments);
      } catch (error) {
        console.error('Error refreshing payments:', error);
      }
    };
    
    fetchPayments();
  };
  
  // Handle payment error
  const handlePaymentError = (errorMessage) => {
    setSnackbar({
      open: true,
      message: `Payment failed: ${errorMessage}`,
      severity: 'error'
    });
  };
  
  // Handle refund
  const handleRefund = async () => {
    if (!selectedPayment || !refundReason) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/payments/${selectedPayment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'refund',
          refundReason
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process refund');
      }
      
      const data = await response.json();
      
      // Update payments list
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.id === selectedPayment.id
            ? { ...payment, status: 'refunded', refundReason, refundDate: new Date() }
            : payment
        )
      );
      
      // Close refund dialog
      setIsRefundDialogOpen(false);
      
      // Update selected payment
      setSelectedPayment(prev => ({ ...prev, status: 'refunded', refundReason, refundDate: new Date() }));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Refund processed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      setSnackbar({
        open: true,
        message: 'Failed to process refund',
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
            Payments
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
            <Tab label="All Payments" />
            <Tab label="Payments Made" />
            <Tab label="Payments Received" />
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
        ) : payments.length === 0 ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {activeTab === 0 ? 'No payments found' : 
               activeTab === 1 ? 'You haven\'t made any payments yet' : 
               'You haven\'t received any payments yet'}
            </Typography>
            {activeTab === 1 && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => router.push('/offers')}
                sx={{ mt: 2 }}
              >
                View Your Offers
              </Button>
            )}
          </Paper>
        ) : (
          <Box>
            {payments.map((payment) => (
              <PaymentItem 
                key={payment.id} 
                payment={payment} 
                onViewDetails={handleViewPaymentDetails} 
              />
            ))}
          </Box>
        )}
      </Box>
      
      {/* Payment Details Dialog */}
      <Dialog
        open={isPaymentDialogOpen}
        onClose={() => !isSubmitting && setIsPaymentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPayment && (
          <>
            <DialogTitle>
              Payment Details
              <Chip 
                label={selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                color={
                  selectedPayment.status === 'pending' ? 'warning' :
                  selectedPayment.status === 'processing' ? 'info' :
                  selectedPayment.status === 'completed' ? 'success' :
                  selectedPayment.status === 'failed' ? 'error' :
                  'default'
                }
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Listing Information
                  </Typography>
                  <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6">{selectedPayment.listing.title}</Typography>
                    <Typography variant="body1" color="primary" gutterBottom>
                      List Price: ${selectedPayment.listing.price.toFixed(2)}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => router.push(`/listings/${selectedPayment.listing.id}`)}
                    >
                      View Listing
                    </Button>
                  </Paper>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Information
                  </Typography>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Amount: ${selectedPayment.amount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Payment Method: {selectedPayment.paymentMethod.toUpperCase()}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      Created: {formatDate(selectedPayment.createdAt)}
                    </Typography>
                    {selectedPayment.status === 'completed' && (
                      <Typography variant="body2">
                        Paid: {formatDate(selectedPayment.paymentDate)}
                      </Typography>
                    )}
                    {selectedPayment.status === 'refunded' && (
                      <>
                        <Typography variant="body2">
                          Refunded: {formatDate(selectedPayment.refundDate)}
                        </Typography>
                        <Typography variant="body2">
                          Refund Reason: {selectedPayment.refundReason}
                        </Typography>
                      </>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    {selectedPayment.isUserBuyer ? 'Seller Information' : 'Buyer Information'}
                  </Typography>
                  <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={selectedPayment.isUserBuyer ? selectedPayment.seller.image : selectedPayment.buyer.image}
                        alt={selectedPayment.isUserBuyer ? selectedPayment.seller.name : selectedPayment.buyer.name}
                        sx={{ width: 50, height: 50, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6">
                          {selectedPayment.isUserBuyer ? selectedPayment.seller.name : selectedPayment.buyer.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedPayment.isUserBuyer ? selectedPayment.seller.email : selectedPayment.buyer.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                  
                  {selectedPayment.status === 'completed' && selectedPayment.isUserSeller && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Actions
                      </Typography>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <Button
                          variant="contained"
                          color="warning"
                          startIcon={<MonetizationOn />}
                          onClick={() => setIsRefundDialogOpen(true)}
                          disabled={isSubmitting}
                          fullWidth
                        >
                          Issue Refund
                        </Button>
                      </Paper>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setIsPaymentDialogOpen(false)} 
                disabled={isSubmitting}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Payment Form Dialog */}
      <Dialog
        open={isPaymentFormOpen}
        onClose={() => !isSubmitting && setIsPaymentFormOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complete Payment</DialogTitle>
        <DialogContent>
          {clientSecret && selectedPayment && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm 
                clientSecret={clientSecret}
                amount={selectedPayment.amount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsPaymentFormOpen(false)} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Refund Dialog */}
      <Dialog
        open={isRefundDialogOpen}
        onClose={() => !isSubmitting && setIsRefundDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Issue Refund</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            You are about to issue a refund for ${selectedPayment?.amount.toFixed(2)} to {selectedPayment?.buyer.name}.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            This action cannot be undone. The full amount will be refunded to the buyer's original payment method.
          </Alert>
          
          <TextField
            label="Reason for Refund"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            required
            error={!refundReason}
            helperText={!refundReason ? 'Please provide a reason for the refund' : ''}
            placeholder="Explain why you are issuing this refund..."
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsRefundDialogOpen(false)} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRefund} 
            variant="contained" 
            color="warning"
            disabled={isSubmitting || !refundReason}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Refund'}
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
  );
};

export default PaymentManagement;

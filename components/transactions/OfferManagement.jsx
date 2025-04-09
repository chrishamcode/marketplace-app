import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Grid, Paper, Typography, Tabs, Tab, Divider, Chip, Avatar, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Snackbar } from '@mui/material';
import { ArrowBack, LocalOffer, Check, Close, Reply, MonetizationOn } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const OfferItem = ({ offer, onViewDetails }) => {
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'countered':
        return 'info';
      case 'expired':
        return 'default';
      case 'withdrawn':
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
      onClick={() => onViewDetails(offer.id)}
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
            {offer.listing.image ? (
              <img 
                src={offer.listing.image} 
                alt={offer.listing.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <LocalOffer color="action" />
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {offer.listing.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              List price: ${offer.listing.price.toFixed(2)}
            </Typography>
            <Chip 
              label={`Your offer: $${offer.amount.toFixed(2)}`}
              color="primary"
              size="small"
              icon={<MonetizationOn />}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              {offer.isUserBuyer ? 'Seller:' : 'Buyer:'}
            </Typography>
            <Avatar 
              src={offer.isUserBuyer ? offer.seller.image : offer.buyer.image} 
              alt={offer.isUserBuyer ? offer.seller.name : offer.buyer.name}
              sx={{ width: 24, height: 24, mr: 1 }}
            />
            <Typography variant="body2">
              {offer.isUserBuyer ? offer.seller.name : offer.buyer.name}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Chip 
            label={offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
            color={getStatusColor(offer.status)}
            sx={{ mb: 1 }}
          />
          
          <Typography variant="body2" color="text.secondary" display="block">
            {offer.status === 'pending' ? 'Expires' : 'Updated'}: {formatDate(offer.status === 'pending' ? offer.expiresAt : offer.updatedAt)}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Created: {formatDate(offer.createdAt)}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

const OfferManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [isCounterDialogOpen, setIsCounterDialogOpen] = useState(false);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const router = useRouter();
  
  // Fetch offers based on active tab
  useEffect(() => {
    const fetchOffers = async () => {
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
        
        // Fetch offers
        const response = await fetch(`/api/offers?role=${role}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch offers');
        }
        
        const data = await response.json();
        setOffers(data.offers);
      } catch (error) {
        console.error('Error fetching offers:', error);
        setError('Failed to load offers. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOffers();
  }, [activeTab]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle view offer details
  const handleViewOfferDetails = async (offerId) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/offers/${offerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch offer details');
      }
      
      const data = await response.json();
      setSelectedOffer(data.offer);
      setIsOfferDialogOpen(true);
    } catch (error) {
      console.error('Error fetching offer details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load offer details',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle offer action (accept, reject, withdraw)
  const handleOfferAction = async (action) => {
    if (!selectedOffer) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/offers/${selectedOffer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update offer');
      }
      
      const data = await response.json();
      
      // Update offers list
      setOffers(prevOffers => 
        prevOffers.map(offer => 
          offer.id === selectedOffer.id
            ? { ...offer, status: data.offer.status }
            : offer
        )
      );
      
      // Update selected offer
      setSelectedOffer(prev => ({ ...prev, status: data.offer.status }));
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Offer ${action}ed successfully`,
        severity: 'success'
      });
      
      // Close dialog after a delay
      setTimeout(() => {
        setIsOfferDialogOpen(false);
      }, 2000);
    } catch (error) {
      console.error(`Error ${action}ing offer:`, error);
      setSnackbar({
        open: true,
        message: `Failed to ${action} offer`,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle counter offer
  const handleCounterOffer = async () => {
    if (!selectedOffer || !counterAmount) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/offers/${selectedOffer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'counter',
          counterAmount: parseFloat(counterAmount),
          message: counterMessage
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create counter offer');
      }
      
      const data = await response.json();
      
      // Update offers list
      setOffers(prevOffers => 
        prevOffers.map(offer => 
          offer.id === selectedOffer.id
            ? { ...offer, status: 'countered' }
            : offer
        )
      );
      
      // Close counter dialog
      setIsCounterDialogOpen(false);
      
      // Update selected offer
      setSelectedOffer(prev => ({ ...prev, status: 'countered' }));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Counter offer sent successfully',
        severity: 'success'
      });
      
      // Close offer dialog after a delay
      setTimeout(() => {
        setIsOfferDialogOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Error creating counter offer:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send counter offer',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle view listing
  const handleViewListing = (listingId) => {
    router.push(`/listings/${listingId}`);
  };
  
  // Format date
  const formatDate = (dateString) => {
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
            Offers
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
            <Tab label="All Offers" />
            <Tab label="Offers Made" />
            <Tab label="Offers Received" />
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
        ) : offers.length === 0 ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {activeTab === 0 ? 'No offers found' : 
               activeTab === 1 ? 'You haven\'t made any offers yet' : 
               'You haven\'t received any offers yet'}
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
            {offers.map((offer) => (
              <OfferItem 
                key={offer.id} 
                offer={offer} 
                onViewDetails={handleViewOfferDetails} 
              />
            ))}
          </Box>
        )}
      </Box>
      
      {/* Offer Details Dialog */}
      <Dialog
        open={isOfferDialogOpen}
        onClose={() => !isSubmitting && setIsOfferDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOffer && (
          <>
            <DialogTitle>
              Offer Details
              <Chip 
                label={selectedOffer.status.charAt(0).toUpperCase() + selectedOffer.status.slice(1)}
                color={
                  selectedOffer.status === 'pending' ? 'warning' :
                  selectedOffer.status === 'accepted' ? 'success' :
                  selectedOffer.status === 'rejected' ? 'error' :
                  selectedOffer.status === 'countered' ? 'info' :
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
                    <Typography variant="h6">{selectedOffer.listing.title}</Typography>
                    <Typography variant="body1" color="primary" gutterBottom>
                      List Price: ${selectedOffer.listing.price.toFixed(2)}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleViewListing(selectedOffer.listing.id)}
                    >
                      View Listing
                    </Button>
                  </Paper>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Offer Information
                  </Typography>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Offer Amount: ${selectedOffer.amount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedOffer.message ? (
                        <>
                          <strong>Message:</strong> {selectedOffer.message}
                        </>
                      ) : (
                        'No message included'
                      )}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      Created: {formatDate(selectedOffer.createdAt)}
                    </Typography>
                    {selectedOffer.status === 'pending' && (
                      <Typography variant="body2">
                        Expires: {formatDate(selectedOffer.expiresAt)}
                      </Typography>
                    )}
                    {selectedOffer.status !== 'pending' && (
                      <Typography variant="body2">
                        Updated: {formatDate(selectedOffer.updatedAt)}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    {selectedOffer.isUserBuyer ? 'Seller Information' : 'Buyer Information'}
                  </Typography>
                  <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={selectedOffer.isUserBuyer ? selectedOffer.seller.image : selectedOffer.buyer.image}
                        alt={selectedOffer.isUserBuyer ? selectedOffer.seller.name : selectedOffer.buyer.name}
                        sx={{ width: 50, height: 50, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6">
                          {selectedOffer.isUserBuyer ? selectedOffer.seller.name : selectedOffer.buyer.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedOffer.isUserBuyer ? selectedOffer.seller.email : selectedOffer.buyer.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                  
                  {selectedOffer.status === 'pending' && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Actions
                      </Typography>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        {selectedOffer.isUserSeller ? (
                          // Seller actions
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<Check />}
                              onClick={() => handleOfferAction('accept')}
                              disabled={isSubmitting}
                              fullWidth
                            >
                              Accept Offer
                            </Button>
                            <Button
                              variant="contained"
                              color="info"
                              startIcon={<Reply />}
                              onClick={() => {
                                setCounterAmount(selectedOffer.listing.price.toString());
                                setCounterMessage('');
                                setIsCounterDialogOpen(true);
                              }}
                              disabled={isSubmitting}
                              fullWidth
                            >
                              Counter Offer
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              startIcon={<Close />}
                              onClick={() => handleOfferAction('reject')}
                              disabled={isSubmitting}
                              fullWidth
                            >
                              Reject Offer
                            </Button>
                          </Box>
                        ) : (
                          // Buyer actions
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<Close />}
                            onClick={() => handleOfferAction('withdraw')}
                            disabled={isSubmitting}
                            fullWidth
                          >
                            Withdraw Offer
                          </Button>
                        )}
                      </Paper>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setIsOfferDialogOpen(false)} 
                disabled={isSubmitting}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Counter Offer Dialog */}
      <Dialog
        open={isCounterDialogOpen}
        onClose={() => !isSubmitting && setIsCounterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Make Counter Offer</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Original offer: ${selectedOffer?.amount.toFixed(2)}
          </Typography>
          <Typography variant="body2" paragraph>
            Listing price: ${selectedOffer?.listing.price.toFixed(2)}
          </Typography>
          
          <TextField
            label="Counter Offer Amount"
            type="number"
            value={counterAmount}
            onChange={(e) => setCounterAmount(e.target.value)}
            InputProps={{
              startAdornment: '$',
            }}
            fullWidth
            margin="normal"
            required
            error={!counterAmount || parseFloat(counterAmount) <= 0}
            helperText={!counterAmount || parseFloat(counterAmount) <= 0 ? 'Please enter a valid amount' : ''}
          />
          
          <TextField
            label="Message (Optional)"
            value={counterMessage}
            onChange={(e) => setCounterMessage(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            placeholder="Explain your counter offer..."
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsCounterDialogOpen(false)} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCounterOffer} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting || !counterAmount || parseFloat(counterAmount) <= 0}
          >
            {isSubmitting ? 'Sending...' : 'Send Counter Offer'}
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

export default OfferManagement;

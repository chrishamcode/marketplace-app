import React, { useState } from 'react';
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, Divider, Chip, Avatar } from '@mui/material';
import { LocalOffer, MonetizationOn } from '@mui/icons-material';

const MakeOfferButton = ({ listingId, listingTitle, listingPrice, sellerId, sellerName, sellerImage }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState(listingPrice * 0.9); // Default to 90% of listing price
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Handle dialog open
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setError(null);
    setSuccess(false);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    if (!isSubmitting) {
      setIsDialogOpen(false);
    }
  };
  
  // Handle offer submission
  const handleSubmitOffer = async () => {
    // Validate offer amount
    if (!offerAmount || offerAmount <= 0) {
      setError('Please enter a valid offer amount');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          amount: offerAmount,
          message
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit offer');
      }
      
      // Show success state
      setSuccess(true);
      
      // Close dialog after a delay
      setTimeout(() => {
        setIsDialogOpen(false);
        
        // Reset form
        setOfferAmount(listingPrice * 0.9);
        setMessage('');
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting offer:', error);
      setError(error.message || 'Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<LocalOffer />}
        onClick={handleOpenDialog}
        fullWidth
      >
        Make an Offer
      </Button>
      
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {success ? 'Offer Submitted!' : 'Make an Offer'}
        </DialogTitle>
        
        <DialogContent>
          {success ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="success.main" gutterBottom>
                Your offer has been sent to the seller!
              </Typography>
              <Typography variant="body1">
                You can view and manage your offers in the Offers section.
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Listing: {listingTitle}
                </Typography>
                <Typography variant="h6" color="primary">
                  List Price: ${listingPrice.toFixed(2)}
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Avatar src={sellerImage} alt={sellerName} sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2">
                    Seller
                  </Typography>
                  <Typography variant="body1">
                    {sellerName}
                  </Typography>
                </Box>
              </Box>
              
              <TextField
                label="Your Offer"
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(parseFloat(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                fullWidth
                margin="normal"
                required
                error={!!error}
                helperText={error}
              />
              
              {offerAmount && listingPrice && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Chip 
                    icon={<MonetizationOn />}
                    label={`${Math.round((offerAmount / listingPrice) * 100)}% of list price`}
                    color={offerAmount >= listingPrice ? "success" : "primary"}
                    variant="outlined"
                  />
                </Box>
              )}
              
              <TextField
                label="Message to Seller (Optional)"
                multiline
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="Explain why you're making this offer or ask questions about the item..."
              />
            </>
          )}
        </DialogContent>
        
        {!success && (
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitOffer} 
              variant="contained" 
              color="primary"
              disabled={isSubmitting || !offerAmount || offerAmount <= 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export default MakeOfferButton;

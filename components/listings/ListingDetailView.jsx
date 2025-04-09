import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Grid, Paper, Typography, Chip, Divider, Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { Edit, Delete, ArrowBack, Message, Share, Favorite, FavoriteBorder, LocationOn } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const ListingDetailView = ({ listingId }) => {
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const router = useRouter();
  
  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listing');
        }
        
        const data = await response.json();
        setListing(data.listing);
        
        // Check if listing is in favorites (would be implemented with user context in a real app)
        // This is a placeholder implementation
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(listingId));
        
      } catch (error) {
        console.error('Error fetching listing:', error);
        setError('Failed to load listing. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format condition
  const formatCondition = (condition) => {
    return condition
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Handle image navigation
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };
  
  // Handle delete
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      
      // Redirect to listings page
      router.push('/listings');
      
    } catch (error) {
      console.error('Error deleting listing:', error);
      setError('Failed to delete listing. Please try again.');
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    // This would be implemented with user context and API calls in a real app
    // This is a placeholder implementation using localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      const updatedFavorites = favorites.filter(id => id !== listingId);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } else {
      favorites.push(listingId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    
    setIsFavorite(!isFavorite);
  };
  
  // Handle message seller
  const handleMessageSeller = () => {
    // Navigate to messaging page with this seller
    router.push(`/messages?userId=${listing.userId}`);
  };
  
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading listing...
        </Typography>
      </Container>
    );
  }
  
  if (error || !listing) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            {error || 'Listing not found'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => router.push('/listings')}
            sx={{ mt: 2 }}
          >
            Back to Listings
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />}
          onClick={() => router.push('/listings')}
          sx={{ mb: 3 }}
        >
          Back to Listings
        </Button>
        
        <Grid container spacing={4}>
          {/* Images section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
              {listing.images && listing.images.length > 0 ? (
                <>
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '75%', // 4:3 aspect ratio
                      backgroundColor: '#f5f5f5',
                    }}
                  >
                    <img
                      src={listing.images[currentImageIndex].url}
                      alt={listing.title}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                    
                    {/* Image navigation buttons */}
                    {listing.images.length > 1 && (
                      <>
                        <IconButton
                          sx={{
                            position: 'absolute',
                            left: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                          }}
                          onClick={handlePrevImage}
                        >
                          &lt;
                        </IconButton>
                        <IconButton
                          sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                          }}
                          onClick={handleNextImage}
                        >
                          &gt;
                        </IconButton>
                      </>
                    )}
                  </Box>
                  
                  {/* Thumbnail navigation */}
                  {listing.images.length > 1 && (
                    <Box sx={{ display: 'flex', p: 1, overflowX: 'auto' }}>
                      {listing.images.map((image, index) => (
                        <Box
                          key={image.id}
                          sx={{
                            width: 60,
                            height: 60,
                            flexShrink: 0,
                            m: 0.5,
                            border: index === currentImageIndex ? '2px solid #1976d2' : '2px solid transparent',
                            borderRadius: 1,
                            overflow: 'hidden',
                            cursor: 'pointer',
                          }}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img
                            src={image.url}
                            alt={`Thumbnail ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No images available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Listing details section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {listing.title}
                </Typography>
                <IconButton 
                  color={isFavorite ? 'error' : 'default'} 
                  onClick={handleFavoriteToggle}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFavorite ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Box>
              
              <Typography variant="h5" color="primary" gutterBottom>
                ${listing.price.toFixed(2)}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body1" color="text.secondary">
                  {listing.location}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={formatCondition(listing.condition)} 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label={listing.category} 
                  color="secondary" 
                  variant="outlined" 
                  size="small" 
                  sx={{ mr: 1 }}
                />
                {listing.subcategory && (
                  <Chip 
                    label={listing.subcategory} 
                    variant="outlined" 
                    size="small" 
                  />
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {listing.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  src={listing.user?.image || ''} 
                  alt={listing.user?.name || 'Seller'}
                  sx={{ mr: 2 }}
                />
                <Box>
                  <Typography variant="subtitle1">
                    {listing.user?.name || 'Anonymous Seller'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Listed on {formatDate(listing.createdAt)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Message />}
                  onClick={handleMessageSeller}
                  fullWidth
                  sx={{ mr: 1 }}
                >
                  Message Seller
                </Button>
                
                {listing.isOwner && (
                  <>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Edit />}
                      onClick={() => router.push(`/listings/${listingId}/edit`)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={handleDeleteClick}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Listing</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this listing? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsDeleteDialogOpen(false)} 
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ListingDetailView;

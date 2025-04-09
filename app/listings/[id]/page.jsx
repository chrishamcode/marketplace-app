import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Grid, Paper, Typography, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel, Pagination, CircularProgress, Chip, IconButton, Tabs, Tab } from '@mui/material';
import { Search, FilterList, Sort, Favorite, FavoriteBorder, LocationOn, Message } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const ListingDetailPage = ({ params }) => {
  const { id } = params;
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const router = useRouter();
  
  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listing');
        }
        
        const data = await response.json();
        setListing(data.listing);
        
        // Check if listing is in favorites (would be implemented with user context in a real app)
        // This is a placeholder implementation
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(id));
        
      } catch (error) {
        console.error('Error fetching listing:', error);
        setError('Failed to load listing. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchListing();
    }
  }, [id]);
  
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
    <div>
      <div id="listing-detail-view">
        {/* This div will be populated by the ListingDetailView component */}
        {/* We're using this approach to avoid duplicating the component logic */}
      </div>
    </div>
  );
};

export default ListingDetailPage;

import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Grid, Paper, Typography, Tabs, Tab, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel, Pagination, CircularProgress, Chip, IconButton } from '@mui/material';
import { Search, Add, FilterList, Sort, Favorite, FavoriteBorder, Delete } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const ListingManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  
  const router = useRouter();
  
  // Fetch listings based on active tab, page, search, filters, and sort
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Determine endpoint based on active tab
        let endpoint = '/api/listings';
        if (activeTab === 1) {
          endpoint = '/api/listings/my-listings';
        } else if (activeTab === 2) {
          // Load favorites from localStorage in this example
          // In a real app, this would be fetched from the server
          const favIds = JSON.parse(localStorage.getItem('favorites') || '[]');
          if (favIds.length > 0) {
            endpoint = `/api/listings?ids=${favIds.join(',')}`;
          } else {
            setListings([]);
            setTotalPages(1);
            setIsLoading(false);
            return;
          }
        }
        
        // Add query parameters
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', '12');
        
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        if (filterCategory) {
          params.append('category', filterCategory);
        }
        
        if (sortBy) {
          params.append('sort', sortBy);
        }
        
        // Fetch data
        const response = await fetch(`${endpoint}?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data = await response.json();
        
        setListings(data.listings);
        setTotalPages(data.totalPages || 1);
        
        // Load favorites from localStorage
        const favIds = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(favIds);
        
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Failed to load listings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListings();
  }, [activeTab, page, searchTerm, filterCategory, sortBy]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
    setPage(1);
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };
  
  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = (listingId) => {
    // This would be implemented with user context and API calls in a real app
    // This is a placeholder implementation using localStorage
    const currentFavorites = [...favorites];
    
    if (currentFavorites.includes(listingId)) {
      const updatedFavorites = currentFavorites.filter(id => id !== listingId);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } else {
      currentFavorites.push(listingId);
      localStorage.setItem('favorites', JSON.stringify(currentFavorites));
      setFavorites(currentFavorites);
    }
  };
  
  // Handle delete listing
  const handleDeleteListing = async (listingId) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      
      // Remove from listings
      setListings(listings.filter(listing => listing.id !== listingId));
      
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing. Please try again.');
    }
  };
  
  // Format condition
  const formatCondition = (condition) => {
    return condition
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Listings
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => router.push('/listings/create')}
          >
            Create Listing
          </Button>
        </Box>
        
        <Paper elevation={3} sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="All Listings" />
            <Tab label="My Listings" />
            <Tab label="Favorites" />
          </Tabs>
        </Paper>
        
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 1 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={toggleFilters}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              Filters
            </Button>
          </Box>
          
          {showFilters && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={handleFilterChange}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Furniture">Furniture</MenuItem>
                  <MenuItem value="Fashion">Fashion</MenuItem>
                  <MenuItem value="Media">Media</MenuItem>
                  <MenuItem value="Home & Garden">Home & Garden</MenuItem>
                  <MenuItem value="Sports & Outdoors">Sports & Outdoors</MenuItem>
                  <MenuItem value="Toys & Games">Toys & Games</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  label="Sort By"
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="price_low">Price: Low to High</MenuItem>
                  <MenuItem value="price_high">Price: High to Low</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </Paper>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="error">
              {error}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Paper>
        ) : listings.length === 0 ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {activeTab === 0 ? 'No listings found' : 
               activeTab === 1 ? 'You haven\'t created any listings yet' : 
               'You don\'t have any favorites yet'}
            </Typography>
            {activeTab === 1 && (
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<Add />}
                onClick={() => router.push('/listings/create')}
                sx={{ mt: 2 }}
              >
                Create Your First Listing
              </Button>
            )}
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {listings.map((listing) => (
                <Grid item key={listing.id} xs={12} sm={6} md={4} lg={3}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                      position: 'relative',
                    }}
                  >
                    {/* Favorite button */}
                    <IconButton 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        zIndex: 1,
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteToggle(listing.id);
                      }}
                    >
                      {favorites.includes(listing.id) ? (
                        <Favorite color="error" />
                      ) : (
                        <FavoriteBorder />
                      )}
                    </IconButton>
                    
                    {/* Image */}
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '75%', // 4:3 aspect ratio
                        backgroundColor: '#f5f5f5',
                        cursor: 'pointer',
                      }}
                      onClick={() => router.push(`/listings/${listing.id}`)}
                    >
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0].url}
                          alt={listing.title}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No image
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    {/* Content */}
                    <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        gutterBottom
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          cursor: 'pointer',
                        }}
                        onClick={() => router.push(`/listings/${listing.id}`)}
                      >
                        {listing.title}
                      </Typography>
                      
                      <Typography 
                        variant="h6" 
                        color="primary" 
                        sx={{ mb: 1 }}
                      >
                        ${listing.price.toFixed(2)}
                      </Typography>
                      
                      <Box sx={{ mb: 1 }}>
                        <Chip 
                          label={formatCondition(listing.condition)} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                        <Chip 
                          label={listing.category} 
                          size="small" 
                          sx={{ mb: 0.5 }}
                        />
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mb: 1,
                          flexGrow: 1,
                        }}
                      >
                        {listing.description}
                      </Typography>
                      
                      {/* Action buttons for My Listings tab */}
                      {activeTab === 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => router.push(`/listings/${listing.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteListing(listing.id);
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default ListingManagementDashboard;

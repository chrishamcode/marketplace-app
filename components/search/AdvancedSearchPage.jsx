import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, InputAdornment, IconButton, Grid, Card, CardContent, CardMedia, Chip, Button, Pagination, FormControl, InputLabel, Select, MenuItem, Slider, Divider, Paper, Drawer, List, ListItem, ListItemText, ListItemIcon, Collapse, CircularProgress, Alert } from '@mui/material';
import { Search as SearchIcon, FilterList, Close, ExpandMore, ExpandLess, LocationOn, Category, AttachMoney, Star, Sort, TrendingUp } from '@mui/icons-material';
import { useResponsive } from '@/lib/responsive/ResponsiveContext';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const AdvancedSearchPage = () => {
  const { isMobile, isTablet } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    categories: true,
    price: true,
    location: true,
    condition: true,
    features: false,
  });
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);
  const [error, setError] = useState(null);

  // Toggle filter sections
  const handleToggleFilter = (filter) => {
    setExpandedFilters({
      ...expandedFilters,
      [filter]: !expandedFilters[filter],
    });
  };

  // Handle price range change
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  // Toggle filter drawer for mobile
  const toggleFilterDrawer = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };

  // Handle feature selection
  const handleFeatureToggle = (feature) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search submission
  const handleSearch = () => {
    setIsLoading(true);
    setError(null);
    
    // Save search to recent searches
    if (searchQuery.trim() !== '') {
      const newRecentSearches = [
        { query: searchQuery, timestamp: new Date() },
        ...recentSearches.filter(s => s.query !== searchQuery)
      ].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    }
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        // Mock search results based on filters
        let filteredResults = [...mockSearchResults];
        
        // Filter by search query
        if (searchQuery) {
          filteredResults = filteredResults.filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        // Filter by category
        if (selectedCategory) {
          filteredResults = filteredResults.filter(item => 
            item.category === selectedCategory
          );
        }
        
        // Filter by condition
        if (selectedCondition) {
          filteredResults = filteredResults.filter(item => 
            item.condition === selectedCondition
          );
        }
        
        // Filter by location
        if (selectedLocation) {
          filteredResults = filteredResults.filter(item => 
            item.location === selectedLocation
          );
        }
        
        // Filter by price range
        filteredResults = filteredResults.filter(item => 
          item.price >= priceRange[0] && item.price <= priceRange[1]
        );
        
        // Filter by features
        if (selectedFeatures.length > 0) {
          filteredResults = filteredResults.filter(item => 
            selectedFeatures.every(feature => item.features.includes(feature))
          );
        }
        
        // Sort results
        switch (sortBy) {
          case 'price_low':
            filteredResults.sort((a, b) => a.price - b.price);
            break;
          case 'price_high':
            filteredResults.sort((a, b) => b.price - a.price);
            break;
          case 'newest':
            filteredResults.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
          case 'oldest':
            filteredResults.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
          case 'relevance':
          default:
            // For relevance, we would typically use a scoring algorithm
            // Here we'll just prioritize exact matches in title
            filteredResults.sort((a, b) => {
              const aTitle = a.title.toLowerCase();
              const bTitle = b.title.toLowerCase();
              const query = searchQuery.toLowerCase();
              
              if (aTitle.includes(query) && !bTitle.includes(query)) return -1;
              if (!aTitle.includes(query) && bTitle.includes(query)) return 1;
              return 0;
            });
            break;
        }
        
        setTotalResults(filteredResults.length);
        
        // Paginate results
        const resultsPerPage = 6;
        const startIndex = (currentPage - 1) * resultsPerPage;
        const paginatedResults = filteredResults.slice(startIndex, startIndex + resultsPerPage);
        
        setSearchResults(paginatedResults);
        
        // Generate recommendations based on search
        generateRecommendations(searchQuery, selectedCategory);
      } catch (err) {
        console.error('Search error:', err);
        setError('An error occurred while searching. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 800); // Simulate network delay
  };
  
  // Generate recommendations based on search query and filters
  const generateRecommendations = (query, category) => {
    // In a real app, this would call an AI recommendation engine
    // Here we'll just filter the mock data to simulate recommendations
    
    let recommended = [...mockSearchResults];
    
    // If we have a category, prioritize items in that category
    if (category) {
      recommended = recommended.filter(item => item.category === category);
    }
    
    // If we have a query, find related items
    if (query) {
      const queryWords = query.toLowerCase().split(' ');
      recommended = recommended.filter(item => 
        queryWords.some(word => 
          item.title.toLowerCase().includes(word) ||
          item.description.toLowerCase().includes(word) ||
          item.tags.some(tag => tag.toLowerCase().includes(word))
        )
      );
    }
    
    // Sort by popularity (in a real app, this would use actual user data)
    recommended.sort((a, b) => b.popularity - a.popularity);
    
    // Take top 4 recommendations
    setRecommendations(recommended.slice(0, 4));
  };

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
    
    // Initial search to populate results
    handleSearch();
  }, []);
  
  // Trigger search when filters or page changes
  useEffect(() => {
    handleSearch();
  }, [selectedCategory, selectedCondition, selectedLocation, priceRange, sortBy, selectedFeatures, currentPage]);

  // Sample categories
  const categories = [
    'Electronics',
    'Furniture',
    'Clothing',
    'Books',
    'Sports',
    'Toys',
    'Home & Garden',
    'Vehicles',
  ];

  // Sample conditions
  const conditions = [
    'New',
    'Like New',
    'Good',
    'Fair',
    'Poor',
  ];

  // Sample locations
  const locations = [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
  ];

  // Sample features
  const features = [
    'Free Shipping',
    'Local Pickup',
    'Returns Accepted',
    'Top Rated Seller',
    'Quick Shipping',
  ];

  // Sample sort options
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ];

  // Mock search results data
  const mockSearchResults = [
    {
      id: 1,
      title: 'iPhone 12 Pro Max - Excellent Condition',
      description: 'Barely used iPhone 12 Pro Max with 256GB storage. Includes original box and accessories.',
      price: 699.99,
      image: 'https://via.placeholder.com/300x200',
      location: 'New York',
      condition: 'Good',
      category: 'Electronics',
      date: '2023-03-28',
      features: ['Free Shipping', 'Returns Accepted', 'Top Rated Seller'],
      tags: ['apple', 'smartphone', 'iphone', 'mobile'],
      popularity: 95,
    },
    {
      id: 2,
      title: 'Leather Sofa - Brown',
      description: 'Beautiful brown leather sofa in excellent condition. Pet-free and smoke-free home.',
      price: 450,
      image: 'https://via.placeholder.com/300x200',
      location: 'Chicago',
      condition: 'Like New',
      category: 'Furniture',
      date: '2023-03-23',
      features: ['Local Pickup'],
      tags: ['furniture', 'living room', 'couch', 'leather'],
      popularity: 82,
    },
    {
      id: 3,
      title: 'Mountain Bike - Trek',
      description: 'Trek mountain bike with 21 speeds. Recently tuned up and ready to ride.',
      price: 350,
      image: 'https://via.placeholder.com/300x200',
      location: 'Los Angeles',
      condition: 'Good',
      category: 'Sports',
      date: '2023-03-27',
      features: ['Local Pickup', 'Returns Accepted'],
      tags: ['bike', 'bicycle', 'outdoor', 'trek'],
      popularity: 78,
    },
    {
      id: 4,
      title: 'Designer Dress - Size M',
      description: 'Brand new designer dress with tags still attached. Perfect for special occasions.',
      price: 85,
      image: 'https://via.placeholder.com/300x200',
      location: 'Houston',
      condition: 'New',
      category: 'Clothing',
      date: '2023-03-29',
      features: ['Free Shipping', 'Quick Shipping', 'Top Rated Seller'],
      tags: ['dress', 'fashion', 'women', 'designer'],
      popularity: 88,
    },
    {
      id: 5,
      title: 'Gaming Laptop - Alienware',
      description: 'Powerful Alienware gaming laptop with RTX 3080, 32GB RAM, and 1TB SSD.',
      price: 1200,
      image: 'https://via.placeholder.com/300x200',
      location: 'Phoenix',
      condition: 'Good',
      category: 'Electronics',
      date: '2023-03-25',
      features: ['Free Shipping', 'Returns Accepted'],
      tags: ['laptop', 'gaming', 'computer', 'alienware'],
      popularity: 92,
    },
    {
      id: 6,
      title: 'Coffee Table - Glass',
      description: 'Modern glass coffee table with chrome legs. Elegant addition to any living room.',
      price: 120,
      image: 'https://via.placeholder.com/300x200',
      location: 'Philadelphia',
      condition: 'Fair',
      category: 'Furniture',
      date: '2023-03-22',
      features: ['Local Pickup'],
      tags: ['table', 'furniture', 'living room', 'glass'],
      popularity: 75,
    },
    {
      id: 7,
      title: 'Canon EOS DSLR Camera',
      description: 'Canon EOS Rebel T7 DSLR Camera with 18-55mm lens. Perfect for photography enthusiasts.',
      price: 450,
      image: 'https://via.placeholder.com/300x200',
      location: 'New York',
      condition: 'Like New',
      category: 'Electronics',
      date: '2023-03-26',
      features: ['Free Shipping', 'Returns Accepted', 'Top Rated Seller'],
      tags: ['camera', 'photography', 'canon', 'dslr'],
      popularity: 85,
    },
    {
      id: 8,
      title: 'Vintage Vinyl Records Collection',
      description: 'Collection of 50+ classic rock vinyl records from the 70s and 80s. Great condition.',
      price: 200,
      image: 'https://via.placeholder.com/300x200',
      location: 'Chicago',
      condition: 'Good',
      category: 'Books',
      date: '2023-03-24',
      features: ['Local Pickup', 'Top Rated Seller'],
      tags: ['music', 'vinyl', 'records', 'vintage'],
      popularity: 80,
    },
    {
      id: 9,
      title: 'Nike Air Jordan Sneakers',
      description: 'Air Jordan 1 Retro High OG. Size 10. Worn only a few times.',
      price: 180,
      image: 'https://via.placeholder.com/300x200',
      location: 'Los Angeles',
      condition: 'Good',
      category: 'Clothing',
      date: '2023-03-27',
      features: ['Free Shipping', 'Quick Shipping'],
      tags: ['shoes', 'sneakers', 'nike', 'jordan'],
      popularity: 90,
    },
    {
      id: 10,
      title: 'Antique Wooden Bookshelf',
      description: 'Beautiful antique wooden bookshelf with intricate carvings. Solid oak construction.',
      price: 300,
      image: 'https://via.placeholder.com/300x200',
      location: 'Houston',
      condition: 'Fair',
      category: 'Furniture',
      date: '2023-03-21',
      features: ['Local Pickup'],
      tags: ['furniture', 'bookshelf', 'antique', 'wood'],
      popularity: 70,
    },
    {
      id: 11,
      title: 'PlayStation 5 Console',
      description: 'Brand new PS5 console, still sealed in box. Disc version with controller.',
      price: 550,
      image: 'https://via.placeholder.com/300x200',
      location: 'Phoenix',
      condition: 'New',
      category: 'Electronics',
      date: '2023-03-28',
      features: ['Free Shipping', 'Top Rated Seller', 'Quick Shipping'],
      tags: ['gaming', 'playstation', 'console', 'ps5'],
      popularity: 98,
    },
    {
      id: 12,
      title: 'Yoga Mat and Blocks Set',
      description: 'Complete yoga set including premium mat, two blocks, and a strap. Perfect for beginners.',
      price: 45,
      image: 'https://via.placeholder.com/300x200',
      location: 'Philadelphia',
      condition: 'Like New',
      category: 'Sports',
      date: '2023-03-25',
      features: ['Free Shipping', 'Returns Accepted'],
      tags: ['yoga', 'fitness', 'exercise', 'sports'],
      popularity: 75,
    },
  ];

  // Render filter section
  const renderFilters = () => (
    <Box sx={{ p: isMobile ? 2 : 0 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>

      {/* Categories filter */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            mb: 1,
          }}
          onClick={() => handleToggleFilter('categories')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Category fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Categories</Typography>
          </Box>
          {expandedFilters.categories ? <ExpandLess /> : <ExpandMore />}
        </Box>
        <Collapse in={expandedFilters.categories}>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>Select Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Select Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Collapse>
      </Box>

      {/* Price range filter */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            mb: 1,
          }}
          onClick={() => handleToggleFilter('price')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachMoney fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Price Range</Typography>
          </Box>
          {expandedFilters.price ? <ExpandLess /> : <ExpandMore />}
        </Box>
        <Collapse in={expandedFilters.price}>
          <Box sx={{ px: 1, mt: 2 }}>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={2000}
              step={10}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2">${priceRange[0]}</Typography>
              <Typography variant="body2">${priceRange[1]}</Typography>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Location filter */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            mb: 1,
          }}
          onClick={() => handleToggleFilter('location')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOn fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Location</Typography>
          </Box>
          {expandedFilters.location ? <ExpandLess /> : <ExpandMore />}
        </Box>
        <Collapse in={expandedFilters.location}>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>Select Location</InputLabel>
            <Select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              label="Select Location"
            >
              <MenuItem value="">All Locations</MenuItem>
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Collapse>
      </Box>

      {/* Condition filter */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            mb: 1,
          }}
          onClick={() => handleToggleFilter('condition')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Star fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Condition</Typography>
          </Box>
          {expandedFilters.condition ? <ExpandLess /> : <ExpandMore />}
        </Box>
        <Collapse in={expandedFilters.condition}>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>Select Condition</InputLabel>
            <Select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              label="Select Condition"
            >
              <MenuItem value="">All Conditions</MenuItem>
              {conditions.map((condition) => (
                <MenuItem key={condition} value={condition}>
                  {condition}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Collapse>
      </Box>

      {/* Features filter */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            mb: 1,
          }}
          onClick={() => handleToggleFilter('features')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Features</Typography>
          </Box>
          {expandedFilters.features ? <ExpandLess /> : <ExpandMore />}
        </Box>
        <Collapse in={expandedFilters.features}>
          <Box sx={{ mt: 1 }}>
            {features.map((feature) => (
              <Chip
                key={feature}
                label={feature}
                clickable
                onClick={() => handleFeatureToggle(feature)}
                color={selectedFeatures.includes(feature) ? 'primary' : 'default'}
                sx={{ m: 0.5 }}
                size="small"
              />
            ))}
          </Box>
        </Collapse>
      </Box>

      {/* Apply filters button (mobile only) */}
      {isMobile && (
        <Button
          variant="contained"
          fullWidth
          onClick={toggleFilterDrawer}
          sx={{ mt: 2 }}
        >
          Apply Filters
        </Button>
      )}
    </Box>
  );

  // Render search results
  const renderSearchResults = () => (
    <Box>
      {/* Search header with count and sort */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <Typography variant="h6" sx={{ mb: isMobile ? 1 : 0 }}>
          {totalResults} Results
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
          {isMobile && (
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={toggleFilterDrawer}
              sx={{ mr: 1, flexGrow: 1 }}
              size="small"
            >
              Filters
            </Button>
          )}

          <FormControl size="small" sx={{ width: isMobile ? '100%' : 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
              startAdornment={
                <InputAdornment position="start">
                  <Sort fontSize="small" />
                </InputAdornment>
              }
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading indicator */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Results grid */}
          {searchResults.length > 0 ? (
            <Grid container spacing={2}>
              {searchResults.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                      cursor: 'pointer',
                    }}
                  >
                    <CardMedia
                      component="img"
                      height={isMobile ? 140 : 160}
                      image={item.image}
                      alt={item.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography variant="h6" component="div" noWrap>
                        {item.title}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', my: 1 }}>
                        ${item.price.toFixed(2)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {item.location}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        <Chip label={item.category} size="small" />
                        <Chip label={item.condition} size="small" variant="outlined" />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Listed {new Date(item.date).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No results found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria or filters
              </Typography>
            </Paper>
          )}

          {/* Pagination */}
          {totalResults > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(totalResults / 6)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
                siblingCount={isMobile ? 0 : 1}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );

  // Render recommendations
  const renderRecommendations = () => {
    if (!showRecommendations || recommendations.length === 0) return null;

    return (
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Recommended For You</Typography>
          <Button 
            size="small" 
            onClick={() => setShowRecommendations(false)}
            startIcon={<Close fontSize="small" />}
          >
            Hide
          </Button>
        </Box>
        <Grid container spacing={2}>
          {recommendations.map((item) => (
            <Grid item xs={6} sm={3} key={`rec-${item.id}`}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  cursor: 'pointer',
                }}
              >
                <CardMedia
                  component="img"
                  height={120}
                  image={item.image}
                  alt={item.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="subtitle2" noWrap>
                    {item.title}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                    ${item.price.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Render recent searches
  const renderRecentSearches = () => {
    if (recentSearches.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Recent Searches
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {recentSearches.map((search, index) => (
            <Chip
              key={index}
              label={search.query}
              size="small"
              onClick={() => {
                setSearchQuery(search.query);
                handleSearch();
              }}
              onDelete={() => {
                const newSearches = recentSearches.filter((_, i) => i !== index);
                setRecentSearches(newSearches);
                localStorage.setItem('recentSearches', JSON.stringify(newSearches));
              }}
            />
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <ResponsiveLayout>
      <Box>
        {/* Search header */}
        <Typography variant="h4" component="h1" gutterBottom>
          Find Items
        </Typography>

        {/* Search bar */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 1 }}
            />
            <Button 
              variant="contained" 
              onClick={handleSearch}
              disabled={isLoading}
              sx={{ minWidth: 100, height: 40 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Box>

          {renderRecentSearches()}

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {categories.slice(0, isMobile ? 4 : 8).map((category) => (
              <Chip
                key={category}
                label={category}
                clickable
                onClick={() => setSelectedCategory(category)}
                color={selectedCategory === category ? 'primary' : 'default'}
                size={isMobile ? 'small' : 'medium'}
              />
            ))}
          </Box>
        </Paper>

        {/* Recommendations */}
        {renderRecommendations()}

        {/* Main content */}
        <Grid container spacing={3}>
          {/* Filters - desktop and tablet */}
          {!isMobile && (
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                {renderFilters()}
              </Paper>
            </Grid>
          )}

          {/* Search results */}
          <Grid item xs={12} md={!isMobile ? 9 : 12}>
            {renderSearchResults()}
          </Grid>
        </Grid>

        {/* Filter drawer for mobile */}
        <Drawer
          anchor="left"
          open={filterDrawerOpen}
          onClose={toggleFilterDrawer}
          PaperProps={{
            sx: { width: '80%', maxWidth: 300 },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={toggleFilterDrawer}>
              <Close />
            </IconButton>
          </Box>
          <Divider />
          {renderFilters()}
        </Drawer>
      </Box>
    </ResponsiveLayout>
  );
};

export default AdvancedSearchPage;

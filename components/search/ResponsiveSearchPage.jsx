import React from 'react';
import { Box, Typography, TextField, InputAdornment, IconButton, Grid, Card, CardContent, CardMedia, Chip, Button, Pagination, FormControl, InputLabel, Select, MenuItem, Slider, Divider, useMediaQuery, useTheme, Paper, Drawer, List, ListItem, ListItemText, ListItemIcon, Collapse } from '@mui/material';
import { Search as SearchIcon, FilterList, Close, ExpandMore, ExpandLess, LocationOn, Category, AttachMoney, Star, Sort } from '@mui/icons-material';
import { useResponsive } from '@/lib/responsive/ResponsiveContext';
import { useState } from 'react';

const ResponsiveSearchPage = () => {
  const { isMobile, isTablet } = useResponsive();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    categories: true,
    price: true,
    location: true,
    condition: true,
  });
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest');

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

  // Sample sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'relevance', label: 'Relevance' },
  ];

  // Sample search results
  const searchResults = [
    {
      id: 1,
      title: 'iPhone 12 Pro Max - Excellent Condition',
      price: 699.99,
      image: 'https://via.placeholder.com/300x200',
      location: 'New York',
      condition: 'Good',
      category: 'Electronics',
      date: '2 days ago',
    },
    {
      id: 2,
      title: 'Leather Sofa - Brown',
      price: 450,
      image: 'https://via.placeholder.com/300x200',
      location: 'Chicago',
      condition: 'Like New',
      category: 'Furniture',
      date: '1 week ago',
    },
    {
      id: 3,
      title: 'Mountain Bike - Trek',
      price: 350,
      image: 'https://via.placeholder.com/300x200',
      location: 'Los Angeles',
      condition: 'Good',
      category: 'Sports',
      date: '3 days ago',
    },
    {
      id: 4,
      title: 'Designer Dress - Size M',
      price: 85,
      image: 'https://via.placeholder.com/300x200',
      location: 'Houston',
      condition: 'New',
      category: 'Clothing',
      date: '1 day ago',
    },
    {
      id: 5,
      title: 'Gaming Laptop - Alienware',
      price: 1200,
      image: 'https://via.placeholder.com/300x200',
      location: 'Phoenix',
      condition: 'Good',
      category: 'Electronics',
      date: '5 days ago',
    },
    {
      id: 6,
      title: 'Coffee Table - Glass',
      price: 120,
      image: 'https://via.placeholder.com/300x200',
      location: 'Philadelphia',
      condition: 'Fair',
      category: 'Furniture',
      date: '1 week ago',
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
          {searchResults.length} Results
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

      {/* Results grid */}
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
                  Listed {item.date}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={10}
          color="primary"
          size={isMobile ? 'small' : 'medium'}
          siblingCount={isMobile ? 0 : 1}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
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
        <TextField
          fullWidth
          placeholder="Search for items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
          sx={{ mb: 2 }}
        />

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
  );
};

export default ResponsiveSearchPage;

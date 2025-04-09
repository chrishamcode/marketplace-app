import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Grid, Paper, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, Divider, CircularProgress } from '@mui/material';
import { Edit, Delete, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const EditListingForm = ({ listingId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    condition: '',
    location: '',
  });
  
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
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
        
        // Set form data
        setFormData({
          title: data.listing.title,
          description: data.listing.description,
          price: data.listing.price,
          category: data.listing.category,
          subcategory: data.listing.subcategory || '',
          condition: data.listing.condition,
          location: data.listing.location,
        });
        
        // Set existing images
        if (data.listing.images && data.listing.images.length > 0) {
          setExistingImages(data.listing.images);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching listing:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load listing. Please try again.'
        });
        setIsLoading(false);
      }
    };
    
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages(prev => [...prev, ...files]);
    }
  };
  
  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingImage = (imageId) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
    setImagesToDelete(prev => [...prev, imageId]);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (existingImages.length === 0 && images.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create form data for submission
      const formDataToSubmit = new FormData();
      
      // Add listing details
      Object.keys(formData).forEach(key => {
        formDataToSubmit.append(key, formData[key]);
      });
      
      // Add images to delete
      if (imagesToDelete.length > 0) {
        formDataToSubmit.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }
      
      // Add new images
      images.forEach((image, index) => {
        formDataToSubmit.append(`images`, image);
      });
      
      // Submit to API
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        body: formDataToSubmit,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update listing');
      }
      
      // Show success message
      setMessage({
        type: 'success',
        text: 'Listing updated successfully!'
      });
      
      // Redirect to listing page after a delay
      setTimeout(() => {
        router.push(`/listings/${listingId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating listing:', error);
      setMessage({
        type: 'error',
        text: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
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
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, my: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Edit Listing
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />}
            onClick={() => router.push(`/listings/${listingId}`)}
          >
            Back to Listing
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={4}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={!!errors.price}
                helperText={errors.price}
                InputProps={{
                  startAdornment: '$',
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.condition} required>
                <InputLabel>Condition</InputLabel>
                <Select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  label="Condition"
                >
                  <MenuItem value="new_in_box">New In Box</MenuItem>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="like_new">Like New</MenuItem>
                  <MenuItem value="excellent">Excellent</MenuItem>
                  <MenuItem value="very_good">Very Good</MenuItem>
                  <MenuItem value="good">Good</MenuItem>
                  <MenuItem value="fair">Fair</MenuItem>
                  <MenuItem value="acceptable">Acceptable</MenuItem>
                  <MenuItem value="poor">Poor</MenuItem>
                </Select>
                {errors.condition && (
                  <Typography variant="caption" color="error">
                    {errors.condition}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.category} required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Furniture">Furniture</MenuItem>
                  <MenuItem value="Fashion">Fashion</MenuItem>
                  <MenuItem value="Media">Media</MenuItem>
                  <MenuItem value="Home & Garden">Home & Garden</MenuItem>
                  <MenuItem value="Sports & Outdoors">Sports & Outdoors</MenuItem>
                  <MenuItem value="Toys & Games">Toys & Games</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {errors.category && (
                  <Typography variant="caption" color="error">
                    {errors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                error={!!errors.location}
                helperText={errors.location}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Images
              </Typography>
              
              {/* Existing images */}
              {existingImages.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Current Images
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {existingImages.map((image) => (
                      <Grid item key={image.id} xs={6} sm={4} md={3}>
                        <Box
                          sx={{
                            position: 'relative',
                            paddingTop: '100%',
                            borderRadius: 1,
                            overflow: 'hidden',
                            boxShadow: 1,
                          }}
                        >
                          <img
                            src={image.url}
                            alt={`Listing image`}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <Button
                            size="small"
                            color="error"
                            variant="contained"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              minWidth: 'auto',
                              width: 24,
                              height: 24,
                              p: 0,
                            }}
                            onClick={() => removeExistingImage(image.id)}
                          >
                            ×
                          </Button>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
              
              {/* New images */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Add New Images
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                  >
                    Add Images
                  </Button>
                </label>
                
                {errors.images && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                    {errors.images}
                  </Typography>
                )}
              </Box>
              
              {images.length > 0 && (
                <Grid container spacing={2}>
                  {images.map((image, index) => (
                    <Grid item key={index} xs={6} sm={4} md={3}>
                      <Box
                        sx={{
                          position: 'relative',
                          paddingTop: '100%',
                          borderRadius: 1,
                          overflow: 'hidden',
                          boxShadow: 1,
                        }}
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`New listing image ${index + 1}`}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <Button
                          size="small"
                          color="error"
                          variant="contained"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            minWidth: 'auto',
                            width: 24,
                            height: 24,
                            p: 0,
                          }}
                          onClick={() => removeNewImage(index)}
                        >
                          ×
                        </Button>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => router.push(`/listings/${listingId}`)}
                  sx={{ mr: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  sx={{ minWidth: 120 }}
                >
                  {isSubmitting ? 'Updating...' : 'Update Listing'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Snackbar
        open={!!message.text}
        autoHideDuration={6000}
        onClose={() => setMessage({ type: '', text: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setMessage({ type: '', text: '' })} 
          severity={message.type} 
          sx={{ width: '100%' }}
        >
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditListingForm;

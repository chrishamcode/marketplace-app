import React, { useState } from 'react';
import { Box, Button, Container, Grid, Paper, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, Divider } from '@mui/material';
import { Add, PhotoCamera } from '@mui/icons-material';
import PhotoToPostComponent from '@/components/listings/PhotoToPostComponent';

const CreateListingForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    condition: 'good',
    location: '',
  });
  
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPhotoToPost, setShowPhotoToPost] = useState(false);
  
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
  
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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
    
    if (images.length === 0) {
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
      
      // Add images
      images.forEach((image, index) => {
        formDataToSubmit.append(`images`, image);
      });
      
      // Submit to API
      const response = await fetch('/api/listings', {
        method: 'POST',
        body: formDataToSubmit,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create listing');
      }
      
      // Show success message
      setMessage({
        type: 'success',
        text: 'Listing created successfully!'
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        subcategory: '',
        condition: 'good',
        location: '',
      });
      setImages([]);
      
      // Redirect to listing page after a delay
      setTimeout(() => {
        window.location.href = `/listings/${data.listing.id}`;
      }, 2000);
      
    } catch (error) {
      console.error('Error creating listing:', error);
      setMessage({
        type: 'error',
        text: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePhotoToPostToggle = () => {
    setShowPhotoToPost(prev => !prev);
  };
  
  const handleListingGenerated = (listingData) => {
    // Update form with data from Photo to Post
    setFormData(prev => ({
      ...prev,
      title: listingData.title || prev.title,
      description: listingData.description || prev.description,
      price: listingData.price || prev.price,
      category: listingData.category || prev.category,
      subcategory: listingData.subcategory || prev.subcategory,
      condition: listingData.condition || prev.condition,
    }));
    
    // Add image
    if (listingData.image) {
      setImages(prev => [...prev, listingData.image]);
    }
    
    // Hide Photo to Post component
    setShowPhotoToPost(false);
  };
  
  // If showing Photo to Post component
  if (showPhotoToPost) {
    return (
      <PhotoToPostComponent 
        onListingGenerated={handleListingGenerated} 
        onCancel={() => setShowPhotoToPost(false)} 
      />
    );
  }
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, my: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Create New Listing
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PhotoCamera />}
            onClick={handlePhotoToPostToggle}
          >
            Create from Photo
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
              
              <Box sx={{ mb: 2 }}>
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
                    startIcon={<Add />}
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
                          alt={`Listing image ${index + 1}`}
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
                          onClick={() => removeImage(index)}
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
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  sx={{ minWidth: 120 }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Listing'}
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

export default CreateListingForm;

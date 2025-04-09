import React, { useState, useRef } from 'react';
import { Box, Button, CircularProgress, Container, Grid, Paper, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import { AddAPhoto, PhotoLibrary, Close, Check, Delete, MonetizationOn, Category, Description, Title } from '@mui/icons-material';

const PhotoToPostComponent = ({ onListingGenerated, onCancel }) => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(file);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    // In a real implementation, this would open the camera
    // For now, we'll just trigger the file input
    fileInputRef.current.click();
  };

  // Process image with AI
  const processImage = async () => {
    if (!image) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', image);

      // Send to API
      const response = await fetch('/api/listings/photo-to-post', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();

      if (data.success && data.detectedObjects && data.detectedObjects.length > 0) {
        setDetectedObjects(data.detectedObjects);
        setSelectedObject(data.detectedObjects[0]);
      } else {
        setError('No objects detected in the image. Please try a different image.');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle object selection
  const handleObjectSelect = (object) => {
    setSelectedObject(object);
  };

  // Handle field update
  const handleFieldUpdate = (field, value) => {
    setSelectedObject({
      ...selectedObject,
      [field]: value
    });
  };

  // Handle listing creation
  const handleCreateListing = () => {
    if (selectedObject) {
      onListingGenerated({
        title: selectedObject.title,
        description: selectedObject.description,
        price: selectedObject.price,
        category: selectedObject.category,
        subcategory: selectedObject.subcategory,
        condition: selectedObject.condition,
        brand: selectedObject.brand,
        image: selectedObject.processedImageBuffer ? 
          new Blob([selectedObject.processedImageBuffer], { type: 'image/jpeg' }) : 
          image
      });
    }
  };

  // Format condition for display
  const formatCondition = (condition) => {
    return condition
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, my: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Create Listing from Photo
        </Typography>

        {!image ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<AddAPhoto />}
                  onClick={handleCameraCapture}
                  size="large"
                >
                  Take Photo
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<PhotoLibrary />}
                  onClick={() => fileInputRef.current.click()}
                  size="large"
                >
                  Upload Photo
                </Button>
              </Grid>
            </Grid>
          </Box>
        ) : !isProcessing && detectedObjects.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
            />
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={processImage}
                sx={{ mr: 1 }}
              >
                Analyze Photo
              </Button>
              <Button
                variant="outlined"
                startIcon={<Close />}
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : isProcessing ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Analyzing your photo...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We're detecting objects, assessing condition, and estimating value.
            </Typography>
          </Box>
        ) : detectedObjects.length > 0 && selectedObject ? (
          <Grid container spacing={3}>
            {/* Object selection sidebar for multiple objects */}
            {detectedObjects.length > 1 && (
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Detected Items
                </Typography>
                <Paper variant="outlined" sx={{ p: 1, maxHeight: '400px', overflow: 'auto' }}>
                  {detectedObjects.map((object, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 1,
                        mb: 1,
                        border: '1px solid',
                        borderColor: selectedObject === object ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      onClick={() => handleObjectSelect(object)}
                    >
                      <Typography variant="body2" noWrap>
                        {object.title || object.className}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            )}

            {/* Main content area */}
            <Grid item xs={12} md={detectedObjects.length > 1 ? 9 : 12}>
              <Grid container spacing={3}>
                {/* Image preview */}
                <Grid item xs={12} md={4}>
                  <img
                    src={selectedObject.processedImageBuffer ? 
                      URL.createObjectURL(new Blob([selectedObject.processedImageBuffer])) : 
                      imagePreview}
                    alt="Detected item"
                    style={{ width: '100%', objectFit: 'contain', borderRadius: '4px' }}
                  />
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Condition: {formatCondition(selectedObject.condition)}
                    </Typography>
                    {selectedObject.brand !== 'unknown' && (
                      <Typography variant="body2" color="text.secondary">
                        Brand: {selectedObject.brand}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Listing details form */}
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={selectedObject.title}
                    onChange={(e) => handleFieldUpdate('title', e.target.value)}
                    InputProps={{
                      startAdornment: <Title sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Description"
                    value={selectedObject.description}
                    onChange={(e) => handleFieldUpdate('description', e.target.value)}
                    multiline
                    rows={4}
                    InputProps={{
                      startAdornment: <Description sx={{ mr: 1, mt: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{ mb: 2 }}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Price"
                        type="number"
                        value={selectedObject.price}
                        onChange={(e) => handleFieldUpdate('price', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <MonetizationOn sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Condition</InputLabel>
                        <Select
                          value={selectedObject.condition}
                          onChange={(e) => handleFieldUpdate('condition', e.target.value)}
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
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={selectedObject.category}
                          onChange={(e) => handleFieldUpdate('category', e.target.value)}
                          label="Category"
                          InputProps={{
                            startAdornment: <Category sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
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
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Subcategory"
                        value={selectedObject.subcategory || ''}
                        onChange={(e) => handleFieldUpdate('subcategory', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Action buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Delete />}
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                        setDetectedObjects([]);
                        setSelectedObject(null);
                      }}
                      sx={{ mr: 1 }}
                    >
                      Start Over
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={onCancel}
                      sx={{ mr: 1 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Check />}
                      onClick={handleCreateListing}
                    >
                      Create Listing
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        ) : null}
      </Paper>

      {/* Error message */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PhotoToPostComponent;

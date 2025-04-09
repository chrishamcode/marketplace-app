import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, CircularProgress, Container, Grid, Paper, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, Divider, IconButton, Card, CardContent, CardMedia, CardActions, Chip } from '@mui/material';
import { AddAPhoto, PhotoLibrary, Close, Check, Delete, MonetizationOn, Category, Description, Title, Collections, FilterNone, ViewComfy, Star, StarHalf, StarBorder } from '@mui/icons-material';

const EnhancedPhotoToPostComponent = ({ onListingGenerated, onCancel }) => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [error, setError] = useState(null);
  const [cameraMode, setCameraMode] = useState('standard');
  const [viewMode, setViewMode] = useState('grid');
  const [guidance, setGuidance] = useState('Center item in frame for best results');
  const fileInputRef = useRef(null);
  const [lightLevel, setLightLevel] = useState('normal');
  const [isBlurry, setIsBlurry] = useState(false);
  const [isMultipleItems, setIsMultipleItems] = useState(false);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(file);
        setImagePreview(reader.result);
        
        // Simulate environment detection
        detectEnvironment(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate environment detection for camera guidance
  const detectEnvironment = (imageData) => {
    // In a real implementation, this would analyze the image
    // For demo purposes, we'll randomly set these values
    const randomLight = Math.random();
    if (randomLight < 0.2) {
      setLightLevel('low');
      setGuidance('Low light detected. Consider using flash or moving to a brighter area.');
    } else {
      setLightLevel('normal');
    }

    const randomBlur = Math.random();
    setIsBlurry(randomBlur < 0.3);
    
    const randomMultiple = Math.random();
    setIsMultipleItems(randomMultiple < 0.5);
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
        
        // If multiple objects detected, don't auto-select any
        // If single object, select it automatically
        if (data.detectedObjects.length === 1) {
          setSelectedObjects([data.detectedObjects[0].itemIndex]);
        }
        
        // Update multiple items flag based on actual detection
        setIsMultipleItems(data.detectedObjects.length > 1);
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
  const handleObjectSelect = (itemIndex) => {
    setSelectedObjects(prev => {
      if (prev.includes(itemIndex)) {
        return prev.filter(idx => idx !== itemIndex);
      } else {
        return [...prev, itemIndex];
      }
    });
  };

  // Handle field update for a specific object
  const handleFieldUpdate = (itemIndex, field, value) => {
    setDetectedObjects(prev => 
      prev.map(obj => 
        obj.itemIndex === itemIndex 
          ? { ...obj, [field]: value } 
          : obj
      )
    );
  };

  // Handle listing creation
  const handleCreateListing = () => {
    if (selectedObjects.length === 0) {
      setError('Please select at least one item to create a listing.');
      return;
    }

    // If only one object is selected, create a single listing
    if (selectedObjects.length === 1) {
      const selectedObject = detectedObjects.find(obj => obj.itemIndex === selectedObjects[0]);
      
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
    } 
    // If multiple objects are selected, create multiple listings
    else {
      const selectedItems = detectedObjects.filter(obj => selectedObjects.includes(obj.itemIndex));
      
      // In a real implementation, this would handle batch creation
      // For now, we'll just use the first selected item
      if (selectedItems.length > 0) {
        onListingGenerated({
          title: selectedItems[0].title,
          description: selectedItems[0].description + "\n\n(Note: Multiple items were detected in your photo. You can create additional listings for the other items.)",
          price: selectedItems[0].price,
          category: selectedItems[0].category,
          subcategory: selectedItems[0].subcategory,
          condition: selectedItems[0].condition,
          brand: selectedItems[0].brand,
          image: selectedItems[0].processedImageBuffer ? 
            new Blob([selectedItems[0].processedImageBuffer], { type: 'image/jpeg' }) : 
            image
        });
      }
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

  // Get condition icon based on score
  const getConditionIcon = (conditionScore) => {
    if (conditionScore >= 80) return <Star color="primary" />;
    if (conditionScore >= 50) return <StarHalf color="primary" />;
    return <StarBorder color="primary" />;
  };

  // Camera overlay component
  const CameraOverlay = () => (
    <Box 
      sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 10, 
        pointerEvents: 'none' 
      }}
    >
      {/* Frame guide */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: '10%', 
          left: '10%', 
          right: '10%', 
          bottom: '10%', 
          border: '2px dashed #1976d2', 
          borderRadius: '8px',
          opacity: 0.7
        }} 
      />
      
      {/* Top guidance text */}
      <Typography 
        variant="body1" 
        sx={{ 
          position: 'absolute', 
          top: '5%', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          color: 'white', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          padding: '4px 8px', 
          borderRadius: '4px',
          textAlign: 'center'
        }}
      >
        {guidance}
      </Typography>
      
      {/* Warning indicators */}
      {lightLevel === 'low' && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '5%', 
            right: '5%', 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            padding: '4px 8px', 
            borderRadius: '4px'
          }}
        >
          <Typography variant="body2" sx={{ color: 'white' }}>
            Low light
          </Typography>
        </Box>
      )}
      
      {isBlurry && (
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: '15%', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            padding: '4px 8px', 
            borderRadius: '4px'
          }}
        >
          <Typography variant="body2" sx={{ color: 'white' }}>
            Hold steady for a clearer photo
          </Typography>
        </Box>
      )}
      
      {isMultipleItems && (
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: '5%', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            padding: '4px 8px', 
            borderRadius: '4px'
          }}
        >
          <Collections sx={{ color: '#90caf9', marginRight: 1 }} />
          <Typography variant="body2" sx={{ color: 'white' }}>
            Multiple items detected
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Camera mode selector component
  const CameraModeSelector = () => (
    <Paper 
      elevation={3} 
      sx={{ 
        position: 'absolute', 
        bottom: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 20, 
        borderRadius: '24px',
        padding: '4px'
      }}
    >
      <Box sx={{ display: 'flex', padding: '4px' }}>
        <Button
          variant={cameraMode === 'standard' ? "contained" : "text"}
          color="primary"
          onClick={() => setCameraMode('standard')}
          sx={{ borderRadius: '20px', mx: 0.5 }}
        >
          Standard
        </Button>
        <Button
          variant={cameraMode === 'closeup' ? "contained" : "text"}
          color="primary"
          onClick={() => setCameraMode('closeup')}
          sx={{ borderRadius: '20px', mx: 0.5 }}
        >
          Close-up
        </Button>
        <Button
          variant={cameraMode === 'wide' ? "contained" : "text"}
          color="primary"
          onClick={() => setCameraMode('wide')}
          sx={{ borderRadius: '20px', mx: 0.5 }}
        >
          Wide
        </Button>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg">
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
            
            <Typography variant="body1" sx={{ mt: 4, mb: 2 }}>
              Take a photo of your item or upload an existing one to create a listing.
            </Typography>
            
            <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
              <Typography variant="subtitle1" gutterBottom>
                Tips for best results:
              </Typography>
              <ul>
                <li>Ensure good lighting to show item details clearly</li>
                <li>Position the item against a plain background</li>
                <li>Capture the entire item in the frame</li>
                <li>For multiple items, space them apart slightly</li>
                <li>Hold the camera steady to avoid blurry images</li>
              </ul>
            </Box>
          </Box>
        ) : !isProcessing && detectedObjects.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 2, position: 'relative' }}>
            <Box sx={{ position: 'relative', maxWidth: 600, mx: 'auto' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
              />
              <CameraOverlay />
            </Box>
            
            <CameraModeSelector />
            
            <Box sx={{ mt: 3 }}>
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              We're detecting objects, assessing condition, and estimating value.
            </Typography>
            <Box sx={{ mt: 3, maxWidth: 400, mx: 'auto' }}>
              <Box sx={{ width: '100%', height: 8, bgcolor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                <Box 
                  sx={{ 
                    width: '60%', 
                    height: '100%', 
                    bgcolor: 'primary.main',
                    animation: 'progress 2s infinite linear',
                    '@keyframes progress': {
                      '0%': { transform: 'translateX(-100%)' },
                      '100%': { transform: 'translateX(100%)' }
                    }
                  }} 
                />
              </Box>
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                This may take a few moments depending on the complexity of the image
              </Typography>
            </Box>
          </Box>
        ) : detectedObjects.length > 0 ? (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {detectedObjects.length === 1 
                  ? '1 Item Detected' 
                  : `${detectedObjects.length} Items Detected`}
              </Typography>
              <Box>
                <IconButton 
                  color={viewMode === 'grid' ? 'primary' : 'default'} 
                  onClick={() => setViewMode('grid')}
                >
                  <ViewComfy />
                </IconButton>
                <IconButton 
                  color={viewMode === 'list' ? 'primary' : 'default'} 
                  onClick={() => setViewMode('list')}
                >
                  <FilterNone />
                </IconButton>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {detectedObjects.map((object) => (
                  <Grid item key={object.itemIndex} xs={12} sm={6} md={4}>
                    <Card 
                      elevation={3} 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: selectedObjects.includes(object.itemIndex) 
                          ? '2px solid #1976d2' 
                          : 'none',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6
                        }
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height={200}
                          image={object.processedImageBuffer 
                            ? URL.createObjectURL(new Blob([object.processedImageBuffer])) 
                            : imagePreview}
                          alt={object.title || object.className}
                          sx={{ objectFit: 'contain', backgroundColor: '#f5f5f5' }}
                        />
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                          }}
                          onClick={() => handleObjectSelect(object.itemIndex)}
                          color={selectedObjects.includes(object.itemIndex) ? "primary" : "default"}
                        >
                          {selectedObjects.includes(object.itemIndex) ? <Check /> : <AddAPhoto />}
                        </IconButton>
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div" gutterBottom>
                          {object.title || `${object.className} for Sale`}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <MonetizationOn color="success" sx={{ mr: 1 }} />
                          <Typography variant="h6" color="text.primary">
                            ${object.price}
                          </Typography>
                          <Chip 
                            label={object.priceConfidence || 'medium'} 
                            size="small" 
                            color={
                              object.priceConfidence === 'high' ? 'success' : 
                              object.priceConfidence === 'low' ? 'error' : 
                              'primary'
                            }
                            sx={{ ml: 1 }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getConditionIcon(object.conditionScore)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {formatCondition(object.condition)}
                          </Typography>
                        </Box>
                        
                        {object.brand !== 'unknown' && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Brand: {object.brand}
                          </Typography>
                        )}
                        
                        <Typography variant="body2" color="text.secondary">
                          Category: {object.category}
                        </Typography>
                      </CardContent>
                      
                      <CardActions>
                        <Button 
                          size="small" 
                          onClick={() => handleObjectSelect(object.itemIndex)}
                          color={selectedObjects.includes(object.itemIndex) ? "primary" : "default"}
                          variant={selectedObjects.includes(object.itemIndex) ? "contained" : "outlined"}
                          fullWidth
                        >
                          {selectedObjects.includes(object.itemIndex) ? 'Selected' : 'Select'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box>
                {detectedObjects.map((object) => (
                  <Paper
                    key={object.itemIndex}
                    elevation={2}
                    sx={{
                      p: 2,
                      mb: 2,
                      display: 'flex',
                      border: selectedObjects.includes(object.itemIndex) 
                        ? '2px solid #1976d2' 
                        : 'none',
                    }}
                  >
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        flexShrink: 0,
                        mr: 2,
                        position: 'relative',
                      }}
                    >
                      <img
                        src={object.processedImageBuffer 
                          ? URL.createObjectURL(new Blob([object.processedImageBuffer])) 
                          : imagePreview}
                        alt={object.title || object.className}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          backgroundColor: '#f5f5f5',
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" component="div">
                        {object.title || `${object.className} for Sale`}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" color="primary" sx={{ mr: 1 }}>
                          ${object.price}
                        </Typography>
                        <Chip 
                          label={formatCondition(object.condition)} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        {object.brand !== 'unknown' && (
                          <Chip 
                            label={object.brand} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {object.description}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        variant={selectedObjects.includes(object.itemIndex) ? "contained" : "outlined"}
                        color="primary"
                        onClick={() => handleObjectSelect(object.itemIndex)}
                        size="small"
                      >
                        {selectedObjects.includes(object.itemIndex) ? 'Selected' : 'Select'}
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<Delete />}
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                  setDetectedObjects([]);
                  setSelectedObjects([]);
                }}
              >
                Start Over
              </Button>
              
              <Box>
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
                  disabled={selectedObjects.length === 0}
                >
                  Create {selectedObjects.length > 1 ? 'Listings' : 'Listing'}
                </Button>
              </Box>
            </Box>
          </Box>
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

export default EnhancedPhotoToPostComponent;

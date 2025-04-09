import React, { useState } from 'react';
import { Box, Button, Container, Grid, Paper, Typography, Tabs, Tab, Divider } from '@mui/material';
import { Add, PhotoCamera } from '@mui/icons-material';
import CreateListingForm from '@/components/listings/CreateListingForm';
import EnhancedPhotoToPostComponent from '@/components/listings/EnhancedPhotoToPostComponent';

const ListingCreationPage = () => {
  const [creationMethod, setCreationMethod] = useState('form');
  const [generatedListingData, setGeneratedListingData] = useState(null);
  
  const handleTabChange = (event, newValue) => {
    setCreationMethod(newValue);
  };
  
  const handleListingGenerated = (listingData) => {
    setGeneratedListingData(listingData);
    setCreationMethod('form');
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Listing
        </Typography>
        
        <Paper elevation={3} sx={{ mb: 3 }}>
          <Tabs
            value={creationMethod}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab 
              value="form" 
              label="Standard Form" 
              icon={<Add />} 
              iconPosition="start"
            />
            <Tab 
              value="photo" 
              label="Create from Photo" 
              icon={<PhotoCamera />} 
              iconPosition="start"
            />
          </Tabs>
        </Paper>
        
        {creationMethod === 'form' ? (
          <CreateListingForm initialData={generatedListingData} />
        ) : (
          <EnhancedPhotoToPostComponent 
            onListingGenerated={handleListingGenerated}
            onCancel={() => setCreationMethod('form')}
          />
        )}
      </Box>
    </Container>
  );
};

export default ListingCreationPage;

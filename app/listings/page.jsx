import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Grid, Paper, Typography, Tabs, Tab, Divider } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import ListingManagementDashboard from '@/components/listings/ListingManagementDashboard';
import { useRouter } from 'next/navigation';

const ListingsPage = () => {
  const router = useRouter();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Marketplace Listings
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/listings/create')}
          >
            Create New Listing
          </Button>
        </Box>
        
        <ListingManagementDashboard />
      </Box>
    </Container>
  );
};

export default ListingsPage;

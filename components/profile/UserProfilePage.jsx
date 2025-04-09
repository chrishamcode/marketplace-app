import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Paper, Grid, Button, Tabs, Tab, Rating, Divider, Chip, Card, CardContent, List, ListItem, ListItemAvatar, ListItemText, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress, Alert, Snackbar } from '@mui/material';
import { Edit, LocationOn, VerifiedUser, Star, StarBorder, ShoppingBag, Favorite, Message, Settings, Close, PhotoCamera, Save } from '@mui/icons-material';
import { useResponsive } from '@/lib/responsive/ResponsiveContext';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const UserProfilePage = ({ userId }) => {
  const { isMobile, isTablet } = useResponsive();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API call with timeout
        setTimeout(() => {
          // For demo purposes, we'll use mock data
          const mockUserProfile = {
            id: userId || 'current-user',
            name: 'John Doe',
            email: 'john.doe@example.com',
            image: 'https://via.placeholder.com/150',
            coverImage: 'https://via.placeholder.com/1200x300',
            bio: 'Passionate about finding unique items and giving them a second life. I love vintage electronics and collectibles.',
            location: 'New York, NY',
            joinDate: '2022-05-15',
            isVerified: true,
            phone: '(555) 123-4567',
            ratings: {
              average: 4.8,
              count: 47,
              breakdown: {
                5: 35,
                4: 10,
                3: 2,
                2: 0,
                1: 0
              }
            },
            stats: {
              listings: 28,
              sold: 23,
              purchased: 15
            },
            badges: [
              { id: 1, name: 'Top Seller', icon: 'star' },
              { id: 2, name: 'Quick Shipper', icon: 'local_shipping' },
              { id: 3, name: 'Trusted Member', icon: 'verified' }
            ],
            socialLinks: {
              facebook: 'https://facebook.com/johndoe',
              instagram: 'https://instagram.com/johndoe',
              twitter: 'https://twitter.com/johndoe'
            },
            activeListings: [
              {
                id: 1,
                title: 'Vintage Polaroid Camera',
                price: 120,
                image: 'https://via.placeholder.com/300x200',
                condition: 'Good',
                likes: 12,
                views: 45
              },
              {
                id: 2,
                title: 'Mechanical Keyboard - Cherry MX',
                price: 85,
                image: 'https://via.placeholder.com/300x200',
                condition: 'Like New',
                likes: 8,
                views: 32
              },
              {
                id: 3,
                title: 'Vintage Vinyl Records Collection',
                price: 200,
                image: 'https://via.placeholder.com/300x200',
                condition: 'Good',
                likes: 15,
                views: 67
              }
            ],
            reviews: [
              {
                id: 1,
                reviewer: {
                  id: 'user1',
                  name: 'Alice Johnson',
                  image: 'https://via.placeholder.com/50'
                },
                rating: 5,
                comment: 'Great seller! Item was exactly as described and shipping was fast.',
                date: '2023-02-15',
                itemTitle: 'Vintage Record Player'
              },
              {
                id: 2,
                reviewer: {
                  id: 'user2',
                  name: 'Bob Smith',
                  image: 'https://via.placeholder.com/50'
                },
                rating: 5,
                comment: 'Excellent communication and the item arrived in perfect condition.',
                date: '2023-01-20',
                itemTitle: 'Antique Desk Lamp'
              },
              {
                id: 3,
                reviewer: {
                  id: 'user3',
                  name: 'Carol White',
                  image: 'https://via.placeholder.com/50'
                },
                rating: 4,
                comment: 'Good transaction overall. Shipping took a bit longer than expected but item was well packaged.',
                date: '2022-12-05',
                itemTitle: 'Leather Messenger Bag'
              }
            ]
          };
          
          setUserProfile(mockUserProfile);
          setEditedProfile(mockUserProfile);
          
          // For demo purposes, assume it's the current user if no userId is provided
          setIsCurrentUser(!userId || userId === 'current-user');
          
          setIsLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle edit profile
  const handleEditProfile = () => {
    setIsEditMode(true);
  };
  
  // Handle save profile
  const handleSaveProfile = () => {
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setUserProfile(editedProfile);
      setIsEditMode(false);
      setIsSubmitting(false);
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    }, 1000);
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditedProfile(userProfile);
    setIsEditMode(false);
  };
  
  // Handle profile field change
  const handleProfileChange = (field, value) => {
    setEditedProfile({
      ...editedProfile,
      [field]: value
    });
  };
  
  // Handle open review dialog
  const handleOpenReviewDialog = () => {
    setReviewRating(5);
    setReviewComment('');
    setIsReviewDialogOpen(true);
  };
  
  // Handle submit review
  const handleSubmitReview = () => {
    if (!reviewComment.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Create new review
      const newReview = {
        id: Date.now(),
        reviewer: {
          id: 'current-user',
          name: 'You',
          image: 'https://via.placeholder.com/50'
        },
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toISOString().split('T')[0],
        itemTitle: 'Recent Purchase'
      };
      
      // Update user profile with new review
      setUserProfile({
        ...userProfile,
        reviews: [newReview, ...userProfile.reviews],
        ratings: {
          ...userProfile.ratings,
          count: userProfile.ratings.count + 1,
          average: ((userProfile.ratings.average * userProfile.ratings.count) + reviewRating) / (userProfile.ratings.count + 1),
          breakdown: {
            ...userProfile.ratings.breakdown,
            [reviewRating]: userProfile.ratings.breakdown[reviewRating] + 1
          }
        }
      });
      
      setIsReviewDialogOpen(false);
      setIsSubmitting(false);
      
      setSnackbar({
        open: true,
        message: 'Review submitted successfully',
        severity: 'success'
      });
    }, 1000);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Render profile header
  const renderProfileHeader = () => (
    <Paper 
      elevation={2} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3
      }}
    >
      {/* Cover image */}
      <Box 
        sx={{ 
          height: { xs: 120, sm: 200 },
          position: 'relative',
          backgroundImage: `url(${isEditMode ? editedProfile.coverImage : userProfile.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {isEditMode && (
          <Button
            variant="contained"
            component="label"
            startIcon={<PhotoCamera />}
            sx={{ 
              position: 'absolute',
              bottom: 10,
              right: 10
            }}
          >
            Change Cover
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                // In a real app, this would upload the file and get a URL
                // For demo purposes, we'll just use a placeholder
                handleProfileChange('coverImage', 'https://via.placeholder.com/1200x300/4a6da7/ffffff');
              }}
            />
          </Button>
        )}
      </Box>
      
      {/* Profile info */}
      <Box sx={{ p: 3, position: 'relative' }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start' }}>
          {/* Avatar */}
          <Box sx={{ position: 'relative', mb: isMobile ? 2 : 0 }}>
            <Avatar
              src={isEditMode ? editedProfile.image : userProfile.image}
              alt={userProfile.name}
              sx={{ 
                width: { xs: 80, sm: 120 },
                height: { xs: 80, sm: 120 },
                border: '4px solid white',
                boxShadow: 1,
                transform: { xs: 'translateY(-40px)', sm: 'translateY(-60px)' },
                marginBottom: { xs: '-40px', sm: '-60px' }
              }}
            />
            {isEditMode && (
              <Button
                variant="contained"
                component="label"
                size="small"
                sx={{ 
                  position: 'absolute',
                  bottom: { xs: '-30px', sm: '-50px' },
                  right: 0,
                  minWidth: 0,
                  width: 36,
                  height: 36,
                  borderRadius: '50%'
                }}
              >
                <PhotoCamera fontSize="small" />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    // In a real app, this would upload the file and get a URL
                    // For demo purposes, we'll just use a placeholder
                    handleProfileChange('image', 'https://via.placeholder.com/150');
                  }}
                />
              </Button>
            )}
          </Box>
          
          {/* User info */}
          <Box sx={{ ml: isMobile ? 0 : 3, textAlign: isMobile ? 'center' : 'left', flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', mb: 1 }}>
              {isEditMode ? (
                <TextField
                  value={editedProfile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  variant="standard"
                  sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                />
              ) : (
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                  {userProfile.name}
                </Typography>
              )}
              
              {userProfile.isVerified && (
                <VerifiedUser color="primary" sx={{ ml: 1 }} />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', mb: 1 }}>
              <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
              {isEditMode ? (
                <TextField
                  value={editedProfile.location}
                  onChange={(e) => handleProfileChange('location', e.target.value)}
                  variant="standard"
                  size="small"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {userProfile.location}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', mb: 1 }}>
              <Rating 
                value={userProfile.ratings.average} 
                precision={0.1} 
                readOnly 
                size="small"
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {userProfile.ratings.average.toFixed(1)} ({userProfile.ratings.count} reviews)
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Member since {formatDate(userProfile.joinDate)}
            </Typography>
          </Box>
          
          {/* Action buttons */}
          {!isMobile && (
            <Box>
              {isCurrentUser ? (
                isEditMode ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </Button>
                )
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Message />}
                    onClick={() => {
                      // Navigate to messages with this user
                    }}
                  >
                    Message
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleOpenReviewDialog}
                  >
                    Leave Review
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
        
        {/* Mobile action buttons */}
        {isMobile && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
            {isCurrentUser ? (
              isEditMode ? (
                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                    fullWidth
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveProfile}
                    disabled={isSubmitting}
                    fullWidth
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Save'}
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleEditProfile}
                  fullWidth
                >
                  Edit Profile
                </Button>
              )
            ) : (
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                <Button
                  variant="outlined"
                  startIcon={<Message />}
                  onClick={() => {
                    // Navigate to messages with this user
                  }}
                  fullWidth
                >
                  Message
                </Button>
                <Button
                  variant="contained"
                  onClick={handleOpenReviewDialog}
                  fullWidth
                >
                  Review
                </Button>
              </Box>
            )}
          </Box>
        )}
        
        {/* Bio */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            About
          </Typography>
          {isEditMode ? (
            <TextField
              value={editedProfile.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Tell others about yourself..."
            />
          ) : (
            <Typography variant="body1">
              {userProfile.bio || 'No bio provided.'}
            </Typography>
          )}
        </Box>
        
        {/* Badges */}
        {userProfile.badges && userProfile.badges.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Badges
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {userProfile.badges.map((badge) => (
                <Chip
                  key={badge.id}
                  label={badge.name}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
  
  // Render profile stats
  const renderProfileStats = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={4}>
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h5" color="primary">
            {userProfile.stats.listings}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Listings
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={4}>
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h5" color="primary">
            {userProfile.stats.sold}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sold
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={4}>
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h5" color="primary">
            {userProfile.stats.purchased}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Purchased
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
  
  // Render profile tabs
  const renderProfileTabs = () => (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'fullWidth' : 'standard'}
          scrollButtons={!isMobile}
          allowScrollButtonsMobile
        >
          <Tab label="Listings" />
          <Tab label="Reviews" />
          {isCurrentUser && <Tab label="Settings" />}
        </Tabs>
      </Box>
      
      {/* Listings Tab */}
      {activeTab === 0 && (
        <Box sx={{ py: 2 }}>
          {userProfile.activeListings && userProfile.activeListings.length > 0 ? (
            <Grid container spacing={2}>
              {userProfile.activeListings.map((listing) => (
                <Grid item xs={12} sm={6} md={4} key={listing.id}>
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
                    <Box
                      sx={{
                        height: 200,
                        backgroundImage: `url(${listing.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                      }}
                    >
                      <Chip
                        label={listing.condition}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" noWrap>
                        {listing.title}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', my: 1 }}>
                        ${listing.price.toFixed(2)}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Favorite fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {listing.likes}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {listing.views} views
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No active listings found.
              </Typography>
              {isCurrentUser && (
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    // Navigate to create listing page
                  }}
                >
                  Create Listing
                </Button>
              )}
            </Box>
          )}
        </Box>
      )}
      
      {/* Reviews Tab */}
      {activeTab === 1 && (
        <Box sx={{ py: 2 }}>
          {/* Rating summary */}
          <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {userProfile.ratings.average.toFixed(1)}
                </Typography>
                <Rating 
                  value={userProfile.ratings.average} 
                  precision={0.1} 
                  readOnly 
                  size="large"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {userProfile.ratings.count} reviews
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = userProfile.ratings.breakdown[rating] || 0;
                  const percentage = userProfile.ratings.count > 0 
                    ? (count / userProfile.ratings.count) * 100 
                    : 0;
                  
                  return (
                    <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: 40 }}>
                        <Typography variant="body2">{rating}</Typography>
                        <Star fontSize="small" sx={{ ml: 0.5 }} />
                      </Box>
                      <Box 
                        sx={{ 
                          flex: 1, 
                          height: 8, 
                          backgroundColor: 'grey.200',
                          borderRadius: 1,
                          mx: 1,
                          overflow: 'hidden'
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: `${percentage}%`, 
                            height: '100%', 
                            backgroundColor: 'primary.main',
                            borderRadius: 1
                          }} 
                        />
                      </Box>
                      <Typography variant="body2" sx={{ width: 30 }}>
                        {count}
                      </Typography>
                    </Box>
                  );
                })}
              </Grid>
            </Grid>
          </Paper>
          
          {/* Reviews list */}
          {userProfile.reviews && userProfile.reviews.length > 0 ? (
            <List>
              {userProfile.reviews.map((review) => (
                <React.Fragment key={review.id}>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ px: 0 }}
                  >
                    <ListItemAvatar>
                      <Avatar src={review.reviewer.image} alt={review.reviewer.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="subtitle1" component="span">
                              {review.reviewer.name}
                            </Typography>
                            <Rating 
                              value={review.rating} 
                              readOnly 
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(review.date)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{ my: 1 }}
                          >
                            {review.comment}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Item: {review.itemTitle}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No reviews yet.
              </Typography>
              {!isCurrentUser && (
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={handleOpenReviewDialog}
                >
                  Leave a Review
                </Button>
              )}
            </Box>
          )}
        </Box>
      )}
      
      {/* Settings Tab (only for current user) */}
      {activeTab === 2 && isCurrentUser && (
        <Box sx={{ py: 2 }}>
          <Typography variant="h6" gutterBottom>
            Account Settings
          </Typography>
          
          <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Contact Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  value={isEditMode ? editedProfile.email : userProfile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  fullWidth
                  margin="normal"
                  disabled={!isEditMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  value={isEditMode ? editedProfile.phone : userProfile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  fullWidth
                  margin="normal"
                  disabled={!isEditMode}
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Social Media Links
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Facebook"
                  value={isEditMode ? editedProfile.socialLinks?.facebook : userProfile.socialLinks?.facebook}
                  onChange={(e) => handleProfileChange('socialLinks', { ...editedProfile.socialLinks, facebook: e.target.value })}
                  fullWidth
                  margin="normal"
                  disabled={!isEditMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Instagram"
                  value={isEditMode ? editedProfile.socialLinks?.instagram : userProfile.socialLinks?.instagram}
                  onChange={(e) => handleProfileChange('socialLinks', { ...editedProfile.socialLinks, instagram: e.target.value })}
                  fullWidth
                  margin="normal"
                  disabled={!isEditMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Twitter"
                  value={isEditMode ? editedProfile.socialLinks?.twitter : userProfile.socialLinks?.twitter}
                  onChange={(e) => handleProfileChange('socialLinks', { ...editedProfile.socialLinks, twitter: e.target.value })}
                  fullWidth
                  margin="normal"
                  disabled={!isEditMode}
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Privacy Settings
            </Typography>
            
            {/* Privacy settings would go here */}
            <Typography variant="body2" color="text.secondary">
              Privacy settings are not implemented in this demo.
            </Typography>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {!isEditMode && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
  
  // Render review dialog
  const renderReviewDialog = () => (
    <Dialog
      open={isReviewDialogOpen}
      onClose={() => !isSubmitting && setIsReviewDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Leave a Review for {userProfile.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Rate your experience
          </Typography>
          <Rating
            value={reviewRating}
            onChange={(event, newValue) => {
              setReviewRating(newValue);
            }}
            size="large"
          />
        </Box>
        
        <TextField
          label="Your Review"
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          multiline
          rows={4}
          fullWidth
          margin="normal"
          placeholder="Share your experience with this seller..."
          error={reviewComment.trim() === ''}
          helperText={reviewComment.trim() === '' ? 'Review comment is required' : ''}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setIsReviewDialogOpen(false)} 
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmitReview} 
          variant="contained" 
          disabled={isSubmitting || reviewComment.trim() === ''}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  // Main render
  if (isLoading) {
    return (
      <ResponsiveLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </ResponsiveLayout>
    );
  }
  
  if (error) {
    return (
      <ResponsiveLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </ResponsiveLayout>
    );
  }
  
  if (!userProfile) {
    return (
      <ResponsiveLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Alert severity="warning">User profile not found</Alert>
        </Box>
      </ResponsiveLayout>
    );
  }
  
  return (
    <ResponsiveLayout>
      {renderProfileHeader()}
      {renderProfileStats()}
      {renderProfileTabs()}
      {renderReviewDialog()}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ResponsiveLayout>
  );
};

export default UserProfilePage;

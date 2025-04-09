import React from 'react';
import { Box } from '@mui/material';
import UserProfilePage from '@/components/profile/UserProfilePage';

const ProfilePage = ({ params }) => {
  const userId = params?.id || 'current-user';
  
  return (
    <Box>
      <UserProfilePage userId={userId} />
    </Box>
  );
};

export default ProfilePage;

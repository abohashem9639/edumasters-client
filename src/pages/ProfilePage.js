import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();  // Assuming user context or token is available
  const [profileData, setProfileData] = useState(null);

  useEffect(() => { 
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const userId = localStorage.getItem('userId');  // جلب الـ userId من الـ localStorage
  
    if (!userId) {
      console.error('User ID is not available');
      return;
    }
  
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/user/profile`, {
        params: { userId },  // إرسال userId كـ query parameter
      });
      
      console.log("User Profile: ", response.data);
      setProfileData(response.data);  // تعيين البيانات المسترجعة من الـ API
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };     

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/login");
  };

  return (
    <Box sx={{ 
      maxWidth: 800, 
      margin: 'auto', 
      padding: 4, 
      backgroundColor: '#f4f6f9', 
      borderRadius: 2, 
      boxShadow: 3 
    }}>
      {profileData ? (
        <Card sx={{ boxShadow: 6, borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: 'bold', color: '#333' }}>
              {profileData.firstName} {profileData.lastName}
            </Typography>

            {/* Profile Image with border and shadow */}
            <Avatar
              alt="Profile Image"
              src={`${process.env.REACT_APP_API_URL_IMAGE}${profileData.profileImageUrl}`}
              sx={{
                width: 120,
                height: 120,
                margin: 'auto',
                marginBottom: 2,
                border: '5px solid #007bff',
                boxShadow: '0 4px 8px rgba(0, 123, 255, 0.3)',
                '&:hover': {
                  transform: 'scale(1.05)',
                  transition: '0.3s ease-in-out',
                }
              }}
            />

            <Typography variant="body1" sx={{ color: '#555', marginBottom: 1 }}>
              <strong>Email:</strong> {profileData.email}
            </Typography>
            <Typography variant="body1" sx={{ color: '#555', marginBottom: 1 }}>
              <strong>User Type:</strong> {profileData.userType}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" sx={{ color: '#777' }}>
              <strong>Member since:</strong> {new Date(profileData.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Typography variant="h6" sx={{ textAlign: 'center', color: '#007bff' }}>Loading profile...</Typography>
      )}

      {/* Logout Button */}
      <Button 
        variant="contained" 
        sx={{
          marginTop: 3, 
          backgroundColor: '#dc3545', 
          '&:hover': { backgroundColor: '#c82333' },
          color: 'white', 
          fontWeight: 'bold'
        }} 
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Box>
  );
};

export default ProfilePage;

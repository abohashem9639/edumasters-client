import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Button, Grid, Typography, Card, CardContent } from '@mui/material';
import { Grid2 } from '@mui/material';
import { Business, People, Assignment, Work, AccountBox, PersonAdd } from '@mui/icons-material';  // Import icons

const HomePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', textAlign: 'center', padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 4 }}>
        Welcome to EduMasters CRM
      </Typography>

      <Card sx={{ padding: 3, marginBottom: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Manage Your Data Efficiently
          </Typography>
          
          <Grid2 container spacing={3}>
            <Grid2 item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                fullWidth
                sx={buttonStyle}
                onClick={() => handleNavigation('/universities')}
                startIcon={<Business />}  // Adding icon
              >
                View Universities
              </Button>
            </Grid2>

            <Grid2 item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                fullWidth
                sx={buttonStyle}
                onClick={() => handleNavigation('/students')}
                startIcon={<People />}  // Adding icon
              >
                View Students
              </Button>
            </Grid2>

            <Grid2 item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                fullWidth
                sx={buttonStyle}
                onClick={() => handleNavigation('/applications')}
                startIcon={<Assignment />}  // Adding icon
              >
                View Applications
              </Button>
            </Grid2>

            {/* Button for Employees */}
            <Grid2 item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                fullWidth
                sx={buttonStyle}
                onClick={() => handleNavigation('/employees')}
                startIcon={<Work />}  // Adding icon
              >
                View Employees
              </Button>
            </Grid2>

            {/* Button for Agents */}
            <Grid2 item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                fullWidth
                sx={buttonStyle}
                onClick={() => handleNavigation('/agents')}
                startIcon={<AccountBox />}  // Adding icon
              >
                View Agents
              </Button>
            </Grid2>

            {/* Button for Sub Agents */}
            <Grid2 item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                fullWidth
                sx={buttonStyle}
                onClick={() => handleNavigation('/sub-agents')}
                startIcon={<PersonAdd />}  // Adding icon
              >
                Sub Agents
              </Button>
            </Grid2>

            {/* Button for Teams */}
            <Grid2 item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                fullWidth
                sx={buttonStyle}
                onClick={() => handleNavigation('/teams')}
                startIcon={<PersonAdd />}  // Adding icon
              >
                Teams
              </Button>
            </Grid2>

            {/* Button for Profile Page */}
            <Grid2 item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                fullWidth
                sx={buttonStyle}
                onClick={() => handleNavigation('/profile')}  // Navigation to Profile Page
                startIcon={<AccountBox />}  // Adding icon
              >
                View Profile
              </Button>
            </Grid2>

                        {/* Button for Profile Page */}
                        <Grid2 item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                fullWidth
                sx={buttonStyle}
                onClick={() => handleNavigation('/announcements')}  // Navigation to Profile Page
                startIcon={<AccountBox />}  // Adding icon
              >
                Announcement
              </Button>
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>
      

      <Button
        variant="contained"
        fullWidth
        sx={logoutButtonStyle}
        onClick={handleLogout}
        startIcon={<PersonAdd />}  // Adding icon for logout
      >
        Logout
      </Button>
    </Box>
  );
};

const buttonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  borderRadius: '5px',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#0056b3',
  },
};

const logoutButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#dc3545',
  '&:hover': {
    backgroundColor: '#c82333',
  },
};

export default HomePage;

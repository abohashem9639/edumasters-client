import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Button, Grid, Typography, Card, CardContent, Drawer, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Business, People, Assignment, Work, AccountBox, PersonAdd } from '@mui/icons-material'; // Import icons

const HomePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [openSidebar, setOpenSidebar] = useState(false); // State to control the sidebar

  const handleNavigation = (path) => {
    navigate(path);
    setOpenSidebar(false); // Close sidebar after navigation
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarList = [
    { label: 'View Universities', path: '/universities', icon: <Business /> },
    { label: 'View Students', path: '/students', icon: <People /> },
    { label: 'View Applications', path: '/applications', icon: <Assignment /> },
    { label: 'View Employees', path: '/employees', icon: <Work /> },
    { label: 'View Agents', path: '/agents', icon: <AccountBox /> },
    { label: 'Sub Agents', path: '/sub-agents', icon: <PersonAdd /> },
    { label: 'Teams', path: '/teams', icon: <PersonAdd /> },
    { label: 'View Profile', path: '/profile', icon: <AccountBox /> },
    { label: 'Announcements', path: '/announcements', icon: <AccountBox /> },
    { label: 'All Branches', path: '/AllBranchesPage', icon: <AccountBox /> }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            backgroundColor: '#007bff', // Light blue
            color: 'white',
            boxSizing: 'border-box',
            paddingTop: 2,
          },
        }}
        variant="persistent"
        anchor="left"
        open={openSidebar}
      >
        <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: 4, color: 'white' }}>EduMasters</Typography>
        
        <List>
          {sidebarList.map((item, index) => (
            <ListItem button key={index} onClick={() => handleNavigation(item.path)}>
              {item.icon}
              <ListItemText primary={item.label} sx={{ marginLeft: 2, color: 'white' }} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ borderColor: 'white' }} />
        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#dc3545',
            '&:hover': { backgroundColor: '#c82333' },
            marginTop: 2,
            color: 'white',
          }}
          onClick={handleLogout}
          startIcon={<PersonAdd />}
        >
          Logout
        </Button>
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, padding: 4, marginLeft: 240 }}>
        <Typography variant="h4" sx={{ marginBottom: 4 }}>
          Welcome to EduMasters CRM
        </Typography>

        <Card sx={{ padding: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Manage Your Data Efficiently
            </Typography>
            
            {/* Button grid for navigation */}
            <Grid container spacing={3}>
              {sidebarList.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={buttonStyle}
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                  >
                    {item.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Button to toggle Sidebar */}
      <Button
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1000,
          backgroundColor: '#007bff',
          '&:hover': { backgroundColor: '#0056b3' },
        }}
        onClick={() => setOpenSidebar(!openSidebar)}
      >
        Toggle Sidebar
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

export default HomePage;

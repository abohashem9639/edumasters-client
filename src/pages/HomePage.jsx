import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Button, Grid, Typography, Card, CardContent, Drawer, List, ListItem, ListItemText, Divider, Avatar } from '@mui/material';
import { Business, People, Assignment, Work, AccountBox, PersonAdd } from '@mui/icons-material'; // Import icons

const HomePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [openSidebar, setOpenSidebar] = useState(true); // Sidebar open by default

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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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
      <Box sx={{ flex: 1, padding: 4, marginLeft: openSidebar ? 240 : 0, transition: 'margin-left 0.3s' }}>
        <Typography variant="h4" sx={{ marginBottom: 4 }}>
          Welcome to EduMasters CRM
        </Typography>

        <Card sx={{ padding: 3, boxShadow: 3, marginBottom: 3 }}>
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

        {/* New Section: About the system */}
        <Card sx={{ padding: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ marginBottom: 3 }}>About EduMasters CRM</Typography>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
              EduMasters CRM is an all-in-one platform designed to streamline the management of universities, students, applications, agents, and more. It provides a user-friendly interface for administrative tasks, offering tools for managing student data, applications, and employee records.
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
              Whether you're looking to view or manage universities, students, or applications, EduMasters CRM allows you to perform these tasks with ease. The platform also supports agents and sub-agents for efficient recruitment management.
            </Typography>

            <Typography variant="h6" sx={{ marginBottom: 2 }}>How it Works:</Typography>
            <Typography variant="body2" sx={{ marginBottom: 1 }}>
              1. **Universities**: Manage all the details related to universities, including their branches and departments.
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 1 }}>
              2. **Students**: Track student data, admissions, and academic progress.
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 1 }}>
              3. **Applications**: Manage student applications to universities and track their status.
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 1 }}>
              4. **Agents and Sub-Agents**: Agents handle recruitment processes, while sub-agents assist in various administrative tasks.
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 1 }}>
              5. **Profile Management**: Edit and manage user profiles for seamless system access.
            </Typography>
            <Box sx={{ textAlign: 'center', marginTop: 3 }}>
              <Avatar src="EduMasters.png" sx={{ width: 120, height: 120, margin: 'auto' }} />
            </Box>
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

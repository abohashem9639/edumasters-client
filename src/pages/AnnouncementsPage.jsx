import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Button, TextField, Typography, MenuItem, FormControl, InputLabel, Select, Snackbar, Avatar, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Add } from "@mui/icons-material";
import { DataGrid } from '@mui/x-data-grid';
import ReactQuill from 'react-quill'; // Import React Quill
import 'react-quill/dist/quill.snow.css'; // Import the default styles

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null); // To store the announcement when clicked

  // Fetch universities on load
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Universities`)
      .then(response => {
        setUniversities(response.data);
      })
      .catch(error => console.error("Error fetching universities:", error));
  }, []);

  // Fetch all announcements without university filter
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Announcements/all`)
      .then(response => {
        setAnnouncements(response.data);
      })
      .catch(error => console.error("Error fetching announcements:", error));
  }, []);
  
  // Handle open dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle change university selection
  const handleUniversityChange = (event) => {
    setSelectedUniversity(event.target.value);
  };

  const handleAnnouncementTextChange = (value) => {
    setAnnouncementText(value);
  };

  const handleAddAnnouncement = () => {
    if (!announcementText || !selectedUniversity) {
      setErrorMessage("Please select a university and write an announcement.");
      setOpenSnackbar(true);
      return;
    }

    const createdByUserId = localStorage.getItem("userId");

    if (!createdByUserId) {
      setErrorMessage("User is not logged in.");
      setOpenSnackbar(true);
      return;
    }

    const newAnnouncement = {
      university_id: selectedUniversity,  // فقط ID للجامعة
      announcement_text: announcementText, // نص الإعلان المنسق
      created_by: createdByUserId,  // معرف المستخدم
    };

    // إرسال البيانات عبر POST
    axios.post(`${process.env.REACT_APP_API_URL_LOCAL}/Announcements`, newAnnouncement)
      .then(response => {
      setAnnouncements(prevAnnouncements => [...prevAnnouncements, response.data]);
      axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Announcements/all`)
        .then(response => {
          setAnnouncements(response.data);
        })
        .catch(error => console.error("Error fetching announcements:", error));
        handleCloseDialog();
      })
      .catch(error => {
        console.error("Error adding announcement:", error);
        setErrorMessage("Failed to add announcement.");
        setOpenSnackbar(true);
      });
  };

  const [users, setUsers] = useState([]);

// Fetch users on load
useEffect(() => {
  axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Employees`)
    .then(response => {
      setUsers(response.data);
    })
    .catch(error => console.error("Error fetching users:", error));
}, []);


  const handleAnnouncementClick = (id) => {
    // Fetch announcement by id
    axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Announcements/${id}`)
      .then(response => {
        const selectedAnnouncement = response.data;
        setSelectedAnnouncement(selectedAnnouncement);
        console.log(response.data);
        // Find the corresponding university and user for the selected announcement
        const selectedUniversity = universities.find(univ => univ.id === selectedAnnouncement.university_id);
        const selectedUser = users.find(user => user.id === selectedAnnouncement.created_by);
  
        if (selectedUniversity) {
          setSelectedAnnouncement(prevAnnouncement => ({
            ...prevAnnouncement,
            universityLogo: selectedUniversity.logoUrl,
            universityName: selectedUniversity.name
          }));
        }
  
        if (selectedUser) {
          setSelectedAnnouncement(prevAnnouncement => ({
            ...prevAnnouncement,
            createdByUserImage: selectedUser.profileImageUrl,
            createdBy: selectedUser.firstName + " " + selectedUser.lastName
          }));
        }
         // Ensure createdAt is included in the data
      setSelectedAnnouncement(prevAnnouncement => ({
        ...prevAnnouncement,
        createdAt: selectedAnnouncement.created_at
      }));
    })
      .catch(error => console.error("Error fetching announcement details:", error));
  };
  
  

  const columns = [
    { field: "id", headerName: "ID", width: 150, headerAlign: 'center', align: 'center' },
    {
      field: "universityLogo",
      headerName: "University",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <Avatar src={`${process.env.REACT_APP_API_URL_IMAGE}/${params.row.universityLogo}`} sx={{ marginRight: 1 }} />
          <Typography sx={{ fontWeight: 'bold' }}>{params.row.universityName}</Typography>
        </Box>
      ),
    },
    {
        field: "announcementText",
        headerName: "Announcement",
        width: 300,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Displaying the formatted announcement text */}
            <div 
              dangerouslySetInnerHTML={{ __html: params.row.announcementText }} 
              style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: 'nowrap' }} 
            />
            {params.row.announcementText && params.row.announcementText.length > 25 && (
              <Button 
                onClick={() => handleAnnouncementClick(params.row.id)} 
                size="small"
                sx={{ 
                  marginTop: 1, // Space between the text and the "Read more" button
                  alignSelf: 'flex-start', // Align the button to the left
                  textTransform: 'none', // Remove the text transformation (uppercase)
                  color: 'primary.main', // Set the color of the button
                }}
              >
                Read more
              </Button>
            )}
          </Box>
        ),
      }
      ,
    {
      field: "createdByUserImage",
      headerName: "Created By",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={`${process.env.REACT_APP_API_URL_IMAGE}/${params.row.createdByUserImage}`} sx={{ marginRight: 1 }} />
          <Typography sx={{ fontWeight: 'bold' }}>{params.row.createdBy}</Typography>
        </Box>
      ),
    },
    { 
      field: "createdAt", 
      headerName: "Created At", 
      width: 180, 
      headerAlign: 'center', 
      align: 'center' 
    },
  ];
  

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Announcements</Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        sx={{ mb: 2 }}
        onClick={handleOpenDialog}
      >
        Add Announcement
      </Button>

      {/* Display announcements */}
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={announcements}
          columns={columns}
          pageSize={25}
          rowsPerPageOptions={[25]}
          onRowClick={(e) => handleAnnouncementClick(e.row.id)} // Handle row click
        />
      </div>

      {selectedAnnouncement && (
  <Dialog open={true} onClose={() => setSelectedAnnouncement(null)}>
<DialogTitle sx={{ textAlign: 'center' }}>
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
    <Avatar src={`${process.env.REACT_APP_API_URL_IMAGE}/${selectedAnnouncement.universityLogo}`} sx={{ marginRight: 2 }} />
    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{selectedAnnouncement.universityName}</Typography>
  </Box>
  
</DialogTitle>

    <DialogContent>
      {/* User name and image with creation date */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        {/* User Info */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={`${process.env.REACT_APP_API_URL_IMAGE}/${selectedAnnouncement.createdByUserImage}`} sx={{ marginRight: 2 }} />
          <Typography sx={{ fontWeight: 'bold' }}>{selectedAnnouncement.createdBy}</Typography>
        </Box>

        {/* Creation Date */}
        <Typography sx={{ fontStyle: 'italic' }}>
          {new Date(selectedAnnouncement.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}{" "}
          {new Date(selectedAnnouncement.createdAt).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          })}
        </Typography>
      </Box>

      {/* Announcement text */}
      <div
        dangerouslySetInnerHTML={{
          __html: selectedAnnouncement.announcement_text.replace(/src="\//g, 'src=`${process.env.REACT_APP_API_URL_IMAGE}/')
        }}
        style={{ whiteSpace: 'pre-line' }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setSelectedAnnouncement(null)}>Close</Button>
    </DialogActions>
  </Dialog>
)}







      {/* Add Announcement Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Announcement</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>University</InputLabel>
            <Select
              value={selectedUniversity}
              onChange={(event) => setSelectedUniversity(event.target.value)}
              label="University"
            >
              {universities.map((university) => (
                <MenuItem key={university.id} value={university.id}>
                  {university.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <ReactQuill 
            value={announcementText} 
            onChange={handleAnnouncementTextChange}
            modules={{
              toolbar: [
                [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['bold', 'italic', 'underline'],
                ['link'],
                [{ 'align': [] }],
                ['image'],
                ['blockquote'],
              ],
            }}
            style={{ height: 200 }} // Adjust height of the editor
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddAnnouncement} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for error message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={errorMessage}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      />
    </Box>
  );
};

export default AnnouncementsPage;

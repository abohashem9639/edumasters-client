import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Modal, TextField, IconButton, List, ListItem, ListItemText, Select, MenuItem, FormControl, InputLabel, Snackbar } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [openAddTeamModal, setOpenAddTeamModal] = useState(false);
  const [openViewEditModal, setOpenViewEditModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", logo: null });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    fetchTeams();
    fetchAgents();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('https://localhost:7048/api/Teams');
      setTeams(response.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await axios.get('https://localhost:7048/api/Teams/available');
      setAgents(response.data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const handleOpenAddTeamModal = () => setOpenAddTeamModal(true);
  const handleCloseAddTeamModal = () => setOpenAddTeamModal(false);

  const handleOpenViewEditModal = () => setOpenViewEditModal(true);
  const handleCloseViewEditModal = () => setOpenViewEditModal(false);

  const handleInputChange = (e) => {
    setNewTeam({ ...newTeam, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newTeam.name);
      if (logoFile) formData.append("logo", logoFile);

      await axios.post('https://localhost:7048/api/Teams', formData);
      fetchTeams();
      setOpenSnackbar(true);
      handleCloseAddTeamModal();
    } catch (error) {
      console.error("Error submitting team:", error);
    }
  };

  const handleViewMembers = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    setSelectedTeam(team);
    setLogoFile(null); // Reset logo file to avoid showing old file
    handleOpenViewEditModal();
  };

  const handleRemoveMember = async (teamId, userId) => {
    try {
      await axios.delete(`https://localhost:7048/api/Teams/${teamId}/remove-member/${userId}`);
      setSelectedTeam((prevState) => ({
        ...prevState,
        teamMembers: prevState.teamMembers.filter((member) => member.userId !== userId),
      }));
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleAddMembersToTeam = async () => {
    try {
      await axios.post(`https://localhost:7048/api/Teams/${selectedTeam.id}/add-members`, { userIds: selectedAgents });
      fetchTeams();
      setSelectedAgents([]);
      setOpenSnackbar(true);
      handleCloseViewEditModal();
    } catch (error) {
      console.error("Error adding members:", error);
      alert("There was an error adding members to the team.");
    }
  };

  const handleEditTeam = async () => {
    try {
      const formData = new FormData();
      formData.append("name", selectedTeam.name);
      if (logoFile) formData.append("logo", logoFile);
  
      await axios.put(`https://localhost:7048/api/Teams/${selectedTeam.id}`, formData);
      fetchTeams();
      setSelectedAgents([]);
      setOpenSnackbar(true);
      handleCloseViewEditModal();
    } catch (error) {
      console.error("Error updating team:", error);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
  <Typography variant="h4" sx={{ mb: 3 }}>Teams</Typography>
  <Box variant="h6" sx={{ mb: 3 }}>
    Total Teams: {teams.length}
  </Box>
  <Button variant="contained" onClick={handleOpenAddTeamModal}>+ Add Team</Button>


      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Team Name</TableCell>
              <TableCell>Members</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>{team.name}</TableCell>
                <TableCell>{team.teamMembers.length}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleViewMembers(team.id)}>
                    View Members
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Adding a Team */}
      <Modal open={openAddTeamModal} onClose={handleCloseAddTeamModal}>
        <Box sx={{ padding: 3, backgroundColor: "white", margin: "auto", maxWidth: 400, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Add New Team</Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Team Name"
              name="name"
              value={newTeam.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              type="file"
              onChange={handleFileChange}
              margin="normal"
            />
            <Button variant="contained" type="submit" sx={{ mt: 2 }}>
              Add Team
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Modal for Viewing and Editing Team */}
      <Modal open={openViewEditModal} onClose={handleCloseViewEditModal}>
        <Box sx={{
          padding: 3,
          backgroundColor: "white",
          margin: "auto",
          maxWidth: 400,
          borderRadius: 2,
          boxShadow: 3,
          maxHeight: "80vh",
          overflowY: "auto",  // enable scroll when the content exceeds the viewable area
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Edit Team</Typography>

          {/* Display Logo */}
          {selectedTeam?.logo && (
            <Box sx={{ display: "flex", justifyContent: "center", position: "relative", mb: 2 }}>
              <img
                src={`https://localhost:7048${selectedTeam.logo}`}
                alt="Team Logo"
                style={{
                  borderRadius: "50%", 
                  width: "100px", 
                  height: "100px", 
                  objectFit: "cover",
                }}
              />
              <IconButton 
                sx={{
                  position: "absolute", 
                  top: "50%", 
                  right: "0", 
                  transform: "translateY(-50%)",
                }}
                onClick={() => document.getElementById("logoUpload").click()}
              >
                <Edit />
              </IconButton>
              <input
                id="logoUpload"
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </Box>
          )}

          <TextField
            fullWidth
            label="Team Name"
            name="name"
            value={selectedTeam ? selectedTeam.name : ""}
            onChange={(e) => setSelectedTeam({ ...selectedTeam, name: e.target.value })}
            margin="normal"
            required
          />

          <Typography variant="h6" sx={{ mt: 2 }}>Members</Typography>
          <List>
            {selectedTeam && selectedTeam.teamMembers.map((member) => (
              <ListItem key={member.userId} secondaryAction={
                <IconButton edge="end" onClick={() => handleRemoveMember(selectedTeam.id, member.userId)}>
                  <Delete />
                </IconButton>
              }>
                <ListItemText primary={`${member.user.firstName} ${member.user.lastName}`} />
              </ListItem>
            ))}
          </List>

          {/* Dropdown for adding new members */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Available Agents</InputLabel>
            <Select
              multiple
              value={selectedAgents}
              onChange={(e) => setSelectedAgents(e.target.value)}
              label="Available Agents"
            >
              {agents.map((agent) => (
                <MenuItem key={agent.id} value={agent.id}>
                  {`${agent.firstName} ${agent.lastName}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={handleAddMembersToTeam} sx={{ mt: 2 }}>
            Add Members
          </Button>

          <Button variant="contained" onClick={handleEditTeam} sx={{ mt: 2 }}>
            Save Changes
          </Button>
        </Box>
      </Modal>

      {/* Snackbar for success message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message="Operation successful!"
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </Box>
  );
};

export default TeamsPage;

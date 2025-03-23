import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Avatar, Button, Modal, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";  // إضافة المكونات المفقودة
import { Delete, Edit, Refresh } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [open, setOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    profileImage: null,
    userType: "Agent",
  });
  const [selectedAgent, setSelectedAgent] = useState(null); // للوكيل الذي سيتم تعديله
  const [errors, setErrors] = useState({});
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const navigate = useNavigate();

  // جلب الوكلاء عند تحميل الصفحة
  useEffect(() => {
    fetchAgents();
  }, []);

  // جلب الفرق عند تحميل الصفحة
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/agents`);
      setAgents(response.data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/agents/get-teams`);
      setTeams(response.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this agent?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL_LOCAL}/delete-agent/${id}`);
      setAgents((prev) => prev.filter((agent) => agent.id !== id));
    } catch (error) {
      console.error("Error deleting agent:", error);
    }
  };

  const handleOpenModal = async (agent) => {
    if (agent === null) {
      setNewAgent({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        profileImage: null,
        userType: 'Agent',
      });
      setOpen(true);
      return;
    }

    setSelectedAgent(agent);

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Agents/${agent.id}`);
      const agentData = response.data;

      setNewAgent({
        firstName: agentData.firstName || '',
        lastName: agentData.lastName || '',
        email: agentData.email || '',
        phoneNumber: agentData.phoneNumber || '',
        profileImage: null,
        userType: agentData.userType || 'Agent',
      });

      setOpen(true);
    } catch (error) {
      console.error("Error fetching agent data:", error);
      alert("Failed to fetch agent data.");
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedAgent(null);
  };

  const handleFileChange = (e) => {
    setNewAgent({ ...newAgent, profileImage: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    setNewAgent({ ...newAgent, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};
    Object.keys(newAgent).forEach((key) => {
      if (!newAgent[key]) newErrors[key] = "This field is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    if (!validateForm()) return;
  
    const formData = new FormData();
    Object.keys(newAgent).forEach((key) => {
      formData.append(key, newAgent[key]);
    });
  
    // إضافة selectedTeams كمصفوفة من الأرقام
    selectedTeams.forEach(teamId => formData.append("selectedTeamIds[]", teamId));  // استخدم [] للإشارة إلى المصفوفة
  
    try {
      const linkedUserId = localStorage.getItem("userId");
      formData.append("LinkedUserId", linkedUserId);
  
      if (selectedAgent) {
        await axios.put(`${process.env.REACT_APP_API_URL_LOCAL}/Agents/update-agent/${selectedAgent.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Agent updated successfully!");
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL_LOCAL}/Auth/create-agent`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Agent added successfully!");
      }
      fetchAgents();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting agent:", error);
      alert("Failed to add or update agent.");
    }
  };
  
  
  

  const resendResetLink = async (email) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL_LOCAL}/Auth/resend-reset-link`, { email });
      alert("Reset link has been sent to the agent's email.");
    } catch (error) {
      console.error("Error sending reset link:", error);
      alert("Failed to resend reset link.");
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Agents
      </Typography>

      <Button variant="contained" color="primary" onClick={() => handleOpenModal(null)} sx={{ mb: 3 }}>
        + Add Agent
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Profile</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell>{agent.id}</TableCell>
                <TableCell>
                  <Avatar src={`${process.env.REACT_APP_API_URL_IMAGE}${agent.profileImageUrl}`} alt={agent.fullName} sx={{ width: 50, height: 50 }} />
                </TableCell>
                <TableCell>{agent.fullName}</TableCell>
                <TableCell>{agent.email}</TableCell>
                <TableCell>{agent.userType}</TableCell>
                <TableCell>{agent.verified ? "✅" : "❌"}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpenModal(agent)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(agent.id)}>
                    <Delete />
                  </IconButton>

                  {!agent.verified && (
                    <IconButton color="info" onClick={() => resendResetLink(agent.email)}>
                      <Refresh />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Adding or Editing Agent */}
      <Modal open={open} onClose={handleCloseModal}>
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          backgroundColor: "white",
          padding: 4,
          boxShadow: 24,
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{selectedAgent ? "Edit Agent" : "Add Agent"}</Typography>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <TextField 
              fullWidth 
              label="First Name" 
              name="firstName" 
              value={newAgent.firstName}  
              onChange={handleInputChange} 
              margin="normal" 
              required 
              error={!!errors.firstName} 
              helperText={errors.firstName} 
            />
            <TextField 
              fullWidth 
              label="Last Name" 
              name="lastName" 
              value={newAgent.lastName}  
              onChange={handleInputChange} 
              margin="normal" 
              required 
              error={!!errors.lastName} 
              helperText={errors.lastName} 
            />
            <TextField 
              fullWidth 
              label="Email" 
              name="email" 
              value={newAgent.email}  
              onChange={handleInputChange} 
              margin="normal" 
              required 
              error={!!errors.email} 
              helperText={errors.email} 
            />
            <TextField 
              fullWidth 
              label="Phone Number" 
              name="phoneNumber" 
              value={newAgent.phoneNumber}  
              onChange={handleInputChange} 
              margin="normal" 
              required 
              error={!!errors.phoneNumber} 
              helperText={errors.phoneNumber} 
            />

{/* <FormControl fullWidth margin="normal">
  <InputLabel>Teams</InputLabel>
  <Select
    multiple
    value={selectedTeams}
    onChange={(e) => setSelectedTeams(e.target.value)}
    label="Teams"
  >
    {teams.map((team) => (
      <MenuItem key={team.id} value={team.id}>
        {team.name}
      </MenuItem>
    ))}
  </Select>
</FormControl> */}


            <TextField 
              fullWidth 
              type="file" 
              onChange={handleFileChange} 
              margin="normal" 
              required 
              error={!!errors.profileImage} 
              helperText={errors.profileImage} 
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              {selectedAgent ? "Update Agent" : "Add Agent"}
            </Button>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default AgentsPage;

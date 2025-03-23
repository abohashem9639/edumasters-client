import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Avatar, Button, Modal, TextField, MenuItem, Select, InputLabel, FormControl, FormHelperText, Grid } from "@mui/material";
import { Delete, Edit, Refresh } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const SubAgentsPage = () => {
  const [subAgents, setSubAgents] = useState([]);
  const [agents, setAgents] = useState([]); // قائمة الوكلاء لاختيار الوكيل المرتبط
  const [open, setOpen] = useState(false);
  const [newSubAgent, setNewSubAgent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    profileImage: null,
    userType: "SubAgent", // نوع المستخدم فرعي
    linkedUserId: "", // هذا الحقل سيرتبط بوكيل
  });
  const [selectedSubAgent, setSelectedSubAgent] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubAgents();
    fetchAgents(); // جلب الوكلاء عند تحميل الصفحة
  }, []);

  const fetchSubAgents = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/SubAgents`);
      if (Array.isArray(response.data)) {
        setSubAgents(response.data); // إذا كانت البيانات مصفوفة، نقوم بتحديث الحالة
      } else {
        console.error("The response data is not an array:", response.data);
        setSubAgents([]); // تعيين مصفوفة فارغة إذا كانت البيانات غير صحيحة
      }
    } catch (error) {
      console.error("Error fetching sub-agents:", error);
      setSubAgents([]); // تعيين مصفوفة فارغة في حالة حدوث خطأ
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/agents`);
      setAgents(response.data);
      console.log(response.data); // تحقق من البيانات هنا
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sub-agent?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL_LOCAL}/Auth/delete-sub-agent/${id}`);
      setSubAgents((prev) => prev.filter((subAgent) => subAgent.id !== id));
    } catch (error) {
      console.error("Error deleting sub-agent:", error);
    }
  };

  const handleOpenModal = (subAgent) => {
    if (subAgent) {
      // عند فتح المودال وتحديد sub-agent نأخذ الـ linkedUserId
      const linkedAgentId = subAgent.linkedUserId;
  
      // تحديد الوكيل المرتبط بناءً على الـ linkedUserId
      const linkedAgent = agents.find(agent => agent.id === linkedAgentId);
  
      setSelectedSubAgent(subAgent);
      setNewSubAgent({
        firstName: subAgent.firstName || "",
        lastName: subAgent.lastName || "",
        email: subAgent.email || "",
        phoneNumber: subAgent.phoneNumber || "",
        profileImage: null,
        userType: "SubAgent",
        linkedUserId: linkedAgent ? linkedAgent.id : "", // تحديد الـ linkedUserId بناءً على الوكيل المرتبط
      });
    } else {
      // إذا لم يكن هنالك sub-agent وتقوم بإضافة جديد
      setNewSubAgent({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        profileImage: null,
        userType: "SubAgent",
        linkedUserId: "", // لا يوجد وكيل مرتبط عند إضافة وكيل جديد
      });
    }
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedSubAgent(null);
  };

  const handleFileChange = (e) => {
    setNewSubAgent({ ...newSubAgent, profileImage: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    setNewSubAgent({ ...newSubAgent, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};
    Object.keys(newSubAgent).forEach((key) => {
      if (!newSubAgent[key]) newErrors[key] = "This field is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePassword = () => Math.random().toString(36).slice(-8); // توليد كلمة مرور عشوائية

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;
  
      const newSubAgentWithPassword = { 
          ...newSubAgent, 
          password: generatePassword()  // إضافة كلمة المرور العشوائية
      };
  
      const formData = new FormData();
      Object.keys(newSubAgentWithPassword).forEach((key) => {
          formData.append(key, newSubAgentWithPassword[key]);
      });
  
      try {
          if (selectedSubAgent) {
              // تعديل الـ sub-agent
              await axios.put(`${process.env.REACT_APP_API_URL_LOCAL}/SubAgents/update-sub-agent/${selectedSubAgent.id}`, formData, {
                  headers: { "Content-Type": "multipart/form-data" },
              });
              alert("Sub-Agent updated successfully!");
          } else {
              // إضافة sub-agent جديد
              const response = await axios.post(`${process.env.REACT_APP_API_URL_LOCAL}/SubAgents/create-sub-agent`, formData, {
                  headers: { "Content-Type": "multipart/form-data" },
              });
              

              alert("Sub-Agent added successfully! Reset link has been sent to the email.");
          }
          fetchSubAgents();
          handleCloseModal();
      } catch (error) {
          console.error("Error submitting sub-agent:", error);
          alert("Failed to add or update sub-agent.");
      }
  };

  const resendResetLink = async (email) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL_LOCAL}/Auth/resend-reset-link`, { email });
      alert("Reset link has been sent to the sub-agent's email.");
    } catch (error) {
      console.error("Error sending reset link:", error);
      alert("Failed to resend reset link.");
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Sub Agents
      </Typography>

      <Button variant="contained" color="primary" onClick={() => handleOpenModal(null)} sx={{ mb: 3 }}>
        + Add Sub-Agent
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
              <TableCell>Linked Agent</TableCell> {/* إضافة هذا العمود */}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(subAgents) && subAgents.map((subAgent) => (
              <TableRow key={subAgent.id}>
                <TableCell>{subAgent.id}</TableCell>
                <TableCell>
                  <Avatar src={`${process.env.REACT_APP_API_URL_IMAGE}${subAgent.profileImageUrl}`} alt={subAgent.fullName} sx={{ width: 50, height: 50 }} />
                </TableCell>
                <TableCell>{subAgent.firstName + " " + subAgent.lastName}</TableCell>
                <TableCell>{subAgent.email}</TableCell>
                <TableCell>{subAgent.userType}</TableCell>
                <TableCell>{subAgent.verified ? "✅" : "❌"}</TableCell>
                <TableCell>{subAgent.linkedAgent ? subAgent.linkedAgent : "No linked agent"}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpenModal(subAgent)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(subAgent.id)}>
                    <Delete />
                  </IconButton>
                  {/* إعادة إرسال رابط تعيين كلمة المرور */}
                  {!subAgent.verified && (
                    <IconButton color="info" onClick={() => resendResetLink(subAgent.email)}>
                      <Refresh />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* مودال إضافة أو تعديل الوكيل الفرعي */}
      <Modal open={open} onClose={handleCloseModal}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, backgroundColor: "white", padding: 4, boxShadow: 24 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{selectedSubAgent ? "Edit Sub-Agent" : "Add Sub-Agent"}</Typography>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <TextField fullWidth label="First Name" name="firstName" value={newSubAgent.firstName} onChange={handleInputChange} margin="normal" required error={!!errors.firstName} helperText={errors.firstName} />
            <TextField fullWidth label="Last Name" name="lastName" value={newSubAgent.lastName} onChange={handleInputChange} margin="normal" required error={!!errors.lastName} helperText={errors.lastName} />
            <TextField fullWidth label="Email" name="email" value={newSubAgent.email} onChange={handleInputChange} margin="normal" required error={!!errors.email} helperText={errors.email} />
            <TextField fullWidth label="Phone Number" name="phoneNumber" value={newSubAgent.phoneNumber} onChange={handleInputChange} margin="normal" required error={!!errors.phoneNumber} helperText={errors.phoneNumber} />
            
            <FormControl fullWidth margin="normal" required error={!!errors.linkedUserId}>
              <InputLabel>Linked Agent</InputLabel>
              <Select
                name="linkedUserId"
                value={newSubAgent.linkedUserId}  // هنا سيتم تحديد الوكيل المرتبط في القائمة المنسدلة
                onChange={handleInputChange}
              >
                {agents.map((agent) => (
                  <MenuItem key={agent.id} value={agent.id}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Avatar
                          src={`${process.env.REACT_APP_API_URL_IMAGE}${agent.profileImageUrl}`}
                          alt={agent.fullName}
                          sx={{ width: 24, height: 24, marginRight: 2 }}
                        />
                      </Grid>
                      <Grid item>
                        <Typography>{agent.fullName}</Typography>
                      </Grid>
                    </Grid>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.linkedUserId}</FormHelperText>
            </FormControl>

            <TextField fullWidth type="file" onChange={handleFileChange} margin="normal" required error={!!errors.profileImage} helperText={errors.profileImage} />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              {selectedSubAgent ? "Update Sub-Agent" : "Add Sub-Agent"}
            </Button>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default SubAgentsPage;

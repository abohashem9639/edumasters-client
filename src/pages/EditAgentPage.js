import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const EditAgentPage = () => {
  const { id } = useParams(); // الحصول على الـ ID من الـ URL
  const navigate = useNavigate();

  const [agent, setAgent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    profileImage: null,
    userType: "Agent", // النوع الافتراضي سيكون وكيل
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAgent();
  }, []); // التأكد من أن هذا يتم عند تحميل الصفحة فقط.

  const fetchAgent = async () => {
    try {
      const response = await axios.get(`https://localhost:7048/api/Agents/${id}`);
      setAgent(response.data); // تعيين البيانات المسترجعة في الحالة
      console.log("Data fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching agent:", error);
      alert("Failed to fetch agent data.");
    }
  };
  
  
  

  const validateForm = () => {
    let newErrors = {};
    Object.keys(agent).forEach((key) => {
      if (!agent[key]) newErrors[key] = "This field is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    setAgent({ ...agent, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAgent({ ...agent, profileImage: e.target.files[0] });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    const formData = new FormData();
    Object.keys(agent).forEach((key) => {
      formData.append(key, agent[key]);
    });
  
    try {
      // تعديل الرابط ليصبح:
      await axios.put(`https://localhost:7048/api/Agents/update-agent/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      alert("Agent updated successfully!");
      navigate("/agents"); 
    } catch (error) {
      console.error("Error updating agent:", error);
      alert("Failed to update agent.");
    }
  };
  
  
  

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Edit Agent
      </Typography>

      <Paper sx={{ padding: 3 }}>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
<TextField
  fullWidth
  label="First Name"
  name="firstName"
  value={agent.firstName || ''} // عرض القيمة إذا كانت موجودة
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
  value={agent.lastName || ''} // عرض القيمة إذا كانت موجودة
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
  value={agent.email || ''} // عرض القيمة إذا كانت موجودة
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
  value={agent.phoneNumber || ''} // عرض القيمة إذا كانت موجودة
  onChange={handleInputChange}
  margin="normal"
  required
  error={!!errors.phoneNumber}
  helperText={errors.phoneNumber}
/>

          <TextField
            fullWidth
            type="file"
            name="profileImage"
            onChange={handleFileChange}
            margin="normal"
            required
            error={!!errors.profileImage}
            helperText={errors.profileImage}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Update Agent
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default EditAgentPage;

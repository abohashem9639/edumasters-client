import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { 
  Box, TextField, Select, MenuItem, Button, Typography, Paper, 
  InputLabel, FormControl, FormHelperText 
} from "@mui/material";

const CreateUserPage = () => {
  const { user } = useAuth(); // المستخدم الحالي (Admin)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    userType: "Employee",
    linkedUserId: user?.id, // افتراضيًا يكون الحساب مرتبطًا بالمشرف
    profileImage: null,
  });

  const [agents, setAgents] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (formData.userType === "SubAgent") {
      axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Auth/agents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setAgents(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({ ...prev, linkedUserId: res.data[0].id }));
        }
      })
      .catch((err) => console.error("Error fetching agents:", err));
    } else {
      setAgents([]);
      setFormData((prev) => ({ ...prev, linkedUserId: user?.id }));
    }
  }, [formData.userType, user]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
    if (formData.userType === "SubAgent" && !formData.linkedUserId) newErrors.linkedUserId = "Please select an agent.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      linkedUserId: name === "userType" 
        ? value === "SubAgent" 
          ? prev.linkedUserId 
          : user?.id
        : prev.linkedUserId,
    }));
  };

  const handleAgentChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      linkedUserId: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profileImage: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const submitData = new FormData();
      submitData.append("firstName", formData.firstName);
      submitData.append("lastName", formData.lastName);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("userType", formData.userType);
      submitData.append("linkedUserId", formData.linkedUserId || "");
      if (formData.profileImage) {
        submitData.append("profileImage", formData.profileImage);
      }

      await axios.post(`${process.env.REACT_APP_API_URL_LOCAL}/Auth/create-user`, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMessage("User created successfully!");
      setErrorMessage("");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        userType: "Employee",
        linkedUserId: user?.id,
        profileImage: null,
      });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to create user.");
    }
  };

  return (
    <Box 
      component={Paper} 
      elevation={3} 
      sx={{ maxWidth: 500, margin: "auto", padding: 4, textAlign: "center", mt: 5 }}
    >
      <Typography variant="h4" gutterBottom>Create New User</Typography>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <TextField 
          fullWidth label="First Name" name="firstName" 
          value={formData.firstName} onChange={handleInputChange} 
          margin="normal" required error={!!errors.firstName} helperText={errors.firstName} 
        />
        <TextField 
          fullWidth label="Last Name" name="lastName" 
          value={formData.lastName} onChange={handleInputChange} 
          margin="normal" required error={!!errors.lastName} helperText={errors.lastName} 
        />
        <TextField 
          fullWidth label="Email" type="email" name="email" 
          value={formData.email} onChange={handleInputChange} 
          margin="normal" required error={!!errors.email} helperText={errors.email} 
        />
        <TextField 
          fullWidth label="Password" type="password" name="password" 
          value={formData.password} onChange={handleInputChange} 
          margin="normal" required error={!!errors.password} helperText={errors.password} 
        />

        <FormControl fullWidth margin="normal" error={!!errors.userType}>
          <InputLabel>User Type</InputLabel>
          <Select name="userType" value={formData.userType} onChange={handleInputChange}>
            <MenuItem value="Employee">Employee</MenuItem>
            <MenuItem value="Agent">Agent</MenuItem>
            <MenuItem value="SubAgent">SubAgent</MenuItem>
          </Select>
          <FormHelperText>{errors.userType}</FormHelperText>
        </FormControl>

        {formData.userType === "SubAgent" && (
          <FormControl fullWidth margin="normal" error={!!errors.linkedUserId}>
            <InputLabel>Linked Agent</InputLabel>
            <Select name="linkedUserId" value={formData.linkedUserId} onChange={handleAgentChange} disabled={agents.length === 0}>
              {agents.length === 0 ? 
                <MenuItem value="">No agents available</MenuItem> 
                : agents.map((agent) => (
                  <MenuItem key={agent.id} value={agent.id}>{agent.fullName}</MenuItem>
                ))
              }
            </Select>
            <FormHelperText>{errors.linkedUserId}</FormHelperText>
          </FormControl>
        )}

        <Typography variant="body1" sx={{ mt: 2 }}>Upload Profile Image</Typography>
        <input type="file" name="profileImage" accept="image/*" onChange={handleFileChange} />

        {successMessage && <Typography color="success.main" mt={2}>{successMessage}</Typography>}
        {errorMessage && <Typography color="error.main" mt={2}>{errorMessage}</Typography>}

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }} disabled={Object.keys(errors).length > 0}>
          Create User
        </Button>
      </form>
    </Box>
  );
};

export default CreateUserPage;

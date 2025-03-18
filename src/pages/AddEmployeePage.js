import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box, TextField, Button, Typography, Paper, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";

const AddEmployeePage = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    userType: "",
    profileImage: null,
  });

  const linkedUserId = localStorage.getItem("userId") || sessionStorage.getItem("userId") || "0"; 

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    Object.keys(employee).forEach((key) => {
      if (!employee[key]) newErrors[key] = "This field is required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    setEmployee({ ...employee, profileImage: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    Object.keys(employee).forEach((key) => {
      formData.append(key, employee[key]);
    });

    formData.append("LinkedUserId", linkedUserId);

    try {
        const response = await axios.post("https://localhost:7048/api/Auth/create-employee", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          
      alert("Employee added successfully! An email has been sent.");
      navigate("/employees");
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add employee.");
    }
  };

  return (
    <Box component={Paper} elevation={3} sx={{ maxWidth: 500, margin: "auto", padding: 4, mt: 5 }}>
      <Typography variant="h4" gutterBottom>Add Employee</Typography>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <TextField fullWidth label="First Name" name="firstName"
          value={employee.firstName} onChange={(e) => setEmployee({ ...employee, firstName: e.target.value })}
          margin="normal" required error={!!errors.firstName} helperText={errors.firstName} />
          
        <TextField fullWidth label="Last Name" name="lastName"
          value={employee.lastName} onChange={(e) => setEmployee({ ...employee, lastName: e.target.value })}
          margin="normal" required error={!!errors.lastName} helperText={errors.lastName} />
          
        <TextField fullWidth label="Email" name="email"
          value={employee.email} onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
          margin="normal" required error={!!errors.email} helperText={errors.email} />

        <TextField fullWidth label="Phone Number" name="phoneNumber"
          value={employee.phoneNumber} onChange={(e) => setEmployee({ ...employee, phoneNumber: e.target.value })}
          margin="normal" required error={!!errors.phoneNumber} helperText={errors.phoneNumber} />

<FormControl fullWidth margin="normal" required error={!!errors.userType}>
  <InputLabel>Role</InputLabel>
  <Select
    name="userType"
    value={employee.userType}
    onChange={(e) => setEmployee({ ...employee, userType: e.target.value })}
  >
    <MenuItem value="follow up">Follow Up</MenuItem>
    <MenuItem value="PR Manager">PR Manager</MenuItem>
    <MenuItem value="Data Entry">Data Entry</MenuItem>
    <MenuItem value="Admission follow up">Admission Follow Up</MenuItem>
    <MenuItem value="Admission Member">Admission Member</MenuItem>
    <MenuItem value="Sales Follow up">Sales Follow Up</MenuItem>
    <MenuItem value="Sales Member">Sales Member</MenuItem>
    <MenuItem value="Admin">Admin</MenuItem>
  </Select>
</FormControl>


        <TextField fullWidth type="file" onChange={handleFileChange} margin="normal" />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Add Employee
        </Button>
      </form>
    </Box>
  );
};

export default AddEmployeePage;

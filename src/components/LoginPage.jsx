import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

const LoginPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://localhost:7048/api/Auth/login", formData);
      const { token, user } = response.data;
  
      if (!user || !user.id) {
        throw new Error("Invalid user data");
      }
  
      // طباعة جميع معلومات المستخدم في الكونسول
      console.log("User Information:", user);
  
      // تخزين كل بيانات المستخدم في الجلسة
      login(user, token); // سيتم تخزين المستخدم مع الـ token في الـ localStorage
      localStorage.setItem("userId", user.id); // تأكد من تخزين الـ userId في localStorage
  
      navigate("/"); // توجيه المستخدم للصفحة الرئيسية بعد تسجيل الدخول
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Invalid email or password.");
    }
  };
  
  
  

  return (
    <Box 
      component={Paper} 
      elevation={3} 
      sx={{ maxWidth: 400, margin: "auto", padding: 4, textAlign: "center", mt: 5 }}
    >
      <Typography variant="h4" gutterBottom>Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          margin="normal"
          required
        />
        {errorMessage && <Typography color="error" mt={1}>{errorMessage}</Typography>}
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </form>
    </Box>
  );
};

export default LoginPage;

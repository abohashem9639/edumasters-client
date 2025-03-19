import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const resetToken = searchParams.get("token") || ""; // ⚠️ إذا كان التوكين مطلوبًا، تأكد من إرساله

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ تحقق من صحة كلمة المرور
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log("📨 Sending request with:", { email, newPassword, confirmPassword, resetToken });

    try {
      await axios.post(`${process.env.REACT_APP_API_URL_LOCAL}/Auth/reset-password`, {
        email,
        newPassword,
        confirmPassword,
        resetToken, // ⚠️ تأكد من أن الخادم لا يتطلب هذا الحقل، وإذا كان مطلوبًا احصل عليه من البريد
      });

      alert("Password set successfully!");
      navigate("/login");
    } catch (error) {
      console.error("❌ Error setting password:", error);
      alert("Failed to set password. Please check your data.");
    }
  };

  return (
    <Box component={Paper} elevation={3} sx={{ maxWidth: 400, margin: "auto", padding: 4, mt: 5 }}>
      <Typography variant="h4" gutterBottom>Set Your Password</Typography>
      <form onSubmit={handleSubmit}>
        <TextField 
          fullWidth 
          label="New Password" 
          type="password" 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)} 
          margin="normal" 
          required 
        />
        <TextField 
          fullWidth 
          label="Confirm Password" 
          type="password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)} 
          margin="normal" 
          required 
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Save Password
        </Button>
      </form>
    </Box>
  );
};

export default ResetPasswordPage;

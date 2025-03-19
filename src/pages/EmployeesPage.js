import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, Button, TextField, IconButton, Avatar, Modal, FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    profileImage: null,  // اختياري
    userType: "Follow Up",  // default value
    linkedUserId: "", // سيتم تحديثه بناءً على userId من الجلسة
  });
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Employees`);
      setEmployees(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL_LOCAL}/Employees/${id}/toggle-status`);
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? { ...emp, status: !currentStatus } : emp))
      );
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL_LOCAL}/Employees/${id}`);
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleOpenModal = (employee) => {
    if (employee) {
      setSelectedEmployee(employee);
      setNewEmployee({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        phoneNumber: employee.phoneNumber || "",
        userType: employee.userType || "Follow Up",  // Set the correct userType
        linkedUserId: employee.linkedUserId || "", // Use the existing linkedUserId
      });
    } else {
      setSelectedEmployee(null);
      setNewEmployee({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        profileImage: null,
        userType: "Follow Up",  // default value for new employee
        linkedUserId: localStorage.getItem('userId') || "",  // Get linkedUserId from session/localStorage
      });
    }
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedEmployee(null);
  };

  const handleFileChange = (e) => {
    setNewEmployee({ ...newEmployee, profileImage: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};
  
    // تحقق من جميع الحقول الأخرى (ما عدا linkedUserId و profileImage و Password)
    Object.keys(newEmployee).forEach((key) => {
      if (key !== "profileImage" && key !== "linkedUserId" && key !== "Password" && !newEmployee[key]) {
        newErrors[key] = "This field is required";
      }
    });
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من أن جميع الحقول المطلوبة موجودة
    if (!validateForm()) return;

    const formData = new FormData();
    Object.keys(newEmployee).forEach((key) => {
      if (key === "profileImage" && !newEmployee[key]) {
        // في حال عدم وجود صورة، أرسل قيمة null
        formData.append(key, null);
      } else if (newEmployee[key] !== null && newEmployee[key] !== undefined) {
        formData.append(key, newEmployee[key]);
      }
    });

    try {
      if (selectedEmployee) {
        // تحديث الموظف
        await axios.put(`${process.env.REACT_APP_API_URL_LOCAL}/Employees/${selectedEmployee.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Employee updated successfully!");
      } else {
        // إضافة موظف جديد
        await axios.post(`${process.env.REACT_APP_API_URL_LOCAL}/Employees/create-employee`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Employee added successfully!");
      }
      fetchEmployees();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting employee:", error);
      alert("Failed to add or update employee.");
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Employees
      </Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Total Employees: {employees.length}
      </Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpenModal(null)}>
        + Add Employee
      </Button>
      <TextField
        fullWidth
        label="Quick Search"
        variant="outlined"
        sx={{ mb: 2 }}
        onChange={(e) => setSearch(e.target.value.toLowerCase())}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Profile</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees
              .filter((emp) =>
                (emp.firstName + " " + emp.lastName || "").toLowerCase().includes(search) ||
                (emp.email || "").toLowerCase().includes(search) ||
                (emp.userType || "").toLowerCase().includes(search)
              )
              .map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell>
                    <Avatar
                      src={`${process.env.REACT_APP_API_URL_IMAGE}${employee.profileImageUrl}`}
                      alt={employee.fullName}
                      sx={{ width: 50, height: 50 }}
                    />
                  </TableCell>
                  <TableCell>{employee.firstName + " " + employee.lastName}</TableCell>
                  <TableCell>{employee.userType}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.verified ? "✅" : "❌"}</TableCell>
                  <TableCell>
                    <Switch
                      checked={employee.status}
                      onChange={() => handleToggleStatus(employee.id, employee.status)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenModal(employee)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(employee.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for adding or editing employee */}
      <Modal open={open} onClose={handleCloseModal}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, backgroundColor: "white", padding: 4, boxShadow: 24 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {selectedEmployee ? "Edit Employee" : "Add Employee"}
          </Typography>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <TextField fullWidth label="First Name" name="firstName" value={newEmployee.firstName} onChange={handleInputChange} margin="normal" required error={!!errors.firstName} helperText={errors.firstName} />
            <TextField fullWidth label="Last Name" name="lastName" value={newEmployee.lastName} onChange={handleInputChange} margin="normal" required error={!!errors.lastName} helperText={errors.lastName} />
            <TextField fullWidth label="Email" name="email" value={newEmployee.email} onChange={handleInputChange} margin="normal" required error={!!errors.email} helperText={errors.email} />
            <TextField fullWidth label="Phone Number" name="phoneNumber" value={newEmployee.phoneNumber} onChange={handleInputChange} margin="normal" required error={!!errors.phoneNumber} helperText={errors.phoneNumber} />

            {/* Dropdown to select the userType */}
            <FormControl fullWidth margin="normal" required error={!!errors.userType}>
              <InputLabel>Role</InputLabel>
              <Select
                name="userType"
                value={newEmployee.userType}
                onChange={handleInputChange}
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
              <FormHelperText>{errors.userType}</FormHelperText>
            </FormControl>

            <TextField fullWidth type="file" onChange={handleFileChange} margin="normal" error={!!errors.profileImage} helperText={errors.profileImage} />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              {selectedEmployee ? "Update Employee" : "Add Employee"}
            </Button>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default EmployeesPage;

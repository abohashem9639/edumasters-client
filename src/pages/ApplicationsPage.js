import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userType = localStorage.getItem("userType");  // أو يمكنك استخدام sessionStorage أو أي طريقة أخرى لتخزين نوع المستخدم
    axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Applications`, { 
      params: { isAdmin: userType !== "A" }  // إرسال المعامل isAdmin بناءً على نوع المستخدم
    })
      .then(response => {
        setApplications(response.data);
      })
      .catch(error => {
        console.error("Error fetching applications:", error);
      });
  }, []);

  const handleViewApplication = (id) => {
    navigate(`/applications/${id}`);
  };

  const handleAddApplication = () => {
    navigate(`/add-application`);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Applications
        </Typography>
        <Button variant="contained" color="success" onClick={handleAddApplication}>
          + Add Application
        </Button>
      </Grid>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Student Name</TableCell>
            <TableCell>Degree</TableCell>
            <TableCell>University</TableCell>
            <TableCell>Branch</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell>
                {application.student ? `${application.student.firstName} ${application.student.lastName}` : "No student data"}
              </TableCell>
              <TableCell>{application.degree}</TableCell>
              <TableCell>{application.university ? application.university.name : "No university data"}</TableCell>
              <TableCell>{application.branch ? application.branch.branchName : "No branch data"}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleViewApplication(application.id)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ApplicationsPage;

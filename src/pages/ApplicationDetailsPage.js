import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Card,
  CardMedia,
  CardContent,
  Paper,
  Menu,
  MenuItem,
  Button,
  Modal,
  TextField,
  Select,
  InputLabel,
  FormControl,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useParams } from "react-router-dom";

const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [files, setFiles] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackMessage, setSnackMessage] = useState("");
  const [isCustomFileName, setIsCustomFileName] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const fileNames = [
    "Conditional acceptance",
    "Final acceptance",
    "Deposit",
    "Missing document",
    "Ogrenci bilgisi",
    "Student confirmation",
    "Swift File",
    "Student payment receipt",
  ];

  const statusOptions = [
    "Ready to Apply",
    "Applied",
    "Missing Documents",
    "Missing Docs Uploaded",
    "Similar",
    "Rejected",
    "Conditional Letter Issued",
    "Deposit Paid",
    "Final Acceptance Letter Issued",
    "Registration Done",
  ];

  useEffect(() => {
    axios
      .get(`https://localhost:7048/api/Applications/${id}`)
      .then((response) => {
        setApplication(response.data);
        setSelectedStatus(response.data.status);
        fetchStudentDetails(response.data.student.id);
        fetchFilesForApplication();
      })
      .catch((error) => console.error("Error fetching application details:", error));
  }, [id]);

  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await axios.get(`https://localhost:7048/api/Students/${studentId}`);
      setStudentInfo(response.data);

      // Fetch student profile image
      const filesResponse = await axios.get(`https://localhost:7048/api/Students/${studentId}/files`);
      const profileFile = filesResponse.data.find((file) => file.fileType.toLowerCase() === "profileimage");

      if (profileFile) {
        setProfileImage(`https://localhost:7048${profileFile.filePath}`);
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  const fetchFilesForApplication = async () => {
    try {
      const response = await axios.get(`https://localhost:7048/api/ApplicationFiles/${id}`);
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`https://localhost:7048/api/Applications/${id}`, { status: newStatus });
      setSelectedStatus(newStatus);
      setApplication({ ...application, status: newStatus });
      setAnchorEl(null);
    } catch (error) {
      console.error("Error updating application status:", error);
      alert(error.response?.data?.message || "Failed to update status.");
    }
  };

  const copyToClipboard = (label, value) => {
    const textToCopy = `${label}: ${value}`;
    navigator.clipboard.writeText(textToCopy);
    setCopyMessage(`Copied: ${textToCopy}`);
    setOpenSnackbar(true);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const userId = localStorage.getItem("userId");

  const handleUploadFile = async () => {
    if (!selectedFile || !fileName) {
      setSnackMessage("Please provide a file and a file name.");
      setOpenSnackbar(true);
      return;
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("fileName", fileName);
    formData.append("applicationId", id);
    formData.append("CreatedByUserId", userId);
  
    try {
      await axios.post("https://localhost:7048/api/ApplicationFiles/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOpenModal(false);
      setSnackMessage("File uploaded successfully!");  // Correct success message
      setOpenSnackbar(true);
      setFileName("");
      setSelectedFile(null);
      fetchFilesForApplication();
    } catch (error) {
      setSnackMessage("Error uploading file.");  // Error message in case of failure
      setOpenSnackbar(true);
    }
  };
  

  return (
    <Box sx={{ padding: 4 }}>
      {application ? (
        <>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}>Application Details</Typography>

          {/* Status Button */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Button
              variant="outlined"
              color="success"
              sx={{ fontWeight: "bold", paddingX: 3, paddingY: 1 }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              {selectedStatus}
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              {statusOptions.map((status, index) => (
                <MenuItem key={index} onClick={() => handleStatusChange(status)}>
                  {status}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Tabs */}
          <Paper sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
            <Tabs
              value={tabIndex}
              onChange={(e, newIndex) => setTabIndex(newIndex)}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Tab label="Student Information" />
              <Tab label="Program Details" />
              <Tab label="Application Documents" />
            </Tabs>
          </Paper>

 {/* Tab Content */}
{tabIndex === 0 && studentInfo && (
  <Box sx={{ padding: 2 }}>
    <Card sx={{ display: "flex", alignItems: "center", mb: 2, padding: 2 }}>
      <CardMedia
        component="img"
        sx={{ width: 100, height: 100, borderRadius: "50%" }}
        image={profileImage || "/default-avatar.png"}
        alt="Student Profile"
      />
      <CardContent>
        <Typography variant="h5">{studentInfo.firstName} {studentInfo.lastName}</Typography>
        <Typography variant="subtitle1" color="text.secondary">{studentInfo.nationality}</Typography>
      </CardContent>
    </Card>

    {/* Student Information - Table Layout */}
    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>Student Information</Typography>
    <Table sx={{ minWidth: 650 }} aria-label="student-info-table">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: "bold" }}>Label</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}>Details</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[
          { label: "Student Name", value: `${studentInfo.firstName} ${studentInfo.lastName}` },
          { label: "Mother Name", value: studentInfo.motherName },
          { label: "Father Name", value: studentInfo.fatherName },
          { label: "Nationality", value: studentInfo.nationality },
          { label: "Passport ID", value: studentInfo.passportNumber },
          { label: "Phones", value: studentInfo.phoneNumber },
          { label: "Date of Birth", value: studentInfo.dateOfBirth ? new Date(studentInfo.dateOfBirth).toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }) : "No date available" },
        ].map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.label}</TableCell>
            <TableCell>{item.value}</TableCell>
            <TableCell>
              <Tooltip title="Copy">
                <IconButton onClick={() => copyToClipboard(item.label, item.value)}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
)}

{/* Program Details */}
{tabIndex === 1 && application && (
  <Box sx={{ padding: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>Program Details</Typography>
    <Table sx={{ minWidth: 650 }} aria-label="program-details-table">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: "bold" }}>Label</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}>Details</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[
          { label: "Country & City", value: `${application.university.country} - ${application.university.city}` },
          { label: "University", value: application.university.name },
          { label: "Degree", value: application.degree },
          { label: "Department", value: application.branch.branchName },
          { label: "Language", value: application.language },
        ].map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.label}</TableCell>
            <TableCell>{item.value}</TableCell>
            <TableCell>
              <Tooltip title="Copy">
                <IconButton onClick={() => copyToClipboard(item.label, item.value)}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
)}


          {/* Application Files */}
          {tabIndex === 2 && (
            <Box sx={{ padding: 2 }}>
              <Typography variant="h6" gutterBottom>Uploaded Files</Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ marginBottom: 2 }}
                onClick={() => setOpenModal(true)}
              >
                Upload File
              </Button>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>File Name</TableCell>
                      <TableCell>Uploaded By</TableCell>
                      <TableCell>Upload Date</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>{file.fileName}</TableCell>
                        <TableCell>{file.uploadedBy}</TableCell>
                        <TableCell>{new Date(file.createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            href={`https://localhost:7048/${file.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

           {/* Modal for uploading file */}
           <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <Box sx={{ padding: 4, backgroundColor: "white", margin: "auto", marginTop: 10, maxWidth: 400 }}>
              <Typography variant="h6" gutterBottom>Upload File</Typography>

              {/* File name selection */}
              {!isCustomFileName && (
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                  <InputLabel>File Name</InputLabel>
                  <Select
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    label="File Name"
                  >
                    {fileNames.map((type, index) => (
                      <MenuItem key={index} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Option for custom file name */}
              {isCustomFileName && (
                <TextField
                  label="File Name"
                  variant="outlined"
                  fullWidth
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  sx={{ marginBottom: 2 }}
                />
              )}
              
              {/* Option to enter custom file name */}
              {!isCustomFileName && (
                <Box sx={{ marginBottom: 2 }}>
                  <Button variant="outlined" onClick={() => setIsCustomFileName(true)}>
                    Enter Custom File Name
                  </Button>
                </Box>
              )}
              <input type="file" onChange={handleFileChange} />
              <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <Button variant="contained" onClick={handleUploadFile}>Upload</Button>
                <Button variant="outlined" onClick={() => setOpenModal(false)}>Cancel</Button>
              </Box>
            </Box>
          </Modal>

          {/* Snackbar for copied message */}
          <Snackbar 
            open={openSnackbar} 
            autoHideDuration={2000} 
            onClose={() => setOpenSnackbar(false)}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}  // Positioning the Snackbar
          >
            <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: "100%" }}>
              {copyMessage}
            </Alert>
          </Snackbar>
        </>
      ) : (
        <Typography variant="h6" color="text.secondary">Loading...</Typography>
      )}
    </Box>
  );
};

export default ApplicationDetailsPage;

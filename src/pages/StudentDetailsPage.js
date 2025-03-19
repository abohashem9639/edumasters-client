import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; 
import { Box, Typography, Button, Grid, FormControl, InputLabel, Select, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";
import { Avatar, Card, CardContent, Divider } from "@mui/material";
import { CloudDownload } from "@mui/icons-material";

const StudentDetailsPage = () => {
  const { id } = useParams(); // استخدام useParams للوصول إلى معرف الطالب
  const [student, setStudent] = useState(null);
  const [files, setFiles] = useState({});
  const [universities, setUniversities] = useState([]);
  const [branches, setBranches] = useState([]);
  const [application, setApplication] = useState({
    degree: "",
    universityId: "",
    language: "",
    term: "",
    branchId: "",
  });
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const createdByUserId = localStorage.getItem("userId"); // ✅ إزالة `useState`
  const navigate = useNavigate();

  // ✅ جلب بيانات الطالب عند تحميل الصفحة أو عند تغيير `id`
  useEffect(() => {
    if (id) {
      axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Students/${id}`)
        .then((response) => {
          console.log("Fetched Student Data:", response.data);
          setStudent(response.data);
        })
        .catch((error) => console.error("Error fetching student details:", error));
    } 
  }, [id]);

  useEffect(() => {
    if (id) {
      axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Students/${id}/files`)
        .then((response) => {
          console.log("Fetched Student Files:", response.data);
          setFiles(response.data);
        })
        .catch((error) => console.error("Error fetching student files:", error));
    }
  }, [id]);
  
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (id) {
      axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Students/${id}/files`)
        .then((response) => {
          console.log("Fetched Student Files:", response.data);
          setFiles(response.data);
  
          // ✅ الحصول على الملف الذي نوعه profileImage
          const profileFile = response.data.find(file => file.fileType.toLowerCase() === "profileimage");
  
          // ✅ تعيين الصورة إذا وُجدت
          if (profileFile) {
            setProfileImage(`${process.env.REACT_APP_API_URL_IMAGE}${profileFile.filePath}`);
          }
        })
        .catch((error) => console.error("Error fetching student files:", error));
    }
  }, [id]);
  
  
  // ✅ جلب قائمة الجامعات مرة واحدة فقط عند تحميل الصفحة
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Universities`)
      .then((response) => {
        setUniversities(response.data);
      })
      .catch((error) => console.error("Error fetching universities:", error));
  }, []); // ✅ `[]` لمنع إعادة الاستدعاء المتكرر

  const handleUniversityChange = async (e) => {
    const universityId = e.target.value;
    setApplication({ ...application, universityId });

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/UniversityBranches?universityId=${universityId}`);
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const handleSubmitApplication = async () => {
    const applicationData = {
      degree: application.degree,
      universityId: parseInt(application.universityId),
      language: application.language,
      term: application.term,
      branchId: parseInt(application.branchId),
      studentId: student.id,
      createdByUserId: parseInt(createdByUserId),
      status: "Ready to Apply"
    };

    try {
      const existingApplications = await axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Applications?isAdmin=false`);

      const duplicate = existingApplications.data.some(app =>
        app.studentId === student.id &&
        app.universityId === parseInt(application.universityId) &&
        app.branchId === parseInt(application.branchId)
      );

      if (duplicate) {
        alert("هذا الطالب لديه بالفعل طلب لنفس الجامعة والفرع.");
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL_LOCAL}/Applications`, applicationData);
      alert(response.data.message);
      setShowApplicationForm(false);
    } catch (error) {
      console.error("Error adding application:", error);
      alert("Failed to add application.");
    }
  };



  return (
    <Box sx={{ padding: 4, maxWidth: "1200px", margin: "auto" }}>
      {student ? (
        <>
          <Paper sx={{ padding: 3, mb: 3, textAlign: "center" }}>
          <Avatar 
  src={profileImage || "/default-avatar.png"} // ✅ استخدام الصورة أو صورة افتراضية
  alt={`${student.firstName} ${student.lastName}`}
  sx={{ width: 120, height: 120, margin: "auto", mb: 2 }}
/>


            <Typography variant="h4">
              {student.firstName} {student.lastName}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {student.nationality} - {student.residenceCountry}
            </Typography>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6">Personal Details</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography><b>Father's Name:</b> {student.fatherName}</Typography>
                  <Typography><b>Mother's Name:</b> {student.motherName}</Typography>
                  <Typography><b>Gender:</b> {student.gender}</Typography>
                  <Typography><b>Phone:</b> {student.phoneNumber}</Typography>
                  <Typography><b>Address:</b> {student.address}</Typography>
                  <Typography><b>Passport Number:</b> {student.passportNumber}</Typography>       
                  <Typography variant="h6">
  <b>Sales Responsible:</b> 
  {student.salesResponsibleName ? (
    <>
      <Avatar 
        src={`${process.env.REACT_APP_API_URL_IMAGE}${student.salesResponsibleProfileImageUrl || "/default-avatar.png"}`}
        alt={student.salesResponsibleName}
        sx={{ width: 30, height: 30, marginRight: 2 }} // تخصيص حجم الصورة
      />
      {student.salesResponsibleName}
    </>
  ) : "N/A"}
</Typography>
      </CardContent>
    </Card>
  </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6">Educational Details</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography><b>GPA:</b> {student.gpa}</Typography>
                  <Typography><b>Graduation School:</b> {student.graduationSchool}</Typography>
                  <Typography><b>Graduation Country:</b> {student.graduationCountry}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

{/* ✅ زر إضافة طلب جديد */}
<Button
  variant="contained"
  color="success"
  sx={{ mb: 2 }}
  onClick={() => navigate(`/add-application?studentId=${id}`)} // ✅ تحويل المستخدم إلى صفحة الإضافة مع تمرير studentId
>
  + Add Application
</Button>


{/* ✅ عرض الطلبات الحالية للطالب */}
<Typography variant="h6" sx={{ mt: 4 }}>Student Applications</Typography>
{student.applications?.length > 0 ? (
  <TableContainer component={Paper} sx={{ mt: 2 }}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell><b>University</b></TableCell>
          <TableCell><b>Branch</b></TableCell>
          <TableCell><b>Degree</b></TableCell>
          <TableCell><b>Language</b></TableCell>
          <TableCell><b>Term</b></TableCell>
          <TableCell><b>Status</b></TableCell>
          <TableCell><b>Created At</b></TableCell>
          <TableCell><b>Action</b></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {student.applications.map((app) => (
          <TableRow key={app.id}>
            <TableCell>{app.university?.name || "N/A"}</TableCell>
            <TableCell>{app.branch?.branchName || "N/A"}</TableCell>
            <TableCell>{app.degree}</TableCell>
            <TableCell>{app.language}</TableCell>
            <TableCell>{app.term}</TableCell>
            <TableCell>{app.status}</TableCell>
            <TableCell>
  {new Date(app.createdAt).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })}
</TableCell>
<TableCell>
                        {/* ✅ زر التنقل إلى صفحة تفاصيل الطلب */}
                        <Button 
                          variant="contained" 
                          color="primary" 
                          onClick={() => navigate(`/applications/${app.id}`)}
                        >
                          View Application
                        </Button>
                      </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
) : (
  <Typography sx={{ mt: 2 }}>No applications found for this student.</Typography>
)}

<Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: "bold" }}>
  Uploaded Files
</Typography>


{files.length > 0 ? (
  <TableContainer component={Paper} sx={{ mt: 2 }}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell><b>File Type</b></TableCell>
          {/* <TableCell><b>File Name</b></TableCell> */}
          <TableCell><b>Uploaded At</b></TableCell>
          <TableCell><b>Action</b></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.id}>
            <TableCell>{file.fileType || "N/A"}</TableCell>
            {/* <TableCell>{file.filePath.split("/").pop()}</TableCell> */}
            <TableCell>
              {new Date(file.createdAt).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
            <TableCell>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<CloudDownload />}
                onClick={() => window.open(`${process.env.REACT_APP_API_URL_IMAGE}${file.filePath}`, "_blank")}
              >
                Download
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
) : (
  <Typography sx={{ mt: 2 }}>No files uploaded for this student.</Typography>
)}

        </>
      ) : (
        <Typography>Loading...</Typography>
      )}
    </Box>
  );
};

export default StudentDetailsPage;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import countriesData from "../data/countries.json"; // ملف الدول
import {
  Box, Button, TextField, Typography, MenuItem, FormControl, InputLabel, Select, Snackbar, Avatar
} from "@mui/material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import { Backdrop, CircularProgress, LinearProgress } from "@mui/material";
import { TableBody, TableCell, TableRow, TableHead, Table } from "@mui/material";

const AddStudentPage = () => {
  const navigate = useNavigate();

  // ✅ متغيرات تحميل البيانات والملفات
  const [studentUploadProgress, setStudentUploadProgress] = useState(0);
  const [filesUploadProgress, setFilesUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({}); // ✅ حفظ الملفات بشكل منفصل
  const [step, setStep] = useState(1); // ✅ حالة الخطوة الحالية: 1 -> إضافة بيانات الطالب, 2 -> رفع الملفات, 3 -> مراجعة البيانات
  const [errorMessage, setErrorMessage] = useState("");
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  
  // ✅ بيانات الطالب
  const [student, setStudent] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    motherName: "",
    gender: "",
    nationality: "",
    dateOfBirth: "",
    phoneNumber: "",
    residenceCountry: "",
    address: "",
    passportNumber: "",
    gpa: "",
    graduationSchool: "",
    graduationCountry: "",
    salesResponsibleType: "", 
    salesResponsibleId: "",
    salesResponsibleProfileImageUrl: ""   
  });

    // ✅ تعريف الملفات
    const fileLabels = {
      profileImage: "Profile Image",
      passportImage: "Passport Image",
      highSchoolDiploma: "High School Diploma",
      transcript: "Transcript",
      yos: "Yös",
      sat: "Sat",
      diplomatTranslation: "Diplomat Translation",
      transcriptTranslation: "Transcript Translation",
      cv: "CV",
      toefel: "Toefel",
      ielts: "Ielts",
      tomer: "Tomer",
      certification: "Certification",
      addressDoc: "The Address",
      idNationality: "ID Nationality",
      letterOfRecommendation: "Letter of Recommendation",
      transcriptDescription: "Transcript Description",
      other1: "Other - 1",
      other2: "Other - 2",
    };
    
  const [errors, setErrors] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(countriesData.find((c) => c.code === "TR"));
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [salesResponsibles, setSalesResponsibles] = useState([]);

  // استيراد قائمة المسؤولين بناءً على النوع المحدد
  useEffect(() => {
    if (student.salesResponsibleType) {
      axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Students/get-sales-responsibles?salesResponsibleType=${student.salesResponsibleType}`)
        .then(response => {
          setSalesResponsibles(response.data);
        })
        .catch(error => {
          console.error("Error fetching sales responsibles:", error);
        });
    }
  }, [student.salesResponsibleType]);
  
  const validateForm = () => {
    let newErrors = {};
    Object.keys(student).forEach((key) => {
      if (!student[key] && key !== "passportNumber") {
        newErrors[key] = "This field is required";
      }
    });
  
    // تحقق من البريد الإلكتروني
    if (student.email && !/\S+@\S+\.\S+/.test(student.email)) {
      newErrors.email = "Invalid email address";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFiles((prev) => ({
        ...prev,
        [fileType]: file,
      }));
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateForm()) return;
      setStep(2); // الانتقال للخطوة الثانية (رفع الملفات)
    } else if (step === 2) {
      setStep(3); // الانتقال للمرحلة الثالثة (المراجعة)
    } else {
      handleSubmit(); // إرسال البيانات بعد المراجعة
    }
  };

  const handleBackStep = () => {
    if (step === 2) {
      setStep(1); // الرجوع للمرحلة الأولى
    } else if (step === 3) {
      setStep(2); // الرجوع للمرحلة الثانية
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // تعيين قيمة افتراضية لصورة الملف الشخصي في حال لم يتم رفع صورة
    if (!student.profileImageUrl) {
      student.profileImageUrl = '/uploads/default-profile-image.png'; // تعيين رابط الصورة الافتراضية
    }
  
    setIsUploading(true);
    setStudentUploadProgress(10);
    setFilesUploadProgress({});
  
    const formData = new FormData();
    Object.entries(student).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });    
    
    console.log('Form data:', formData); // للتحقق من البيانات المرسلة
    
  
    const createdByUserId = localStorage.getItem("userId");
    if (!createdByUserId) {
      setErrorMessage("Invalid user data. Please log in.");
      setOpenErrorSnackbar(true); // إظهار إشعار الخطأ
      setIsUploading(false);
      return;
    }
    formData.append("CreatedByUserId", createdByUserId);
    console.log('Sales Responsible Type:', student.salesResponsibleType);
    console.log('Sales Responsible ID:', student.salesResponsibleId);
    
    try {
      // رفع بيانات الطالب
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL_LOCAL}/Students`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setStudentUploadProgress(percentCompleted);
          },
        }
      );
  
      const studentId = response.data.id;
      console.log("Student created, ID:", studentId);
      setStudentUploadProgress(100);
  
      // رفع الملفات
      if (Object.keys(selectedFiles || {}).length > 0) {
        await uploadFiles(studentId);
      }
  

      setTimeout(() => {
        setIsUploading(false);
        navigate("/students");
      }, 1500);
    } catch (error) {
      console.error("Error sending student data:", error);
      setErrorMessage(error.response?.data || "Failed to add student.");
      setOpenErrorSnackbar(true);
      setIsUploading(false);
    }
  };

  const uploadFiles = async (studentId) => {
    setFilesUploadProgress({});
  
    for (const [fileType, file] of Object.entries(selectedFiles)) {
      const formData = new FormData();
      const newFileName = `${student.firstName}_${student.lastName}_${fileType}_${studentId}${file.name.substring(file.name.lastIndexOf("."))}`;
      formData.append("files", file, newFileName);
      formData.append("fileTypes", fileType);
  
      try {
        await axios.post(
          `${process.env.REACT_APP_API_URL_LOCAL}/Students/${studentId}/upload-files`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setFilesUploadProgress((prev) => ({
                ...prev,
                [fileType]: percentCompleted,
              }));
            },
          }
        );
        console.log(`File uploaded successfully: ${fileType}`);
      } catch (error) {
        console.error(`Error uploading file: ${fileType}`, error);
        setErrorMessage(`Failed to upload file: ${fileType}`);
        setOpenErrorSnackbar(true); // إظهار إشعار الخطأ
        alert(`Failed to upload file: ${fileType}`);
      }
    }
  };

  const generateRandomData = () => {
    setStudent({
      firstName: "John",
      lastName: "Doe",
      fatherName: "Father Name",
      motherName: "Mother Name",
      gender: "Male",
      nationality: "USA",
      dateOfBirth: "1990-01-01",
      phoneNumber: "+1234567890",
      residenceCountry: "USA",
      address: "123 Main St, City, Country",
      email: "example@domain.com",
      passportNumber: Math.floor(Math.random() * 1000000000).toString(),
      gpa: "3.8",
      graduationSchool: "Some High School",
      graduationCountry: "USA",
    });
  };
  
  return (
    <Box sx={{ maxWidth: 600, margin: "auto", padding: 3 }}>
      {/* خطوات التقدم */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Typography variant="body1" sx={{ mr: 3, fontWeight: step === 1 ? "bold" : "normal" }}>
          <span style={{ color: step === 1 ? "blue" : "gray" }}>•</span> STUDENT
        </Typography>
        <Typography variant="body1" sx={{ mr: 3, fontWeight: step === 2 ? "bold" : "normal" }}>
          <span style={{ color: step === 2 ? "blue" : "gray" }}>•</span> PROGRAM
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: step === 3 ? "bold" : "normal" }}>
          <span style={{ color: step === 3 ? "blue" : "gray" }}>•</span> REVIEW
        </Typography>
      </Box>

      {/* التفاعل مع القسم بناءً على الخطوة */}
      <Typography variant="h4" sx={{ mb: 3 }}>
        {step === 1 ? "Add Student Data" : step === 2 ? "Upload Files" : "Review"}
      </Typography>

      <form onSubmit={(e) => e.preventDefault()} encType="multipart/form-data">
        {step === 1 ? (
          <>
            {/* قسم بيانات الطالب */}
            <TextField
              fullWidth label="First Name" name="firstName"
              value={student.firstName} onChange={(e) => setStudent({ ...student, firstName: e.target.value })}
              margin="normal" required
            />
            <TextField
              fullWidth label="Last Name" name="lastName"
              value={student.lastName} onChange={(e) => setStudent({ ...student, lastName: e.target.value })}
              margin="normal" required error={!!errors.lastName} helperText={errors.lastName}
            />
            <TextField
              fullWidth label="Father Name" name="fatherName"
              value={student.fatherName} onChange={(e) => setStudent({ ...student, fatherName: e.target.value })}
              margin="normal" required error={!!errors.fatherName} helperText={errors.fatherName}
            />
            <TextField
              fullWidth label="Mother Name" name="motherName"
              value={student.motherName} onChange={(e) => setStudent({ ...student, motherName: e.target.value })}
              margin="normal" required error={!!errors.motherName} helperText={errors.motherName}
            />
            <FormControl fullWidth margin="normal" required error={!!errors.gender}>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender" value={student.gender}
                onChange={(e) => setStudent({ ...student, gender: e.target.value })}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth label="Nationality" name="nationality"
              value={student.nationality} onChange={(e) => setStudent({ ...student, nationality: e.target.value })}
              margin="normal" required error={!!errors.nationality} helperText={errors.nationality}
            />
            <TextField
              fullWidth label="Residence Country" name="residenceCountry"
              value={student.residenceCountry} onChange={(e) => setStudent({ ...student, residenceCountry: e.target.value })}
              margin="normal" required error={!!errors.residenceCountry} helperText={errors.residenceCountry}
            />
            <TextField
              fullWidth label="Date of Birth" type="date" name="dateOfBirth"
              value={student.dateOfBirth} onChange={(e) => setStudent({ ...student, dateOfBirth: e.target.value })}
              margin="normal" required error={!!errors.dateOfBirth} helperText={errors.dateOfBirth}
              InputLabelProps={{ shrink: true }}
            />
            <PhoneInput
              country={selectedCountry?.code.toLowerCase() || "tr"}
              value={student.phoneNumber}
              onChange={(phone) => setStudent({ ...student, phoneNumber: phone })}
              inputStyle={{ width: "100%", height: "56px" }}
              dropdownStyle={{ maxHeight: "200px", overflowY: "auto" }}
              required
            />
            <TextField
              fullWidth label="Address" name="address"
              value={student.address} onChange={(e) => setStudent({ ...student, address: e.target.value })}
              margin="normal" required error={!!errors.address} helperText={errors.address}
            />
            <TextField
  fullWidth
  label="Email"
  name="email"
  value={student.email}
  onChange={(e) => setStudent({ ...student, email: e.target.value })}
  margin="normal"
  required
  error={!!errors.email}
  helperText={errors.email}
/>

            <TextField
              fullWidth label="Passport Number" name="passportNumber"
              value={student.passportNumber} onChange={(e) => setStudent({ ...student, passportNumber: e.target.value })}
              margin="normal" required error={!!errors.passportNumber} helperText={errors.passportNumber}
            />
            <TextField
              fullWidth label="GPA" name="gpa" type="number"
              value={student.gpa} onChange={(e) => setStudent({ ...student, gpa: e.target.value })}
              margin="normal" required error={!!errors.gpa} helperText={errors.gpa}
            />
            <TextField
              fullWidth label="Graduation School" name="graduationSchool"
              value={student.graduationSchool} onChange={(e) => setStudent({ ...student, graduationSchool: e.target.value })}
              margin="normal" required error={!!errors.graduationSchool} helperText={errors.graduationSchool}
            />
            <TextField
              fullWidth label="Graduation Country" name="graduationCountry"
              value={student.graduationCountry} onChange={(e) => setStudent({ ...student, graduationCountry: e.target.value })}
              margin="normal" required error={!!errors.graduationCountry} helperText={errors.graduationCountry}
            />

            {/* إضافة القوائم المنسدلة لاختيار نوع المسؤول */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Sales Responsible Type</InputLabel>
              <Select
                name="salesResponsibleType"
                value={student.salesResponsibleType}
                onChange={(e) => setStudent({ ...student, salesResponsibleType: e.target.value })}
              >
                <MenuItem value="Sales Person">Sales Person</MenuItem>
                <MenuItem value="Agent Person">Agent Person</MenuItem>
                <MenuItem value="subAgent Person">SubAgent Person</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
  <InputLabel>Sales Responsible</InputLabel>
  <Select
    name="salesResponsibleId"
    value={student.salesResponsibleId}
    onChange={(e) => {
      const selectedResponsible = salesResponsibles.find(res => res.id === e.target.value);
      setStudent({
        ...student,
        salesResponsibleId: selectedResponsible.id,
        salesResponsibleName: `${selectedResponsible.firstName} ${selectedResponsible.lastName}`, // حفظ الاسم الكامل
        salesResponsibleProfileImageUrl: selectedResponsible.profileImageUrl || "/default-avatar.png", // حفظ مسار صورة المسؤول
      });
    }}
  >
    {salesResponsibles.map((responsible) => (
      <MenuItem key={responsible.id} value={responsible.id}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={`${process.env.REACT_APP_API_URL_IMAGE}${responsible.profileImageUrl || "/uploads/default-avatar.png"}`}
            alt={responsible.firstName}
            sx={{ width: 30, height: 30, marginRight: 2 }}
          />
          {responsible.firstName} {responsible.lastName}
        </Box>
      </MenuItem>
    ))}
  </Select>
</FormControl>





            {/* زر للانتقال للخطوة التالية */}
            <Button onClick={handleNextStep} variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
              Next
            </Button>
                    {/* زر لملء البيانات العشوائية */}
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={generateRandomData}
        >
          Fill with Random Data
        </Button>
          </>
      ) : step === 2 ? (
        <>
        {/* قسم رفع الملفات */}
        {["profileImage", "passportImage", "highSchoolDiploma", "transcript", "yos", "sat", "diplomatTranslation", "transcriptTranslation", "cv", "toefel", "ielts", "tomer", "certification", "addressDoc", "idNationality", "letterOfRecommendation", "transcriptDescription", "other1", "other2"].map((fileKey, index) => (
  <TextField
    key={index}
    fullWidth
    type="file"
    label={fileLabels[fileKey]}
    margin="normal"
    onChange={(e) => handleFileChange(e, fileKey)} // تفعيل المعالج دون تعيين value
  />
))}



        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button onClick={handleBackStep} variant="outlined" color="primary" sx={{ mt: 3 }}>
            Back
          </Button>
          <Button onClick={handleNextStep} variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
            Next
          </Button>
        </Box>
      </>
      ) : (
        <>
        {/* قسم المراجعة */}
        <Typography variant="h6">Review the student Information</Typography>
        <div>
          <Typography><strong>Name:</strong> {student.firstName} {student.lastName}</Typography>
          <Typography><strong>Father's Name:</strong> {student.fatherName}</Typography>
          <Typography><strong>Mother's Name:</strong> {student.motherName}</Typography>
          <Typography><strong>Gender:</strong> {student.gender}</Typography>
          <Typography><strong>Nationality:</strong> {student.nationality}</Typography>
          <Typography><strong>Residence Country:</strong> {student.residenceCountry}</Typography>
          <Typography><strong>Date of Birth:</strong> {student.dateOfBirth}</Typography>
          <Typography><strong>Phone Number:</strong> {student.phoneNumber}</Typography>
          <Typography><strong>Address:</strong> {student.address}</Typography>
          <Typography><strong>Passport Number:</strong> {student.passportNumber}</Typography>
          <Typography><strong>GPA:</strong> {student.gpa}</Typography>
          <Typography><strong>Graduation School:</strong> {student.graduationSchool}</Typography>
          <Typography><strong>Graduation Country:</strong> {student.graduationCountry}</Typography>
          <Typography variant="h6">
  <b>Sales Responsible:</b> 
  {student.salesResponsibleName ? (
    <>
<Avatar
  src={`${process.env.REACT_APP_API_URL_IMAGE}${student.salesResponsibleProfileImageUrl || "/uploads/default-avatar.png"}`}
  alt={student.salesResponsibleName}
  sx={{ width: 30, height: 30, marginRight: 2 }} // تخصيص حجم الصورة
/>

      {student.salesResponsibleName}
    </>
  ) : "N/A"}
</Typography>

        </div>
 {/* عرض الملفات في جدول */}
<Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Uploaded Files</Typography>
{Object.keys(selectedFiles).length > 0 ? (
  <Box sx={{ width: "100%", overflowX: "auto" }}>
    <Table sx={{ minWidth: 650 }}>
      <TableHead>
        <TableRow>
          <TableCell><strong>File Type</strong></TableCell>
          <TableCell><strong>File Name</strong></TableCell>
          <TableCell><strong>Action</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(selectedFiles).map(([fileType, file]) => (
          <TableRow key={fileType}>
            <TableCell>{fileLabels[fileType]}</TableCell>
            <TableCell>{file.name}</TableCell>
            <TableCell>
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.open(URL.createObjectURL(file), "_blank")}
              >
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
) : (
  <Typography>No files uploaded yet.</Typography>
)}


        {/* أزرار الرجوع والإرسال */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button onClick={handleBackStep} variant="outlined" color="primary" sx={{ mt: 3 }}>
            Back
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ mt: 3 }}>
            Submit
          </Button>
        </Box>
      </>
    )}
  </form>

      {/* Snackbar for error message */}
      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenErrorSnackbar(false)}
        message={errorMessage}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}  // Display at top-right corner
        sx={{ zIndex: 1300 }} // Ensure it's above other components
      />


  {/* Backdrop for uploading */}
  <Backdrop open={isUploading} sx={{ zIndex: 1300, color: "#fff", flexDirection: "column" }}>
    <Typography variant="h5" sx={{ mb: 2 }}>Uploading Data...</Typography>
    <LinearProgress variant="determinate" value={studentUploadProgress} sx={{ width: "80%", mb: 2 }} />
    {Object.keys(filesUploadProgress).map((file) => (
      <Box key={file} sx={{ width: "80%", textAlign: "left", mb: 2 }}>
        <Typography variant="body2">{file} ({filesUploadProgress[file]}%)</Typography>
        <LinearProgress variant="determinate" value={filesUploadProgress[file]} />
      </Box>
    ))}
    <CircularProgress color="inherit" />
  </Backdrop>
</Box>
);
};

export default AddStudentPage;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Button, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf"; // استيراد مكتبة jsPDF

const StudentsListPage = () => {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Students`)
      .then((response) => {
        console.log(response.data);  // تحقق من الرد هنا
        setStudents(response.data);  // تعيين البيانات للمصفوفة students
      })
      .catch((error) => console.error("Error fetching students:", error));
  }, []);

  // دالة لتنزيل الجدول كـ PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Students List", 14, 20);  // عنوان الوثيقة

    let yOffset = 30;  // بداية السطر للكتابة
    // إضافة رؤوس الأعمدة
    doc.text("Name", 14, yOffset);
    doc.text("Phone", 70, yOffset);
    doc.text("Actions", 130, yOffset);
    yOffset += 10;

    // إضافة بيانات الطلاب
    students.forEach((student) => {
      doc.text(`${student.firstName} ${student.lastName}`, 14, yOffset);
      doc.text(student.phoneNumber, 70, yOffset);
      doc.text("View", 130, yOffset); // قد ترغب في إضافة رابط أو آلية أخرى لعرض التفاصيل
      yOffset += 10;
    });

    // تنزيل PDF
    doc.save("students_list.pdf");
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4">Students List</Typography>
      
      {/* زر إضافة طالب */}
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={() => navigate("/add-student")} // الانتقال إلى صفحة إضافة الطالب
      >
        Add New Student
      </Button>
      
      {/* زر لتنزيل الجدول كـ PDF */}
      <Button
        variant="contained"
        color="secondary"
        sx={{ mt: 2, ml: 2 }}
        onClick={downloadPDF} // استدعاء دالة تنزيل PDF
      >
        Download as PDF
      </Button>

      {students.length === 0 ? (
        <Typography>No students found.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.firstName} {student.lastName}</TableCell>
                <TableCell>{student.phoneNumber}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/students/${student.id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default StudentsListPage;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  FormGroup,
  FormControlLabel,
  MenuItem,
  Select,
  CircularProgress
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";

const BranchesPage = () => {
  const { universityId } = useParams();
  const { user } = useAuth(); 
  const [branches, setBranches] = useState([]);
  const [processedBranches, setProcessedBranches] = useState([]); // الفروع المعالجة
  const [filteredBranches, setFilteredBranches] = useState([]); // الفروع المفلترة
  const [branchNames, setBranchNames] = useState([]); // أسماء الأفرع
  const [filterCriteria, setFilterCriteria] = useState({
    branchName: "",
    durationYears: "",
    annualFee: "",
    levels: [],
    languages: [],
  });

  const [universityLogoUrl, setUniversityLogoUrl] = useState(""); 
  const [universityName, setUniversityName] = useState("");
  const [loading, setLoading] = useState(false);

  const [newBranch, setNewBranch] = useState({
    branchName: "",
    durationYears: "",
    annualFee: "",
    levels: [],
    languages: [],
    price: "",
    discountPrice: "",
    cashPrice: "",
    currency: "USD", // افتراضي
    ourCommission: "",
    status: "opening",
  });
  
  const [openBranchDialog, setOpenBranchDialog] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, [universityId]);

  useEffect(() => {
    applyFilters(); // تطبيق الفلترة عند تحديث البيانات أو معايير الفلترة
  }, [filterCriteria, processedBranches]);

  const fetchBranches = async () => {
    setLoading(true);
    try {
        // ✅ جلب بيانات الفروع
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL_LOCAL}/UniversityBranches?universityId=${universityId}`
        );

        if (response.data && Array.isArray(response.data)) {
            processBranches(response.data);
        } else {
            console.warn("Unexpected response format:", response.data);
            setProcessedBranches([]);
            setFilteredBranches([]);
        }

        // ✅ جلب بيانات الجامعة (بما في ذلك الشعار)
        const universityResponse = await axios.get(
            `${process.env.REACT_APP_API_URL_LOCAL}/Universities/${universityId}`
        );

        setUniversityName(universityResponse.data?.name || "Unknown University");
        setUniversityLogoUrl(universityResponse.data?.logoUrl || "");

    } catch (error) {
        console.error("Error fetching branches or university name:", error);
    } finally {
        setLoading(false);
    }
};



const processBranches = (branchesData) => {
  const result = [];
  const branchNamesSet = new Set();

  branchesData.forEach((branch) => {
    const levels = branch.levels.split(",");
    const languages = branch.languages.split(",");

    levels.forEach((level) => {
      languages.forEach((language) => {
        result.push({
          ...branch,
          level: level.trim(),
          language: language.trim(),
          price: branch.price,  // ✅ إضافة السعر
          discountPrice: branch.discountPrice, // ✅ السعر المخفض
          cashPrice: branch.cashPrice, // ✅ السعر النقدي
          currency: branch.currency, // ✅ العملة
          ourCommission: branch.ourCommission, // ✅ العمولة
          status: branch.status, // ✅ الحالة (مفتوح/مغلق)
        });
      });
    });

    branchNamesSet.add(branch.branchName);
  });

  setProcessedBranches(result); // تحديث الفروع المعالجة
  setFilteredBranches(result); // تعيين الفروع المفلترة مبدئيًا
  setBranchNames(Array.from(branchNamesSet)); // إعداد أسماء الأفرع
};

  const applyFilters = () => {
    let filtered = processedBranches;

    if (filterCriteria.branchName) {
      filtered = filtered.filter(
        (branch) =>
          branch.branchName.toLowerCase() === filterCriteria.branchName.toLowerCase()
      );
    }

    if (filterCriteria.durationYears) {
      filtered = filtered.filter(
        (branch) => branch.durationYears === parseInt(filterCriteria.durationYears, 10)
      );
    }

    if (filterCriteria.annualFee) {
      filtered = filtered.filter(
        (branch) => branch.annualFee <= parseFloat(filterCriteria.annualFee)
      );
    }

    if (filterCriteria.levels.length > 0) {
      filtered = filtered.filter((branch) =>
        filterCriteria.levels.includes(branch.level)
      );
    }

    if (filterCriteria.languages.length > 0) {
      filtered = filtered.filter((branch) =>
        filterCriteria.languages.includes(branch.language)
      );
    }

    setFilteredBranches(filtered);
  };

  const handleOpenBranchDialog = () => {
    setOpenBranchDialog(true);
  };

  const handleAddBranch = async () => {
    try {
      if (!newBranch.branchName || !newBranch.durationYears || !newBranch.annualFee || !newBranch.price) {
        alert("Please fill in all required fields.");
        return;
      }
  
      if (newBranch.levels.length === 0 || newBranch.languages.length === 0) {
        alert("Please select at least one Level and one Language.");
        return;
      }
  
      const branchData = {
        universityId: parseInt(universityId, 10),
        branchName: newBranch.branchName,
        durationYears: parseInt(newBranch.durationYears, 10),
        annualFee: parseFloat(newBranch.annualFee),
        levels: newBranch.levels,
        languages: newBranch.languages,
        price: parseFloat(newBranch.price),
        discountPrice: parseFloat(newBranch.discountPrice),
        cashPrice: parseFloat(newBranch.cashPrice),
        currency: newBranch.currency,
        ourCommission: parseFloat(newBranch.ourCommission),
        status: newBranch.status,
      };
  
      await axios.post(`${process.env.REACT_APP_API_URL_LOCAL}/UniversityBranches`, branchData);
      alert("Branch added successfully");
      fetchBranches();
      setOpenBranchDialog(false);
      setNewBranch({
        branchName: "",
        durationYears: "",
        annualFee: "",
        levels: [],
        languages: [],
        price: "",
        discountPrice: "",
        cashPrice: "",
        currency: "USD",
        ourCommission: "",
        status: "opening",
      });
    } catch (error) {
      console.error("Error adding branch:", error.response?.data || error);
    }
  };
  
  

  const handleCheckboxChange = (field, value) => {
    setNewBranch((prevBranch) => {
      const updatedField = prevBranch[field];
      if (updatedField.includes(value)) {
        return { ...prevBranch, [field]: updatedField.filter((v) => v !== value) };
      } else {
        return { ...prevBranch, [field]: [...updatedField, value] };
      }
    });
  };

  const handleCheckboxChange1 = (field, value) => {
    setFilterCriteria((prevCriteria) => {
      const currentValues = prevCriteria[field];
      // إذا كانت القيمة موجودة، نقوم بإزالتها (إلغاء التحديد)
      if (currentValues.includes(value)) {
        return { ...prevCriteria, [field]: currentValues.filter((v) => v !== value) };
      } else {
        // إذا لم تكن القيمة موجودة، نقوم بإضافتها (تحديد المربع)
        return { ...prevCriteria, [field]: [...currentValues, value] };
      }
    });
  };
  

const downloadPDF = () => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const marginX = 20;
    const marginY = 15;

    // ✅ تنسيق اسم الجامعة
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.text(`University: ${universityName}`, marginX, marginY);

    // ✅ إعداد التاريخ والتفاصيل
    const currentDate = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated by: ${user?.firstName || "N/A"} ${user?.lastName || "N/A"}`, marginX, marginY + 10);
    doc.text(`Email: ${user?.email || "N/A"}`, marginX, marginY + 16);
    doc.text(`Generated at: ${currentDate}`, marginX, marginY + 22);

    // ✅ خط فاصل أنيق
    doc.setLineWidth(0.5);
    doc.line(marginX, marginY + 26, 190, marginY + 26);

    // ✅ تحميل الشعار وتحويله إلى Base64 ثم إضافته
    if (universityLogoUrl) { 
        const logoPath = `${process.env.REACT_APP_API_URL_IMAGE}${universityLogoUrl}`;

        toDataURL(logoPath, (dataUrl) => {
            if (dataUrl) {
                doc.addImage(dataUrl, "JPEG", 150, 10, 40, 40); // إضافة الشعار
            }
            generatePDFContent(doc, marginY + 30); // يتم إنشاء المحتوى بعد الشعار
        });
    } else {
        generatePDFContent(doc, marginY + 30);
    }
};

// ✅ دالة تحميل الصورة وتحويلها إلى Base64
const toDataURL = (url, callback) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        const reader = new FileReader();
        reader.onloadend = function () {
            callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = function () {
        console.error("Error loading image:", url);
        callback(null);
    };
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
};

// ✅ دالة لإنشاء الجدول بتنسيق أفضل
const generatePDFContent = (doc, startY) => {
    // ✅ تنسيق الجدول
    const tableColumns = ["Branch Name", "Duration (Years)", "Annual Fee", "Level", "Language"];
    const tableRows = filteredBranches.map((branch) => [
        branch.branchName || "N/A",
        branch.durationYears || "N/A",
        `$${branch.annualFee || "0.00"}`,
        branch.level || "N/A",
        branch.language || "N/A",
    ]);

    doc.autoTable({
        startY: startY,
        head: [tableColumns],
        body: tableRows,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 11, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [240, 240, 240] }, // ✅ تمييز الصفوف بالتناوب
        margin: { top: 10 },
    });

    // ✅ حفظ الملف بتنسيق مناسب
    doc.save(`${universityName.replace(/\s+/g, "_")}_Branches_Report.pdf`);
};

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
    Branches of {universityName || "Loading..."}
</Typography>

      {/* زر تحميل التقرير PDF */}
      <Button
        variant="contained"
        color="secondary"
        sx={{ marginBottom: 2 }}
        onClick={downloadPDF}
      >
        Download PDF Report
      </Button>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" my={3}>
          <CircularProgress /> {/* ✅ مؤشر تحميل أثناء جلب الفروع */}
          <Typography variant="h6" sx={{ ml: 2 }}>Loading branches...</Typography>
        </Box>
      ) : (
        <>
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Filter Branches
        </Typography>

        <Select
          value={filterCriteria.branchName}
          onChange={(e) =>
            setFilterCriteria({ ...filterCriteria, branchName: e.target.value })
          }
          displayEmpty
          sx={{ width: 200, marginRight: 2, marginBottom: 2 }}
        >
          <MenuItem value="">All Branches</MenuItem>
          {branchNames.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>

        <TextField
          label="Duration (Years)"
          type="number"
          value={filterCriteria.durationYears}
          onChange={(e) =>
            setFilterCriteria({ ...filterCriteria, durationYears: e.target.value })
          }
          sx={{ marginRight: 2, marginBottom: 2 }}
        />
        <TextField
          label="Max Annual Fee"
          type="number"
          value={filterCriteria.annualFee}
          onChange={(e) =>
            setFilterCriteria({ ...filterCriteria, annualFee: e.target.value })
          }
          sx={{ marginRight: 2, marginBottom: 2 }}
        />
        <FormGroup row>
          {["Bachelor", "Master", "PhD"].map((level) => (
            <FormControlLabel
              key={level}
              control={
                <Checkbox
                  checked={filterCriteria.levels.includes(level)}
                  onChange={() => handleCheckboxChange1("levels", level)}
                />
              }
              label={level}
            />
          ))}
        </FormGroup>
        <FormGroup row>
          {["English", "Turkish"].map((language) => (
            <FormControlLabel
              key={language}
              control={
                <Checkbox
                  checked={filterCriteria.languages.includes(language)}
                  onChange={() => handleCheckboxChange1("languages", language)}
                />
              }
              label={language}
            />
          ))}
        </FormGroup>
      </Box>

      {/* زر إضافة فرع */}
      <Button
        variant="contained"
        color="primary"
        sx={{ marginBottom: 2 }}
        onClick={handleOpenBranchDialog}
      >
        Add Branch
      </Button>

{/* جدول عرض الفروع مع الأعمدة الجديدة */}
<Table sx={{ marginTop: 4 }}>
  <TableHead>
    <TableRow>
      <TableCell>Branch Name</TableCell>
      <TableCell>Duration (Years)</TableCell>
      <TableCell>Annual Fee</TableCell>
      <TableCell>Price</TableCell>
      <TableCell>Discount Price</TableCell>
      <TableCell>Cash Price</TableCell>
      <TableCell>Currency</TableCell>
      <TableCell>Our Commission</TableCell>
      <TableCell>Level</TableCell>
      <TableCell>Language</TableCell>
      <TableCell>Status</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {filteredBranches.map((branch, index) => (
      <TableRow key={index}>
        <TableCell>{branch.branchName}</TableCell>
        <TableCell>{branch.durationYears}</TableCell>
        <TableCell>${branch.annualFee}</TableCell>
        <TableCell>${branch.price}</TableCell>
        <TableCell>${branch.discountPrice}</TableCell>
        <TableCell>${branch.cashPrice}</TableCell>
        <TableCell>{branch.currency}</TableCell>
        <TableCell>${branch.ourCommission}</TableCell>
        <TableCell>{branch.level}</TableCell>
        <TableCell>{branch.language}</TableCell>
        <TableCell>{branch.status}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

      </>
      )}
{/* Dialog لإضافة فرع */}
<Dialog open={openBranchDialog} onClose={() => setOpenBranchDialog(false)}>
  <DialogTitle>Add New Branch</DialogTitle>
  <DialogContent>
    {/* اسم الفرع */}
    <TextField
      fullWidth
      label="Branch Name"
      value={newBranch.branchName}
      onChange={(e) => setNewBranch({ ...newBranch, branchName: e.target.value })}
      margin="normal"
    />
    
    {/* مدة الدراسة */}
    <TextField
      fullWidth
      label="Duration (Years)"
      type="number"
      value={newBranch.durationYears}
      onChange={(e) => setNewBranch({ ...newBranch, durationYears: e.target.value })}
      margin="normal"
    />
    
    {/* الرسوم السنوية */}
    <TextField
      fullWidth
      label="Annual Fee"
      type="number"
      value={newBranch.annualFee}
      onChange={(e) => setNewBranch({ ...newBranch, annualFee: e.target.value })}
      margin="normal"
    />

    {/* المستويات */}
    <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
      Levels
    </Typography>
    <FormGroup row>
      {["Integrated PHD", "PHD", "Master With Thesis", "Master Without Thesis", "Vocational School", "Bachelor"].map((level) => (
        <FormControlLabel
          key={level}
          control={
            <Checkbox
              checked={newBranch.levels.includes(level)}
              onChange={() => handleCheckboxChange("levels", level)}
            />
          }
          label={level}
        />
      ))}
    </FormGroup>

    {/* اللغات */}
    <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
      Languages
    </Typography>
    <FormGroup row>
      {["English", "Turkish", "30% English", "30% Arabic", "French", "Russian", "Chinese", "German", "Turkish/Russian", "English/Turkish"].map((language) => (
        <FormControlLabel
          key={language}
          control={
            <Checkbox
              checked={newBranch.languages.includes(language)}
              onChange={() => handleCheckboxChange("languages", language)}
            />
          }
          label={language}
        />
      ))}
    </FormGroup>

    {/* السعر */}
    <TextField
      fullWidth
      label="Price"
      type="number"
      value={newBranch.price}
      onChange={(e) => setNewBranch({ ...newBranch, price: e.target.value })}
      margin="normal"
    />

    {/* السعر المخفض */}
    <TextField
      fullWidth
      label="Discount Price"
      type="number"
      value={newBranch.discountPrice}
      onChange={(e) => setNewBranch({ ...newBranch, discountPrice: e.target.value })}
      margin="normal"
    />

    {/* السعر النقدي */}
    <TextField
      fullWidth
      label="Cash Price"
      type="number"
      value={newBranch.cashPrice}
      onChange={(e) => setNewBranch({ ...newBranch, cashPrice: e.target.value })}
      margin="normal"
    />

    {/* العملة */}
    <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
      Currency
    </Typography>
    <Select
      fullWidth
      value={newBranch.currency}
      onChange={(e) => setNewBranch({ ...newBranch, currency: e.target.value })}
    >
      <MenuItem value="USD">USD</MenuItem>
      <MenuItem value="EUR">EUR</MenuItem>
      <MenuItem value="TRY">TRY</MenuItem>
    </Select>

    {/* العمولة */}
    <TextField
      fullWidth
      label="Our Commission"
      type="number"
      value={newBranch.ourCommission}
      onChange={(e) => setNewBranch({ ...newBranch, ourCommission: e.target.value })}
      margin="normal"
    />

    {/* الحالة */}
    <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
      Status
    </Typography>
    <Select
      fullWidth
      value={newBranch.status}
      onChange={(e) => setNewBranch({ ...newBranch, status: e.target.value })}
    >
      <MenuItem value="opening">Opening</MenuItem>
      <MenuItem value="closed">Closed</MenuItem>
    </Select>
  </DialogContent>

  {/* أزرار الحفظ والإلغاء */}
  <DialogActions>
    <Button onClick={() => setOpenBranchDialog(false)}>Cancel</Button>
    <Button onClick={handleAddBranch} variant="contained">
      Add
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
};

export default BranchesPage;

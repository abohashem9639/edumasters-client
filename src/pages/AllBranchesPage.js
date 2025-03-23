import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Card, Avatar, CircularProgress, TextField, InputAdornment, Button } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import html2pdf from "html2pdf.js";

const ProgramFilterPage = () => {
  const [universities, setUniversities] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({
    country: "",
    city: "",
    status: "",
    degree: "",
    language: "",
    universityId: "",
    searchTerm: "" // لتخزين قيمة البحث
  });

  // Loading state
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(true);

  // Fetch universities
  useEffect(() => {
    setLoadingUniversities(true);
    axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Universities`)
      .then((response) => {
        setUniversities(response.data);
        setLoadingUniversities(false);
      })
      .catch((error) => {
        console.error("Error fetching universities:", error);
        setLoadingUniversities(false);
      });
  }, []);

  // Fetch branches based on filters
  useEffect(() => {
    setLoadingBranches(true);
    let url = `${process.env.REACT_APP_API_URL_LOCAL}/UniversityBranches`;

    if (filters.universityId) {
      url += `?universityId=${filters.universityId}`;
    }

    axios.get(url)
      .then((response) => {
        const processedBranches = response.data.map(branch => {
          const university = universities.find(u => u.id === branch.universityId) || {};
          return {
            ...branch,
            country: university.country || "Unknown",
            city: university.city || "Unknown",
            levels: branch.levels ? branch.levels.split(",").map(l => l.trim()) : ["Not Available"],
            languages: branch.languages ? branch.languages.split(",").map(l => l.trim()) : ["Not Available"]
          };
        });
        setBranches(processedBranches);
        setLoadingBranches(false);
      })
      .catch((error) => {
        console.error("Error fetching branches:", error);
        setLoadingBranches(false);
      });
  }, [filters, universities]);

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredBranches = branches.filter(branch =>
    (filters.degree === "" || branch.levels.includes(filters.degree)) &&
    (filters.language === "" || branch.languages.includes(filters.language)) &&
    (filters.country === "" || branch.country === filters.country) &&
    (filters.city === "" || branch.city === filters.city) &&
    (filters.status === "" || branch.status === filters.status) &&
    (filters.searchTerm === "" || branch.branchName.toLowerCase().includes(filters.searchTerm.toLowerCase()))
  );

  const downloadPDF = () => {
    const element = document.getElementById("programs-to-pdf"); // تحديد العنصر
    const options = {
      margin:       1,
      filename:     'programs.pdf',
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { dpi: 192, letterRendering: true, useCORS: true }, // إضافة useCORS لدعم تحميل الصور
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(options).save();
  };

  return (
    <Box sx={{ maxWidth: "1200px", width: "100%", margin: "auto", p: 4 }}>
      {/* عرض العنوان والعدد بجانب بعض */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ mr: 2 }}>
          Programs
        </Typography>
        {/* مربع صغير بجانب العنوان يظهر عدد الفروع */}
        <Box sx={{
          backgroundColor: "#007bff",
          color: "#fff",
          px: 3,
          py: 1,
          borderRadius: "5px",
          fontWeight: "bold",
          textAlign: "center",
        }}>
          {filteredBranches.length}
        </Box>
      </Box>

      {/* شريط البحث أسفل العنوان والعدد */}
      <Box sx={{ mb: 4 }}>
        <TextField
          label="Quick Search For In (University, Programs, Campus, Degree, Language, Faculty)"
          variant="outlined"
          fullWidth
          name="searchTerm"
          value={filters.searchTerm}
          onChange={handleFilterChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            borderRadius: "20px", // لإعطاء الشريط الشكل المربع
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#007bff", // حدود الشريط باللون الأزرق
              },
              "&:hover fieldset": {
                borderColor: "#0056b3", // اللون عند التمرير
              },
            },
            mb: 2, // Adjust margin for better spacing on mobile
          }}
        />
      </Box>

      {/* زر تنزيل PDF */}
      <Box sx={{ mb: 4 }}>
        <Button variant="contained" color="primary" onClick={downloadPDF} sx={{ width: "100%" }}>
          Download Programs as PDF
        </Button>
      </Box>

      {/* Horizontal filter section */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4, justifyContent: "space-between" }}>
        {/* Degree Filter */}
        <FormControl sx={{ minWidth: 160, flex: 1 }} size="small">
          <InputLabel>Degree</InputLabel>
          <Select name="degree" value={filters.degree} onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Integrated PHD">Integrated PHD</MenuItem>
            <MenuItem value="PHD">PHD</MenuItem>
            <MenuItem value="Master With Thesis">Master With Thesis</MenuItem>
            <MenuItem value="Master Without Thesis">Master Without Thesis</MenuItem>
            <MenuItem value="Vocational School">Vocational School</MenuItem>
            <MenuItem value="Bachelor">Bachelor</MenuItem>
          </Select>
        </FormControl>

        {/* University Filter */}
        <FormControl sx={{ minWidth: 160, flex: 1 }} size="small">
          <InputLabel>University</InputLabel>
          <Select name="universityId" value={filters.universityId} onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            {universities.map((university) => (
              <MenuItem key={university.id} value={university.id}>{university.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Language Filter */}
        <FormControl sx={{ minWidth: 160, flex: 1 }} size="small">
          <InputLabel>Language</InputLabel>
          <Select name="language" value={filters.language} onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="Turkish">Turkish</MenuItem>
            <MenuItem value="30% English">30% English</MenuItem>
            <MenuItem value="30% Arabic">30% Arabic</MenuItem>
            <MenuItem value="French">French</MenuItem>
            <MenuItem value="Russian">Russian</MenuItem>
            <MenuItem value="Chinese">Chinese</MenuItem>
            <MenuItem value="German">German</MenuItem>
            <MenuItem value="Turkish/Russian">Turkish/Russian</MenuItem>
            <MenuItem value="English/Turkish">English/Turkish</MenuItem>
          </Select>
        </FormControl>

        {/* Country Filter */}
        <FormControl sx={{ minWidth: 160, flex: 1 }} size="small">
          <InputLabel>Country</InputLabel>
          <Select name="country" value={filters.country} onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            {[...new Set(universities.map(u => u.country))].map(country => (
              <MenuItem key={country} value={country}>{country}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* City Filter */}
        <FormControl sx={{ minWidth: 160, flex: 1 }} size="small">
          <InputLabel>City</InputLabel>
          <Select name="city" value={filters.city} onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            {[...new Set(universities.map(u => u.city))].map(city => (
              <MenuItem key={city} value={city}>{city}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Status Filter */}
        <FormControl sx={{ minWidth: 160, flex: 1 }} size="small">
          <InputLabel>Status</InputLabel>
          <Select name="status" value={filters.status} onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="opening">Opening</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Loading Spinner for Fetching Data */}
      {(loadingUniversities || loadingBranches) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      )}

      {/* Display Programs in Grid */}
      {!loadingUniversities && !loadingBranches && (
        <Box id="programs-to-pdf" sx={{ padding: 2 }}>
          {filteredBranches.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {filteredBranches.map((branch) => {
                const university = universities.find((u) => u.id === branch.universityId);
                return (
                  <Card key={branch.id} sx={{
                    mb: 1,
                    p: 1,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr 1fr" }, // تعديل التنسيق بناءً على حجم الشاشة
                    alignItems: "center",
                    gap: 2,
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    boxShadow: "none",
                  }}>
                    {/* الجامعة واسم الفرع */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        src={`${process.env.REACT_APP_API_URL_IMAGE}${university?.logoUrl}`}
                        sx={{ width: 60, height: 60 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: "bold", marginBottom: 0 }}>
                        {branch.branchName}
                      </Typography>
                    </Box>

                    {/* اسم الجامعة والعنوان */}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: "bold", marginBottom: 1 }}>
                        {university?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 0 }}>
                        {university?.country}, {university?.city}
                      </Typography>
                    </Box>

                    {/* الدرجة واللغة */}
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 0 }}>
                        <b>Degree:</b> {branch.levels}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 0 }}>
                        <b>Language:</b> {branch.languages.join(", ")}
                      </Typography>
                    </Box>

                    {/* الـ Payment و الـ Status في العمود الرابع */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                      <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1 }}>
                        <b>Status:</b> <span style={{ color: branch.status === "OPEN" ? "#28a745" : "#dc3545" }}>
                          {branch.status}
                        </span>
                      </Typography>
                      <Typography variant="body2" sx={{
                        textDecoration: branch.discountPrice ? "line-through" : "none",
                        color: branch.discountPrice ? "#dc3545" : "#000"
                      }}>
                        <b>Payment:</b> {branch.annualFee} {branch.currency}
                      </Typography>
                      {/* عرض الخصم إذا كان موجودًا و ليس صفرًا */}
                      {branch.discountPrice && branch.discountPrice !== 0 && (
                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#007bff" }}>
                          Disc. Price: {branch.discountPrice} {branch.currency}
                        </Typography>
                      )}
                    </Box>
                  </Card>
                );
              })}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <Typography variant="h6">No programs found matching the filters.</Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProgramFilterPage;

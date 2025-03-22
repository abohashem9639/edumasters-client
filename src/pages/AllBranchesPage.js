import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Grid, Card, CardContent, Avatar, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress } from "@mui/material";
import { School } from "@mui/icons-material";

const AllBranchesPage = () => {
  const [branches, setBranches] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [filters, setFilters] = useState({
    universityId: "",
    degree: "",
    language: "",
    status: ""
  });
  const [loading, setLoading] = useState(false);

  // جلب البيانات الخاصة بالفروع والجامعات
  useEffect(() => {
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/UniversityBranches`)
      .then((response) => setBranches(response.data))
      .catch((error) => console.error("Error fetching branches:", error))
      .finally(() => setLoading(false));

    axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Universities`)
      .then((response) => setUniversities(response.data))
      .catch((error) => console.error("Error fetching universities:", error));
  }, []);

  // تغيير الفلاتر
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // تصفية الأفرع بناءً على الفلاتر
  const filteredBranches = branches.filter(branch => {
    return (
      (filters.universityId ? branch.universityId === filters.universityId : true) &&
      (filters.degree ? branch.levels.includes(filters.degree) : true) &&
      (filters.language ? branch.languages.includes(filters.language) : true) &&
      (filters.status ? branch.status === filters.status : true)
    );
  });

  return (
    <Box sx={{ maxWidth: "1200px", width: "100%", margin: "auto", p: 4 }}>
      <Typography variant="h4" align="center" sx={{ mb: 3 }}>
        Browse All University Branches
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading branches...</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
          {/* فلترة */}
          <Box sx={{ width: "300px", p: 2, border: "1px solid #ddd", borderRadius: "5px" }}>
            <Typography variant="h6">Filters</Typography>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>University</InputLabel>
              <Select
                name="universityId"
                value={filters.universityId}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Universities</MenuItem>
                {universities.map((university) => (
                  <MenuItem key={university.id} value={university.id}>
                    {university.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Degree</InputLabel>
              <Select
                name="degree"
                value={filters.degree}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Degrees</MenuItem>
                <MenuItem value="Integrated PHD">Integrated PHD</MenuItem>
                <MenuItem value="PHD">PHD</MenuItem>
                <MenuItem value="Master With Thesis">Master With Thesis</MenuItem>
                <MenuItem value="Master Without Thesis">Master Without Thesis</MenuItem>
                <MenuItem value="Vocational School">Vocational School</MenuItem>
                <MenuItem value="Bachelor">Bachelor</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Language</InputLabel>
              <Select
                name="language"
                value={filters.language}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Languages</MenuItem>
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

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="opening">Opening</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* عرض الفروع المتاحة */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">Available Programs</Typography>
            <Grid container spacing={3}>
              {filteredBranches.map((branch) => {
                const university = universities.find((u) => u.id === branch.universityId);
                return (
                  <Grid item xs={12} sm={6} md={4} key={branch.id}>
                    <Card sx={{ display: "flex", alignItems: "center", p: 2 }}>
                      <Avatar
                        src={`${process.env.REACT_APP_API_URL_IMAGE}${university?.logoUrl}`}
                        sx={{ width: 50, height: 50, mr: 2 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" color="primary">#{branch.id}</Typography>
                        <Typography variant="subtitle1">{branch.branchName}</Typography>
                        <Typography variant="body2"><b>University:</b> {university?.name}</Typography>
                        <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                          {branch.languages.map((lang, index) => (
                            <Typography
                              key={`lang-${index}`}
                              variant="body2"
                              sx={{
                                background: "#007bff",
                                color: "#fff",
                                px: 1,
                                borderRadius: "4px",
                                display: "inline-block",
                                m: 0.5,
                              }}
                            >
                              {lang}
                            </Typography>
                          ))}
                          {branch.levels.map((level, index) => (
                            <Typography
                              key={`level-${index}`}
                              variant="body2"
                              sx={{
                                background: "#28a745",
                                color: "#fff",
                                px: 1,
                                borderRadius: "4px",
                                display: "inline-block",
                                m: 0.5,
                              }}
                            >
                              {level}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AllBranchesPage;

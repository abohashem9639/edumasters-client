  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import { useNavigate, useSearchParams } from "react-router-dom";
  import {
    Box,
    Typography,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    Paper,
    Avatar,
    Card,
    CardContent,
    Divider,
  } from "@mui/material";
  import { Person, School, CheckCircle } from "@mui/icons-material";

  const AddApplicationPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const studentIdFromURL = searchParams.get("studentId");

    const [step, setStep] = useState(0);
    const [students, setStudents] = useState([]);
    const [student, setStudent] = useState(null);
    const [universities, setUniversities] = useState([]);
    const [branches, setBranches] = useState([]);
    const [application, setApplication] = useState({
      studentId: studentIdFromURL || "",
      degree: "",
      universityId: "",
      language: "",
      branchId: "",
    });
    const [selectedBranches, setSelectedBranches] = useState([]); // ✅ تخزين الفروع المختارة
    const [filters, setFilters] = useState({
      country: "",
      city: "",
      status: ""
    });
    
  const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId") || "0"; 

    // ✅ جلب بيانات الطالب إذا كان `studentId` موجودًا في الرابط
    useEffect(() => {
      if (studentIdFromURL) {
        axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/${studentIdFromURL}`)
          .then((response) => setStudent(response.data))
          .catch((error) => console.error("Error fetching student details:", error));
      } else {
        axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Students`)
          .then((response) => setStudents(response.data))
          .catch((error) => console.error("Error fetching students:", error));
      }
    }, [studentIdFromURL]);

    // ✅ عند اختيار الطالب من القائمة المنسدلة، يتم تحديث بياناته مباشرة
    const handleStudentChange = (event) => {
      const selectedStudentId = event.target.value;
      setApplication(prev => ({ ...prev, studentId: selectedStudentId }));
    
      // جلب بيانات الطالب المختار
      axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Students/${selectedStudentId}`)
        .then(response => setStudent(response.data))
        .catch(error => console.error("Error fetching student details:", error));
    };
    // ✅ جلب قائمة الجامعات
    useEffect(() => {
      axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Universities`)
        .then((response) => setUniversities(response.data))
        .catch((error) => console.error("Error fetching universities:", error));
    }, []);

    // ✅ جلب الفروع الخاصة بالجامعة المختارة
    useEffect(() => {
      let url = `${process.env.REACT_APP_API_URL_LOCAL}/UniversityBranches`;
      
      // إذا كانت هناك جامعة محددة، اجلب فقط الفروع الخاصة بها
      if (application.universityId) {
        url += `?universityId=${application.universityId}`;
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
          console.log("Fetched Branches:", processedBranches);
        })
        .catch((error) => console.error("Error fetching branches:", error));
    }, [application.universityId, universities]);
    
  

  const handleNext = () => {
    if (step === 0 && !application.studentId) {
      alert("Please select a student before proceeding.");
      return;
    }
    if (step === 1 && selectedBranches.length === 0) {
      alert("You must select at least one branch before proceeding.");
      return;
    }
    setStep(step + 1);
  };
    
    const handleBack = () => setStep(step - 1);

    const handleSubmitApplication = async () => {
      try {
          console.log("Application Data Before Submission:", application);

          if (!application.studentId || selectedBranches.length === 0) {
              alert("Please select a student and at least one branch.");
              return;
          }

          // التحقق من أن جميع الحقول المطلوبة غير فارغة
          selectedBranches.forEach(branch => {
              if (!branch.levels || branch.levels.length === 0) {
                  alert(`Degree is required for branch ${branch.branchName}`);
                  return;
              }
              if (!branch.languages || branch.languages.length === 0) {
                  alert(`Language is required for branch ${branch.branchName}`);
                  return;
              }
          });

          // ✅ تجهيز البيانات المطلوبة للإرسال بدون `term`
          const applicationData = {
              studentId: application.studentId,
              degree: selectedBranches[0].levels[0], // تحديد الدرجة من أول فرع
              universityId: selectedBranches[0].universityId,
              language: selectedBranches[0].languages[0], // تحديد اللغة من أول فرع
              branchId: selectedBranches[0].id,
              createdByUserId: userId,
              status: "Ready to Apply" // تعيين الحالة افتراضيًا
          };

          console.log("Application Data Sent:", applicationData);

          const response = await axios.post(`${process.env.REACT_APP_API_URL_LOCAL}/Applications`, applicationData);

          alert("Application submitted successfully!");
          navigate(`/students/${application.studentId}`);
      } catch (error) {
          console.error("Error submitting application:", error);

          // طباعة تفاصيل الخطأ لتحديد السبب
          if (error.response) {
              console.log("Error Response Data:", error.response.data);
              alert(`Failed to submit application: ${JSON.stringify(error.response.data.errors)}`);
          } else {
              alert("Failed to submit application. Please check the console for more details.");
          }
      }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
};
    const handleAddBranch = (branch) => {
      if (selectedBranches.some((b) => b.universityId === branch.universityId)) {
        alert("You cannot select more than one branch from the same university.");
        return;
      }
    
      setSelectedBranches([...selectedBranches, {
        ...branch,
        degree: branch.levels ? branch.levels[0] : "Not Available",
        language: branch.languages ? branch.languages[0] : "Not Available",
      }]);
    };
    
    const handleRemoveBranch = (branchId) => {
      setSelectedBranches(selectedBranches.filter(branch => branch.id !== branchId));
    };
    

    return (
      <Box sx={{ maxWidth: "1200px", width: "100%", margin: "auto", p: 4 }}>

        <Typography variant="h4" align="center" sx={{ mb: 3 }}>
          Add Application
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Tabs value={step} centered>
            <Tab label="Student" icon={<Person />} />
            <Tab label="Program" icon={<School />} />
            <Tab label="Review" icon={<CheckCircle />} />
          </Tabs>

          {step === 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Select Student</Typography>
              {student ? (
                <Card sx={{ mt: 3, p: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item>
                        <Avatar sx={{ width: 80, height: 80 }} src={`${process.env.REACT_APP_API_URL_IMAGE}${student.profileImage}`} />
                      </Grid>
                      <Grid item xs>
                        <Typography><b>Name:</b> {student.firstName} {student.lastName}</Typography>
                        <Typography><b>Nationality:</b> {student.nationality}</Typography>
                        <Typography><b>Passport ID:</b> {student.passportNumber}</Typography>
                        <Typography><b>Email:</b> {student.email}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ) : (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Student</InputLabel>
                  <Select value={application.studentId} onChange={handleStudentChange}>
                  {students.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.firstName} {s.lastName} - {s.nationality}</MenuItem>
                  ))}
                </Select>
                </FormControl>
              )}
              <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                <Button onClick={() => navigate("/students")}>Cancel</Button>
                <Button variant="contained" onClick={handleNext} disabled={!application.studentId}>
                  Next
                </Button>
              </Box>
            </Box>
          )}

  {step === 1 && (
    <Box sx={{ mt: 3, display: "flex", gap: 3 }}>
      {/* ✅ قسم الفلترة على اليسار */}
      <Box sx={{ width: "300px", p: 2, border: "1px solid #ddd", borderRadius: "5px" }}>
        <Typography variant="h6">Filters</Typography>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Degree</InputLabel>
          <Select value={application.degree} onChange={(e) => setApplication({ ...application, degree: e.target.value })}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Integrated PHD">Integrated PHD</MenuItem>
            <MenuItem value="PHD">PHD</MenuItem>
            <MenuItem value="Master With Thesis">Master With Thesis</MenuItem>
            <MenuItem value="Master Without Thesis">Master Without Thesis</MenuItem>
            <MenuItem value="Vocational School">Vocational School</MenuItem>
            <MenuItem value="Bachelor">Bachelor</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>University</InputLabel>
          <Select value={application.universityId} onChange={(e) => setApplication({ ...application, universityId: e.target.value })}>
            <MenuItem value="">All</MenuItem>
            {universities.map((university) => (
              <MenuItem key={university.id} value={university.id}>{university.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Language</InputLabel>
          <Select value={application.language} onChange={(e) => setApplication({ ...application, language: e.target.value })}>
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
        <FormControl fullWidth sx={{ mt: 2 }}>
  <InputLabel>Country</InputLabel>
  <Select name="country" value={filters.country} onChange={handleFilterChange}>
    <MenuItem value="">All</MenuItem>
    {[...new Set(universities.map(u => u.country))].map(country => (
      <MenuItem key={country} value={country}>{country}</MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl fullWidth sx={{ mt: 2 }}>
  <InputLabel>City</InputLabel>
  <Select name="city" value={filters.city} onChange={handleFilterChange}>
    <MenuItem value="">All</MenuItem>
    {[...new Set(universities.map(u => u.city))].map(city => (
      <MenuItem key={city} value={city}>{city}</MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl fullWidth sx={{ mt: 2 }}>
  <InputLabel>Status</InputLabel>
  <Select name="status" value={filters.status} onChange={handleFilterChange}>
    <MenuItem value="">All</MenuItem>
    <MenuItem value="opening">Opening</MenuItem>
    <MenuItem value="closed">Closed</MenuItem>
  </Select>
</FormControl>

        {/* <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Term</InputLabel>
          <Select value={application.term} onChange={(e) => setApplication({ ...application, term: e.target.value })}>
            <MenuItem value="Fall">Fall</MenuItem>
            <MenuItem value="Spring">Spring</MenuItem>
          </Select>
        </FormControl> */}
        {/* ✅ عرض الفروع المختارة أسفل القائمة */}
        <Box sx={{ mt: 3 }}>
    <Typography variant="h6">Selected Programs</Typography>
    {selectedBranches.length > 0 ? (
      selectedBranches.map((branch) => {
        const university = universities.find((u) => u.id === branch.universityId);
        return (
          <Card key={branch.id} sx={{ mb: 2, display: "flex", alignItems: "center", p: 2, background: "#f8f9fa" }}>
            <Avatar src={`${process.env.REACT_APP_API_URL_LOCAL}${university?.logoUrl}`} sx={{ width: 50, height: 50, mr: 2 }} />

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" color="primary">#{branch.id}</Typography>
              <Typography variant="subtitle1">{branch.branchName}</Typography>
              <Typography variant="body2"><b>University:</b> {university?.name}</Typography>

              {/* ✅ عرض المعلومات بنفس تصميم Available Programs */}
              <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                {/* ✅ عرض اللغات كمربعات ملونة */}
                {branch.languages && branch.languages.length > 0 ? (
                  branch.languages.map((lang, index) => (
                    <Typography
                      key={`selected-lang-${index}`}
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
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ background: "#007bff", color: "#fff", px: 1, borderRadius: "4px" }}
                  >
                    N/A
                  </Typography>
                )}

                {/* ✅ عرض المستويات كمربعات ملونة */}
                {branch.levels && branch.levels.length > 0 ? (
                  branch.levels.map((level, index) => (
                    <Typography
                      key={`selected-level-${index}`}
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
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ background: "#28a745", color: "#fff", px: 1, borderRadius: "4px" }}
                  >
                    N/A
                  </Typography>
                )}

                {/* ✅ عرض الحالة (Status) */}
                <Typography
                  variant="body2"
                  sx={{
                    background: branch.status === "opening" ? "#6c757d" : "#dc3545",
                    color: "#fff",
                    px: 1,
                    borderRadius: "4px",
                  }}
                >
                  {branch.status || "N/A"}
                </Typography>
              </Box>
            </Box>

            {/* ✅ زر الإزالة */}
            <Button variant="contained" color="secondary" onClick={() => handleRemoveBranch(branch.id)}>
              Remove
            </Button>
          </Card>
        );
      })
    ) : (
      <Typography>No programs selected yet.</Typography>
    )}
  </Box>



        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
    <Button onClick={handleBack}>Back</Button>
    <Button variant="contained" onClick={handleNext} disabled={selectedBranches.length === 0}>
      Next
    </Button>
  </Box>

      </Box>

      {/* ✅ عرض الفروع المتاحة على اليمين */}
      <Box sx={{ flex: 1 }}>
    <Typography variant="h6">Available Programs</Typography>
    {branches.filter(branch => 
  (application.universityId === "" || branch.universityId === application.universityId) &&
  (application.degree === "" || (Array.isArray(branch.levels) && branch.levels.includes(application.degree))) &&
  (application.language === "" || (Array.isArray(branch.languages) && branch.languages.includes(application.language))) &&
  (filters.country === "" || branch.country === filters.country) &&
  (filters.city === "" || branch.city === filters.city) &&
  (filters.status === "" || branch.status === filters.status)
)

      .map((branch) => {
        const university = universities.find((u) => u.id === branch.universityId);
        return (
          <Card key={branch.id} sx={{ mb: 2, display: "flex", alignItems: "center", p: 2 }}>
            <Avatar src={`${process.env.IMAGE_API}${university?.logoUrl}`} sx={{ width: 50, height: 50, mr: 2 }} />

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" color="primary">#{branch.id}</Typography>
              <Typography variant="subtitle1">{branch.branchName}</Typography>
              <Typography variant="body2"><b>University:</b> {university?.name}</Typography>

              <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                {/* ✅ عرض اللغات كمربعات ملونة */}
                {branch.languages && branch.languages.length > 0 ? (
                  branch.languages.map((lang, index) => (
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
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ background: "#007bff", color: "#fff", px: 1, borderRadius: "4px" }}
                  >
                    N/A
                  </Typography>
                )}

                {/* ✅ عرض المستويات كمربعات ملونة */}
                {branch.levels && branch.levels.length > 0 ? (
                  branch.levels.map((level, index) => (
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
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ background: "#28a745", color: "#fff", px: 1, borderRadius: "4px" }}
                  >
                    N/A
                  </Typography>
                )}

                {/* ✅ عرض الحالة (Status) */}
                <Typography
                  variant="body2"
                  sx={{
                    background: branch.status === "opening" ? "#6c757d" : "#dc3545",
                    color: "#fff",
                    px: 1,
                    borderRadius: "4px",
                  }}
                >
                  {branch.status || "N/A"}
                </Typography>
              </Box>
            </Box>

            {/* ✅ زر الإضافة */}
            <Button variant="contained" color="primary" onClick={() => handleAddBranch(branch)}>Add</Button>
          </Card>
        );
      })}
  </Box>
      
    </Box>
  )}

  {step === 2 && (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6">Review Application</Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={2}>
          {/* ✅ معلومات الطالب */}
          <Grid item xs={12} md={6}>
          <Typography variant="h6">Student Information</Typography>
                    <Typography><b>Name:</b> {student?.firstName} {student?.lastName}</Typography>
                    <Typography><b>Nationality:</b> {student?.nationality}</Typography>
                    <Typography><b>Email:</b> {student?.email}</Typography>
                    <Typography><b>Passport ID:</b> {student?.passportNumber}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* ✅ قائمة الفروع المختارة مع تفاصيل كل جامعة */}
        <Typography variant="h6">Selected Programs</Typography>
        {selectedBranches.length > 0 ? (
          selectedBranches.map((branch) => {
            const university = universities.find((u) => u.id === branch.universityId);
            return (
              <Card key={branch.id} sx={{ mb: 2, display: "flex", alignItems: "center", p: 2, background: "#f8f9fa" }}>
                <Avatar src={`${process.env.REACT_APP_API_URL_IMAGE}${university?.logoUrl}`} sx={{ width: 50, height: 50, mr: 2 }} />

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" color="primary">#{branch.id}</Typography>
                  <Typography variant="subtitle1">{branch.branchName}</Typography>
                  <Typography variant="body2"><b>University:</b> {university?.name}</Typography>

                  {/* ✅ عرض التفاصيل بنفس التصميم */}
                  <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                    {/* ✅ عرض اللغات كمربعات ملونة */}
                    {branch.languages && branch.languages.length > 0 ? (
                      branch.languages.map((lang, index) => (
                        <Typography
                          key={`review-lang-${index}`}
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
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ background: "#007bff", color: "#fff", px: 1, borderRadius: "4px" }}
                      >
                        N/A
                      </Typography>
                    )}

                    {/* ✅ عرض المستويات كمربعات ملونة */}
                    {branch.levels && branch.levels.length > 0 ? (
                      branch.levels.map((level, index) => (
                        <Typography
                          key={`review-level-${index}`}
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
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ background: "#28a745", color: "#fff", px: 1, borderRadius: "4px" }}
                      >
                        N/A
                      </Typography>
                    )}

                    {/* ✅ عرض الحالة (Status) */}
                    <Typography
                      variant="body2"
                      sx={{
                        background: branch.status === "opening" ? "#6c757d" : "#dc3545",
                        color: "#fff",
                        px: 1,
                        borderRadius: "4px",
                      }}
                    >
                      {branch.status || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            );
          })
        ) : (
          <Typography>No programs selected yet.</Typography>
        )}

      </Paper>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
        <Button onClick={handleBack}>Previous</Button>
        <Button variant="contained" color="primary" onClick={handleSubmitApplication}>
          Submit Application
        </Button>
      </Box>
    </Box>
  )}

        </Paper>
      </Box>
    );
  };

  export default AddApplicationPage;

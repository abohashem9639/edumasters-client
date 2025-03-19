import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const UniversitiesPage = () => {
  const [universities, setUniversities] = useState([]);
  const [branchesCount, setBranchesCount] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Turkey"); // افتراضيًا
  const [city, setCity] = useState("Istanbul"); // افتراضيًا
  const [universityType, setUniversityType] = useState("Public"); // افتراضيًا
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [currentUniversity, setCurrentUniversity] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [universityToDelete, setUniversityToDelete] = useState(null);
  const [logo, setLogo] = useState(null); 

  const navigate = useNavigate();

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleLogoChange = (event) => {
    setLogo(event.target.files[0]);
  };

  const fetchUniversities = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/Universities`);
      setUniversities(response.data);
      fetchBranchesCount(response.data);
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  };

  const fetchBranchesCount = async (universities) => {
    const counts = {};
    for (const uni of universities) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL_LOCAL}/UniversityBranches?universityId=${uni.id}`);
        counts[uni.id] = response.data.length;
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    }
    setBranchesCount(counts);
  };

  const handleViewBranches = (universityId) => {
    navigate(`/branches/${universityId}`);
  };

  const handleAddOrUpdateUniversity = async (event) => {
    event.preventDefault();
    setError("");

    if (!name || !country || !city || !universityType) {
        setError("Please enter all required fields.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("country", country);
        formData.append("city", city);
        formData.append("universityType", universityType);
        if (logo) formData.append("logo", logo);

        // ✅ طباعة محتويات FormData للتحقق مما يتم إرساله
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        if (editMode && currentUniversity) {
            await axios.put(`${process.env.REACT_APP_API_URL_LOCAL}/Universities/${currentUniversity.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
        } else {
            const response = await axios.post(`${process.env.REACT_APP_API_URL_LOCAL}/Universities`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setUniversities([...universities, response.data]);
        }

        setShowForm(false);
        setEditMode(false);
        setName("");
        setCountry("Turkey");
        setCity("Istanbul");
        setUniversityType("Public");
        setLogo(null); 
        fetchUniversities();
    } catch (error) {
        console.error("Error saving university:", error);
        setError("An error occurred while saving the university.");
    }
};



  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Universities ({universities.length})
      </Typography>

      <Button variant="contained" color="success" sx={{ mb: 2 }} onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Add University"}
      </Button>

      {showForm && (
        <Paper sx={{ p: 3, mb: 4, maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            {editMode ? "Edit University" : "Add a New University"}
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          <form onSubmit={handleAddOrUpdateUniversity}>
            <TextField
              label="University Name"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
              Country *
            </Typography>
            <Select
              fullWidth
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <MenuItem value="Turkey">Turkey</MenuItem>
              <MenuItem value="KKTC">KKTC</MenuItem>
            </Select>

            <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
              City *
            </Typography>
            <Select
              fullWidth
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <MenuItem value="Istanbul">Istanbul</MenuItem>
              <MenuItem value="Ankara">Ankara</MenuItem>
              <MenuItem value="Lefkoşa">Lefkoşa</MenuItem>
            </Select>

            <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
              University Type
            </Typography>
            <Select
              fullWidth
              value={universityType}
              onChange={(e) => setUniversityType(e.target.value)}
            >
              <MenuItem value="Public">Public</MenuItem>
              <MenuItem value="Private">Private</MenuItem>
            </Select>

            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange} 
              style={{ marginTop: "10px" }}
            />

            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              {editMode ? "Update" : "Submit"}
            </Button>
          </form>
        </Paper>
      )}

      <Table sx={{ marginTop: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>Logo</TableCell>
            <TableCell>University Name</TableCell>
            <TableCell>Country</TableCell>
            <TableCell>City</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Branches Count</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {universities.map((university) => (
            <TableRow key={university.id}>
              <TableCell>
                {university.logoUrl && (
                  <img
                    src={`${process.env.REACT_APP_API_URL_IMAGE}${university.logoUrl}`}
                    alt={university.name}
                    style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                  />
                )}
              </TableCell>
              <TableCell>{university.name}</TableCell>
              <TableCell>{university.country}</TableCell>
              <TableCell>{university.city}</TableCell>
              <TableCell>{university.universityType}</TableCell>
              <TableCell>{branchesCount[university.id] || 0}</TableCell>
              <TableCell>
                <Button variant="contained" color="primary" onClick={() => handleViewBranches(university.id)}>View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default UniversitiesPage;

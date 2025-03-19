import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./components/LoginPage";
import HomePage from "./pages/HomePage";
import UniversitiesPage from "./pages/UniversitiesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import BranchesPage from "./pages/BranchesPage";
import CreateUserPage from "./components/CreateUserPage";
import StudentsListPage from "./pages/StudentsListPage";
import AddStudentPage from "./pages/AddStudentPage";
import StudentDetailsPage from "./pages/StudentDetailsPage";
import ApplicationsPage from "./pages/ApplicationsPage"; // إضافة الاستيراد لصفحة التطبيقات
import ApplicationDetailsPage from "./pages/ApplicationDetailsPage"; // إضافة الاستيراد لصفحة تفاصيل التطبيق
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EmployeesPage from "./pages/EmployeesPage";
import AddApplicationPage from "./pages/AddApplicationPage";
import AgentsPage from "./pages/AgentsPage";
import SubAgentsPage from './pages/SubAgentsPage';
import TeamsPage from './pages/TeamsPage';
import ProfilePage from "./pages/ProfilePage";
import AnnouncementsPage from "./pages/AnnouncementsPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><StudentsListPage /></ProtectedRoute>} />
          <Route path="/students/:id" element={<ProtectedRoute><StudentDetailsPage /></ProtectedRoute>} />
          <Route path="/add-student" element={<ProtectedRoute><AddStudentPage /></ProtectedRoute>} />
          <Route path="/universities" element={<ProtectedRoute><UniversitiesPage /></ProtectedRoute>} />
          <Route path="/create-user" element={<ProtectedRoute><CreateUserPage /></ProtectedRoute>} />
          <Route path="/branches/:universityId" element={<ProtectedRoute><BranchesPage /></ProtectedRoute>} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/employees" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
          <Route path="/add-application" element={<ProtectedRoute><AddApplicationPage /></ProtectedRoute>} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/sub-agents" element={<ProtectedRoute><SubAgentsPage /></ProtectedRoute>} />
          <Route path="/teams" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />


          {/* إضافة المسارات لصفحات التطبيقات */}
          <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
          <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetailsPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

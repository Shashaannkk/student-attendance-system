import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AttendanceProvider } from './context/AttendanceContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import RegisterUser from './pages/RegisterUser';
import RegisterStudent from './pages/RegisterStudent';
import UploadStudents from './pages/UploadStudents';

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Layout>
            <Outlet />
        </Layout>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AttendanceProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/attendance" element={<Attendance />} />
                            <Route path="/register-user" element={<RegisterUser />} />
                            <Route path="/register-student" element={<RegisterStudent />} />
                            <Route path="/upload-students" element={<UploadStudents />} />
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </Route>
                    </Routes>
                </AttendanceProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;

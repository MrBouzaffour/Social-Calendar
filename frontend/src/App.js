import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import Welcome from './pages/HomePage';
import PrivateRoutes from './components/PrivateRoutes';
import Calendar from './pages/CalendarPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect to login by default */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protect the welcome page using PrivateRoutes */}
          <Route element={<PrivateRoutes />}>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<ProfilePage />} /> {/* Add the profile route */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

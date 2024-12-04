import React, { useState, useEffect } from 'react';
//import { logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';  // Import CSS file for styling
import Navbar from '../VisualObjects/Navbar';
import SideBar from '../VisualObjects/SideBar';



const HomePage = () => {
  const navigate = useNavigate();
   // State for friend UID input
  
  const handleLogout = async () => {
    //await logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      {/* Action Buttons (Profile, Calendar, Logout) */}
        <Navbar /> 
        <SideBar />
      <div>
        
      </div>
      

    </div>
  );
};

export default HomePage;

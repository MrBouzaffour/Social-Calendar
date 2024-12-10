import React, { useState, useEffect } from 'react';
import { getCurrentProfile  } from '../services/authService'; // met670 : for auth
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';  // Import CSS file for styling
import Navbar from '../components/Navbar/Navbar';
import defaultProfilePic from "../assets/images/profilePicture.png"

const ProfilePage = () => {
  const [message, setMessage] = useState('');
  const [userProfile, setUserProfile] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    getUserProfile();
  },[])

  const getUserProfile = async() => {
      //Will get the information from the database and display it
    const userData = await getCurrentProfile();
    setUserProfile(userData);
    console.log(userData);

  }

  const handleDeleteAccount = async () => {
    try {
      //const result = await deleteAccount();
      //setMessage(result.message);
      navigate('/login');  // Redirect to login after account deletion
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };
  const user = {
    name: userProfile.name,
    id: userProfile.id,
    email: userProfile.email,
    profilePicture: defaultProfilePic
  };

  return (
    <div className="profile-page">
      <p>{message}</p>
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-info">
            <h2>Profile Information</h2>
            <img
              src={user.profilePicture}
              alt="Profile"
              className="profile-picture"
            />
            <div className="profile-data">
              <p className="profile-name">{user.name}</p>
              <p className="profile-id">{"ID: "+user.id}</p>
              <p className="profile-email">{"Email: "+user.email}</p>
            </div>
          </div>
          <button onClick={handleDeleteAccount} className="delete-button">
            Delete Account
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default ProfilePage;

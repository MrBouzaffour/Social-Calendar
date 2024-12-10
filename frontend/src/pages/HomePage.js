import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Import CSS file for styling
import Navbar from '../VisualObjects/Navbar';
import SideBar from '../VisualObjects/SideBar';
import Chat from '../VisualObjects/Chat'; // Import the Chat component

const HomePage = () => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false); // State for toggling chat visibility

  const handleLogout = async () => {
    // await logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <Navbar />
      <SideBar />

      {/* Global Chat Feature */}
      {isChatOpen && (
        <Chat
          group={{ name: 'Global Chat' }} // You can replace 'Global Chat' with dynamic group names if needed
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* Button to toggle the chat */}
      <button
        className="open-chat-button"
        onClick={() => setIsChatOpen((prev) => !prev)}
      >
        {isChatOpen ? 'Close Chat' : 'Open Chat'}
      </button>
    </div>
  );
};

export default HomePage;

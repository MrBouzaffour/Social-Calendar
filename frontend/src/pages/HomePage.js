import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import SideBar from '../components/Sidebar/SideBar';
import Chat from '../components/Chat/Chat';
import '../styles/HomePage.css'

const HomePage = () => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="home-page">
      <Navbar />
      <div className="home-layout">
        <SideBar />
        <div className="main-content">
          <h1>Welcome to Social Calendar</h1>
          <p>Select an option from the sidebar to explore more features.</p>
        </div>
      </div>
      {isChatOpen && (
        <Chat
          group={{ name: 'Global Chat' }}
          onClose={() => setIsChatOpen(false)}
        />
      )}
      <button
        className="toggle-chat-btn"
        onClick={() => setIsChatOpen((prev) => !prev)}
      >
        {isChatOpen ? 'Close Chat' : 'Open Chat'}
      </button>
    </div>
  );
};

export default HomePage;

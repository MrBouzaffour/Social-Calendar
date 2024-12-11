import React, { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import SideBar from '../components/Sidebar/SideBar';
import '../styles/HomePage.css';

const HomePage = () => {
  const [activeComponent, setActiveComponent] = useState(null);

  return (
    <div className="home-page">
      <SideBar setActiveComponent={setActiveComponent} />
      <div className="main-container">
        <Navbar />
        <div className="main-content">
          {activeComponent || (
            <>
              <h1>Welcome to Social Calendar</h1>
              <p>Select an option from the sidebar to explore more features.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

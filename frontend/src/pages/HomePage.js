import React, { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import SideBar from "../components/Sidebar/SideBar";
import CalendarCard from "../components/Calendar/CalendarCard";
import GroupsCard from "../components/Groups/GroupCard";
import "../styles/HomePage.css";

const HomePage = () => {
  const [activeComponent, setActiveComponent] = useState(<CalendarCard />);

  return (
    <div className="home-page">
      <SideBar setActiveComponent={setActiveComponent} />
      <div className="content-container">
        <Navbar />
        <div className="content-wrapper">
          {activeComponent}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

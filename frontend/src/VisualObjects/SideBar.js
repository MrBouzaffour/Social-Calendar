import React from 'react';
import { SideBarButtons } from "./SideBarData";
import './SideBar.css';

const SideBar = () => {
    return (
        <nav className="sidebar">
            <div className="sidebar-logo">
                <h2>Social Calendar</h2>
            </div>
            <ul className="sidebar-menu">
                <SideBarButtons />
            </ul>
        </nav>
    );
};

export default SideBar;

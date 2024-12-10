import React, { useState } from 'react';
import { SideBarButtons } from './SideBarData';
import './SideBar.css';

const SideBar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            <div className="sidebar-header">
                <h2 className="sidebar-logo">{isOpen ? 'Social Calendar' : 'SC'}</h2>
                <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
                    {isOpen ? <span>&#x25C0;</span> : <span>&#x25B6;</span>}
                </button>
            </div>
            <ul className="sidebar-menu">
                <SideBarButtons isOpen={isOpen} />
            </ul>
        </div>
    );
};

export default SideBar;

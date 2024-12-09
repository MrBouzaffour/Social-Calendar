import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo" onClick={() => navigate('/welcome')}>
                    Social Calendar
                </div>
                <div className="navbar-actions">
                    <button className="nav-button" onClick={() => navigate('/profile')}>
                        Profile
                    </button>
                    <button className="nav-button" onClick={() => navigate('/calendar')}>
                        Calendar
                    </button>
                    <button className="nav-button logout" onClick={() => navigate('/login')}>
                        Logout
                    </button>
                </div>
                <button className="bell-icon" onClick={toggleDropdown}>
                    <i className="fa-solid fa-bell"></i>
                </button>
                {isDropdownOpen && (
                    <div className="dropdown">
                        <ul>
                            <li>No new notifications</li>
                        </ul>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

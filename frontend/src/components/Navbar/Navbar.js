import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import 'rsuite/dist/rsuite.min.css'; 
import { getNotificationsByUserID } from '../../services/notificationService';
import { getCurrentProfile, getCurrentUserID } from '../../services/authService';

const Navbar = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const userId = getCurrentUserID();

    useEffect(() => {
        if (notificationsEnabled) {
            fetchNotifications();
        }
    }, [notificationsEnabled]);

    const fetchNotifications = async () => {
        try {
            const notifications = await getNotificationsByUserID(userId);
            setNotifications(notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    const toggleNotifications = () => {
        setNotificationsEnabled((prev) => !prev);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Notifications Bell */}
                <div className="bell-container">
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={notificationsEnabled}
                            onChange={toggleNotifications}
                        />
                        <span className="slider">
                            <p className="switchText">
                                {notificationsEnabled ? 'Enabled' : 'Disabled'}
                            </p>
                        </span>
                    </label>
                    <button
                        className="bell-icon"
                        onClick={toggleDropdown}
                        aria-label="Notifications"
                    >
                        {notificationsEnabled && notifications.length > 0 && (
                            <span className="notification-count">
                                {notifications.length > 9 ? '9+' : notifications.length}
                            </span>
                        )}
                        <i className="fa-solid fa-bell"></i>
                    </button>
                </div>
                {isDropdownOpen && (
                    <div className="dropdown">
                        <ul>
                            {notifications.length > 0 ? (
                                notifications.map((notification, index) => (
                                    <li key={index} className="notification-item">
                                        {notification.message}
                                    </li>
                                ))
                            ) : (
                                <li className="no-notifications">No notifications</li>
                            )}
                        </ul>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="nav-buttons">
                    <button className="nav-icon user-icon" onClick={() => navigate('/profile')}>
                        <i className="fa-solid fa-user"></i>
                    </button>
                    <button className="nav-icon home-icon" onClick={() => navigate('/welcome')}>
                        <i className="fa-solid fa-house"></i>
                    </button>
                    <button className="nav-icon logout-icon" onClick={() => navigate('/login')}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

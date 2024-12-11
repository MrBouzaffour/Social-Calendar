import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getNotificationsByUserID } from "../../services/notificationService";
import { getCurrentUserID } from "../../services/authService";
import { AiOutlineBell, AiFillBell, AiOutlineUser, AiOutlineHome, AiOutlineLogout } from "react-icons/ai";

const NavbarContainer = styled.nav`
  background: linear-gradient(90deg, #1e293b, #111827);
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const NotificationContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const NotificationBell = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const NotificationCount = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff4757;
  color: white;
  font-size: 12px;
  border-radius: 50%;
  padding: 3px 6px;
  display: ${({ count }) => (count > 0 ? "block" : "none")};
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 50px; /* Position below the bell */
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: 300px;
  max-height: 300px;
  overflow-y: auto;
  padding: 15px;
  z-index: 2000;

  @media (max-width: 500px) {
    width: 90vw; /* Adjust width for smaller screens */
    right: 5%; /* Center the dropdown */
  }
`;

const DropdownHeader = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

const NotificationItem = styled.div`
  padding: 10px;
  font-size: 14px;
  color: #555;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #f9f9f9;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NoNotifications = styled.div`
  text-align: center;
  font-size: 14px;
  color: #888;
`;

const NavButtons = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
  transition: color 0.3s;
  &:hover {
    color: #10b1b1;
  }
`;

const Navbar = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const userId = getCurrentUserID();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const fetchedNotifications = await getNotificationsByUserID(userId);
        setNotifications(fetchedNotifications || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [userId]);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  return (
    <NavbarContainer>
      <NavButtons>
        {/* Navigation Buttons */}
        <NavButton onClick={() => navigate("/profile")}>
          <AiOutlineUser />
        </NavButton>
        <NavButton onClick={() => navigate("/welcome")}>
          <AiOutlineHome />
        </NavButton>
        <NavButton onClick={() => navigate("/login")}>
          <AiOutlineLogout />
        </NavButton>
      </NavButtons>
      {/* Notifications */}
      <NotificationContainer>
        <NotificationBell onClick={toggleDropdown}>
          {notifications.length > 0 ? <AiFillBell size={24} /> : <AiOutlineBell size={24} />}
          <NotificationCount count={notifications.length}>
            {notifications.length > 9 ? "9+" : notifications.length}
          </NotificationCount>
        </NotificationBell>
        {isDropdownOpen && (
          <DropdownMenu>
            <DropdownHeader>Notifications</DropdownHeader>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <NotificationItem key={index}>{notification.message}</NotificationItem>
              ))
            ) : (
              <NoNotifications>No notifications</NoNotifications>
            )}
          </DropdownMenu>
        )}
      </NotificationContainer>
    </NavbarContainer>
  );
};

export default Navbar;

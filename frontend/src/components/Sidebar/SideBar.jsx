import React, { useState } from "react";
import styled from "styled-components";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { SideBarData } from "./SideBarData";

const SidebarContainer = styled.div`
  background-color: #1e293b;
  height: calc(100vh - 70px); /* Adjust height to avoid overlapping with navbar */
  width: ${(props) => (props.isOpen ? "250px" : "70px")};
  transition: width 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 70px; /* Start below the navbar */
  left: 0;
  z-index: 1000;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const SidebarHeader = styled.div`
  position: relative;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.isOpen ? "flex-start" : "center")};
  border-bottom: 1px solid #333;
  padding: 0 20px; /* Adds padding on both left and right */
`;

const Logo = styled.h2`
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  opacity: ${(props) => (props.isOpen ? "1" : "0")};
  transition: opacity 0.3s ease-in-out;
  margin-right: auto; /* Align text to the left within the header */
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: ${(props) => (props.isOpen ? "10px" : "-0px")};
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  transition: right 0.3s ease, transform 0.3s ease;
`;

const SidebarMenu = styled.ul`
  flex-grow: 1; /* Ensures the menu takes up available space */
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isOpen ? "flex-start" : "center")};
  justify-content: flex-start; /* Align items at the top of the sidebar */
  padding: 10px 0;
  margin: 0;
  list-style: none;
`;

const MenuItem = styled.li`
  width: 100%;
  padding: 10px 15px;
  margin: 5px 0;
  color: #e2e8f0;
  font-size: ${(props) => (props.isOpen ? "16px" : "14px")};
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.isOpen ? "flex-start" : "center")};
  transition: background-color 0.3s ease, padding 0.3s ease, color 0.3s ease;
  &:hover {
    background-color: #334155;
    color: #50d0d0;
  }
`;

const MenuIcon = styled.span`
  font-size: 20px;
  color: ${(props) => (props.isActive ? "#50d0d0" : "#e2e8f0")};
  margin-right: ${(props) => (props.isOpen ? "10px" : "0")};
`;

const Footer = styled.div`
  padding: 10px;
  text-align: center;
  background-color: #1e293b;
  color: #50d0d0;
  font-size: 12px;
  border-top: 1px solid #333;
  margin-top: auto; /* Pushes the footer to the bottom of the sidebar */
`;



const SideBar = ({ setActiveComponent }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const handleMenuClick = (component) => {
    setActiveComponent(component);
  };

  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>
        <Logo isOpen={isOpen}>Social Calendar</Logo>
        <ToggleButton isOpen={isOpen} onClick={toggleSidebar}>
          {isOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
        </ToggleButton>
      </SidebarHeader>
      <SidebarMenu isOpen={isOpen}>
        {SideBarData().map((item, index) => (
          <MenuItem
            key={index}
            isOpen={isOpen}
            onClick={() => handleMenuClick(item.component)}
          >
            <MenuIcon isOpen={isOpen}>{item.icon}</MenuIcon>
            {isOpen && item.title}
          </MenuItem>
        ))}
      </SidebarMenu>
      <Footer>© 2024 Social Calendar</Footer>
    </SidebarContainer>
  );
};

export default SideBar;

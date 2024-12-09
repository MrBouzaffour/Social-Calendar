import React, { useState } from 'react';
import { Link } from "react-router-dom";
import * as ai from 'react-icons/ai';
import FriendsCard from './FriendsCard';
import CalendarCard from './CalendarCard';
import GroupsCard from './GroupCard';
import { getCalendarByUserID } from '../services/calendarService';
import { getCurrentUserID } from '../services/authService';

export const SideBarData = () => {
    const userId = getCurrentUserID();
    const calendarId = getCalendarByUserID(userId);

    return [
        {
            title: "My Calendar",
            icon: <ai.AiFillCalendar />,
            component: <CalendarCard calendarID={calendarId} />,
            id: "calendar",
        },
        {
            title: "Friends",
            icon: <ai.AiFillBook />,
            component: <FriendsCard />,
            id: "friends",
        },
        {
            title: "Groups",
            icon: <ai.AiOutlineOrderedList />,
            component: <GroupsCard />,
            id: "groups",
        },
    ];
};

export const SideBarButtons = () => {
    const sideData = SideBarData();
    const [activeComponent, setActiveComponent] = useState(null);

    const handleButtonClick = (data) => {
        setActiveComponent((prev) => (prev?.id === data.id ? null : data));
    };

    return (
        <>
            {sideData.map((item, index) => (
                <li
                    key={index}
                    className={`sidebar-item ${activeComponent?.id === item.id ? "active" : ""}`}
                    onClick={() => handleButtonClick(item)}
                >
                    <Link to={""} className="sidebar-link">
                        {item.icon}
                        <span>{item.title}</span>
                    </Link>
                </li>
            ))}
            <div className="sidebar-content">
                {activeComponent ? activeComponent.component : <p>Select an option</p>}
            </div>
        </>
    );
};

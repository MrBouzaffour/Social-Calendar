import React, {useState} from 'react';
import * as ai from 'react-icons/ai'
import {Link} from "react-router-dom";
import FriendsCard from './FriendsCard';
import CalendarCard from './CalendarCard';
import GroupsCard from './GroupCard';
import { getCalendarByUserID } from '../services/calendarService';
import { getCurrentUserID } from '../services/authService';

export const SideBarData = () => {

   
    const userId = getCurrentUserID();
    const getCalendarId = (userId) =>{
        try{
        
        const calendarId= getCalendarByUserID(userId);
       return calendarId;
        }
        catch (error){
            console.log('Error fetching user calendar:', error)

        }
    }
    const CalendarID=getCalendarId(userId);
    
    return [
        {
            title: "My Calendar",
            class: "sBarText",
            icon: <ai.AiFillCalendar/>,
            component: <CalendarCard calendarID={CalendarID}  />,
            id: "calendar"
        },
        {
            title: "Friends",
            class: "sBarText",
            icon: <ai.AiFillBook/>,
            component: <FriendsCard />,
            id: "friends"
        },
        {
            title: "Groups",
            class: "sBarText",
            icon: <ai.AiOutlineOrderedList/>,
            component: <GroupsCard/>,
            id: "groups"
        }
    ]
}
export const SideBarButtons = () => {
    const sideData = SideBarData()
    const [activeComponent, setActiveComponent] = useState(null);

    // Function to handle button click and set active component
    const handleButtonClick = (data) => {
        if(activeComponent!=null && activeComponent.id==data.id){
            setActiveComponent(null);
        }
        else{
            setActiveComponent(data);
        }
        
      };

    return (
        <div>
            {sideData.map((item, index) => (
                <li key={index} className={"side-bar-tabs"} onClick={() =>handleButtonClick(item)}>
                    <Link to={""} className={item.class}>
                        {item.icon}
                        {item.title}
                    </Link>
                </li>
            ))}
            <div style={{ padding: "50px", flex: 1 }}>
                {activeComponent ? activeComponent.component : <div></div>}
            </div>
        </div>
    )
}
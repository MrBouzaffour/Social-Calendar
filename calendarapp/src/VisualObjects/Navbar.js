
import React, {useEffect, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import 'rsuite/dist/rsuite.min.css'; 
import { getNotificationsByUserID } from '../services/notificationService';
import { getCurrentProfile, getCurrentUserID} from '../services/authService';

function Navbar() {
    const navigate= useNavigate()

    const [notifications, setNotifications] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [notificationsOn, setGetNotifications] = useState(true);
    const userId= getCurrentUserID();
    //const fetchUserData = getCurrentProfile()
    const [updateNavbar, setUpdateNavbar]= useState(false);
    useEffect(() => {
    fetchNotifications().then((data)=>{
        console.log(data)
        const parsedNotification=  data
        console.log(parsedNotification);
        setNotifications(parsedNotification);


    })
    }, [updateNavbar]);



    const fetchNotifications = async()=>{
        const uid= await userId
        try {
            const noti= await getNotificationsByUserID(uid);
            return noti;
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }



    const toggleDropdown = async () => {
        setIsDropdownOpen((prev) => !prev);
        setUpdateNavbar(!updateNavbar);
    };

    const toggleNotificationsOn = async () => {
        setGetNotifications((prev) => !prev);
    }
    
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <button style={{ backgroundColor: 'transparent' }}
                // Bell Icon and notifcation drop down
                className='bell-icon'>
                    <label class="switch">
                        <input type="checkbox"/>
                        <span class="slider" onClick={toggleNotificationsOn}>
                            {notificationsOn ?
                            (<p className='switchText'>Enabled</p>)
                            :
                            (<p className='switchText'>Disabled</p>)}
                        </span>
                    </label>
                    {notificationsOn && notifications?.length > 0 && (
                    <span
                        style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-15px',
                        backgroundColor: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '4px 8px',
                        fontSize: '10px',
                        }}
                    >
                        
                        {notifications?.length > 9 ? '9+' : notifications.length}
                    </span>
                    )}

                    <i class="fa-solid fa-bell" onClick={toggleDropdown}></i>
                        
                    
                </button>
                {isDropdownOpen && (
                <div
                    style={{
                    position: 'absolute',
                    top: '70px',
                    right: '10px',
                    backgroundColor: 'white',
                    border: '1px solid lightgray',
                    borderRadius: '4px',
                    width: '200px',
                    padding: '5px',
                    fontSize: '15px',
                    alignContent: 'center',
                    maxHeight: '200px',
                    overflow: 'auto',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    
                    <ul>
                        {notifications?.length > 0 ? (
                            notifications.map((notification, index) => (
                            <Link key={index}>{index+1}. {notification.message}<br /></Link>
                            
                            ))
                        ) : (<li>No notifications</li>)}
                    </ul>
                </div>
                )}
                



                <button class='user-icon' onClick= {() => navigate('/profile')}>
                    <i class="fa-solid fa-user"> </i>
                    </button>
                <button class='home-icon' onClick= {() => navigate('/welcome')}>
                    <i class="fa-solid fa-house"> </i>
                    </button>


                <button class='logout-icon' onClick= {() => navigate('/login')}>
                    <i class="fa-solid fa-right-from-bracket"> </i>
                    </button>                            
                        
                
            </div>
        </nav>
    ); 
}

export default Navbar;


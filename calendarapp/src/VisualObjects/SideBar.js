import React from 'react';
import {SideBarButtons} from "./SideBarData";
import './SideBar.css';
import { Button } from 'rsuite';


const SideBar = () => {
    return (
        <nav className="side-bar">
                <ul className="menu-items">
                    <SideBarButtons/>
                    {/* <Button>Get Free time</Button> */}
                </ul>
            </nav>
    )
}
export default SideBar;
import React from "react";
import { AiFillCalendar, AiFillBook, AiOutlineOrderedList } from "react-icons/ai";

export const SideBarData = () => [
  {
    title: "My Calendar",
    icon: <AiFillCalendar />,
  },
  {
    title: "Friends",
    icon: <AiFillBook />,
  },
  {
    title: "Groups",
    icon: <AiOutlineOrderedList />,
  },
];

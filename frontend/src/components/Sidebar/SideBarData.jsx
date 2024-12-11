import { AiFillCalendar, AiFillBook, AiOutlineOrderedList } from "react-icons/ai";
import CalendarCard from "../Calendar/CalendarCard";
import FriendsCard from "../Friends/FriendsCard";
import GroupCard from "../Groups/GroupCard";

export const SideBarData = () => [
  {
    title: "My Calendar",
    icon: <AiFillCalendar />,
    component: <CalendarCard />,
  },
  {
    title: "Friends",
    icon: <AiFillBook />,
    component: <FriendsCard />,
  },
  {
    title: "Groups",
    icon: <AiOutlineOrderedList />,
    component: <GroupCard />,
  },
];

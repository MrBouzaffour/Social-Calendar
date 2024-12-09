import React, { useState, useEffect } from 'react';
import { createGroup, getUserGroups, getGroupById } from '../services/groupServices'
import CalendarCard from './CalendarCard';
import "./GroupCard.css";
import ChatPopup from './Chat';
import { useNavigate } from 'react-router-dom';
import { getFriendsList, getProfile } from '../services/friendsServices';
import { sendGroupInvite, getGroupInvites } from '../services/groupServices';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';


const GroupsCard =()=> {
  const navigate= useNavigate()
  const [groups, setGroups] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [addToGroupPopup, setAddPopup] = useState(false);
  const [selectedUid, setSelectedUid] = useState("");
  const [friendProfiles, setFriendProfiles] = useState({});
  const [activeComponent, setActiveComponent] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedGroupForCalendar, setSelectedGroupForCalendar] = useState(null);
  const [groupInvites, setGroupInvites] = useState(null);
  const [selectedGroupChat, setSelectedGroupChat] = useState(null);

  useEffect(() => {
    console.log("Active component updated:" , activeComponent);
  }, [activeComponent]);
  
  useEffect(() => {
    console.log("new group",selectedGroup);
  }, [selectedGroup])

  useEffect(() => {
    fetchGroups();
    fetchFriendsList();
    fetchGroupInvites();
    console.log(friendProfiles);
  }, []);

  //chat toggle
  const toggleChat = (group = null) => {
    setSelectedGroupChat(group);
    setIsChatOpen((prev) => !prev);
  };

  // handles opening calendar
  const openCalendar = (group = null) => {
    setSelectedGroupForCalendar(group);
    setIsCalendarOpen((prev) => !prev);
  };

  // Add new group
  const addGroup = async () => {
    if (groupName) {
      try{
        const newGroup = await createGroup(groupName);
        if(!newGroup){
          throw new Error('Group was not added with success');
        }
      } catch(error){
        console.error('Error Creating a group:', error.message);
      }
    }
  };


  const fetchGroups = async () =>{
    try{
      const userGroups = await getUserGroups();
      console.log(userGroups);
      const pairProfile = async (arr) => {
        console.log(arr);
        const entries = await Promise.all(
          arr.map(async (id) => [id, await fetchGroupById(id)])
        );
        return Object.fromEntries(entries);
      }
      const groupPairs = await pairProfile(userGroups.groups);
      setGroups(groupPairs);
      return userGroups;
    } catch(error){
      console.log(error, 'Error fetching user groups:', error)

    }
  }

  const fetchGroupById = async (groupId) => {
    try{
      const groupInfo = await getGroupById(groupId);
      console.log(groupInfo);
      return groupInfo;
    }
    catch (error) {
      console.error("Error fetching group with id ",groupId,": ",error);
    }
  }

  // Reset modal state
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const invitePopup = async (groupId) => {
    console.log("!");
    setSelectedGroup(groupId);
    setAddPopup(!addToGroupPopup);
    console.log("popup",groupId);
    try{
      fetchFriendsList();
    } catch (error) {
      console.error("error fetching friends list: ", error);
    }
  }

  const fetchFriendsList = async () => {
    try {
      const friendsList = await getFriendsList();
      const pairProfile = async (arr) => {
        const entries = await Promise.all(
          arr.map(async (id) => [id, await fetchProfile(id)])
        );
        return Object.fromEntries(entries);
      }
      const friendNames = await pairProfile(friendsList.friends);
      setFriendProfiles(friendNames);
      console.log(friendNames);
    } catch (error) {
      console.error('Error fetching friends list:', error);
    }
  };

  const fetchGroupInvites = async () => {

    try{
      const groupInvites = await getGroupInvites();
      console.log("invites",groupInvites);
      setGroupInvites(null);
      

    } catch(error){
      console.error('Error fetching friends list:', error);
    }
    };

  const handleInviteToGroup = async (userId) => {
    try{
      console.log("group",selectedGroup,"user",userId);
      await sendGroupInvite(selectedGroup, userId);
    } catch (error) {
      console.error("error sending group invite",error);
    }
  };

  const handleInviteWithId = async (event) => {
    event.preventDefault();
    try{
      await sendGroupInvite(selectedGroup, selectedUid);
    } catch (error) {
      console.error("error sending invite with id",error);
    }
  }

  const fetchProfile = async (friendID) => {
    try{
      const profile = await getProfile(friendID);
      return profile;
    }
    catch (error) {
      console.error('Error fetching friend profile:',error);
    }
  }

  // Group list, temporary place holder till backend works TODO
  const GroupList = ({ groups, setActiveComponent}) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3>Your Groups</h3>
      {groups.length === 0 ? (Object.entries(groups).map(([key,value]) => (<li key={key}>
        {key}
        </li>))) : (<p>No groups yet.</p>)}
    </div>
  );

  const AddToGroup = () => (
    <div className='addAFriend'>
      <ul className="friends-list">
        {console.log(friendProfiles)}
        {console.log(friendProfiles.length)}
        <p>Enter User ID</p>
        <form onSubmit={handleInviteWithId}>
          <input
          type="text"
          placeholder="Enter User UID"
          value={selectedUid}
          onChange={(e) => setSelectedUid(e.target.value)}
          required
          />
        </form>
        <p>Or choose a friend</p>
          {Object.entries(friendProfiles).length > 0 ? (
          Object.entries(friendProfiles).map(([key, value]) => (
            <li key={key}><button onClick={()=>handleInviteToGroup(value.id)}>Invite</button>{value.name}</li> 
          ))
          ) : (
            <li>No friends</li>
          )}
        </ul>
    </div>
  );

  const GroupInvitesBox = () => (
    <div className='groupInvites'>
      <h3 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 16 }}>Your Invites</h3>
      <ul className='invites'>
        {groupInvites ? (<>/</>) : (<></>)}
      </ul>
    </div>
  )

  return activeComponent ? (
      activeComponent
    ) : ( 
    <div
      className='groupCard'
    >
      <button onClick={() => setOpenDialog(true)}>Create New Group</button>
      <h3 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>Your Groups</h3>
      <GroupInvitesBox/>
      <div>
        {Object.entries(groups).map(([key,group]) => (
          <div
            key={group.id}
            className='groupBox'
          >
            <h4><button onClick={() => invitePopup(group.id)}>+</button>{group.name}</h4>
            <p>Members: {group.members.length}</p>
            <button style={{backgroundColor: '#10B1B1', color: 'white', marginRight: '2px'}} onClick={() => toggleChat(group)}>Open Chat</button>
            <button style={{backgroundColor: '#10B1B1', color: 'white', marginLeft: '2px'}} onClick={() => openCalendar(group)}>Open Calendar</button>
          </div>
        ))}
        {addToGroupPopup ?
          <AddToGroup/> : <></>
        }
      </div>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group Name"
          style={{ marginBottom: '10px', width: '100%' }}
        />
        <div style={{ marginTop: '10px' }}>
          <button onClick={() => {addGroup();handleCloseDialog();}} style={{ marginRight: '10px' }}>
            Create Group
          </button>
          <button onClick={() => {handleCloseDialog();}}>Cancel</button>
        </div>
        </DialogContent>
      </Dialog>

    {isChatOpen && selectedGroup && (
        <ChatPopup group={selectedGroup} onClose={toggleChat} />
    )}
    {isCalendarOpen && selectedGroupForCalendar && (
      <CalendarCard
        calendarID={selectedGroupForCalendar.calendarId}
        group={selectedGroupForCalendar}
        onClose={() => setIsCalendarOpen(false)}
      />
    )}
    </div>
    )
};
export default GroupsCard


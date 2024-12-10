import { searchUsersByName,sendFriendRequest,getFriendRequests,acceptFriendRequest,rejectFriendRequest,getFriendsList,getProfile} from '../services/friendsServices';
import {getCurrentUserID} from '../services/authService'
import React, { useState, useEffect } from 'react';
import './FriendsCard.css';
const FriendsCard = () => {

const [friendUid, setFriendUid] = useState('');
const [currentUid, setCurrentUid] = useState('');
const [message, setMessage] = useState(''); // State for feedback messages
const [friendRequests, setFriendRequests] = useState({}); // State to manage incoming friend requests
const [requestProfiles, setRequestProfiles] = useState([{requestID:null,profile:null,name:null}]);
const [friendsList, setFriendsList] = useState({friends:[]}); // State for the list of accepted friends
const [friendProfiles, setFriendProfiles] = useState({});
const [position, setPosition] = useState({ top: 50, left: 50 }); // State for draggable position


const [searchName, setSearchName] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [loading, setLoading] = useState(false);

  // Fetch friend requests and friends list when the component mounts
  useEffect(() => {
    fetchFriendRequests();
    fetchFriendsList();
    fetchUserID();
  }, []);

  const fetchUserID = async () => {
    try{
      const uid = await getCurrentUserID();
      setCurrentUid(uid);
    } catch (error) {
      console.error('Error fetching Current User ID:', error);
    }
  };

  // Handle friend request submission
  const handleFriendRequestSubmit = async (receiverId) => {
    console.log('Sending friend request to receiverId:', receiverId);
    try {
      await sendFriendRequest(receiverId);
      setMessage('Friend request sent successfully!');
    } catch (error) {
      console.error('Error sending friend request:', error.message);
      setMessage(`Error: ${error.message}`);
    }
  };
  
  


  // Fetch friend requests from the server
  const fetchFriendRequests = async () => {
    try {
      const requests = await getFriendRequests();
      const pairProfile = async (arr, idProp, valueProp) => {
        const entries = await Promise.all(
          arr.map(async (item) => {
            const id = item[idProp]
            const sender = item[valueProp];
            const profile = await fetchProfile(sender);
            return [id, profile]; // Return as a key-value pair
          })
        );
        return Object.fromEntries(entries);
      }
      const requestNames = await pairProfile(requests,"id","senderId");
      setFriendRequests(requests);
      setRequestProfiles(requestNames);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  // Fetch the accepted friends list from the server
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
      setFriendsList(friendsList);
      setFriendProfiles(friendNames);
    } catch (error) {
      console.error('Error fetching friends list:', error);
    }
  };

  const fetchProfile = async (friendID) => {
    try{
      const profile = await getProfile(friendID);
      console.log(profile);
      return profile;
    }
    catch (error) {
      console.error('Error fetching friend profile:',error);
    }
  }

  // Handle accepting a friend request
  const handleAccept = async (friendUid) => {
    try {
      await acceptFriendRequest(friendUid);
      setMessage('Friend request accepted');
      fetchFriendRequests();  // Refresh friend requests after accepting
      fetchFriendsList();     // Refresh friends list
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };
   // Handle search for users
   const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchName) return;

    try {
      setLoading(true);
      const results = await searchUsersByName(searchName);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      setMessage('Failed to fetch search results.');
    } finally {
      setLoading(false);
    }
  };
  // Handle rejecting a friend request
  const handleReject = async (friendUid) => {
    try {
      await rejectFriendRequest(friendUid);
      setMessage('Friend request rejected');
      fetchFriendRequests();  // Refresh friend requests after rejecting
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  // Drag and move the box
  const handleDrag = (event) => {
    const offsetX = event.clientX - position.left;
    const offsetY = event.clientY - position.top;
  

    const onMouseMove = (e) => {
      setPosition({
        top: e.clientY - offsetY,
        left: e.clientX - offsetX
      });
    };

    document.addEventListener('mousemove', onMouseMove);

    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', onMouseMove);
    }, { once: true });
  };
      
      
 return (     

  <div
  className="draggable-box"
  style={{
    position: "absolute", // allows free positioning
    top: position.top,
    left: position.left,
    zIndex: 1000, // ensures the box is above other elements
  }}
  onMouseDown={handleDrag}
>
  <h3>Enter Friend's ID</h3>
  <form onSubmit={handleFriendRequestSubmit}>
    <input
      type="text"
      placeholder="Enter Friend UID"
      value={friendUid}
      onChange={(e) => setFriendUid(e.target.value)}
      required
    />
    <button style={{ backgroundColor: "#10B1B1" }} type="submit">
      Send Friend Request
    </button>
  </form>
  {message && <p>{message}</p>}

  {/* Search for Friends */}
  <h3>Search for Friends</h3>
  <form onSubmit={handleSearch}>
    <input
      type="text"
      placeholder="Search by name"
      value={searchName}
      onChange={(e) => setSearchName(e.target.value)}
      className="search-input"
    />
    <button className="search-button" type="submit">
      Search
    </button>
  </form>
  <ul className="search-results">
  {loading ? (
    <p>Loading...</p>
  ) : searchResults.length > 0 ? (
    searchResults.map((user) => (
      <li key={user.id}>
        {user.name}
        <button
          style={{ backgroundColor: '#10B1B1' }}
          onClick={() => handleFriendRequestSubmit(user.id)} // Pass the user ID directly
        >
          Add Friend
        </button>
      </li>
    ))
  ) : (
    <li>No users found</li>
  )}
</ul>


  {/* Friends List */}
  <h3>Current Friends</h3>
  <ul className="friends-list">
    {friendsList.friends.length > 0 ? (
      Object.entries(friendProfiles).map(([key, value]) => (
        <li key={key}>{value.name}</li>
      ))
    ) : (
      <li>No friends</li>
    )}
  </ul>

  {/* Friend Requests List */}
  <h3>Friend Requests</h3>
  <ul className="friend-requests-list">
    {friendRequests.length > 0 ? (
      Object.entries(requestProfiles).map(([key, value]) => (
        <li key={key}>
          {value.name}
          <button
            className="accept-button"
            style={{
              backgroundColor: "#10B1B1",
              marginTop: "5px",
              marginBottom: "10px",
            }}
            onClick={() => handleAccept(key)}
          >
            Accept
          </button>
          <button
            className="reject-button"
            style={{ backgroundColor: "#10B1B1" }}
            onClick={() => handleReject(key)}
          >
            Reject
          </button>
        </li>
      ))
    ) : (
      <li>No pending friend requests</li>
    )}
  </ul>

  <h4>Your ID</h4>
  <h3 className="userID">{currentUid}</h3>
</div>

  );

};


export default FriendsCard
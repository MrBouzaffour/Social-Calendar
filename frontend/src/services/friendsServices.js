const API_BASE_URL = 'http://localhost:3000/api/friends';
const API_USER_URL = 'http://localhost:3000/api/users';

const getToken = () => localStorage.getItem('token');

export const sendFriendRequest = async (friendUid) => {
  const response = await fetch(`${API_BASE_URL}/request`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ receiverId: friendUid }),
  });

  if (!response.ok) {
    throw new Error('Error sending friend request');
  }

  return await response.json();
};

export const acceptFriendRequest = async (requestId) => {
  const response = await fetch(`${API_BASE_URL}/request/${requestId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'accept' }),
  });

  if (!response.ok) {
    throw new Error('Error accepting friend request');
  }

  return await response.json();
};

export const rejectFriendRequest = async (requestId) => {
  const response = await fetch(`${API_BASE_URL}/request/${requestId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'reject' }),
  });

  if (!response.ok) {
    throw new Error('Error rejecting friend request');
  }

  return await response.json();
};

export const getProfile = async (userId) => {
  const response = await fetch(`${API_USER_URL}/profile/${userId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${getToken()}` },
});
  if(!response.ok) throw new Error('Failed to get friend profile');
  const data = await response.json();
  return data;
}


/**
 * Get all pending friend requests List
 */


export const getFriendRequests = async () => {
  const response = await fetch(`${API_BASE_URL}/requests`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('friendsServices: Error fetching friend requests');
  }

  return await response.json();
};

export const getFriendsList = async () =>{
  const response = await fetch(`${API_USER_URL}/friends`,{
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  if(!response.ok) {
    throw new Error('Error fetching friend list');
  }
  
  return await response.json();
}
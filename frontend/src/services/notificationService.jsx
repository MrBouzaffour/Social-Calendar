const API_USER_URL = 'http://localhost:3000/api/users'

const getToken = () => localStorage.getItem('token');

export const getNotificationsByUserID = async (userId) => {
    const uid = await userId;
    const response = await fetch(`${API_USER_URL}/${uid}/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Error getting notifications');
    }
    const data = await response.json(); 
    
    return data.notifications;
  }
const API_GROUP_URL = 'http://localhost:3000/api/groups'
const API_USER_URL= 'http://localhost:3000/api/users'
const getToken = () => localStorage.getItem('token');

export const createGroup = async (name, description) => {
    
    const response = await fetch(`${API_GROUP_URL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    });
  
    if (!response.ok) {
      throw new Error('Error creating calendar');
    }
   
    const data= await response.json();
    console.log(data)
    return data
  };
  


export const getUserGroups = async () =>{
   
    const response = await fetch(`${API_USER_URL}/groups`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error('Error getting calendar');
    }
    const data = await response.json(); 
    console.log(data)
    return data
  };

export const getGroupById = async (groupId) =>{
  const groId = await groupId;
  const response = await fetch(`${API_GROUP_URL}/${groId}/info`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    }
  });
  if(!response.ok){
    throw new Error("error getting group");
  }
  const data = await response.json();
  console.log("group by id",data);
  return data;
}





  export const getCalendarByGroupID = async (groupID) => {
    const groId = await groupID;
    const response = await fetch(`${API_GROUP_URL}/${groId}/calendar`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error('Error getting calendar');
    }
    const data = await response.json();
    console.log("calander",data);
  
    return data.calendarId
  }



export const sendGroupInvite = async (groupId, invitedID) => {
  const groId = await groupId;
  const invtID = await invitedID;
  const response = await fetch(`${API_GROUP_URL}/${groId}/invite`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipientId: invtID }),
  });

  if (!response.ok) {
    throw new Error('Error sending friend request');
  }

  const data= await response.json();
  return data
};

export const getGroupInvites = async () => {
  const response = await fetch(`${API_GROUP_URL}/requests`,{
    headers: {
      method: "GET",
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  if(!response.ok){
    throw new Error('Error fetching group requests');
  }
  return await response.json();
}

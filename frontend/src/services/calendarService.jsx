const API_CALENDAR_URL = 'http://localhost:3000/api/calendars';
const API_USER_URL = 'http://localhost:3000/api/users'


const getToken = () => localStorage.getItem('token');

export const createCalendar = async (name, type) => {
  const response = await fetch(`${API_CALENDAR_URL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, type }),
  });

  if (!response.ok) {
    throw new Error('Error creating calendar');
  }

  return await response.json();
};

export const getCalendarByUserID = async (userId) => {
  const uid = await userId;
  const response = await fetch(`${API_USER_URL}/${uid}/calendar`, {
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

  return data.calendarId
}


//Working
export const addEventToCalendar = async (calendarId, eventData) => {
  const calID= await calendarId
  const response = await fetch(`${API_CALENDAR_URL}/${calID}/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: eventData.title, startDate: eventData.start.toISOString(), endDate: eventData.end.toISOString(), location: eventData.location, description: eventData.description, type: eventData.eventType}),
  });
  if (!response.ok) {
    throw new Error('Error adding event to calendar');
  }
  const data= await response.json();
  return data;
};

//Working
export const getCalendarEvents = async (calendarId) => {
  const calID= await calendarId;
  console.log(calID)
  const response = await fetch(`${API_CALENDAR_URL}/${calID}/events`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    }
  });
  if (!response.ok) {
    throw new Error('Error fetching eventstt');
  }

  const data =await response.json();
  //console.log(data)
  return data;
}

export const editEventInfo = async (calendarId,eventId,eventData) => {
const evID= await eventId;
const calID= await calendarId;
const response = await fetch(`${API_CALENDAR_URL}/${calID}/events/${evID}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ title: eventData.title, startDate: eventData.start.toISOString(), endDate: eventData.end.toISOString(), location: eventData.location, description: eventData.description, type: eventData.eventType, show: eventData.show}),
});
if (!response.ok) {
  throw new Error('Error adding event to calendar');
}
const data= await response.json();
return data;
};


export const addReminder = async (userId,calendarId,eventId,reminderdate, eventTitle) => {
  const evID= await eventId;
  const calID= await calendarId;
  const uId= await userId;
  const response = await fetch(`${API_CALENDAR_URL}/${calID}/events/${evID}/reminders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId:uId, message:eventTitle, time:reminderdate}),
  });
  if (!response.ok) {
    throw new Error('Error adding event to calendar');
  }
  const data= await response.json();
  return data;
  };



export const deleteEvent = async(calendarId,eventId)=>{
  const evID= await eventId;
  const calID= await calendarId;
  const response = await fetch(`${API_CALENDAR_URL}/${calID}/events/${evID}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Error deleting event from calendar');
  }
  const data= await response.json();
  return data;

}



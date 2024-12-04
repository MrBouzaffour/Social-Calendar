const API_BASE_URL = 'http://localhost:3000/api/events';

export const getEvents = async () => {
  const response = await fetch(`${API_BASE_URL}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });

  if (!response.ok) {
    throw new Error('Error fetching events');
  }

  return await response.json();
};

export const getEventById = async (eventId) => {
  const response = await fetch(`${API_BASE_URL}/${eventId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });

  if (!response.ok) {
    throw new Error('Error fetching event');
  }

  return await response.json();
};



export const getCalendarEvents = async (calendarId) => {
  const response = await fetch(`${API_BASE_URL}/${calendarId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });

  if (!response.ok) {
    throw new Error('Error fetching events');
  }

  return await response.json();
};
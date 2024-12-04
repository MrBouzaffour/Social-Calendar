import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = 'http://localhost:3000/api/users';

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  const { exp } = jwtDecode(token);
  if (Date.now() >= exp * 1000) {
    localStorage.removeItem('token');
    return false;
  }
  return true;
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error('Login failed');

  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};

export const registerUser = async (email, password, name) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) throw new Error('Registration failed');

  return await response.json();
};

export const getCurrentProfile = async () => {
  console.log("currUser");
  const currentUid = await getCurrentUserID();
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/profile/${currentUid}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Failed to fetch profile');

  return await response.json();
};

export const logoutUser = () => {
  localStorage.removeItem('token');
};

export const getCurrentUserID = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  try {
    // Decode the token
    const { uid, userId } = jwtDecode(token);
    return uid || userId; // Decode user ID if it's in the token
  } catch (error) {
    console.error('Error decoding token. Falling back to API:', error);

    // Fall back to fetching from the API
    const response = await fetch(`${API_BASE_URL}/id`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch user ID from API');

    const data = await response.json();
    return data.userId; // Ensure this matches your API response structure
  }
};

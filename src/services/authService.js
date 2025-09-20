import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://stylehub-backend-nu.vercel.app';

// User signup
export const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/signup`, userData);
    return response.data;
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
};

// User login
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// Get user profile
export const getProfile = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (token, profileData) => {
  try {
    const response = await axios.put(`${API_URL}/api/auth/profile`, profileData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (token, passwordData) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/change-password`, passwordData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Logout
export const logout = async (token) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

// Verify token
export const verifyToken = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/verify-token`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};

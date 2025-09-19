import axios from 'axios';
import { API_URL } from '../config';

// Get all active locations
export const getActiveLocations = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/location`);
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

// Admin functions
export const getAllLocations = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/location/all`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all locations:', error);
    throw error;
  }
};

export const createLocation = async (locationData) => {
  try {
    // If locationData is already FormData, use it directly
    const formData = locationData instanceof FormData ? locationData : new FormData();
    
    // Only append these if locationData is not already FormData
    if (!(locationData instanceof FormData)) {
      formData.append('name', locationData.name);
      formData.append('displayOrder', locationData.displayOrder || 0);
      formData.append('isActive', locationData.isActive || true);
      
      if (locationData.image) {
        formData.append('image', locationData.image);
      }
    }

    const response = await axios.post(`${API_URL}/api/location`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;
  }
};

export const updateLocation = async (id, locationData) => {
  try {
    // If locationData is already FormData, use it directly
    const formData = locationData instanceof FormData ? locationData : new FormData();
    
    // Only append these if locationData is not already FormData
    if (!(locationData instanceof FormData)) {
      formData.append('name', locationData.name);
      formData.append('displayOrder', locationData.displayOrder || 0);
      formData.append('isActive', locationData.isActive || true);
      
      if (locationData.image) {
        formData.append('image', locationData.image);
      }
    }

    const response = await axios.put(`${API_URL}/api/location/${id}`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
};

export const deleteLocation = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/location/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
};
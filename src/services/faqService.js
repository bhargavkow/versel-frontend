import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://stylehub-backend-nu.vercel.app';

// Get all active FAQs (for public display)
export const getFAQs = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/faqs/active`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    throw error;
  }
};

// Get all FAQs (for admin)
export const getAllFAQs = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/faqs`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all FAQs:', error);
    throw error;
  }
};

// Create a new FAQ
export const createFAQ = async (faqData) => {
  try {
    const response = await axios.post(`${API_URL}/api/faqs`, faqData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating FAQ:', error);
    throw error;
  }
};

// Update an existing FAQ
export const updateFAQ = async (id, faqData) => {
  try {
    const response = await axios.put(`${API_URL}/api/faqs/${id}`, faqData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating FAQ:', error);
    throw error;
  }
};

// Delete a FAQ
export const deleteFAQ = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/faqs/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    throw error;
  }
};

// Toggle FAQ status
export const toggleFAQStatus = async (id) => {
  try {
    const response = await axios.patch(`${API_URL}/api/faqs/${id}/toggle-status`);
    return response.data.data;
  } catch (error) {
    console.error('Error toggling FAQ status:', error);
    throw error;
  }
};

// Reorder FAQ
export const reorderFAQ = async (id, newOrder) => {
  try {
    const response = await axios.patch(`${API_URL}/api/faqs/${id}/reorder`, {
      newOrder: newOrder
    });
    return response.data.data;
  } catch (error) {
    console.error('Error reordering FAQ:', error);
    throw error;
  }
};
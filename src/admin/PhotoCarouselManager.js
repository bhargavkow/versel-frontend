import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Popup from '../components/Popup';
import { usePopup } from '../hooks/usePopup';

const PhotoCarouselManager = () => {
  const [carouselItems, setCarouselItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { popup, showPopup, hidePopup } = usePopup();
  const [formData, setFormData] = useState({
    title: '',
    altText: '',
    link: '',
    order: 0,
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'https://vercel-backend-seven.vercel.app';
  
  // Debug: Log API URL
  console.log('🔍 PhotoCarouselManager API_URL:', API_URL);

  // URL validation function
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Fetch carousel items
  const fetchCarouselItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/photo-carousel`);
      if (response.data.success) {
        setCarouselItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching carousel items:', error);
      setError('Failed to fetch carousel items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarouselItems();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      altText: '',
      link: '',
      order: 0,
      isActive: true
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingItem(null);
    setShowForm(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile && !editingItem) {
      showPopup('Please select an image', 'error');
      return;
    }

    if (!formData.title.trim()) {
      showPopup('Please enter a title', 'error');
      return;
    }

    // Validate link if provided
    if (formData.link.trim() && !isValidUrl(formData.link.trim())) {
      showPopup('Please enter a valid URL or leave the link field empty', 'error');
      return;
    }

    try {
      console.log('🚀 Submitting form to:', `${API_URL}/api/photo-carousel`);
      console.log('📝 Form data:', formData);
      console.log('📁 Image file:', imageFile);
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('altText', formData.altText.trim());
      formDataToSend.append('link', formData.link.trim() || ''); // Link is optional
      formDataToSend.append('order', formData.order || 0);
      formDataToSend.append('isActive', formData.isActive);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      let response;
      if (editingItem) {
        console.log('✏️ Updating item:', editingItem._id);
        response = await axios.put(`${API_URL}/api/photo-carousel/${editingItem._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        console.log('➕ Creating new item');
        response = await axios.post(`${API_URL}/api/photo-carousel`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      console.log('✅ Response:', response.data);

      if (response.data.success) {
        showPopup(editingItem ? 'Carousel item updated successfully!' : 'Carousel item created successfully!', 'success');
        resetForm();
        fetchCarouselItems();
      } else {
        showPopup(response.data.message || 'Failed to save carousel item', 'error');
      }
    } catch (error) {
      console.error('Error saving carousel item:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save carousel item';
      showPopup(`Error: ${errorMessage}`, 'error');
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      altText: item.altText,
      link: item.link,
      order: item.order,
      isActive: item.isActive
    });
    setImagePreview(`${API_URL}${item.image}`);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this carousel item?')) {
      try {
        const response = await axios.delete(`${API_URL}/api/photo-carousel/${id}`);
        if (response.data.success) {
          showPopup('Carousel item deleted successfully!', 'success');
          fetchCarouselItems();
        }
      } catch (error) {
        console.error('Error deleting carousel item:', error);
        showPopup('Failed to delete carousel item', 'error');
      }
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (id) => {
    try {
      const response = await axios.put(`${API_URL}/api/photo-carousel/${id}/toggle-active`);
      if (response.data.success) {
        fetchCarouselItems();
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
      showPopup('Failed to toggle active status', 'error');
    }
  };

  // Handle order update
  const handleOrderUpdate = async (items) => {
    try {
      const response = await axios.put(`${API_URL}/api/photo-carousel/update-order`, {
        items: items.map((item, index) => ({ id: item._id, order: index }))
      });
      if (response.data.success) {
        fetchCarouselItems();
      }
    } catch (error) {
      console.error('Error updating order:', error);
      showPopup('Failed to update order', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Photo Carousel Manager</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Item
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Carousel Item' : 'Add New Carousel Item'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!editingItem}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-fit rounded-md"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  name="altText"
                  value={formData.altText}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link <span className="text-gray-500 text-sm">(Optional)</span>
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Carousel Items List */}
      <div className="space-y-4">
        {carouselItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No carousel items found. Add your first item!
          </div>
        ) : (
          carouselItems.map((item, index) => (
            <div key={item._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={`${API_URL}${item.image}`}
                    alt={item.altText}
                    className="w-20 h-20 object-fit rounded-md"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600">Order: {item.order}</p>
                  {item.link && (
                    <p className="text-sm text-blue-600">Link: {item.link}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(item._id)}
                    className={`px-3 py-1 text-sm rounded ${
                      item.isActive
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {item.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Popup 
        show={popup.show} 
        message={popup.message} 
        type={popup.type} 
        onClose={hidePopup} 
      />
    </div>
  );
};

export default PhotoCarouselManager;

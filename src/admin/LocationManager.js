import React, { useState, useEffect } from 'react';
import { getAllLocations, createLocation, updateLocation, deleteLocation } from '../services/locationService';
import { API_URL } from '../config';

const LocationManager = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    displayOrder: 0,
    isActive: true,
    image: null
  });
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await getAllLocations();
      if (response.success) {
        setLocations(response.data);
      } else {
        setError('Failed to fetch locations');
      }
    } catch (err) {
      setError('Error loading locations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      setFormData({
        ...formData,
        image: files[0]
      });

      // Create preview URL
      if (files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(files[0]);
      } else {
        setPreviewImage(null);
      }
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const locationData = new FormData();
      locationData.append('name', formData.name);
      locationData.append('displayOrder', formData.displayOrder);
      locationData.append('isActive', formData.isActive);

      if (formData.image) {
        locationData.append('image', formData.image);
      }

      if (editingId) {
        await updateLocation(editingId, locationData);
      } else {
        await createLocation(locationData);
      }

      // Reset form and refresh data
      resetForm();
      fetchLocations();
    } catch (err) {
      setError('Error saving location');
      console.error(err);
    }
  };

  const handleEdit = (location) => {
    setEditingId(location._id);
    setFormData({
      name: location.name,
      displayOrder: location.displayOrder,
      isActive: location.isActive,
      image: null
    });
    setPreviewImage(`${API_URL}${location.imageUrl}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation(id);
        fetchLocations();
      } catch (err) {
        setError('Error deleting location');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayOrder: 0,
      isActive: true,
      image: null
    });
    setEditingId(null);
    setPreviewImage(null);
  };

  if (loading && locations.length === 0) return <div className="text-center py-10">Loading locations...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Location Manager</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Location' : 'Add New Location'}</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Location Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-gray-700">Active</span>
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Location Image</label>
              <input
                type="file"
                name="image"
                onChange={handleInputChange}
                className="w-full"
                accept="image/*"
                {...(!editingId && { required: true })}
              />
              {previewImage && (
                <div className="mt-2">
                  <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover border rounded" />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                {editingId ? 'Update Location' : 'Add Location'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Locations List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Locations</h2>

          {locations.length === 0 ? (
            <p className="text-gray-500">No locations found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Image</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Order</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((location) => (
                    <tr key={location._id} className="border-b">
                      <td className="px-4 py-2">
                        <img
                          src={`${API_URL}${location.imageUrl}`}
                          alt={location.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="px-4 py-2">{location.name}</td>
                      <td className="px-4 py-2">{location.displayOrder}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${location.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {location.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEdit(location)}
                          className="text-blue-500 hover:text-blue-700 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(location._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationManager;
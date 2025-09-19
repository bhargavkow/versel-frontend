import React, { useState, useEffect } from 'react';
import { getActiveLocations } from '../services/locationService';
import { API_URL } from '../config';

const LocationGallery = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await getActiveLocations();
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

    fetchLocations();
  }, []);

  // Function to create columns of locations
  const createLocationColumns = () => {
    if (locations.length === 0) return [];
    
    // Create 4 columns
    const columns = [[], [], [], []];
    
    // Distribute locations across columns
    locations.forEach((location, index) => {
      const columnIndex = index % 4;
      columns[columnIndex].push(location);
    });
    
    return columns;
  };

  const locationColumns = createLocationColumns();

  if (loading) return <div className="text-center py-10">Loading locations...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <section className="relative py-10 px-5 text-center">
      {/* Full-width Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      
      <div className="relative max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-5 font-serif">Location</h1>
        <div className="flex justify-center gap-5 flex-wrap">
        {locationColumns.map((column, columnIndex) => (
          <div key={`column-${columnIndex}`} className="flex flex-col gap-4">
            {column.map((location) => (
              <img 
                key={location._id}
                src={`${API_URL}${location.imageUrl}`}
                alt={location.name}
                className="w-48 h-48 shadow-strong transition-transform duration-100 hover:scale-105 hover:rounded-lg hover:border hover:border-black"
              />
            ))}
          </div>
        ))}
        </div>
      </div>
    </section>
  );
};

export default LocationGallery;
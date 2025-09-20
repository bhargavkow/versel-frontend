import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PhotoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'https://stylehub-backend-nu.vercel.app';

  // Fetch carousel images from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/photo-carousel/active`);
        if (response.data.success && response.data.data.length > 0) {
          // Process images to ensure they have full URLs
          const processedImages = response.data.data.map(item => {
            if (item.image && !item.image.startsWith('http')) {
              return {
                ...item,
                imageUrl: `${API_URL}${item.image}`
              };
            }
            return {
              ...item,
              imageUrl: item.image
            };
          });
          setImages(processedImages);
        } else {
          // Fallback to sample images if no data
          setImages([
            {
              _id: '1',
              title: 'Sample Image 1',
              imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
              altText: 'Sample image 1'
            },
            {
              _id: '2',
              title: 'Sample Image 2',
              imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
              altText: 'Sample image 2'
            },
            {
              _id: '3',
              title: 'Sample Image 3',
              imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
              altText: 'Sample image 3'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching carousel images:', error);
        setError('Failed to load carousel images');
        // Fallback to sample images
        setImages([
          {
            _id: '1',
            title: 'Sample Image 1',
            imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
            altText: 'Sample image 1'
          },
          {
            _id: '2',
            title: 'Sample Image 2',
            imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
            altText: 'Sample image 2'
          },
          {
            _id: '3',
            title: 'Sample Image 3',
            imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
            altText: 'Sample image 3'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [API_URL]);

  // Auto-play functionality
  useEffect(() => {
    if (images.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Helper function to get previous, current, and next indices
  const getSlideIndices = () => {
    const prev = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    const next = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    return { prev, current: currentIndex, next };
  };

  const { prev, current, next } = getSlideIndices();

  if (loading) {
    return (
      <section className="relative py-20 px-8 my-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <div className="relative max-w-md mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading photo gallery...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && images.length === 0) {
    return (
      <section className="relative py-20 px-8 my-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-600">Please try again later</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 px-8 my-20 overflow-hidden">
      {/* Enhanced Background with animated elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#93C5FD] via-white to-[#3B82F6] mx-auto my-auto max-w-7xl p-8 rounded-3xl shadow-lg"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#1E40AF]/20 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-[#3B82F6]/20 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-[#93C5FD]/20 rounded-full opacity-25 animate-ping"></div>
        <div className="absolute bottom-32 right-1/3 w-14 h-14 bg-[#1E40AF]/20 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-[#3B82F6]/20 rounded-full opacity-35 animate-bounce"></div>
        <div className="absolute top-1/3 right-1/4 w-10 h-10 bg-[#93C5FD]/20 rounded-full opacity-30 animate-pulse"></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-[#1E40AF] via-[#3B82F6] to-[#1E40AF] bg-clip-text text-transparent mb-4">
            Photo Gallery
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] mx-auto rounded-full"></div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Main Carousel with Side Images */}
          <div className="relative overflow-hidden rounded-3xl">
            <div className="flex items-center justify-center gap-4">
              {/* Previous Image (Half Width) */}
              <div className="w-1/4 opacity-50 transition-all duration-500 hover:opacity-70">
                <div className="relative group">
                  <img
                    className="w-full h-80 object-fit rounded-2xl transition-all duration-500 group-hover:scale-105"
                    src={images[prev]?.imageUrl}
                    alt={images[prev]?.altText || images[prev]?.title || 'Previous image'}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </div>
              </div>

              {/* Current Image (Full Width) */}
              <div className="w-1/2 opacity-100 transition-all duration-500">
                <div className="relative group">
                  <img
                    className="w-full h-96 object-fit rounded-2xl transition-all duration-500 group-hover:scale-105 shadow-2xl"
                    src={images[current]?.imageUrl}
                    alt={images[current]?.altText || images[current]?.title || `Current image ${current + 1}`}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  {images[current]?.title && (
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                      <h3 className="text-black text-xl font-semibold bg-white/50 px-3 py-2 rounded-lg text-center">
                        {images[current].title}
                      </h3>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Image (Half Width) */}
              <div className="w-1/4 opacity-50 transition-all duration-500 hover:opacity-70">
                <div className="relative group">
                  <img
                    className="w-full h-80 object-fit rounded-2xl transition-all duration-500 group-hover:scale-105"
                    src={images[next]?.imageUrl}
                    alt={images[next]?.altText || images[next]?.title || 'Next image'}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 -translate-y-1/2 left-4 z-10 w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:bg-white"
          >
            <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute top-1/2 -translate-y-1/2 right-4 z-10 w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:bg-white"
          >
            <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Navigation */}
          <div className="flex justify-center mt-8 space-x-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-gray-600 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhotoCarousel;

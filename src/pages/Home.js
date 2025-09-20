import React, { useState, useEffect } from "react";
import axios from "axios";
import LocationGallery from "../components/LocationGallery";
import PhotoCarousel from "../components/PhotoCarousel";
import { getFAQs } from "../services/faqService";




import rental_img from "../imges/rental_img.png";
import rental_img2 from "../imges/rental_img2.png";
import helpimg from "../imges/helpimg.jpg"
import contactimg from "../imges/contactimg.jpg"
import plan from '../imges/3hr_delivery_icon.png';
import easy_return from '../imges/easy_return_icon.png';
import cod from '../imges/money.png';
import free_trail from '../imges/free_trial_icon.png';
import qc from '../imges/QC_icon.png';
import shipping from '../imges/shipping_both_ways_icon.png';


import men_categories from '../imges/men_categories.png';
import women_categories from '../imges/women_categories.png';
import children_categories from '../imges/children_categories.png';
import trending_categories from '../imges/trending_categories.png';
import offer_categories from '../imges/offer_categories.png';
import sale_categories from '../imges/sale_categories.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import About_us from "./About_us"


function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselImages, setCarouselImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [faqsData, setFaqsData] = useState([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [faqsError, setFaqsError] = useState(null);

  // Define API URL
  const API_URL = process.env.REACT_APP_API_URL || 'https://stylehub-backend-nu.vercel.app';

  // Fetch carousel images from API
  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/carousels/active`);
        if (response.data && response.data.success && response.data.data.length > 0) {
          console.log('Carousel data:', response.data.data);

          // Process images to ensure they have full URLs
          const images = response.data.data.map(item => {
            if (item.image && !item.image.startsWith('http')) {
              return `${API_URL}${item.image}`;
            }
            return item.image;
          });

          setCarouselImages(images);
        }
      } catch (error) {
        console.error('Error fetching carousel images:', error);
      }
    };

    fetchCarouselImages();
  }, [API_URL]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/homepage-categories`);
        if (response.data && response.data.success && response.data.data.length > 0) {
          console.log('Homepage Categories:', response.data.data);

          // Process categories to ensure they have full URLs and correct field names
          const processedCategories = response.data.data.map(category => {
            console.log('Homepage Category:', category);
            return {
              ...category,
              category_name: category.name, // Map 'name' to 'category_name' for compatibility
              imageUrl: category.image && !category.image.startsWith('http')
                ? `${API_URL}${category.image}`
                : category.image
            };
          });

          setCategories(processedCategories);
        }
      } catch (error) {
        console.error('Error fetching homepage categories:', error);
      }
    };

    fetchCategories();
  }, [API_URL]);

  // Fetch FAQs from API
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setFaqsLoading(true);
        setFaqsError(null);
        const faqs = await getFAQs();
        console.log('FAQs data:', faqs);
        setFaqsData(faqs);
        setFaqsLoading(false);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setFaqsError('Failed to load FAQs');
        setFaqsLoading(false);
        
        // Fallback to static FAQs if API fails
        setFaqsData([]);
      }
    };

    fetchFAQs();
  }, []);

  useEffect(() => {
    if (carouselImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);



  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#E8F4FD]">
      <Navbar />

      {/* Carousel Section */}
      <div className="relative w-full -mt-[80px] overflow-hidden h-screen shadow-strong">
        <button
          className="carousel-control-arrow carousel-control-prev text-white border-none text-3xl cursor-pointer z-10"
          onClick={prevSlide}
        >
          &#10094;
        </button>
        {carouselImages.length > 0 ? (
          <img
            src={carouselImages[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            className="w-full h-[100vh] object-cover transition-opacity duration-500"
          />
        ) : (
          <div className="w-full h-[90vh] bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Loading carousel images...</p>
          </div>
        )}
        <button
          className="carousel-control-arrow carousel-control-next text-white border-none text-3xl cursor-pointer z-10"
          onClick={nextSlide}
        >
          &#10095;
        </button>

        <div className="carousel-dots">
          {carouselImages.length > 0 && carouselImages.map((_, index) => (
            <span
              key={index}
              className={`carousel-dot ${index === currentIndex ? "selected" : ""}`}
              onClick={() => setCurrentIndex(index)}
            ></span>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-gradient-to-br from-[#93C5FD] via-white to-[#3B82F6] mx-auto my-16 max-w-7xl p-8 rounded-3xl shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div className="flex flex-col items-center text-center hover-lift">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-2xl flex items-center justify-center mb-4 shadow-medium">
              <img src={plan} alt="Plan" className="w-12 h-12 filter brightness-0 invert" />
            </div>
            <p className="text-sm font-semibold text-[#1E40AF]">All India Delivery</p>
          </div>
          <div className="flex flex-col items-center text-center hover-lift">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-2xl flex items-center justify-center mb-4 shadow-medium">
              <img src={easy_return} alt="Easy Return" className="w-12 h-12 filter brightness-0 invert" />
            </div>
            <p className="text-sm font-semibold text-[#1E40AF]">Quality Check</p>
          </div>
          <div className="flex flex-col items-center text-center hover-lift">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-2xl flex items-center justify-center mb-4 shadow-medium">
              <img src={cod} alt="COD" className="w-12 h-12 filter brightness-0 invert" />
            </div>
            <p className="text-sm font-semibold text-[#1E40AF]">COD (Advance)</p>
          </div>
          <div className="flex flex-col items-center text-center hover-lift">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-2xl flex items-center justify-center mb-4 shadow-medium">
              <img src={qc} alt="Quality Check" className="w-12 h-12 filter brightness-0 invert" />
            </div>
            <p className="text-sm font-semibold text-[#1E40AF]">Certified</p>
          </div>
          <div className="flex flex-col items-center text-center hover-lift">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-2xl flex items-center justify-center mb-4 shadow-medium">
              <img src={free_trail} alt="Free Trial" className="w-12 h-12 filter brightness-0 invert" />
            </div>
            <p className="text-sm font-semibold text-[#1E40AF]">Free Trial</p>
          </div>
          <div className="flex flex-col items-center text-center hover-lift">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-2xl flex items-center justify-center mb-4 shadow-medium">
              <img src={shipping} alt="Shipping" className="w-12 h-12 filter brightness-0 invert" />
            </div>
            <p className="text-sm font-semibold text-[#1E40AF]">Shipping</p>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gradient-to-br from-[#93C5FD] via-white to-[#3B82F6] mb-16 p-8 rounded-3xl mx-auto max-w-7xl shadow-lg">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-[#1E40AF] via-[#3B82F6] to-[#1E40AF] bg-clip-text text-transparent my-8 font-serif animate-fade-in">CATEGORIES</h1>
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8 justify-items-center">
          {categories.length > 0 ? (
            categories.map((category, index) => {
              // Define category text based on position
              const categoryTexts = ['MEN', 'WOMEN', 'CHILDREN', 'TRENDING', 'OFFER', 'SALE'];
              const hoverText = categoryTexts[index] || category.category_name;
              
              // Use linkTo if available, otherwise fall back to category ID
              const categoryLink = category.linkTo || `/category/${category._id}`;
              console.log(`Category ${index} (${hoverText}):`, {
                categoryId: category._id,
                linkTo: category.linkTo,
                finalLink: categoryLink
              });
              
              return (
                <a href={categoryLink} className="group" key={category._id}>
                  <div className="card w-96 h-96 overflow-hidden hover-lift relative">
                    <img
                      src={category.imageUrl}
                      alt={category.category_name}
                      className="w-full h-full object-fit transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
                    />
                    {/* Dynamic category text overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                        <h2 className="text-white text-4xl font-bold">{hoverText}</h2>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })
          ) : (
            <div className="text-center py-16">
              <div className="card-glass p-8">
                <p className="text-xl text-neutral-600">No categories available. Please check back later.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Query Section */}
      <div className="bg-gradient-to-br from-[#93C5FD] via-white to-[#3B82F6] mb-16 p-8 rounded-3xl mx-auto max-w-7xl shadow-lg">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-[#1E40AF] via-[#3B82F6] to-[#1E40AF] bg-clip-text text-transparent my-8 font-serif animate-fade-in">QUERY</h1>
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 px-8 justify-items-center">
          <a href="/Help" className="group">
            <div className="card w-110 h-96 overflow-hidden hover-lift relative">
              <img
                src={helpimg}
                alt="Help"
                className="w-full h-full object-fit transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
              />
              {/* Dynamic category text overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                  <h2 className="text-white text-4xl font-bold">HELP</h2>
                </div>
              </div>
            </div>
          </a>
          <a href="/ContactUs" className="group">
            <div className="card w-110 h-96 overflow-hidden hover-lift relative">
              <img
                src={contactimg}
                alt="Contact Us"
                className="w-full h-full object-fit transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
              />
              {/* Dynamic category text overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                  <h2 className="text-white text-4xl font-bold">CONTACT</h2>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Location Gallery Section */}
      

      {/* Photo Carousel Section */}
      <PhotoCarousel />

      {/* FAQ Section */}
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
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] mx-auto rounded-full"></div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqsLoading ? (
              <div className="text-center py-16">
                <div className="inline-block">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-gray-600 text-xl font-medium">Loading FAQs...</p>
                </div>
              </div>
            ) : faqsError ? (
              <div className="text-center py-16">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-red-200 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                  </div>
                  <p className="text-red-600 mb-2 text-lg font-semibold">{faqsError}</p>
                  <p className="text-gray-600">Please try again later</p>
                </div>
              </div>
            ) : faqsData.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-question-circle text-gray-500 text-2xl"></i>
                  </div>
                  <p className="text-gray-600 text-lg">No FAQs available at the moment.</p>
                </div>
              </div>
            ) : (
              faqsData.map((faq, index) => (
                <div key={faq._id || index} className="group">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[#93C5FD] overflow-hidden">
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full text-left p-6 hover:bg-gradient-to-r hover:from-[#E8F4FD] hover:to-[#93C5FD]/20 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#3B82F6]"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {index + 1}
                          </div>
                          <h3 className="text-xl font-semibold text-[#1E40AF] group-hover:text-[#3B82F6] transition-colors duration-300 pr-4">
                            {faq.question}
                          </h3>
                        </div>
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-full flex items-center justify-center transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''}`}>
                            <i className="fas fa-chevron-down text-white text-sm"></i>
                          </div>
                        </div>
                      </div>
                    </button>
                    {activeIndex === index && (
                      <div className="px-6 pb-6 animate-slide-down">
                        <div className="border-t border-[#93C5FD] pt-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-full mt-3 flex-shrink-0"></div>
                            <p className="text-[#1E40AF] leading-relaxed text-base font-medium">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
export default Home;
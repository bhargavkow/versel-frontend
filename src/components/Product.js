import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import Navbar from './Navbar';
import Footer from './Footer';
import DynamicProductDisplay from './DynamicProductDisplay';
import { API_URL } from '../config';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [magnifyPosition, setMagnifyPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => {
      setPopup({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/products/${id}`);
        const productData = response.data.data || response.data;
        
        console.log('=== PRODUCT DEBUG INFO ===');
              console.log('Product data:', productData);
        console.log('Product image field:', productData.image);
        console.log('Product images field:', productData.other_images);
        console.log('Product object keys:', Object.keys(productData));
        console.log('========================');
              
              setProduct(productData);
              setActiveIndex(0);

        // Set default size if available
              if (productData.sizes && productData.sizes.length > 0) {
                setSelectedSize(productData.sizes[0]);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) {
      showPopup('Product not loaded', 'error');
      return;
    }
    
    if (!selectedSize) {
      showPopup('Please select a size', 'error');
      return;
    }
    
    try {
      // Prepare cart item data
      const cartItem = {
        _id: product._id,
        id: product._id,
        productName: product.productName || product.name,
        name: product.productName || product.name,
        price: product.price || product.rental_price || 0,
        rental_price: product.price || product.rental_price || 0,
        image: product.image,
        imageUrl: product.image,
        image_url: product.image,
        selectedSize: selectedSize, // Changed from 'size' to 'selectedSize'
        size: selectedSize, // Keep both for compatibility
        quantity: quantity,
        sizes: product.sizes,
        category: product.category,
        subcategory: product.subcategory,
        description: product.description,
        fabric: product.fabric,
        color: product.color,
        stock: product.stock
      };
      
      console.log('Adding to cart:', cartItem);
      
      // Add to cart using context
      addToCart(cartItem);
      
      showPopup('Added to cart successfully!', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showPopup('Failed to add to cart. Please try again.', 'error');
    }
  };

  const handleBuyNow = () => {
    if (!product) {
      showPopup('Product not loaded', 'error');
      return;
    }
    
    if (!selectedSize) {
      showPopup('Please select a size', 'error');
      return;
    }
    
    try {
      // Prepare order data for direct purchase
      const orderPayload = {
        products: [{
          id: product._id,
          name: product.productName || product.name,
          rental_price: product.price || product.rental_price || 0,
          security_deposit: product.security_deposit || 0,
          selectedSize: selectedSize,
          size: selectedSize,
          quantity: quantity,
          image: product.image,
          category: product.category,
          subcategory: product.subcategory
        }],
        totalPrice: (product.price || product.rental_price || 0) * quantity,
        address: {
          first_name: 'Guest',
          last_name: 'User',
          email: 'guest@example.com',
          phone_number: '0000000000',
          street_address: 'Address',
          city: 'City',
          state: 'State',
          postal_code: '000000',
          country: 'India'
        }
      };
      
      console.log('Buy now order:', orderPayload);
      
      // Navigate to payment page
      navigate('/payment', { state: { orderPayload } });
    } catch (error) {
      console.error('Error with buy now:', error);
      showPopup('Failed to proceed with purchase. Please try again.', 'error');
    }
  };

  const handleAddToFavorites = () => {
    if (!product) {
      showPopup('Product not loaded', 'error');
      return;
    }
    
    try {
      // Add to favorites logic here
      console.log('Adding to favorites:', product._id);
      showPopup('Added to favorites!', 'success');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      showPopup('Failed to add to favorites. Please try again.', 'error');
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMagnifyPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#E8F4FD] to-[#F1F5F9] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#E8F4FD] to-[#F1F5F9] flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#E8F4FD] to-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left Column - Image Gallery */}
            <div className="space-y-6 h-fit">
              {/* Main Image Display */}
              <div className="relative bg-gradient-to-br from-white via-[#F8FAFC] to-[#E8F4FD] rounded-2xl shadow-xl overflow-hidden border border-[#CBD5E1] h-[500px]">
                <div 
                  className="w-full h-full relative cursor-crosshair"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
            {(() => {
                    // Determine which image to show based on activeIndex
                    let imageSrc;
                    if (activeIndex === 0) {
                      imageSrc = product.image; // Main image
                    } else if (product.other_images && product.other_images[activeIndex - 1]) {
                      imageSrc = product.other_images[activeIndex - 1]; // Other image
                } else {
                      imageSrc = product.image; // Fallback to main image
                }
                
                    if (!imageSrc) {
                return (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <div className="text-center text-gray-400">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <p className="text-lg font-medium">No Image Available</p>
                    </div>
                  </div>
                );
              }
              
              // Construct proper image URL
              let imageUrl;
                    if (imageSrc.startsWith('http')) {
                      imageUrl = imageSrc;
                    } else if (imageSrc.startsWith('/uploads/')) {
                      imageUrl = `${API_URL}${imageSrc}`;
                    } else if (imageSrc.startsWith('/')) {
                      imageUrl = `${API_URL}${imageSrc}`;
              } else {
                      imageUrl = `${API_URL}/uploads/products/${imageSrc}`;
              }
              
              return (
                <>
                  <img 
                    src={imageUrl} 
                    alt={product.productName || product.name} 
                    className="w-full h-full object-fit transition-all duration-300"
                    onError={(e) => {
                            console.error('Display image failed to load:', imageUrl);
                            let altUrl;
                            if (imageSrc.startsWith('/uploads/')) {
                              altUrl = `${API_URL}${imageSrc}`;
                            } else if (imageSrc.startsWith('/')) {
                              altUrl = `${API_URL}${imageSrc}`;
                            } else {
                              altUrl = `https://stylehub-backend-nu.vercel.app/uploads/products/${imageSrc}`;
                            }
                      e.target.src = altUrl;
                    }}
                  />
                  
                  {/* Magnifying Glass Overlay */}
                  {showMagnifier && (
                    <div 
                      className="absolute pointer-events-none z-10 w-32 h-32 border-2 border-white rounded-full shadow-lg overflow-hidden"
                      style={{
                        left: `${magnifyPosition.x}%`,
                        top: `${magnifyPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: '400% 400%',
                        backgroundPosition: `${magnifyPosition.x}% ${magnifyPosition.y}%`,
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      <div className="w-full h-full bg-white/20"></div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
                
                {/* Image Navigation Arrows */}
                {(product.other_images && product.other_images.length > 0) && (
                  <>
                    <button 
                      onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                      disabled={activeIndex === 0}
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setActiveIndex(Math.min((product.other_images?.length || 0), activeIndex + 1))}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                      disabled={activeIndex === (product.other_images?.length || 0)}
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="flex space-x-4 overflow-x-auto pb-2 h-24">
                {/* Main Image Thumbnail */}
                {(() => {
                  const imageSrc = product.image;
                  if (!imageSrc) return null;
                  
                  let imageUrl;
                  if (imageSrc.startsWith('http')) {
                    imageUrl = imageSrc;
                  } else if (imageSrc.startsWith('/uploads/')) {
                      imageUrl = `${API_URL}${imageSrc}`;
                  } else if (imageSrc.startsWith('/')) {
                      imageUrl = `${API_URL}${imageSrc}`;
                  } else {
                    imageUrl = `https://stylehub-backend-nu.vercel.app/uploads/products/${imageSrc}`;
                  }
                  
                  return (
                    <button
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        activeIndex === 0 
                          ? 'border-[#3B82F6] ring-2 ring-[#E8F4FD]' 
                          : 'border-[#CBD5E1] hover:border-[#94A3B8]'
                      }`}
                      onClick={() => setActiveIndex(0)}
                    >
                      <img 
                        src={imageUrl} 
                        alt={`${product.productName || product.name}`} 
                        className="w-full h-full object-fit"
                        onError={(e) => {
                          let altUrl;
                          if (imageSrc.startsWith('/uploads/')) {
                            altUrl = `${API_URL}${imageSrc}`;
                          } else if (imageSrc.startsWith('/')) {
                            altUrl = `${API_URL}${imageSrc}`;
                          } else {
                            altUrl = `https://stylehub-backend-nu.vercel.app/uploads/products/${imageSrc}`;
                          }
                          e.target.src = altUrl;
                        }}
                      />
                    </button>
                  );
                })()}
                
                {/* Other Images Thumbnails */}
                {product.other_images && product.other_images.map((imageSrc, index) => {
                  let imageUrl;
                  if (imageSrc.startsWith('http')) {
                    imageUrl = imageSrc;
                  } else if (imageSrc.startsWith('/uploads/')) {
                      imageUrl = `${API_URL}${imageSrc}`;
                  } else if (imageSrc.startsWith('/')) {
                      imageUrl = `${API_URL}${imageSrc}`;
                  } else {
                    imageUrl = `https://stylehub-backend-nu.vercel.app/uploads/products/${imageSrc}`;
                  }
                  
                  return (
                    <button
                      key={index}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        activeIndex === index + 1 
                          ? 'border-[#3B82F6] ring-2 ring-[#E8F4FD]' 
                          : 'border-[#CBD5E1] hover:border-[#94A3B8]'
                      }`}
                      onClick={() => setActiveIndex(index + 1)}
                    >
                      <img 
                        src={imageUrl} 
                        alt={`${product.productName || product.name} ${index + 1}`} 
                        className="w-full h-full object-fit"
                        onError={(e) => {
                          let altUrl;
                          if (imageSrc.startsWith('/uploads/')) {
                            altUrl = `${API_URL}${imageSrc}`;
                          } else if (imageSrc.startsWith('/')) {
                            altUrl = `${API_URL}${imageSrc}`;
                          } else {
                            altUrl = `https://stylehub-backend-nu.vercel.app/uploads/products/${imageSrc}`;
                          }
                          e.target.src = altUrl;
                        }}
                      />
                    </button>
                  );
                })}
              </div>
              
              {/* Product Information */}
              <div className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#E8F4FD] rounded-xl p-6 shadow-lg border border-[#CBD5E1] h-fit">
                <h3 className="text-lg font-semibold text-[#475569] mb-4">Product Information</h3>
                <div className="space-y-3 text-sm text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#3B82F6] rounded-full"></div>
                    <p>Free shipping on orders over ₹500</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#3B82F6] rounded-full"></div>
                    <p>30-day return policy</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#3B82F6] rounded-full"></div>
                    <p>Secure payment processing</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#3B82F6] rounded-full"></div>
                    <p>Customer support available 24/7</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Product Details */}
            <div className="space-y-6 h-fit">
          {/* Product Header */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-medium text-[#475569] bg-gradient-to-r from-[#F8FAFC] to-[#E8F4FD] px-4 py-2 rounded-full border border-[#CBD5E1]">
                    {product.category?.categoryName || 'Category'}
                  </span>
                  <span className="text-sm text-[#64748B]">
                    {product.subcategory?.subcategoryName || 'Subcategory'}
                  </span>
                </div>
                
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#475569] via-[#3B82F6] to-[#475569] bg-clip-text text-transparent mb-3">
              {product.brand || product.manufacturer_name || 'Brand'}
            </h1>
                
                <h2 className="text-2xl font-semibold text-[#475569] mb-4">
              {product.productName || product.name || 'Product Name'}
            </h2>

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-bold text-[#3B82F6]">
                    ₹{product.price || 0}
                  </span>  
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#E8F4FD] rounded-xl p-6 shadow-lg border border-[#CBD5E1] h-fit">
                <h3 className="text-lg font-semibold text-[#475569] mb-4">Product Details</h3>
              <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Description:</span>
                    <span className="text-[#475569] font-medium">{product.description || 'No description available'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Color:</span>
                  <div className="flex items-center gap-2">
                    <div 
                        className="w-4 h-4 rounded-full border border-[#CBD5E1]"
                        style={{ backgroundColor: product.color?.toLowerCase() || '#000' }}
                    ></div>
                      <span className="text-[#475569] font-medium">{product.color || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Fabric:</span>
                    <span className="text-[#475569] font-medium">{product.fabric || 'N/A'}</span>
                </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Stock:</span>
                    <span className="text-[#475569] font-medium">{product.stock || 0} available</span>
                  </div>
                </div>
              </div>

              {/* Size Selection */}
              <div className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#E8F4FD] rounded-xl p-6 shadow-lg border border-[#CBD5E1] h-fit">
                <h3 className="text-lg font-semibold text-[#475569] mb-4">Select Size</h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  {product.sizes && product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                        selectedSize === size
                          ? 'border-[#3B82F6] bg-[#E8F4FD] text-[#3B82F6]'
                          : 'border-[#CBD5E1] hover:border-[#94A3B8] text-[#475569]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <p className="text-sm text-[#3B82F6] font-medium">
                    ✓ Selected: {selectedSize}
                  </p>
                )}
          </div>

              {/* Quantity Selection */}
              <div className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#E8F4FD] rounded-xl p-6 shadow-lg border border-[#CBD5E1] h-fit">
                <h3 className="text-lg font-semibold text-[#475569] mb-4">Quantity</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-[#CBD5E1] flex items-center justify-center hover:bg-[#F8FAFC] transition-colors"
                  >
                    <svg className="w-4 h-4 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-xl font-semibold text-[#475569] min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-[#CBD5E1] flex items-center justify-center hover:bg-[#F8FAFC] transition-colors"
                  >
                    <svg className="w-4 h-4 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
          </div>
          </div>

          {/* Action Buttons */}
              <div className="space-y-3">
            <button 
              onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] hover:from-[#1E3A8A] hover:to-[#2563EB] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                Add to Cart
              </div>
            </button>
                
            <button
                  onClick={handleAddToFavorites}
                  className="w-full bg-gradient-to-r from-[#F8FAFC] to-[#E8F4FD] hover:from-[#F1F5F9] hover:to-[#DBEAFE] text-[#475569] font-semibold py-4 px-6 rounded-xl transition-all duration-200 border border-[#CBD5E1] hover:border-[#94A3B8]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Add to Favorites
                  </div>
            </button>
            </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {/* <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">You Might Also Like</h2>
              <p className="text-gray-600">Discover more products in this category</p>
          </div>
            <DynamicProductDisplay 
              categoryId={product.category?._id || product.category}
              limit={4}
              excludeProductId={product._id}
            />
        </div>
      </section> */}
      </main>
      
      <Footer />

      {/* Popup Component */}
      {popup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`bg-white rounded-xl p-6 shadow-2xl max-w-md mx-4 transform transition-all duration-300 ${
            popup.type === 'success' 
              ? 'border-l-4 border-green-500' 
              : 'border-l-4 border-red-500'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                popup.type === 'success' 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                {popup.type === 'success' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${
                  popup.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {popup.type === 'success' ? 'Success!' : 'Error!'}
                </h3>
                <p className={`text-sm ${
                  popup.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {popup.message}
                </p>
              </div>
              <button
                onClick={() => setPopup({ show: false, message: '', type: 'success' })}
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                  popup.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Product;
import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

const SearchResults = () => {
  const query = new URLSearchParams(useLocation().search).get("q")?.toLowerCase();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API URLs to try
  const API_URLS = [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://192.168.1.11:5000'
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try different API URLs
        for (const url of API_URLS) {
          try {
            const response = await axios.get(`${url}/api/products?isActive=true`);
            
            console.log('Search products response:', response.data);
            
            // Handle different response structures
            const productsData = response.data.success ? response.data.data : response.data;
            
            if (Array.isArray(productsData)) {
              setProducts(productsData);
              setLoading(false);
              return; // Success, exit the loop
            }
            
          } catch (err) {
            console.error(`Error with API URL ${url}:`, err);
            continue; // Try next URL
          }
        }
        
        // If all URLs failed
        setError('Failed to load products from all API endpoints');
        setLoading(false);
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    (p.productName || p.name || "").toLowerCase().includes(query || "")
  );

  const getPrice = (product) => {
    return (
      product.price ||
      product.rental_price ||
      product.rentalPrice ||
      0
    );
  };

  const getImage = (product) => {
    // Handle single image field
    const imageSrc = product.image;
    if (!imageSrc) return "";
    
    // Construct proper image URL - backend serves static files from /uploads route
    if (imageSrc.startsWith('http')) {
      return imageSrc; // Full URL
    } else if (imageSrc.startsWith('/uploads/')) {
      return `http://localhost:5000${imageSrc}`; // Backend serves from /uploads route
    } else if (imageSrc.startsWith('/')) {
      return `http://localhost:5000${imageSrc}`; // Other relative paths
    } else {
      return `http://localhost:5000/uploads/products/${imageSrc}`; // Just filename
    }
  };

  const getName = (product) => {
    return product.productName || product.name || "";
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Products</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Search Results for "{query}"</h2>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/Product/${product._id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-medium transition-all duration-300 hover:scale-105">
                    <img 
                      src={getImage(product)} 
                      alt={getName(product)} 
                      className="w-full h-64 object-fit group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        console.error('Search result image failed to load:', e.target.src);
                        // Try alternative URL formats
                        const originalSrc = product.image;
                        if (originalSrc) {
                          let altUrl;
                          if (originalSrc.startsWith('/uploads/')) {
                            altUrl = `http://localhost:5000${originalSrc}`;
                          } else if (originalSrc.startsWith('/')) {
                            altUrl = `http://localhost:5000${originalSrc}`;
                          } else {
                            altUrl = `http://localhost:5000/uploads/products/${originalSrc}`;
                          }
                          console.log('Trying alternative search result image URL:', altUrl);
                          e.target.src = altUrl;
                        } else {
                          e.target.src = '/images/placeholder.jpg';
                        }
                      }}
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{getName(product)}</h3>
                      <p className="text-xl font-bold text-green-600">₹{getPrice(product)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">No products found.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SearchResults;

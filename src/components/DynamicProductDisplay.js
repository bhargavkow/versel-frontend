import React, { useState, useEffect, useContext } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from './Navbar';
import Footer from './Footer';
import { FavoritesContext } from "../context/FavoritesContext";
import { API_URL } from "../config";

const PRICE_RANGES = [
  { label: "Under ₹500", value: "under500", min: 0, max: 500 },
  { label: "₹500 - ₹1000", value: "500to1000", min: 500, max: 1000 },
  { label: "₹1000 - ₹2000", value: "1000to2000", min: 1000, max: 2000 },
  { label: "Above ₹2000", value: "above2000", min: 2000, max: Infinity },
];

const DynamicProductDisplay = () => {
  const { categoryId, subcategoryId } = useParams();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    brand: [],
    color: [],
    size: [],
    fabric: [],
    price: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);

  // API URLs to try
  const API_URLS = [
    API_URL,
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://192.168.1.11:5000'
  ];

  // Determine what type of filtering to apply based on the current route
  const getFilterType = () => {
    const pathname = location.pathname;
    
    if (subcategoryId) {
      return { type: 'subcategory', id: subcategoryId };
    } else if (categoryId) {
      return { type: 'category', id: categoryId };
    } else {
      return { type: 'all' };
    }
  };

  // Fetch products based on category/subcategory
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        let productsData = [];
        const filterType = getFilterType();
        
        // Try different API URLs
        for (const url of API_URLS) {
          try {
            let response;
            let apiUrl = `${url}/api/products?isActive=true`;
            
            // Build the API URL based on filter type
            if (filterType.type === 'subcategory') {
              apiUrl += `&subcategory=${filterType.id}`;
            } else if (filterType.type === 'category') {
              apiUrl += `&category=${filterType.id}`;
            }
            
            response = await axios.get(apiUrl);
            
            console.log('Products response:', response.data);
            console.log('Filter type:', filterType);
            console.log('API URL:', apiUrl);
            
            // Handle different response structures
            productsData = response.data.success ? response.data.data : response.data;
            
            if (Array.isArray(productsData)) {
              setProducts(productsData);
              setFilteredProducts(productsData);
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
  }, [categoryId, subcategoryId, location.pathname]);

  // Get page title based on current route
  const getPageTitle = () => {
    const filterType = getFilterType();
    
    if (filterType.type === 'subcategory') {
      return 'Subcategory Products';
    } else if (filterType.type === 'category') {
      return 'Category Products';
    } else {
      return 'All Products';
    }
  };

  // Get unique filter options from products
  const getUniqueOptions = (key) => {
    if (key === 'size') {
      // Handle sizes array - flatten all sizes from all products
      const allSizes = products.flatMap(product => product.sizes || (product.size ? [product.size] : []));
      return [...new Set(allSizes)].sort();
    }
    const values = products.map(product => product[key]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  const allBrands = getUniqueOptions("brand");
  const allColors = getUniqueOptions("color");
  const allSizes = getUniqueOptions("size");
  const allFabrics = getUniqueOptions("fabric");

  // Apply filters to products
  useEffect(() => {
    let newFilteredProducts = products;
    
    Object.keys(activeFilters).forEach((filterType) => {
      if (activeFilters[filterType].length > 0) {
        if (filterType === "price") {
          newFilteredProducts = newFilteredProducts.filter((p) =>
            activeFilters.price.some((priceKey) => {
              const range = PRICE_RANGES.find((r) => r.value === priceKey);
              return p.price >= range.min && p.price < range.max;
            })
          );
        } else if (filterType === "size") {
          // Handle sizes array filtering
          newFilteredProducts = newFilteredProducts.filter((p) => {
            const productSizes = p.sizes || (p.size ? [p.size] : []);
            return activeFilters.size.some(selectedSize => 
              productSizes.includes(selectedSize)
            );
          });
        } else {
          newFilteredProducts = newFilteredProducts.filter((p) =>
            activeFilters[filterType].includes(p[filterType])
          );
        }
      }
    });
    
    setFilteredProducts(newFilteredProducts);
    setCurrentPage(1); // Reset to first page when filters change
  }, [activeFilters, products]);

  const handleFilterChange = (filterType, value) => {
    setActiveFilters((prev) => {
      const isSelected = prev[filterType].includes(value);
      if (isSelected) {
        return { ...prev, [filterType]: prev[filterType].filter((item) => item !== value) };
      } else {
        return { ...prev, [filterType]: [...prev[filterType], value] };
      }
    });
  };

  const handleClearFilters = () => {
    setActiveFilters({ brand: [], color: [], size: [], fabric: [], price: [] });
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Filter Section Component
  const FilterSection = ({ title, options, filterType }) => (
    <div className="mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">{title}</h3>
      <div className="space-y-1 sm:space-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-2 cursor-pointer hover:text-orange-500 transition-colors duration-200">
            <input
              type="checkbox"
              checked={activeFilters[filterType].includes(option)}
              onChange={() => handleFilterChange(filterType, option)}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-xs sm:text-sm text-gray-700">{option.charAt(0).toUpperCase() + option.slice(1)}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // Price Filter Section Component
  const PriceFilterSection = () => (
    <div className="mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">Price</h3>
      <div className="space-y-1 sm:space-y-2">
        {PRICE_RANGES.map((range) => (
          <label key={range.value} className="flex items-center space-x-2 cursor-pointer hover:text-orange-500 transition-colors duration-200">
            <input
              type="checkbox"
              checked={activeFilters.price.includes(range.value)}
              onChange={() => handleFilterChange("price", range.value)}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-xs sm:text-sm text-gray-700">{range.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // Product Card Component
  const ProductCard = ({ product }) => {
    const liked = isFavorite(product._id);

    return (
      <Link to={`/Product/${product._id}`} className="block group">
        <div className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-medium transition-all duration-300 hover:scale-105">
          <div className="relative">
            <div
              className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(product);
              }}
            >
              <svg
                width="20px"
                height="20px"
                viewBox="0 0 24 24"
                fill={liked ? "red" : "none"}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
                  stroke={liked ? "red" : "#000000"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <img 
              src={(() => {
                // Handle single image field
                const imageSrc = product.image;
                if (!imageSrc) return '/images/placeholder.jpg';
                
                // Construct proper image URL - backend serves static files from /uploads route
                if (imageSrc.startsWith('http')) {
                  return imageSrc; // Full URL
                } else if (imageSrc.startsWith('/uploads/')) {
                  return `${API_URL}${imageSrc}`; // Backend serves from /uploads route
                } else if (imageSrc.startsWith('/')) {
                  return `${API_URL}${imageSrc}`; // Other relative paths
                } else {
                  return `${API_URL}/uploads/products/${imageSrc}`; // Just filename
                }
              })()} 
              alt={product.productName} 
              className="w-full h-48 sm:h-56 lg:h-64 object-fit group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                console.error('Product image failed to load:', e.target.src);
                // Try alternative URL formats
                const originalSrc = product.image;
                if (originalSrc) {
                  let altUrl;
                  if (originalSrc.startsWith('/uploads/')) {
                    altUrl = `${API_URL}${originalSrc}`;
                  } else if (originalSrc.startsWith('/')) {
                    altUrl = `${API_URL}${originalSrc}`;
                  } else {
                    altUrl = `${API_URL}/uploads/products/${originalSrc}`;
                  }
                  console.log('Trying alternative product image URL:', altUrl);
                  e.target.src = altUrl;
                } else {
                  e.target.src = '/images/placeholder.jpg';
                }
              }}
            />
          </div>
          <div className="p-3 sm:p-4">
            <h2 className="text-xs sm:text-sm font-semibold text-blue-600 mb-1">{product.brand}</h2>
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 mb-2 line-clamp-2">{product.productName}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-green-600">₹{product.price}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                product.stock > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#E8F4FD] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#E8F4FD] flex items-center justify-center">
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
      <div className="min-h-screen bg-[#E8F4FD]">
        <header className="py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#1E40AF] via-[#3B82F6] to-[#1E40AF] bg-clip-text text-transparent mb-4">
              {getPageTitle()}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-4">
              {filteredProducts.length} products found
            </p>
            <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] mx-auto rounded-full"></div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full bg-white rounded-lg shadow-soft p-4 flex items-center justify-between hover:shadow-medium transition-all duration-300"
            >
              <span className="text-lg font-semibold text-gray-800">Filters</span>
              <i className={`fas fa-chevron-${showFilters ? 'up' : 'down'} text-gray-600`}></i>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* Sidebar Filters */}
            <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 bg-white rounded-lg shadow-soft p-4 sm:p-6 h-fit`}>
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Filters</h2>
                <button 
                  onClick={handleClearFilters} 
                  className="text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors duration-200"
                >
                  Clear All
                </button>
              </div>
              
              {allBrands.length > 0 && (
                <FilterSection title="Brand" options={allBrands} filterType="brand" />
              )}
              {allColors.length > 0 && (
                <FilterSection title="Color" options={allColors} filterType="color" />
              )}
              {allSizes.length > 0 && (
                <FilterSection title="Size" options={allSizes} filterType="size" />
              )}
              {allFabrics.length > 0 && (
                <FilterSection title="Fabric" options={allFabrics} filterType="fabric" />
              )}
              <PriceFilterSection />
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {currentProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {currentProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-gray-400 text-4xl sm:text-6xl mb-4">🔍</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                  <p className="text-sm sm:text-base text-gray-600">Try adjusting your filters or check back later.</p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-8 sm:mt-12">
              <button 
                onClick={prevPage} 
                disabled={currentPage === 1} 
                className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                « Prev
              </button>
              
              {/* Mobile: Show limited page numbers */}
              <div className="flex items-center gap-1 sm:gap-2">
                {totalPages <= 7 ? (
                  // Show all pages if 7 or fewer
                  Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                      className={`px-2 sm:px-3 py-2 text-sm sm:text-base rounded-lg transition-colors duration-200 ${
                    currentPage === i + 1 
                      ? "bg-orange-500 text-white" 
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
                  ))
                ) : (
                  // Show limited pages for mobile
                  <>
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => paginate(1)}
                          className="px-2 sm:px-3 py-2 text-sm sm:text-base bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          1
                        </button>
                        {currentPage > 4 && <span className="text-gray-500">...</span>}
                      </>
                    )}
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`px-2 sm:px-3 py-2 text-sm sm:text-base rounded-lg transition-colors duration-200 ${
                            currentPage === pageNum 
                              ? "bg-orange-500 text-white" 
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && <span className="text-gray-500">...</span>}
                        <button
                          onClick={() => paginate(totalPages)}
                          className="px-2 sm:px-3 py-2 text-sm sm:text-base bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
              
              <button 
                onClick={nextPage} 
                disabled={currentPage === totalPages} 
                className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next »
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DynamicProductDisplay;

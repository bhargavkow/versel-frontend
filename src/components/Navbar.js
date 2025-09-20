import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FavoritesContext } from "../context/FavoritesContext";
import axios from "axios";
import { API_URL } from "../config";

const Navbar = () => {
  const { favorites } = useContext(FavoritesContext);
  const [query, setQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState({});

  const navigate = useNavigate();

  // API URLs to try
    const API_URLS = [
        API_URL,
        'https://stylehub-backend-nu.vercel.app',
        'http://127.0.0.1:5000',
    'http://192.168.1.11:5000'
  ];

  // Fetch categories and subcategories
  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        setLoading(true);

        // Try different API URLs
        for (const url of API_URLS) {
          try {
            const [categoriesRes, subcategoriesRes] = await Promise.all([
              axios.get(`${url}/api/categories/active/list`),
              axios.get(`${url}/api/subcategories`)
            ]);

            // Handle response structure
            const categoriesData = categoriesRes.data.success ? categoriesRes.data.data : categoriesRes.data;
            const subcategoriesData = subcategoriesRes.data.success ? subcategoriesRes.data.data : subcategoriesRes.data;

            // Filter active categories and limit to 4
            const activeCategories = Array.isArray(categoriesData)
              ? categoriesData.filter(cat => cat.isActive).slice(0, 4)
              : [];

            // Group subcategories by category
            const subcategoriesByCategory = {};
            if (Array.isArray(subcategoriesData)) {
              subcategoriesData.forEach(sub => {
                if (sub.isActive && sub.category) {
                  const categoryId = sub.category._id || sub.category;
                  if (!subcategoriesByCategory[categoryId]) {
                    subcategoriesByCategory[categoryId] = [];
                  }
                  subcategoriesByCategory[categoryId].push(sub);
                }
              });
            }

            setCategories(activeCategories);
            setSubcategories(subcategoriesByCategory);
            setLoading(false);
            return; // Success, exit the loop

          } catch (err) {
            console.error(`Error with API URL ${url}:`, err);
            continue; // Try next URL
          }
        }

        // If all URLs failed, set empty data
        setCategories([]);
        setSubcategories({});
        setLoading(false);

      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
        setSubcategories({});
        setLoading(false);
      }
    };

    fetchCategoriesAndSubcategories();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    setIsLoggedIn(!!token);

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      const token = localStorage.getItem("user_token");
      setIsLoggedIn(!!token);
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${query}`);
      setQuery("");
      setMobileOpen(false);
    }
  };

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    setIsLoggedIn(false);
    navigate("/login");
    setMobileOpen(false);
  };

  // Function to refresh login state (can be called from other components)
  const refreshLoginState = () => {
    const token = localStorage.getItem("user_token");
    setIsLoggedIn(!!token);
  };

  // Expose refresh function to window for external access
  useEffect(() => {
    window.refreshNavbarLoginState = refreshLoginState;
    return () => {
      delete window.refreshNavbarLoginState;
    };
  }, []);

  const closeMobile = () => {
    setMobileOpen(false);
    setDropdownOpen({});
  };

  const toggleDropdown = (categoryId) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  return (
    <nav className="flex justify-between items-center glass-effect text-neutral-800 px-3 sm:px-6 lg:px-8 h-[80px] shadow-medium sticky top-0 z-[1000] backdrop-blur-[200px]">
      {/* Logo & Hamburger */}
      <div className="flex items-center">
        <button
          className="lg:hidden mr-2 sm:mr-4 text-xl sm:text-2xl"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <i className="fas fa-bars"></i>
        </button>

        <Link
          to="/"
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient no-underline font-serif hover:no-underline hover:scale-105 transition-all duration-300"
          onClick={closeMobile}
        >
          StyleHub
        </Link>
      </div>

      {/* Menu Links */}
      <div
        className={`absolute lg:static top-[80px] left-0 w-full transition-all duration-300 ease-in-out z-[999] 
        ${mobileOpen ? "block bg-white shadow-strong backdrop-blur-xl" : "hidden lg:block bg-transparent"}`}
      >
        <ul className="flex flex-col  lg:flex-row gap-0 lg:gap-8 m-0 p-4 lg:p-0 lg:py-2 justify-center">
          {/* Dynamic Categories */}
          {loading ? (
            <li className="text-center py-4 ">
              <span className="text-gray-500">Loading categories...</span>
            </li>
          ) : (
            categories.map((category) => (
              <li key={category._id} className="relative group">
                <div
                  className="flex justify-between items-center lg:block lg:cursor-default cursor-pointer lg:cursor-pointer"
                >
                  {/* Mobile click handler */}
                  <div 
                    className="lg:hidden flex-1"
                    onClick={() => toggleDropdown(category._id)}
                  >
                    <Link
                      to={`/category/${category._id}`}
                      className="block text-neutral-700 font-semibold hover:text-gradient-secondary py-2 px-4 transition-all duration-300 hover:scale-105 bg-white rounded-lg"
                      onClick={closeMobile}
                    >
                      {category.categoryName}
                    </Link>
                    <span className="lg:hidden">
                      <i
                        className={`fas fa-chevron-${dropdownOpen[category._id] ? "up" : "down"} text-black`}
                      ></i>
                    </span>
                  </div>
                  
                  {/* Desktop version - no click handler */}
                  <div className="hidden lg:block">
                    <Link
                      to={`/category/${category._id}`}
                      className="block text-neutral-700 font-semibold hover:text-gradient-secondary py-2 px-4 transition-all duration-300 hover:scale-105"
                      onClick={closeMobile}
                    >
                      {category.categoryName}
                    </Link>
                  </div>
                </div>
                {subcategories[category._id] && subcategories[category._id].length > 0 && (
                  <div
                    className={`lg:absolute lg:top-full bg-white lg:left-0 glass-effect shadow-strong w-48 rounded-2xl py-3 z-10 backdrop-blur-xl ${dropdownOpen[category._id] ? "block" : "hidden lg:group-hover:block"
                      }`}
                  >
                    {subcategories[category._id].map((subcategory) => (
                      <Link
                        key={subcategory._id}
                        to={`/category/${category._id}/subcategory/${subcategory._id}`}
                        className="block text-neutral-700 font-semibold hover:bg-blue-500 hover:text-white py-3 px-6 rounded-xl mx-2 transition-all duration-300 hover:no-underline hover:scale-105 bg-gray-50 lg:bg-transparent"
                        onClick={closeMobile}
                      >
                        {subcategory.subcategoryName}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
        {/* Search (desktop only) */}
        <form onSubmit={handleSearch} className="relative w-64 hidden sm:block">
          <input
            type="text"
            placeholder="Search..."
            className="input-field w-full py-3 px-4 pr-12 rounded-full text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-neutral-500 hover:text-gradient-primary transition-all duration-300"
          >
            <i className="fas fa-search"></i>
          </button>
        </form>

        {/* Favorites */}
        <Link
          to="/favorite"
          className="relative text-lg sm:text-xl lg:text-2xl text-neutral-700 hover:text-gradient-secondary transition-all duration-300 hover:scale-110"
          onClick={closeMobile}
        >
          <i className="fa-regular fa-heart"></i>
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-2.5 bg-red-600 text-white rounded-full py-0.5 px-1 sm:py-1 sm:px-2 text-xs font-bold shadow-lg border-2 border-white">
              {favorites.length}
            </span>
          )}
        </Link>

        {/* Cart */}
        <Link
          to="/Bag"
          className="text-lg sm:text-xl lg:text-2xl text-neutral-700 hover:text-gradient-accent transition-all duration-300 hover:scale-110"
          onClick={closeMobile}
        >
          <i className="fa-solid fa-cart-shopping"></i>
        </Link>

        {/* Auth */}
        {isLoggedIn ? (
          <>
            <button
              onClick={handleProfileClick}
              className="text-lg sm:text-xl lg:text-2xl text-neutral-700 hover:text-gradient-primary transition-all duration-300 hover:scale-110"
            >
              <i className="fa-regular fa-user"></i>
            </button>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-1 px-2 sm:py-2 sm:px-4 rounded-full text-xs sm:text-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] hover:from-[#1E3A8A] hover:to-[#2563EB] text-white py-1 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm rounded-full no-underline transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              onClick={closeMobile}
            >
              <i className="fas fa-sign-in-alt"></i>
              <span className="hidden sm:inline">Login</span>
            </Link>
            <Link
              to="/signup"
              className="bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] hover:from-[#2563EB] hover:to-[#1E3A8A] text-white py-1 px-2 sm:py-2 sm:px-4 text-xs sm:text-sm rounded-full no-underline transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              onClick={closeMobile}
            >
              <i className="fas fa-user-plus"></i>
              <span className="hidden sm:inline">SignUp</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

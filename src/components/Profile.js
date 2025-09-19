import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Footer from "./Footer";
import axios from "axios";
import Navbar from "./Navbar";

// Define API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Profile = () => {
  const { user, setUser } = useUser();
  const [profileData, setProfileData] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is logged in
        const token = localStorage.getItem("user_token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Try to get user data from localStorage first
        const storedUserData = localStorage.getItem("user_data");
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setProfileData(userData);
          setUser(userData);
        }

        // Fetch fresh profile data from API
        const response = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const userData = response.data.data.user;
          setProfileData(userData);
          setUser(userData);
          // Update localStorage with fresh data
          localStorage.setItem("user_data", JSON.stringify(userData));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (err.response?.status === 401) {
          // Token is invalid, redirect to login
          localStorage.removeItem("user_token");
          localStorage.removeItem("user_data");
          navigate("/login");
        } else {
          setError("Failed to load profile data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen bg-[#E8F4FD] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#1E40AF]/10 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-[#3B82F6]/15 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-[#93C5FD]/20 rounded-full opacity-25 animate-ping"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-[#1E40AF]/10 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-[#3B82F6]/15 rounded-full opacity-35 animate-bounce"></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-[#93C5FD]/20 rounded-full opacity-30 animate-pulse"></div>
      </div>

      <Navbar />

      {/* Enhanced Heading */}
      <div className="relative text-center mt-16 mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-[#1E40AF] via-[#3B82F6] to-[#1E40AF] bg-clip-text text-transparent mb-4 font-serif">
          User Profile
        </h1>
        <div className="w-32 h-1 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] mx-auto rounded-full"></div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Main Layout */}
      {!loading && !error && (
        <div className="flex justify-center px-4 relative z-10">
          <div className="flex flex-wrap w-full max-w-7xl gap-8 p-6">
            {/* Enhanced Sidebar */}
            <div className="flex-none w-80 bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300">
              {/* Profile Avatar Section */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-white text-3xl font-bold">
                    {(profileData?.firstName || profileData?.fullName || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-[#1E40AF] mb-2">
                  Hello, {profileData?.firstName || profileData?.fullName}!
                </h2>
                <p className="text-[#3B82F6] text-sm font-medium">Welcome back to your account</p>
              </div>

              {/* Navigation Links */}
              <div className="space-y-4">
                <Link
                  to="/Bag"
                  className="group flex items-center w-full py-4 px-6 bg-gradient-to-r from-[#93C5FD] to-[#3B82F6] rounded-2xl text-white font-medium transition-all duration-300 hover:from-[#3B82F6] hover:to-[#1E40AF] hover:scale-105 hover:shadow-lg hover:no-underline"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4 group-hover:bg-white/30 transition-colors duration-300">
                    <i className="fa-solid fa-cart-shopping text-lg"></i>
                  </div>
                  <span className="text-lg">Your Bag</span>
                </Link>
                
                <Link
                  to="/Favorite"
                  className="group flex items-center w-full py-4 px-6 bg-gradient-to-r from-[#93C5FD] to-[#3B82F6] rounded-2xl text-white font-medium transition-all duration-300 hover:from-[#3B82F6] hover:to-[#1E40AF] hover:scale-105 hover:shadow-lg hover:no-underline"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4 group-hover:bg-white/30 transition-colors duration-300">
                    <i className="fa-regular fa-heart text-lg"></i>
                  </div>
                  <span className="text-lg">Favorites</span>
                </Link>
                
                <Link
                  to="/Confirmorder"
                  className="group flex items-center w-full py-4 px-6 bg-gradient-to-r from-[#93C5FD] to-[#3B82F6] rounded-2xl text-white font-medium transition-all duration-300 hover:from-[#3B82F6] hover:to-[#1E40AF] hover:scale-105 hover:shadow-lg hover:no-underline"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4 group-hover:bg-white/30 transition-colors duration-300">
                    <i className="fa-solid fa-check-circle text-lg"></i>
                  </div>
                  <span className="text-lg">Confirm Order</span>
                </Link>
              </div>

            {/* Logout (uncomment when needed) */}
            {/* 
            <section className="mt-8">
              <button
                onClick={handleLogout}
                className="w-full py-3 px-5 bg-red-500 rounded-full text-white text-sm font-medium transition duration-300 hover:bg-red-600"
              >
                Log Out
              </button>
            </section> 
            */}
          </div>

          {/* Enhanced Profile Info */}
          <div className="flex-1 bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 min-w-80">
            <header className="mb-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-full flex items-center justify-center mr-4">
                  <i className="fa-solid fa-user text-white text-lg"></i>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] bg-clip-text text-transparent">
                  Personal Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-[#E8F4FD] to-[#93C5FD]/30 p-4 rounded-2xl border border-[#93C5FD]/20">
                  <div className="flex items-center mb-2">
                    <i className="fa-solid fa-user text-[#1E40AF] mr-3"></i>
                    <span className="font-semibold text-[#1E40AF]">Full Name</span>
                  </div>
                  <p className="text-[#3B82F6] font-medium">{profileData?.fullName || `${profileData?.firstName} ${profileData?.lastName}`}</p>
                </div>

                <div className="bg-gradient-to-r from-[#E8F4FD] to-[#93C5FD]/30 p-4 rounded-2xl border border-[#93C5FD]/20">
                  <div className="flex items-center mb-2">
                    <i className="fa-solid fa-envelope text-[#1E40AF] mr-3"></i>
                    <span className="font-semibold text-[#1E40AF]">Email Address</span>
                  </div>
                  <p className="text-[#3B82F6] font-medium">{profileData?.email}</p>
                </div>

                <div className="bg-gradient-to-r from-[#E8F4FD] to-[#93C5FD]/30 p-4 rounded-2xl border border-[#93C5FD]/20">
                  <div className="flex items-center mb-2">
                    <i className="fa-solid fa-at text-[#1E40AF] mr-3"></i>
                    <span className="font-semibold text-[#1E40AF]">Username</span>
                  </div>
                  <p className="text-[#3B82F6] font-medium">{profileData?.username}</p>
                </div>

                <div className="bg-gradient-to-r from-[#E8F4FD] to-[#93C5FD]/30 p-4 rounded-2xl border border-[#93C5FD]/20">
                  <div className="flex items-center mb-2">
                    <i className="fa-solid fa-phone text-[#1E40AF] mr-3"></i>
                    <span className="font-semibold text-[#1E40AF]">Mobile Number</span>
                  </div>
                  <p className="text-[#3B82F6] font-medium">{profileData?.mobileNumber || "Not provided"}</p>
                </div>

                <div className="bg-gradient-to-r from-[#E8F4FD] to-[#93C5FD]/30 p-4 rounded-2xl border border-[#93C5FD]/20">
                  <div className="flex items-center mb-2">
                    <i className="fa-solid fa-calendar text-[#1E40AF] mr-3"></i>
                    <span className="font-semibold text-[#1E40AF]">Age</span>
                  </div>
                  <p className="text-[#3B82F6] font-medium">{profileData?.age || "Not provided"}</p>
                </div>

                <div className="bg-gradient-to-r from-[#E8F4FD] to-[#93C5FD]/30 p-4 rounded-2xl border border-[#93C5FD]/20">
                  <div className="flex items-center mb-2">
                    <i className="fa-solid fa-venus-mars text-[#1E40AF] mr-3"></i>
                    <span className="font-semibold text-[#1E40AF]">Gender</span>
                  </div>
                  <p className="text-[#3B82F6] font-medium">{profileData?.gender ? profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1) : "Not provided"}</p>
                </div>

                <div className="bg-gradient-to-r from-[#E8F4FD] to-[#93C5FD]/30 p-4 rounded-2xl border border-[#93C5FD]/20">
                  <div className="flex items-center mb-2">
                    <i className="fa-solid fa-shield text-[#1E40AF] mr-3"></i>
                    <span className="font-semibold text-[#1E40AF]">Role</span>
                  </div>
                  <p className="text-[#3B82F6] font-medium">{profileData?.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : "User"}</p>
                </div>

                <div className="bg-gradient-to-r from-[#E8F4FD] to-[#93C5FD]/30 p-4 rounded-2xl border border-[#93C5FD]/20">
                  <div className="flex items-center mb-2">
                    <i className="fa-solid fa-clock text-[#1E40AF] mr-3"></i>
                    <span className="font-semibold text-[#1E40AF]">Last Login</span>
                  </div>
                  <p className="text-[#3B82F6] font-medium">{profileData?.lastLogin ? new Date(profileData.lastLogin).toLocaleDateString() : "Never"}</p>
                </div>
              </div>

              {/* Enhanced FAQ Section */}
              <div className="mt-12">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-full flex items-center justify-center mr-4">
                    <i className="fa-solid fa-question-circle text-white text-lg"></i>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] bg-clip-text text-transparent">
                    Frequently Asked Questions
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-[#E8F4FD] to-[#93C5FD]/30 p-6 rounded-2xl border border-[#93C5FD]/20 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <i className="fa-solid fa-envelope text-white text-sm"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#1E40AF] mb-3">
                          What happens when I update my email address (or mobile number)?
                        </h3>
                        <p className="text-[#3B82F6] leading-relaxed">
                          Your login email id (or mobile number) changes likewise.
                          You'll receive all your account related communication on
                          your updated email address (or mobile number).
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-[#E8F4FD] to-[#93C5FD]/30 p-6 rounded-2xl border border-[#93C5FD]/20 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <i className="fa-solid fa-clock text-white text-sm"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#1E40AF] mb-3">
                          When will my StyleHub account be updated with the new email
                          address (or mobile number)?
                        </h3>
                        <p className="text-[#3B82F6] leading-relaxed">
                          It happens as soon as you confirm the verification code sent
                          to your email (or mobile) and save the changes.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-[#E8F4FD] to-[#93C5FD]/30 p-6 rounded-2xl border border-[#93C5FD]/20 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <i className="fa-solid fa-shield text-white text-sm"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#1E40AF] mb-3">
                          What happens to my existing StyleHub account when I update my
                          email address (or mobile number)?
                        </h3>
                        <p className="text-[#3B82F6] leading-relaxed">
                          Updating your email address (or mobile number) doesn't
                          invalidate your account. Your account remains fully
                          functional. You'll continue seeing your order history, saved
                          information and personal details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>
          </div>
        </div>
      </div>
      )}

      <Footer />
    </div>
  );
};

export default Profile;

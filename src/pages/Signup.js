import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import stylehub4 from "../imges/stylehub4.png";

// Define API URL
const API_URL = process.env.REACT_APP_API_URL || 'https://stylehub-backend-nu.vercel.app';



const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    age: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.mobileNumber || 
        !formData.email || !formData.age || !formData.gender || 
        !formData.password || !formData.confirmPassword) {
      setErrorMessage("Please fill in all required fields!");
      setIsLoading(false);
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long!");
      setIsLoading(false);
      return;
    }

    // Validate age
    const age = parseInt(formData.age);
    if (age < 13 || age > 120) {
      setErrorMessage("Age must be between 13 and 120!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/signup`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          mobileNumber: formData.mobileNumber,
          email: formData.email,
          age: age,
          gender: formData.gender,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem("user_token", response.data.data.token);
        localStorage.setItem("user_data", JSON.stringify(response.data.data.user));

        // Show success message
        setErrorMessage("");
        
        // Refresh navbar login state
        if (window.refreshNavbarLoginState) {
          window.refreshNavbarLoginState();
        }
        
        // Redirect to home page or dashboard
        navigate("/");
      }
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response) {
        const errorMsg = error.response.data.message || error.response.data.error || "Signup failed!";
        setErrorMessage(errorMsg);
      } else {
        setErrorMessage("Server not reachable. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      {/* Main Signup Container */}
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#E8F4FD] to-[#F1F5F9] flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="bg-gradient-to-br from-[#93C5FD] via-white to-[#3B82F6] rounded-2xl shadow-lg border border-[#CBD5E1] p-12 mb-8 hover:shadow-xl transition-all duration-300">
              <img src={stylehub4} alt="StyleHub Logo" className="w-80 h-80 object-contain mx-auto" />
            </div>
            
          </div>

          {/* Right Side - Signup Form */}
          <div className="w-full max-w-2xl mx-auto animate-slide-up">
            <div className="bg-gradient-to-br from-[#93C5FD] via-white to-[#3B82F6] rounded-2xl shadow-lg border border-[#CBD5E1] p-8 hover:shadow-xl transition-all duration-300">
              
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-[#475569] via-[#3B82F6] to-[#475569] bg-clip-text text-transparent mb-2">Create Account</h2>
                <p className="text-[#64748B] text-lg">Join thousands of fashion enthusiasts</p>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="label flex items-center gap-2 text-[#475569] font-semibold">
                      <i className="fas fa-user text-[#3B82F6]"></i>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200 bg-white"
                      placeholder='Enter your first name'
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="label flex items-center gap-2 text-[#475569] font-semibold">
                      <i className="fas fa-user text-[#3B82F6]"></i>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200 bg-white"
                      placeholder='Enter your last name'
                      required
                    />
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="mobileNumber" className="label flex items-center gap-2 text-[#475569] font-semibold">
                      <i className="fas fa-phone text-[#3B82F6]"></i>
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      pattern="[0-9]{10}"
                      name="mobileNumber"
                      id="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200 bg-white"
                      placeholder='Enter your 10-digit mobile number'
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="label flex items-center gap-2 text-[#475569] font-semibold">
                      <i className="fas fa-envelope text-[#3B82F6]"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200 bg-white"
                      placeholder='Enter your email address'
                      required
                    />
                  </div>
                </div>

                {/* Personal Info Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="age" className="label flex items-center gap-2 text-[#475569] font-semibold">
                      <i className="fas fa-calendar text-[#3B82F6]"></i>
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      id="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200 bg-white"
                      placeholder='Enter your age'
                      min="13"
                      max="100"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="gender" className="label flex items-center gap-2 text-[#475569] font-semibold">
                      <i className="fas fa-venus-mars text-[#3B82F6]"></i>
                      Gender
                    </label>
                    <select
                      name="gender"
                      id="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200 bg-white"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="label flex items-center gap-2 text-[#475569] font-semibold">
                      <i className="fas fa-lock text-[#3B82F6]"></i>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200 bg-white"
                      placeholder='Create a strong password'
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="label flex items-center gap-2 text-[#475569] font-semibold">
                      <i className="fas fa-lock text-[#3B82F6]"></i>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200 bg-white"
                      placeholder='Confirm your password'
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#E8F4FD] rounded-xl shadow-lg border border-[#CBD5E1] p-4 text-center border-l-4 border-red-500">
                    <p className="text-red-700 text-lg font-semibold">{errorMessage}</p>
                  </div>
                )}

                {/* Create Account Button */}
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 text-lg font-bold bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] hover:from-[#1E3A8A] hover:to-[#2563EB] text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="carousel-spinner w-5 h-5"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <i className="fas fa-user-plus"></i>
                      Create Account
                    </div>
                  )}
                </button>

                {/* Terms and Privacy */}
                <div className="text-center text-sm text-[#64748B]">
                  By creating an account, you agree to our{' '}
                  <Link to="/Policy" className="text-[#3B82F6] font-semibold hover:text-[#1E40AF] transition-all duration-300 no-underline hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/Policy" className="text-[#3B82F6] font-semibold hover:text-[#1E40AF] transition-all duration-300 no-underline hover:underline">
                    Privacy Policy
                  </Link>
                </div>

                {/* Login Link */}
                <div className="text-center pt-4">
                  <p className="text-[#64748B] text-lg">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-[#3B82F6] font-bold hover:text-[#1E40AF] transition-all duration-300 no-underline hover:underline"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Signup;

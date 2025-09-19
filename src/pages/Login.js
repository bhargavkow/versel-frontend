import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { useUser } from "../context/UserContext";
import stylehub4 from "../imges/stylehub4.png";
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

// Define API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();

  const location = useLocation();
  const message = location.state?.message;

  useEffect(() => {
    const storedToken = localStorage.getItem("user_token");
    if (storedToken) {
      // User is already logged in, redirect to profile
      navigate("/profile");
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username: email, // API expects 'username' field (can be email or username)
        password: password
      }, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem("user_token", response.data.data.token);
        localStorage.setItem("user_data", JSON.stringify(response.data.data.user));
        
        // Update user context
        setUser(response.data.data.user);

        // Refresh navbar login state
        if (window.refreshNavbarLoginState) {
          window.refreshNavbarLoginState();
        }

        // Redirect to profile page
        navigate("/profile");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        const errorMsg = err.response.data.message || err.response.data.error || "Invalid credentials";
        setErrorMessage(errorMsg);
      } else {
        setErrorMessage("Server not reachable. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await axios.get("http://192.168.1.11:5000/auth/google/", {
      });

      // Backend returns { url: "https://accounts.google.com/..." }
      const redirectUrl = response.data.url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        setErrorMessage("Google login failed. No redirect URL received.");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setErrorMessage("Google login failed. Server not reachable.");
    }
  };

  return (
    <>
      <Navbar />
      
      {/* Main Login Container */}
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#E8F4FD] to-[#F1F5F9] flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="bg-gradient-to-br from-[#93C5FD] via-white to-[#3B82F6] rounded-2xl shadow-lg border border-[#CBD5E1] p-12 mb-8 hover:shadow-xl transition-all duration-300">
              <img src={stylehub4} alt="StyleHub Logo" className="w-80 h-80 object-contain mx-auto" />
            </div>
           
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto animate-slide-up">
            <div className="bg-gradient-to-br from-[#93C5FD] via-white to-[#3B82F6] rounded-2xl shadow-lg border border-[#CBD5E1] p-8 hover:shadow-xl transition-all duration-300">
              
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-[#475569] via-[#3B82F6] to-[#475569] bg-clip-text text-transparent mb-2">Welcome Back</h2>
                <p className="text-[#64748B] text-lg">Sign in to your StyleHub account</p>
              </div>

              {/* Success Message */}
              {message && (
                <div className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#E8F4FD] rounded-xl shadow-lg border border-[#CBD5E1] p-4 mb-6 text-center border-l-4 border-green-500">
                  <p className="text-green-700 text-lg font-semibold">{message}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="label flex items-center gap-2 text-[#475569] font-semibold">
                    <i className="fas fa-envelope text-[#3B82F6]"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200 bg-white"
                    placeholder='Enter your email address'
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="label flex items-center gap-2 text-[#475569] font-semibold">
                    <i className="fas fa-lock text-[#3B82F6]"></i>
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200 bg-white"
                    placeholder='Enter your password'
                    required
                  />
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#E8F4FD] rounded-xl shadow-lg border border-[#CBD5E1] p-4 text-center border-l-4 border-red-500">
                    <p className="text-red-700 text-lg font-semibold">{errorMessage}</p>
                  </div>
                )}

                {/* Login Button */}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-4 text-lg font-bold bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] hover:from-[#1E3A8A] hover:to-[#2563EB] text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="carousel-spinner w-5 h-5"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <i className="fas fa-sign-in-alt"></i>
                      Sign In
                    </div>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#CBD5E1]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-[#64748B] font-medium">or continue with</span>
                  </div>
                </div>

                {/* Google Login */}
                <button 
                  type="button" 
                  onClick={handleGoogleLogin}
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-br from-white via-[#F8FAFC] to-[#E8F4FD] border border-[#CBD5E1] rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <i className="fa-brands fa-google text-xl text-red-500"></i>
                  Continue with Google
                </button>

                {/* Sign Up Link */}
                <div className="text-center pt-4">
                  <p className="text-[#64748B] text-lg">
                    Don't have an account?{' '}
                    <Link 
                      to="/signup" 
                      className="text-[#3B82F6] font-bold hover:text-[#1E40AF] transition-all duration-300 no-underline hover:underline"
                    >
                      Create Account
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
}

export default Login;











// import React, { useState, useEffect } from "react";
// import homepage_img4 from "../imges/homepage_img4.jpg";
// import homepage_img5 from "../imges/homepage_img5.jpg";
// import homepage_img6 from "../imges/homepage_img6.jpg";
// import homepage_img7 from "../imges/homepage_img7.jpg";
// import homepage_img8 from "../imges/homepage_img8.jpg";
// import homepage_img9 from "../imges/homepage_img8.jpg";
// import mumbai from "../imges/mumbai.png"
// import surat from "../imges/surat.png"
// import ahmedabad from "../imges/ahmedabad.png"
// import pune from "../imges/pune.png"
// import jaipur from "../imges/jaipur.png"
// import chennai from "../imges/chennai.png"
// import kolkata from "../imges/kolkata.png"
// import hyderabad from "../imges/hyderabad.png"
// import delhi from "../imges/delhi.png"
// import bengluru from "../imges/bengluru.png"
// import rajkot from "../imges/rajkot.png"
// import ludhiyana from "../imges/ludhiyana.png"




// import rental_img from "../imges/rental_img.png";
// import rental_img2 from "../imges/rental_img2.png";
// import plan from '../imges/3hr_delivery_icon.png';
// import easy_return from '../imges/easy_return_icon.png';
// import cod from '../imges/money.png';
// import free_trail from '../imges/free_trial_icon.png';
// import qc from '../imges/QC_icon.png';
// import shipping from '../imges/shipping_both_ways_icon.png';


// import men_categories from '../imges/men_categories.png';
// import women_categories from '../imges/women_categories.png';
// import children_categories from '../imges/children_categories.png';
// import trending_categories from '../imges/trending_categories.png';
// import offer_categories from '../imges/offer_categories.png';
// import sale_categories from '../imges/sale_categories.png';
// import '@fortawesome/fontawesome-free/css/all.min.css';
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import About_us from "./About_us"





// function Home(){
// const [currentIndex, setCurrentIndex] = useState(0);
// const carouselImages = [
//   homepage_img4,
//   homepage_img5,
//   homepage_img8,
//   homepage_img9
// ];

// useEffect(() => {
//   const interval = setInterval(() => {
//     setCurrentIndex((prevIndex) =>
//       prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
//     );
//   }, 3000);
//   return () => clearInterval(interval);
// }, [carouselImages.length]);



// const nextSlide = () => {
//   setCurrentIndex((prevIndex) =>
//     prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
//   );
// };

// const prevSlide = () => {
//   setCurrentIndex((prevIndex) =>
//     prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
//   );
// };

// // FAQs data
// const faqsData = [
//   {
//     question: "What is StyleHub?",
//     answer: "StyleHub provides clothes at an affordable rental price."
//   },
//   {
//     question: "Does StyleHub provide service in India?",
//     answer: "Yes, StyleHub provides service in 15 states across India."
//   },
//   {
//     question: "Can I buy clothes from StyleHub?",
//     answer: "Yes, you can also buy clothes directly from the site."
//   }
// ];

// const [activeIndex, setActiveIndex] = useState(null);

// const toggleAccordion = (index) => {
//   setActiveIndex(activeIndex === index ? null : index);
// };

// return (
//   <>
//     <Navbar />

//     {/* Carousel Section */}
//     <div className="relative w-full -mt-[70px] overflow-hidden h-screen shadow-medium">
//       <button
//         className="absolute top-1/2 left-5 transform -translate-y-1/2 bg-black bg-opacity-50 text-white border-none text-3xl py-2.5 px-4 cursor-pointer z-10 rounded-full hover:bg-opacity-70 transition-all duration-300"
//         onClick={prevSlide}
//       >
//         &#10094;
//       </button>
//       <img
//         src={carouselImages[currentIndex]}
//         alt={`Slide ${currentIndex + 1}`}
//         className="w-full h-[90vh] object-cover transition-opacity duration-500"
//       />
//       <button
//         className="absolute top-1/2 right-5 transform -translate-y-1/2 bg-black bg-opacity-50 text-white border-none text-3xl py-2.5 px-4 cursor-pointer z-10 rounded-full hover:bg-opacity-70 transition-all duration-300"
//         onClick={nextSlide}
//       >
//         &#10095;
//       </button>

//       <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
//         {carouselImages.map((_, index) => (
//           <span
//             key={index}
//             className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${index === currentIndex ? "bg-white" : "bg-white bg-opacity-50"
//               }`}
//             onClick={() => setCurrentIndex(index)}
//           ></span>
//         ))}
//       </div>
//     </div>

//     {/* Services Section */}
//     <div className="flex items-center justify-around w-4/5 mx-auto my-12 flex-wrap gap-8">
//       <div className="flex flex-col items-center text-center">
//         <img src={plan} alt="Plan" className="w-16 h-16 mb-2" />
//         <p className="text-xs text-gray-600">All India Delivery</p>
//       </div>
//       <div className="flex flex-col items-center text-center">
//         <img src={easy_return} alt="Easy Return" className="w-16 h-16 mb-2" />
//         <p className="text-xs text-gray-600">Quality Check</p>
//       </div>
//       <div className="flex flex-col items-center text-center">
//         <img src={cod} alt="COD" className="w-16 h-16 mb-2" />
//         <p className="text-xs text-gray-600">COD (Advance)</p>
//       </div>
//       <div className="flex flex-col items-center text-center">
//         <img src={qc} alt="Quality Check" className="w-16 h-16 mb-2" />
//         <p className="text-xs text-gray-600">Certified</p>
//       </div>
//       <div className="flex flex-col items-center text-center">
//         <img src={free_trail} alt="Free Trial" className="w-16 h-16 mb-2" />
//         <p className="text-xs text-gray-600">Free Trial</p>
//       </div>
//       <div className="flex flex-col items-center text-center">
//         <img src={shipping} alt="Shipping" className="w-16 h-16 mb-2" />
//         <p className="text-xs text-gray-600">Shipping</p>
//       </div>
//     </div>

//     {/* Categories Section */}
//     <div className="mb-12">
//       <div className="text-center">
//         <h1 className="text-5xl font-bold my-5 font-serif">CATEGORIES</h1>
//       </div>
//       <div className="w-full flex items-center justify-center flex-wrap gap-4 px-4">
//         <a href="/Men" className="group">
//           <div className="w-96 h-96 overflow-hidden rounded-lg shadow-soft hover:scale-105 transition-transform duration-300 hover:rounded-lg hover:cursor-pointer hover:border hover:border-black">
//             <img src={men_categories} alt="Men Categories" className="w-full h-full object-fit" />
//           </div>
//         </a>
//         <a href="/Women" className="group">
//           <div className="w-96 h-96 overflow-hidden rounded-lg shadow-soft hover:scale-105 transition-transform duration-300 hover:rounded-lg hover:cursor-pointer hover:border hover:border-black">
//             <img src={women_categories} alt="Women Categories" className="w-full h-full object-fit" />
//           </div>
//         </a>
//         <a href="/Children" className="group">
//           <div className="w-96 h-96 overflow-hidden rounded-lg shadow-soft hover:scale-105 transition-transform duration-300 hover:rounded-lg hover:cursor-pointer hover:border hover:border-black">
//             <img src={children_categories} alt="Children Categories" className="w-full h-full object-fit" />
//           </div>
//         </a>
//         <a href="/Men" className="group">
//           <div className="w-96 h-96 overflow-hidden rounded-lg shadow-soft hover:scale-105 transition-transform duration-300 hover:rounded-lg hover:cursor-pointer hover:border hover:border-black">
//             <img src={offer_categories} alt="Offer Categories" className="w-full h-full object-fit" />
//           </div>
//         </a>
//         <a href="/Men" className="group">
//           <div className="w-96 h-96 overflow-hidden rounded-lg shadow-soft hover:scale-105 transition-transform duration-300 hover:rounded-lg hover:cursor-pointer hover:border hover:border-black">
//             <img src={sale_categories} alt="Sale Categories" className="w-full h-full object-fit" />
//           </div>
//         </a>
//       </div>
//     </div>

//     {/* Rental Section */}
//     <div className="flex justify-center items-center gap-8 my-8 px-4">
//       <a href="/Help" className="group">
//         <img
//           src={rental_img}
//           alt="Rental 1"
//           className="h-[450px] w-4/5 mx-auto my-5 shadow-strong hover:scale-105 transition-transform duration-300 hover:rounded-lg hover:cursor-pointer hover:border hover:border-black"
//         />
//       </a>
//       <a href="/Men" className="group">
//         <img
//           src={rental_img2}
//           alt="Rental 2"
//           className="h-[450px] w-4/5 mx-auto my-5 shadow-strong hover:scale-105 transition-transform duration-300 hover:rounded-lg hover:cursor-pointer hover:border hover:border-black"
//         />
//       </a>
//     </div>

//     {/* Location Gallery Section */}
//     <section className="py-10 px-5 text-center">
//       <h1 className="text-5xl font-bold mb-5 font-serif">Location</h1>
//       <div className="flex justify-center gap-5 flex-wrap">
//         {/* Column 1 */}
//         <div className="flex flex-col gap-4">
//           <img src={mumbai} alt="Mumbai" className="w-48 h-48 shadow-strong transition-transform duration-100 hover:scale-105 hover:rounded-lg hover:border hover:border-black" />
//           <img src={surat} alt="Surat" className="w-48 h-48 shadow-strong transition-transform duration-100 hover:scale-105 hover:rounded-lg hover:border hover:border-black" />
//           <img src={ahmedabad} alt="Ahmedabad" className="w-48 h-48 shadow-strong transition-transform duration-100 hover:scale-105 hover:rounded-lg hover:border hover:border-black" />
//         </div>

//         {/* Column 2 */}
//         <div className="flex flex-col gap-4">
//           <img src={pune} alt="Pune" className="w-48 h-48 shadow-strong transition-transform duration-100 hover:scale-105 hover:rounded-lg hover:border hover:border-black" />
//           <img src={chennai} alt="Chennai" className="w-48 h-48 shadow-strong transition-transform duration-100 hover:scale-105 hover:rounded-lg hover:border hover:border-black" />
//           <img src={kolkata} alt="Kolkata" className="w-48 h-48 shadow-strong transition-transform duration-100 hover:scale-105 hover:rounded-lg hover:border hover:border-black" />
//         </div>

//         {/* Column 3 */}
//         <div className="flex flex-col gap-4">
//           <img src={delhi} alt="Delhi" className="w-48 h-48 shadow-strong transition-transform duration-100 hover:scale-105 hover:rounded-lg hover:border hover:border-black" />
//           <img src={ludhiyana} alt="Ludhiana" className="w-48 h-48 shadow-strong transition-transform duration-100 hover:scale-105 hover:rounded-lg hover:border hover:border-black" />
//           <img src={bengluru} alt="Bangalore" className="w-48 h-48 shadow-strong transition-transform duration-100 hover:scale-105 hover:rounded-lg hover:border hover:border-black" />
//         </div>

//         {/* Column 4 */}
//         <div className="flex flex-col gap-4">
//           <img src={jaipur} alt="Jaipur" className="w-48 h-48 shadow-strong transition-transform duration-100 hover:scale-105 hover:rounded-lg hover:border hover:border-black" />
//           <img src={rajkot} alt="Rajkot" className="w-48 h-48 shadow-strong transition-transform duration-100 hover:scale-105 hover:rounded-lg hover:border hover:border-black" />
//           <img src={hyderabad} alt="Hyderabad" className="w-48 h-48 shadow-strong transition-transform duration-100 hover:scale-105 hover:rounded-lg hover:border hover:border-black" />
//         </div>
//       </div>
//     </section>

//     {/* FAQ Section */}
//     <section className="py-10 px-4 my-8">
//       <h2 className="text-4xl font-bold text-center mb-6">FAQs</h2>
//       <div className="max-w-3xl mx-auto">
//         {faqsData.map((faq, index) => (
//           <div key={index} className="mb-4 border-b border-gray-400 hover:scale-105 transition-transform duration-200">
//             <button
//               onClick={() => toggleAccordion(index)}
//               className="w-full text-left py-4 text-xl font-semibold border-none bg-none cursor-pointer text-inherit outline-none hover:text-orange-500 transition-colors duration-200"
//             >
//               {faq.question}
//             </button>
//             {activeIndex === index && (
//               <p className="text-gray-800 mt-2 mb-4 leading-relaxed">{faq.answer}</p>
//             )}
//           </div>
//         ))}
//       </div>
//     </section>

//     {/* Footer */}
//     <Footer />
//   </>
// );
// }
// export default Home;

import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="bg-black text-white relative overflow-hidden">
      {/* Enhanced Background with animated elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/10 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-500/10 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-500/10 rounded-full opacity-25 animate-ping"></div>
        <div className="absolute bottom-32 right-1/3 w-14 h-14 bg-indigo-500/10 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-yellow-500/10 rounded-full opacity-35 animate-bounce"></div>
        <div className="absolute top-1/3 right-1/4 w-10 h-10 bg-green-500/10 rounded-full opacity-30 animate-pulse"></div>
      </div>
      
      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-20 md:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-16">
          
          {/* Brand Info */}
          <div className="animate-fade-in lg:col-span-1">
            <h2 className="text-4xl font-serif mb-8">
              <a href="/" className="text-gradient-secondary no-underline font-serif hover:scale-105 transition-all duration-300">
                STYLE HUB
              </a>
            </h2>
            <p className="text-neutral-300 text-sm leading-relaxed max-w-xs">
              Our website provides many types of rental services across the
              country. StyleHub is the most trusted website in this field!!!
            </p>
          </div>

          {/* Categories */}
          <div className="animate-slide-up">
            <h2 className="text-xl font-bold mb-8 text-gradient-accent">CATEGORIES</h2>
            <ul className="space-y-5">
              {["Men", "Women", "Children", "Trending"].map((item) => (
                <li
                  key={item}
                  className="hover:scale-105 transition-all duration-300 hover:text-gradient-primary"
                >
                  <Link
                    to={`/${item}`}
                    className="text-neutral-300 no-underline text-sm hover:text-white transition-colors duration-300 block py-1"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Details */}
          <div className="animate-slide-up">
            <h2 className="text-xl font-bold mb-8 text-gradient-accent">DETAIL</h2>
            <ul className="space-y-5">
              {[
                { name: "About Us", link: "/About_us" },
                { name: "Contact Us", link: "/ContactUS" },
                { name: "Policy", link: "/Policy" },
                { name: "Help", link: "/Help" },
              ].map((item) => (
                <li
                  key={item.name}
                  className="hover:scale-105 transition-all duration-300 hover:text-gradient-primary"
                >
                  <Link
                    to={item.link}
                    className="text-neutral-300 no-underline text-sm hover:text-white transition-colors duration-300 block py-1"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div className="animate-slide-up">
            <h2 className="text-xl font-bold mb-8 text-gradient-accent">SOCIAL MEDIA</h2>
            <ul className="space-y-5">
              <li className="hover:scale-105 transition-all duration-300 hover:text-gradient-primary">
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-300 no-underline text-sm flex items-center hover:text-white transition-colors duration-300 py-1"
                >
                  <i className="fa-brands fa-instagram mr-3 text-lg w-5"></i> Instagram
                </a>
              </li>
              <li className="hover:scale-105 transition-all duration-300 hover:text-gradient-primary">
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-300 no-underline text-sm flex items-center hover:text-white transition-colors duration-300 py-1"
                >
                  <i className="fa-brands fa-facebook mr-3 text-lg w-5"></i> Facebook
                </a>
              </li>
              <li className="hover:scale-105 transition-all duration-300 hover:text-gradient-primary">
                <a
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-300 no-underline text-sm flex items-center hover:text-white transition-colors duration-300 py-1"
                >
                  <i className="fa-brands fa-x-twitter mr-3 text-lg w-5"></i> Twitter
                </a>
              </li>
              <li className="hover:scale-105 transition-all duration-300 hover:text-gradient-primary">
                <a
                  href="https://www.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-300 no-underline text-sm flex items-center hover:text-white transition-colors duration-300 py-1"
                >
                  <i className="fa-brands fa-google mr-3 text-lg w-5"></i> Google
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="animate-slide-up">
            <h2 className="text-xl font-bold mb-8 text-gradient-accent">CONTACT</h2>
            <ul className="space-y-5">
              <li className="hover:scale-105 transition-all duration-300 hover:text-gradient-primary">
                <a
                  href="tel:+911234567890"
                  className="text-neutral-300 no-underline text-sm flex items-center hover:text-white transition-colors duration-300 py-1"
                >
                  <i className="fa-solid fa-phone mr-3 text-lg w-5"></i> +91 1234567890
                </a>
              </li>
              <li className="hover:scale-105 transition-all duration-300 hover:text-gradient-primary">
                <a
                  href="https://maps.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-300 no-underline text-sm flex items-center hover:text-white transition-colors duration-300 py-1"
                >
                  <i className="fa-solid fa-location-dot mr-3 text-lg w-5"></i> 
                  <span className="leading-tight">Shindhu Bhavan Road, Ahmedabad</span>
                </a>
              </li>
              <li className="hover:scale-105 transition-all duration-300 hover:text-gradient-primary">
                <a
                  href="mailto:StyleHub.support@gmail.com"
                  className="text-neutral-300 no-underline text-sm flex items-center hover:text-white transition-colors duration-300 py-1"
                >
                  <i className="fa-solid fa-envelope mr-3 text-lg w-5"></i>
                  <span className="leading-tight">StyleHub.support@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="text-center text-gray-300 text-sm pt-16 pb-0 mt-12 border-t border-gray-700/30">
          <p className="flex items-center justify-center">
            <i className="fa-solid fa-copyright mr-2"></i>
            All rights reserved by StyleHub. Made with ❤️ for fashion lovers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;

import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ContactUs = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#E8F4FD] py-16">
        <div className="max-w-4xl mx-auto px-4">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600">Feel free to reach out to us with any questions or inquiries.</p>
          </header>

          <div className="bg-white rounded-lg shadow-soft p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <FaEnvelope className="text-orange-500 text-2xl" />
                <a 
                  href="https://mail.google.com/mail/" 
                  className="text-lg text-gray-700 hover:text-orange-500 transition-colors duration-200"
                >
                  Stylehub.support@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <FaPhone className="text-orange-500 text-2xl" />
                <a 
                  href="https://play.google.com/store/apps/details?id=com.google.android.contacts&hl=en_IN" 
                  className="text-lg text-gray-700 hover:text-orange-500 transition-colors duration-200"
                >
                  +91 1234567890
                </a>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <FaMapMarkerAlt className="text-orange-500 text-2xl" />
                <a 
                  href='https://www.google.com/maps/place/Sankalp+Square+3B/@23.0435266,72.4809431,18z/data=!3m1!4b1!4m6!3m5!1s0x395e9b7aff4e20c1:0xeca4a5aa065bcbc3!8m2!3d23.0435253!4d72.481641!16s%2Fg%2F11h9y5bfwf?entry=ttu&g_ep=EgoyMDI1MDgyNS4wIKXMDSoASAFQAw%3D%3D' 
                  className="text-lg text-gray-700 hover:text-orange-500 transition-colors duration-200"
                >
                  Shindhu Bhavan Road, Ahmedabad
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactUs;

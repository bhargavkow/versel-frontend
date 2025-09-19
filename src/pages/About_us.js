import React from 'react';
import img1 from '../imges/homepage_img.jpeg';
import img2 from '../imges/homepage_img2.jpeg';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const AboutUs = () => {
  return (
    <>
    <Navbar/>
      <div className="min-h-screen bg-[#E8F4FD]">
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Our Story</h1>
            <p className="text-xl text-gray-600">
              Driven by a passion for quality and craft.
            </p>
          </div>
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div className="text-content">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">The Beginning</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  It all started in 2020 with a simple idea: to create a curated
                  collection of clothes that blends timeless design with
                  modern functionality. We saw a gap in the market for products that
                  were not only beautiful but also built to last, and so, StyleHub was born.
                </p>
              </div>
              <div className="image-content">
                <img src={img2} alt="Founder" className="w-full h-96 object-cover rounded-lg shadow-soft" />
              </div>
            </div>

            <div className="mission-block">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Mission</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Quality First</h3>
                  <p className="text-gray-600 leading-relaxed">We believe in the power of well-made goods. Our products are meticulously sourced and crafted with an unwavering commitment to quality and durability.</p>
                </div>
                <div className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Customer Trust</h3>
                  <p className="text-gray-600 leading-relaxed">Your satisfaction is our top priority. We're dedicated to providing an exceptional shopping experience and building a community of loyal customers.</p>
                </div>
                <div className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Sustainable Growth</h3>
                  <p className="text-gray-600 leading-relaxed">We are committed to ethical and sustainable practices, from our supply chain to our packaging. We believe business can be a force for good.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />

    </>
  );
};

export default AboutUs;

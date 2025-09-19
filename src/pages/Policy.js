import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Policy = () => {
  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-[#E8F4FD] py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">E-commerce Policies</h1>

          <div className="space-y-8">
            <section className="bg-white rounded-lg shadow-soft p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Privacy Policy</h2>
              <p className="text-gray-600 leading-relaxed">Your privacy is important to us. This policy explains how we collect, use, and protect your personal information when you use our website. We collect data such as your name, email address, shipping address, and payment details to process orders and improve your shopping experience. We do not share your information with third parties except as necessary for order fulfillment or legal requirements.</p>
            </section>

            <section className="bg-white rounded-lg shadow-soft p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Terms of Service</h2>
              <p className="text-gray-600 leading-relaxed">By using our website, you agree to comply with and be bound by the following terms and conditions of use. These terms govern your use of our website and the services offered. This includes rules regarding user conduct, intellectual property, disclaimers of warranties, and limitations of liability.</p>
            </section>

            <section className="bg-white rounded-lg shadow-soft p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Refund and Return Policy</h2>
              <p className="text-gray-600 leading-relaxed">We offer a 30-day return policy for most items purchased on our website. To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging. Refunds will be processed within 5-7 business days of receiving the returned item.</p>
            </section>

            <section className="bg-white rounded-lg shadow-soft p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping Policy</h2>
              <p className="text-gray-600 leading-relaxed">We aim to process and ship all orders within 2-3 business days. Shipping times may vary depending on your location and the selected shipping method. We offer various shipping options, including standard and expedited shipping. Tracking information will be provided once your order has shipped.</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Policy;
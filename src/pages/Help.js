import React, { useState, useEffect } from "react";
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const Help = () => {
    const faqsData = [
        {
            question: "What is StyleHub?",
            answer: "StyleHub provides clothes at an affordable rental price."
        },
        {
            question: "Does StyleHub provide service in India?",
            answer: "Yes, StyleHub provides service in 15 states across India."
        },
        {
            question: "Can I buy clothes from StyleHub?",
            answer: "Yes, you can also buy clothes directly from the site."
        }
    ];

    const [activeIndex, setActiveIndex] = useState(null);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };
    return (

        <>
            <Navbar/>
            <div className="min-h-screen bg-[#E8F4FD] py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Customer Help Center</h1>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">FAQs</h2>
                        <div className="space-y-4">
                            {faqsData.map((faq, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-soft overflow-hidden">
                                    <button
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full text-left p-6 text-lg font-semibold text-gray-800 hover:bg-gray-50 transition-colors duration-200 flex justify-between items-center"
                                    >
                                        {faq.question}
                                        <span className={`text-2xl transition-transform duration-200 ${activeIndex === index ? 'rotate-45' : ''}`}>
                                            +
                                        </span>
                                    </button>
                                    {activeIndex === index && (
                                        <div className="px-6 pb-6">
                                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping Information</h2>
                        <p className="text-gray-600 leading-relaxed mb-2">We offer free standard shipping on orders over $50. Orders typically ship within 2-3 business days.</p>
                        <p className="text-gray-600 leading-relaxed">For expedited shipping, we offer 2-day and next-day shipping options at checkout.</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Returns & Exchanges</h2>
                        <p className="text-gray-600 leading-relaxed mb-2">Our return policy allows you to return items within 30 days of purchase. To initiate a return, please visit the "Returns" section in your account.</p>
                        <p className="text-gray-600 leading-relaxed">Exchanges are also accepted, provided the item is in new, unused condition.</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-soft p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Us</h2>
                        <p className="text-gray-600 leading-relaxed mb-2">If you have any other questions, please don't hesitate to reach out:</p>
                        <p className="text-gray-600 leading-relaxed mb-1">Email: <a href="https://mail.google.com/mail/" className="text-orange-500 hover:text-orange-600 transition-colors duration-200">Stylehub.support@gmail.com</a></p>
                        <p className="text-gray-600 leading-relaxed">Phone No: <a href="https://play.google.com/store/apps/details?id=com.google.android.contacts&hl=en_IN" className="text-orange-500 hover:text-orange-600 transition-colors duration-200">+91 1234567890</a></p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Help;

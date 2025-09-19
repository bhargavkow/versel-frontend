import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Bag = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const totalPrice = (cart || []).reduce(
    (total, item) => total + (item.price || item.rental_price || 0) * (item.quantity || 1),
    0
  );

  const handleBuyNow = (item) => {
    navigate(`/buy/${item._id || item.id}`, { state: { product: item } });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#E8F4FD] to-[#F1F5F9]">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#93C5FD] via-white to-[#3B82F6] border-b border-[#CBD5E1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              <div className="animate-fade-in">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#475569] via-[#3B82F6] to-[#475569] bg-clip-text text-transparent mb-2 sm:mb-4">Shopping Bag</h1>
                <p className="text-[#64748B] text-base sm:text-lg">
                  {cart && cart.length > 0 ? `${cart.length} item${cart.length > 1 ? 's' : ''} in your bag` : 'Your bag is empty'}
                </p>
              </div>
              {cart && cart.length > 0 && (
                <div className="text-left sm:text-right animate-slide-up">
                  <p className="text-sm text-[#64748B] mb-1 sm:mb-2">Total Amount</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3B82F6]">₹{totalPrice.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {cart && cart.length === 0 ? (
            /* Empty Cart State */
            <div className="text-center py-12 sm:py-16 lg:py-20">
              <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-[#E8F4FD] to-[#93C5FD] rounded-full flex items-center justify-center mb-6 sm:mb-8 shadow-lg border border-[#CBD5E1]">
                <svg className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#475569] mb-3 sm:mb-4">Your bag is empty</h3>
              <p className="text-[#64748B] text-base sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto px-4">
                Looks like you haven't added any items to your bag yet. Start shopping to fill it up!
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] hover:from-[#1E3A8A] hover:to-[#2563EB] text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2 sm:mr-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                Start Shopping
              </button>
            </div>
          ) : (
            /* Cart Items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Cart Items List */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {cart.map((item, index) => (
                  <div key={item._id || item.id} className="group bg-gradient-to-br from-white via-[#F8FAFC] to-[#E8F4FD] rounded-2xl shadow-lg border border-[#CBD5E1] overflow-hidden hover:shadow-xl hover:border-[#94A3B8] transition-all duration-300">
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 rounded-xl overflow-hidden bg-gradient-to-br from-[#F8FAFC] to-[#E8F4FD] shadow-lg border border-[#CBD5E1]">
                            <img
                              src={item.image || item.imageUrl || item.image_url || ""}
                              alt={item.productName || item.name}
                              className="w-full h-full object-fit group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2 sm:mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg sm:text-xl font-bold text-[#475569] truncate mb-1">
                                {item.productName || item.name}
                              </h3>
                              {item.brand && (
                                <p className="text-xs sm:text-sm text-[#64748B] font-medium">by {item.brand}</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeFromCart(item._id || item.id, item.selectedSize)}
                              className="flex-shrink-0 p-2.5 text-[#64748B] hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 ml-3"
                              title="Remove item"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <div className="space-y-2 sm:space-y-2 mb-3 sm:mb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <p className="text-lg sm:text-xl font-bold text-[#3B82F6]">
                                ₹{(item.price || item.rental_price || 0).toLocaleString()}
                              </p>
                              {item.selectedSize && (
                                <span className="px-2.5 py-1 bg-[#E8F4FD] text-[#3B82F6] text-xs font-medium rounded-full border border-[#CBD5E1] w-fit">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                              <span className="text-xs sm:text-sm text-[#64748B]">Quantity:</span>
                              <div className="flex items-center border border-[#CBD5E1] rounded-lg">
                                <button
                                  onClick={() => updateQuantity(item._id || item.id, item.selectedSize, (item.quantity || 1) - 1)}
                                  className="px-2 py-1 text-[#64748B] hover:text-[#475569] hover:bg-[#F8FAFC] transition-colors duration-200"
                                  disabled={item.quantity <= 1}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="px-3 py-1 text-sm font-semibold text-[#475569] min-w-[2rem] text-center">
                                  {item.quantity || 1}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item._id || item.id, item.selectedSize, (item.quantity || 1) + 1)}
                                  className="px-2 py-1 text-[#64748B] hover:text-[#475569] hover:bg-[#F8FAFC] transition-colors duration-200"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                            <button
                              onClick={() => handleBuyNow(item)}
                              className="px-3 py-1.5 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white text-xs sm:text-sm font-medium rounded-md hover:from-[#1E3A8A] hover:to-[#2563EB] transition-all duration-200 flex items-center justify-center sm:justify-start"
                            >
                              <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                              </svg>
                              Buy Now
                            </button>
                            <div className="text-left sm:text-right">
                              <p className="text-xs text-[#64748B]">Subtotal</p>
                              <p className="text-sm font-semibold text-[#475569]">
                                ₹{((item.price || item.rental_price || 0) * (item.quantity || 1)).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#E8F4FD] rounded-2xl shadow-lg border border-[#CBD5E1] p-4 sm:p-6 sticky top-8 hover:shadow-xl transition-shadow duration-300">
                  <h2 className="text-lg sm:text-xl font-bold text-[#475569] mb-4 sm:mb-6 flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Order Summary
                  </h2>
                  
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Items ({cart.length})</span>
                      <span className="font-medium text-[#475569]">₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Delivery</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="border-t border-[#CBD5E1] pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-[#475569]">Total</span>
                        <span className="text-[#3B82F6]">₹{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/payment", { state: { orderPayload: { products: cart, totalPrice: totalPrice, address: { first_name: 'Guest', last_name: 'User', email: 'guest@example.com', phone_number: '0000000000', street_address: 'Address', city: 'City', state: 'State', postal_code: '000000', country: 'India' } } } })}
                    className="w-full px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white font-semibold rounded-xl hover:from-[#1E3A8A] hover:to-[#2563EB] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-[1.02] text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    Proceed to Checkout
                  </button>

                  <div className="mt-4 text-center">
                    <p className="text-xs text-[#64748B]">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Secure checkout with SSL encryption
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Bag;



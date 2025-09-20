import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import Popup from './Popup';
import { usePopup } from '../hooks/usePopup';

const API_URL = process.env.REACT_APP_API_URL || 'https://stylehub-backend-nu.vercel.app';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { popup, showPopup, hidePopup } = usePopup();
  const [orderData, setOrderData] = useState(null);
  const [razorpayConfig, setRazorpayConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get order data from location state
    if (location.state?.orderPayload) {
      setOrderData(location.state.orderPayload);
    } else {
      // If no order data, redirect to home
      navigate('/');
    }

    // Load Razorpay configuration
    loadRazorpayConfig();
  }, [location.state, navigate]);

  const loadRazorpayConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/razorpay/config`);
      if (response.data.success) {
        setRazorpayConfig(response.data.data);
      }
    } catch (error) {
      console.error('Error loading Razorpay config:', error);
      setError('Failed to load payment configuration');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async (amount, receipt) => {
    try {
      const response = await axios.post(`${API_URL}/api/razorpay/create-order`, {
        amount: amount,
        currency: 'INR',
        receipt: receipt,
        notes: {
          order_type: 'rental',
          customer_email: orderData?.address?.email
        }
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  };

  const verifyPayment = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
      console.log('Verifying payment with:', {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: razorpaySignature ? 'Present' : 'Missing'
      });

      const response = await axios.post(`${API_URL}/api/razorpay/verify-payment`, {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        orderData: {
          orderNumber: `ORD_${Date.now()}`,
          customerInfo: {
            firstName: orderData?.address?.first_name,
            lastName: orderData?.address?.last_name,
            email: orderData?.address?.email,
            phoneNumber: orderData?.address?.phone_number
          }
        }
      });

      console.log('Verification response:', response.data);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!orderData || !razorpayConfig) {
      setError('Payment data not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Calculate total amount
      const totalAmount = orderData.totalPrice || 0;
      if (totalAmount <= 0) {
        throw new Error('Invalid amount for payment');
      }

      // Create Razorpay order
      const receipt = `receipt_${Date.now()}`;
      const razorpayOrder = await createRazorpayOrder(totalAmount, receipt);

      // Razorpay options
      const options = {
        key: razorpayConfig.key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: razorpayConfig.name,
        description: razorpayConfig.description,
        image: razorpayConfig.image,
        order_id: razorpayOrder.id,
        prefill: {
          name: `${orderData.address?.first_name} ${orderData.address?.last_name}`,
          email: orderData.address?.email,
          contact: orderData.address?.phone_number
        },
        notes: {
          order_type: 'rental',
          receipt: receipt
        },
        theme: {
          color: '#3399cc'
        },
        handler: async function (response) {
          try {
            console.log('Razorpay response:', response);
            
            // Verify payment
            const verificationResult = await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            console.log('Verification result:', verificationResult);

            // Payment successful
            showPopup('Payment successful!', 'success');
            navigate('/Confirmorder', { 
              state: { 
                orderPayload: orderData,
                paymentData: verificationResult
              } 
            });
          } catch (error) {
            console.error('Payment verification error:', error);
            console.error('Error details:', error.response?.data);
            
            let errorMessage = 'Payment verification failed. Please contact support.';
            if (error.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
            
            showPopup(errorMessage, 'error');
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            console.log('Payment modal dismissed');
          }
        }
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!orderData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Order Data Found</h2>
            <p className="text-gray-600 mb-6">Please go back and try again.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded transition"
            >
              Go to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment</h1>
            <p className="text-gray-600">Complete your rental order</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                {orderData.products?.map((product, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="font-medium text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-600">Rental Price</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">₹{product.rental_price?.toFixed(2) || '0.00'}</p>
                      {product.security_deposit && (
                        <p className="text-sm text-gray-600">Deposit: ₹{product.security_deposit.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                    <span className="text-xl font-bold text-blue-600">₹{orderData.totalPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
              
              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><span className="font-medium">Name:</span> {orderData.address?.first_name} {orderData.address?.last_name}</p>
                  <p><span className="font-medium">Email:</span> {orderData.address?.email}</p>
                  <p><span className="font-medium">Phone:</span> {orderData.address?.phone_number}</p>
                  <p><span className="font-medium">Address:</span> {orderData.address?.street_address}, {orderData.address?.city}, {orderData.address?.state} - {orderData.address?.postal_code}</p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Payment Method</h3>
                <div className="flex items-center p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
                  <img 
                    src="https://razorpay.com/assets/razorpay-logo.svg" 
                    alt="Razorpay" 
                    className="h-8 mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-800">Razorpay</p>
                    <p className="text-sm text-gray-600">Secure payment gateway</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading || !razorpayConfig}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay ₹{orderData.totalPrice?.toFixed(2) || '0.00'}
                  </>
                )}
              </button>

              {/* Test Card Information */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">Test Mode - Use These Cards:</h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p><strong>Success:</strong> 4111 1111 1111 1111</p>
                  <p><strong>Failure:</strong> 4000 0000 0000 0002</p>
                  <p><strong>CVV:</strong> Any 3 digits</p>
                  <p><strong>Expiry:</strong> Any future date</p>
                </div>
              </div>

              {/* Security Note */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Your payment is secure and encrypted
                </p>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded transition"
            >
              Back to Checkout
            </button>
          </div>
        </div>
      </main>
      <Footer />

      <Popup 
        show={popup.show} 
        message={popup.message} 
        type={popup.type} 
        onClose={hidePopup} 
      />
    </>
  );
};

export default Payment;

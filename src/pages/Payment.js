import React, { useEffect, useState } from "react";
import axios from "axios";
import Popup from "../components/Popup";
import { usePopup } from "../hooks/usePopup";
import { API_URL } from "../config";

function Payment() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { popup, showPopup, hidePopup } = usePopup();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/payments`);
      setPayments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/payments/${paymentId}/status`, {
        status: newStatus
      });
      fetchPayments(); // Refresh the list
      setShowModal(false);
      setSelectedPayment(null);
    } catch (err) {
      console.error('Error updating payment status:', err);
      showPopup('Failed to update payment status', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800',
      'Refunded': 'bg-purple-100 text-purple-800',
      'Partially Refunded': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'Razorpay':
        return '💳';
      case 'Credit Card':
        return '💳';
      case 'Debit Card':
        return '💳';
      case 'PayPal':
        return '🅿️';
      case 'Bank Transfer':
        return '🏦';
      case 'Cash on Delivery':
        return '💰';
      case 'Digital Wallet':
        return '📱';
      default:
        return '💳';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-lg">{error}</div>
        <button 
          onClick={fetchPayments}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Payments Management</h1>
        <button 
          onClick={fetchPayments}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.paymentId}
                        </div>
                        <div className="text-sm text-gray-500">
                          Order: {payment.orderNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.customerInfo.firstName} {payment.customerInfo.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.customerInfo.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.customerInfo.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">
                          {getPaymentMethodIcon(payment.paymentMethod.type)}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.paymentMethod.type}
                          </div>
                          {payment.paymentMethod.details.method && (
                            <div className="text-sm text-gray-500">
                              {payment.paymentMethod.details.method}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Subtotal: ₹{payment.amount.subtotal}</div>
                        <div>Tax: ₹{payment.amount.tax}</div>
                        <div>Shipping: ₹{payment.amount.shipping}</div>
                        <div>Discount: ₹{payment.amount.discount}</div>
                        <div className="font-bold text-lg">Total: ₹{payment.amount.total}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>ID: {payment.transactionDetails.transactionId}</div>
                        {payment.transactionDetails.gatewayTransactionId && (
                          <div>Gateway: {payment.transactionDetails.gatewayTransactionId}</div>
                        )}
                        {payment.transactionDetails.gatewayName && (
                          <div>Gateway: {payment.transactionDetails.gatewayName}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Payment Status
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Payment: {selectedPayment.paymentId}
              </p>
              <div className="space-y-2">
                {['Pending', 'Processing', 'Completed', 'Failed', 'Cancelled', 'Refunded', 'Partially Refunded'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updatePaymentStatus(selectedPayment._id, status)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedPayment.status === status 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPayment(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Popup 
        show={popup.show} 
        message={popup.message} 
        type={popup.type} 
        onClose={hidePopup} 
      />
    </div>
  );
}

export default Payment;

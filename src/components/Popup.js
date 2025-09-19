import React, { useState, useEffect } from 'react';

const Popup = ({ show, message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`bg-white rounded-xl p-6 shadow-2xl max-w-md mx-4 transform transition-all duration-300 ${
        type === 'success' 
          ? 'border-l-4 border-green-500' 
          : 'border-l-4 border-red-500'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            type === 'success' 
              ? 'bg-green-100' 
              : 'bg-red-100'
          }`}>
            {type === 'success' ? (
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${
              type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {type === 'success' ? 'Success!' : 'Error!'}
            </h3>
            <p className={`text-sm ${
              type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;

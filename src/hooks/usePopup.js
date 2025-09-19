import { useState } from 'react';

export const usePopup = () => {
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
  };

  const hidePopup = () => {
    setPopup({ show: false, message: '', type: 'success' });
  };

  return { popup, showPopup, hidePopup };
};

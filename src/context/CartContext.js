import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("cart");
    }
  }, [cart]);


  const addToCart = (product) => {
    setCart((prev) => {
      const productId = product._id || product.id;
      const selectedSize = product.selectedSize || 'No Size';
      
      // Create a unique key combining product ID and selected size
      const uniqueKey = `${productId}-${selectedSize}`;
      
      // Check if the same product with the same size already exists
      const exists = prev.find((item) => {
        const itemId = item._id || item.id;
        const itemSize = item.selectedSize || 'No Size';
        return `${itemId}-${itemSize}` === uniqueKey;
      });
      
      if (exists) {
        // If same product with same size exists, increase quantity
        return prev.map((item) => {
          const itemId = item._id || item.id;
          const itemSize = item.selectedSize || 'No Size';
          const itemKey = `${itemId}-${itemSize}`;
          
          if (itemKey === uniqueKey) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
      }
      
      // If it's a new product or same product with different size, add as new item
      return [...prev, { 
        ...product, 
        quantity: 1,
        cartKey: uniqueKey // Add unique key for easier identification
      }];
    });
  };
  
  const removeFromCart = (id, selectedSize = null) => {
    setCart((prev) => {
      if (selectedSize) {
        // If size is provided, remove specific product-size combination
        const productId = id;
        const size = selectedSize || 'No Size';
        const uniqueKey = `${productId}-${size}`;
        
        return prev.filter((item) => {
          const itemId = item._id || item.id;
          const itemSize = item.selectedSize || 'No Size';
          const itemKey = `${itemId}-${itemSize}`;
          return itemKey !== uniqueKey;
        });
      } else {
        // Fallback to old behavior for backward compatibility
        return prev.filter((item) => (item._id || item.id) !== id);
      }
    });
  };
  const updateQuantity = (id, selectedSize, newQuantity) => {
    setCart((prev) => {
      const productId = id;
      const size = selectedSize || 'No Size';
      const uniqueKey = `${productId}-${size}`;
      
      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        return prev.filter((item) => {
          const itemId = item._id || item.id;
          const itemSize = item.selectedSize || 'No Size';
          const itemKey = `${itemId}-${itemSize}`;
          return itemKey !== uniqueKey;
        });
      }
      
      // Update quantity for specific product-size combination
      return prev.map((item) => {
        const itemId = item._id || item.id;
        const itemSize = item.selectedSize || 'No Size';
        const itemKey = `${itemId}-${itemSize}`;
        
        if (itemKey === uniqueKey) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price || item.rental_price || 0) * item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

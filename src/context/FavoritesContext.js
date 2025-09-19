import React, { createContext, useState, useEffect } from "react";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
 
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem("favorites");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (product) => {
    setFavorites((prevFavorites) => {
      const productId = product._id || product.id;
      const exists = prevFavorites.find((item) => (item._id || item.id) === productId);
      if (exists) {
        return prevFavorites.filter((item) => (item._id || item.id) !== productId);
      } else {
        return [...prevFavorites, product];
      }
    });
  };

  const isFavorite = (productId) => {
    return favorites.some((item) => (item._id || item.id) === productId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

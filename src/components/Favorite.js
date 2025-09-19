import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { FavoritesContext } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Popup from "./Popup";
import { usePopup } from "../hooks/usePopup";
import { API_URL } from "../config";

const Favorite = () => {
    const { favorites, toggleFavorite } = useContext(FavoritesContext);
    const { addToCart } = useCart();
    const { popup, showPopup, hidePopup } = usePopup();

    const handleAddToCart = (product) => {
        // For favorites, we'll add with a default size or let user select
        const productWithSize = {
            ...product,
            selectedSize: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'One Size'
        };
        addToCart(productWithSize);
        showPopup("Product added to bag!", 'success');
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#E8F4FD] to-[#F1F5F9]">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-[#93C5FD] via-white to-[#3B82F6] border-b border-[#CBD5E1]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#475569] via-[#3B82F6] to-[#475569] bg-clip-text text-transparent flex items-center">
                                    <svg className="w-8 h-8 mr-3 text-[#3B82F6]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                    My Favorites
                                </h1>
                                <p className="text-[#64748B] mt-2">
                                    {favorites.length > 0 ? `${favorites.length} item${favorites.length > 1 ? 's' : ''} saved` : 'No items saved yet'}
                                </p>
                            </div>
                            {favorites.length > 0 && (
                                <div className="text-right">
                                    <p className="text-sm text-[#64748B]">Total Value</p>
                                    <p className="text-2xl font-bold text-[#3B82F6]">
                                        ₹{favorites.reduce((total, item) => total + (item.price || item.rental_price || 0), 0).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {favorites.length === 0 ? (
                        /* Empty Favorites State */
                        <div className="text-center py-16">
                            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#E8F4FD] to-[#93C5FD] rounded-full flex items-center justify-center mb-6 shadow-lg border border-[#CBD5E1]">
                                <svg className="w-12 h-12 text-[#3B82F6]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-[#475569] mb-2">No favorites yet</h3>
                            <p className="text-[#64748B] mb-8 max-w-md mx-auto">
                                Start exploring our products and add items to your favorites to see them here!
                            </p>
                            <button
                                onClick={() => window.history.back()}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] hover:from-[#1E3A8A] hover:to-[#2563EB] text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        /* Favorites Grid */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {favorites.map((product) => (
                                <div key={product._id || product.id} className="group bg-gradient-to-br from-white via-[#F8FAFC] to-[#E8F4FD] rounded-2xl shadow-lg border border-[#CBD5E1] overflow-hidden hover:shadow-xl hover:border-[#94A3B8] transition-all duration-300">
                                    {/* Product Image */}
                                    <div className="relative">
                                        <div className="aspect-square overflow-hidden bg-gradient-to-br from-[#F8FAFC] to-[#E8F4FD]">
                                            <img 
                                                src={(() => {
                                                    // Handle single image field
                                                    const imageSrc = product.image;
                                                    if (!imageSrc) return "";
                                                    
                                                    // Construct proper image URL - backend serves static files from /uploads route
                                                    if (imageSrc.startsWith('http')) {
                                                        return imageSrc; // Full URL
                                                    } else if (imageSrc.startsWith('/uploads/')) {
                                                        return `${API_URL}${imageSrc}`; // Backend serves from /uploads route
                                                    } else if (imageSrc.startsWith('/')) {
                                                        return `${API_URL}${imageSrc}`; // Other relative paths
                                                    } else {
                                                        return `${API_URL}/uploads/products/${imageSrc}`; // Just filename
                                                    }
                                                })()} 
                                                alt={product.productName || product.name} 
                                                className="w-full h-full object-fit group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    console.error('Favorite image failed to load:', e.target.src);
                                                    // Try alternative URL formats
                                                    const originalSrc = product.image;
                                                    if (originalSrc) {
                                                        let altUrl;
                                                        if (originalSrc.startsWith('/uploads/')) {
                                                            altUrl = `${API_URL}${originalSrc}`;
                                                        } else if (originalSrc.startsWith('/')) {
                                                            altUrl = `${API_URL}${originalSrc}`;
                                                        } else {
                                                            altUrl = `${API_URL}/uploads/products/${originalSrc}`;
                                                        }
                                                        console.log('Trying alternative favorite image URL:', altUrl);
                                                        e.target.src = altUrl;
                                                    } else {
                                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
                                                    }
                                                }}
                                            />
                                        </div>
                                        
                                        {/* Remove from Favorites Button */}
                                        <button
                                            onClick={() => toggleFavorite(product)}
                                            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm text-[#3B82F6] hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 shadow-sm opacity-0 group-hover:opacity-100"
                                            title="Remove from favorites"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                            </svg>
                                        </button>

                                        {/* Quick Add to Cart Button */}
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] hover:from-[#1E3A8A] hover:to-[#2563EB] text-white rounded-full transition-all duration-200 shadow-sm opacity-0 group-hover:opacity-100"
                                            title="Add to cart"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Product Details */}
                                    <div className="p-4">
                                        <div className="mb-2">
                                            <h2 className="text-sm font-medium text-[#3B82F6] mb-1">{product.brand}</h2>
                                            <h3 className="text-lg font-bold text-[#475569] line-clamp-2 mb-2">
                                                {product.productName || product.name}
                                            </h3>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-4">
                                            <p className="text-xl font-bold text-[#3B82F6]">
                                                ₹{(product.price || product.rental_price || 0).toLocaleString()}
                                            </p>
                                            {product.sizes && product.sizes.length > 0 && (
                                                <p className="text-xs text-[#64748B] mt-1">
                                                    Available in {product.sizes.length} size{product.sizes.length > 1 ? 's' : ''}
                                                </p>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-2">
                                            <Link 
                                                to={`/Product/${product._id || product.id}`}
                                                className="block w-full text-center px-4 py-2 bg-gradient-to-r from-[#475569] to-[#64748B] hover:from-[#374151] hover:to-[#475569] text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                            >
                                                View Details
                                            </Link>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="w-full px-4 py-2 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] hover:from-[#1E3A8A] hover:to-[#2563EB] text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                                </svg>
                                                Add to Bag
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
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

export default Favorite;

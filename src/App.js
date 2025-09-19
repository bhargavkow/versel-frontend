import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Scrolltotop from './components/Scrolltotop';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About_us from './pages/About_us';
import ContactUs from './pages/ContactUs';
import Policy from './pages/Policy';

import Help from './pages/Help';
import Product from './components/Product';
import Favorite from './components/Favorite';
import Bag from './components/Bag';
import SearchResults from './components/SearchResults';
import Profile from './components/Profile';
import Buy from './components/Buy';
import Payment from './components/Payment';
import Confirmorder from './components/Confirmorder';
import DynamicProductDisplay from './components/DynamicProductDisplay';

import Adminform from './admin/Adminform';
import Admin from "./admin/Admin";

import { FavoritesProvider } from './context/FavoritesContext';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  const isAdminLoggedIn = !!localStorage.getItem("admin_token"); // Check token

  return (
    <Router>
      <Scrolltotop />
      <UserProvider>
        <CartProvider>
          <FavoritesProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/About_us" element={<About_us />} />
              <Route path="/ContactUs" element={<ContactUs />} />
              <Route path="/Policy" element={<Policy />} />
              <Route path="/Help" element={<Help />} />
              <Route path="/Product/:id" element={<Product />} />
              <Route path="/category/:categoryId" element={<DynamicProductDisplay />} />
              <Route path="/category/:categoryId/subcategory/:subcategoryId" element={<DynamicProductDisplay />} />
              <Route path="/Favorite" element={<Favorite />} />
              <Route path="/Bag" element={<Bag />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/Profile" element={<Profile />} />
              <Route path="/buy" element={<Buy />} />
              <Route path="/buy/:id" element={<Buy />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/Confirmorder" element={<Confirmorder />} />

              <Route
                path="/admin"
                element={
                  isAdminLoggedIn ? <Navigate to="/admin/dashboard" /> : <Adminform />
                }
              />
              <Route
                path="/admin/*"
                element={isAdminLoggedIn ? <Admin /> : <Navigate to="/admin" />}
              />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </FavoritesProvider>
        </CartProvider>
      </UserProvider>
    </Router>
  );
}

export default App;

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTachometerAlt, faShoppingCart, faCreditCard, faUsers, faPlusCircle, faImages, faTags, faMapMarkerAlt, faQuestionCircle, faHome, faLayerGroup, faCamera } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/Sidebar";
import Dashboard from "../pages/Dashboard";
import Order from "../pages/Order";
import Payment from "../pages/Payment";
import Users from "../pages/Users";
import Addproduct from "../admin/Addproduct";
import CarouselManager from "../admin/CarouselManager";
import CategoryManager from "../admin/categorymanager";
import SubcategoryManager from "../admin/SubcategoryManager";
import HomepageCategoryManager from "../admin/HomepageCategoryManager";
import LocationManager from "../admin/LocationManager";
import FAQManagement from "./FAQManagement";
import PhotoCarouselManager from "./PhotoCarouselManager";
import Adminform from "./Adminform";

function Admin() {
  const [page, setPage] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("admin_token"));

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const renderPage = () => {
    switch (page) {
      case "order":
        return <Order />;
      case "payment":
        return <Payment />;
      case "users":
        return <Users />;
      case "Addproduct":
        return <Addproduct />;
      case "carousel":
        return <CarouselManager />;
      case "categories":
        return <CategoryManager />;
      case "subcategories":
        return <SubcategoryManager />;
      case "homepage-categories":
        return <HomepageCategoryManager />;
      case "locations":
        return <LocationManager />;
      case "faqs":
        return <FAQManagement />;
      case "photo-carousel":
        return <PhotoCarouselManager />;
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <Adminform onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar with clickable icons */}
      <div className="w-64 bg-gray-800 text-white p-6 shadow-lg space-y-6">
        <div className="space-y-4">
          <SidebarIcon
            icon={<FontAwesomeIcon icon={faTachometerAlt} />}
            label="Dashboard"
            onClick={() => setPage("dashboard")}
          />
          <SidebarIcon
            icon={<FontAwesomeIcon icon={faShoppingCart} />}
            label="Orders"
            onClick={() => setPage("order")}
          />
          <SidebarIcon
            icon={<FontAwesomeIcon icon={faCreditCard} />}
            label="Payments"
            onClick={() => setPage("payment")}
          />
          <SidebarIcon
            icon={<FontAwesomeIcon icon={faUsers} />}
            label="Users"
            onClick={() => setPage("users")}
          />
          <SidebarIcon
            icon={<FontAwesomeIcon icon={faPlusCircle} />}
            label="Add Product"
            onClick={() => setPage("Addproduct")}
          />
          <SidebarIcon
            icon={<FontAwesomeIcon icon={faImages} />}
            label="Carousel Images"
            onClick={() => setPage("carousel")}
          />
          <SidebarIcon
            icon={<FontAwesomeIcon icon={faCamera} />}
            label="Photo Carousel"
            onClick={() => setPage("photo-carousel")}
          />
          <SidebarIcon
            icon={<FontAwesomeIcon icon={faTags} />}
            label="Categories"
            onClick={() => setPage("categories")}
          />
          <SidebarIcon
            icon={<FontAwesomeIcon icon={faLayerGroup} />}
            label="Subcategories"
            onClick={() => setPage("subcategories")}
          />
          <SidebarIcon
            icon={<FontAwesomeIcon icon={faHome} />}
            label="Homepage Categories"
            onClick={() => setPage("homepage-categories")}
          />
          <SidebarIcon
            icon={<FontAwesomeIcon icon={faMapMarkerAlt} />}
            label="Locations"
            onClick={() => setPage("locations")}
          />
          <SidebarIcon
            icon={<FontAwesomeIcon icon={faQuestionCircle} />}
            label="FAQs"
            onClick={() => setPage("faqs")}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50 overflow-auto">
        <div className="bg-white shadow-xl rounded-lg p-6 space-y-6">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

const SidebarIcon = ({ icon, label, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 p-2 rounded-lg"
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};

export default Admin;

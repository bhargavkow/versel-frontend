import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Popup from "./Popup";
import { usePopup } from "../hooks/usePopup";
import axios from "axios";

const API_BASE = "http://localhost:5000/address";

const Buy = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cartCtx = useCart();
  const { popup, showPopup, hidePopup } = usePopup();
  const addToCart = cartCtx?.addToCart ?? (() => {});

  let initialProduct = null;
  try {
    initialProduct =
      location.state?.product ??
      JSON.parse(localStorage.getItem("buy_product") || "null");
  } catch (e) {
    initialProduct = location.state?.product ?? null;
  }

  const [product, setProduct] = useState(initialProduct);
  const isMultiple = Array.isArray(product);
  const products = isMultiple ? product : product ? [product] : [];
  const [addresses, setAddresses] = useState([]);
  const [addingNewAddress, setAddingNewAddress] = useState(false);
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    id: null,
    address_type: "shipping",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    phone_number: "",
    first_name: "",
    last_name: "",
    email: "",
    isDefault: false,
  });
  const [processing, setProcessing] = useState(false);

  // Save selected product in localStorage
  useEffect(() => {
    if (product) {
      try {
        localStorage.setItem("buy_product", JSON.stringify(product));
      } catch (e) {}
    }
  }, [product]);

  // Fetch addresses and auto-select default
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await axios.get(`${API_BASE}/addresse`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        });
        const fetched = res.data || [];
        setAddresses(fetched);

        // check localStorage for default
        const storedDefault = localStorage.getItem("default_address");
        if (storedDefault) {
          const parsed = JSON.parse(storedDefault);
          const match = fetched.find((a) => a.id === parsed.id);
          if (match) {
            setAddress(match);
          }
        } else {
          const def = fetched.find((a) => a.isDefault);
          if (def) setAddress(def);
        }
      } catch (err) {
        console.error("Failed to fetch addresses", err);
      }
    };
    fetchAddresses();
  }, []);

  const getName = (p) =>
    p?.name || p?.cloth_name || p?.clothName || p?.title || "Product";

  const parseNumber = (val) => {
    if (val == null) return 0;
    if (typeof val === "number") return val;
    const n = parseFloat(String(val).replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const totalPrice = products.reduce(
    (sum, p) =>
      sum +
      (parseNumber(p?.rental_price ?? p?.rentalPrice ?? p?.price) +
        parseNumber(
          p?.security_deposit ?? p?.securityDeposit ?? p?.deposit
        )),
    0
  );

  if (!products.length) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nothing to buy — product not found</h2>
            <p className="text-gray-600 mb-6">
              You tried to open the purchase page without selecting a product.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => navigate(-1)} 
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => navigate("/")} 
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Home
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Save address as default
  const setDefaultAddress = (addr) => {
    setAddress(addr);
    localStorage.setItem("default_address", JSON.stringify(addr));
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === addr.id,
      }))
    );
  };

  const validateAddress = () => {
    if (!address.first_name.trim()) return showPopup("Enter first name.", 'error');
    if (!address.last_name.trim()) return showPopup("Enter last name.", 'error');
    if (!/\S+@\S+\.\S+/.test(address.email))
      return showPopup("Enter a valid email.", 'error');
    if (!/^\d{10}$/.test(address.phone_number))
      return showPopup("Enter a valid 10 digit phone number.", 'error');
    if (!address.street_address.trim()) return showPopup("Enter street address.", 'error');
    if (!address.city.trim()) return showPopup("Enter city.", 'error');
    if (!address.state.trim()) return showPopup("Enter state.", 'error');
    if (!/^[1-9][0-9]{5}$/.test(address.postal_code))
      return showPopup("Enter a valid 6 digit postal code.", 'error');
    if (!address.country.trim()) return showPopup("Enter country.", 'error');
    return true;
  };

  const handleAddressNext = () => {
    if (!validateAddress()) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirm = async () => {
    setProcessing(true);

    const orderPayload = {
      products: products.map((p) => ({
        id: p?.id ?? p?.cloth_id ?? p?.clothId,
        name: getName(p),
        rental_price: parseNumber(
          p?.rental_price ?? p?.rentalPrice ?? p?.price
        ),
        security_deposit: parseNumber(
          p?.security_deposit ?? p?.securityDeposit ?? p?.deposit
        ),
      })),
      totalPrice,
      address,
    };

    try {
      products.forEach((p) => {
        try {
          addToCart({ ...p, orderMeta: orderPayload });
        } catch (e) {}
      });

      await new Promise((res) => setTimeout(res, 900));
      localStorage.removeItem("buy_product");

      setProcessing(false);
      // Navigate to payment page instead of directly to confirm order
      navigate("/payment", { state: { orderPayload } });
    } catch (err) {
      setProcessing(false);
      showPopup("Something went wrong. Please try again.", 'error');
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">Checkout</h2>
                  <div className="flex space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>1</div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>2</div>
                  </div>
                </div>

              {/* STEP 1: Address */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800">1. Shipping Address</h3>

                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          address.id === addr.id 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          setAddress({ ...addr });
                          setAddingNewAddress(false);
                        }}
                      >
                        <p className="font-semibold text-gray-800">
                          {addr.first_name} {addr.last_name} ({addr.address_type})
                        </p>
                        <p className="text-gray-600">
                          {addr.street_address}, {addr.city}, {addr.state}, {addr.postal_code}, {addr.country}
                        </p>
                        <p className="text-gray-600">Email: {addr.email}</p>
                        <p className="text-gray-600">Phone: {addr.phone_number}</p>
                        <div className="mt-2 flex justify-between items-center">
                          {addr.isDefault && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Default</span>
                          )}
                          {!addr.isDefault && (
                            <button
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDefaultAddress(addr);
                              }}
                            >
                              Make Default
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                    onClick={() => setAddingNewAddress(!addingNewAddress)}
                  >
                    {addingNewAddress ? "Cancel" : "Add New Address"}
                  </button>

                  {addingNewAddress && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <input
                        placeholder="First Name"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={address.first_name}
                        onChange={(e) =>
                          setAddress({ ...address, first_name: e.target.value })
                        }
                      />
                      <input
                        placeholder="Last Name"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={address.last_name}
                        onChange={(e) =>
                          setAddress({ ...address, last_name: e.target.value })
                        }
                      />
                      <input
                        placeholder="Email"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={address.email}
                        onChange={(e) =>
                          setAddress({ ...address, email: e.target.value })
                        }
                      />
                      <input
                        placeholder="Phone Number"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={address.phone_number}
                        onChange={(e) =>
                          setAddress({
                            ...address,
                            phone_number: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          })
                        }
                      />
                      <input
                        placeholder="Street Address"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={address.street_address}
                        onChange={(e) =>
                          setAddress({
                            ...address,
                            street_address: e.target.value,
                          })
                        }
                      />
                      <input
                        placeholder="City"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={address.city}
                        onChange={(e) =>
                          setAddress({ ...address, city: e.target.value })
                        }
                      />
                      <input
                        placeholder="State"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={address.state}
                        onChange={(e) =>
                          setAddress({ ...address, state: e.target.value })
                        }
                      />
                      <input
                        placeholder="Postal Code"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={address.postal_code}
                        onChange={(e) =>
                          setAddress({
                            ...address,
                            postal_code: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6),
                          })
                        }
                      />
                      <input
                        placeholder="Country"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={address.country}
                        onChange={(e) =>
                          setAddress({ ...address, country: e.target.value })
                        }
                      />
                      <div className="md:col-span-2 flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={address.isDefault}
                          onChange={(e) =>
                            setAddress({ ...address, isDefault: e.target.checked })
                          }
                        />
                        <label className="text-sm text-gray-700">Set as default address</label>
                      </div>
                    </div>
                  )}

                  <button 
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200" 
                    onClick={handleAddressNext}
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* STEP 2: Review */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800">2. Review & Confirm</h3>
                  <div className="space-y-3 text-gray-700">
                    <p>
                      <span className="font-semibold">Address Type:</span> {address.address_type}
                    </p>
                    <p>
                      <span className="font-semibold">Ship to:</span> {address.first_name} {address.last_name}, {address.street_address}, {address.city}, {address.state}, {address.postal_code}, {address.country}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span> {address.email}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span> {address.phone_number}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-2xl font-bold text-blue-800">Total: ₹{totalPrice.toFixed(2)}</h3>
                  </div>
                  <div className="flex space-x-4">
                    <button 
                      className="flex-1 py-3 px-6 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors" 
                      onClick={() => setStep(1)}
                    >
                      Back
                    </button>
                    <button
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      onClick={handleConfirm}
                      disabled={processing}
                    >
                      {processing ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        "Confirm Order"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h3>
              <div className="space-y-4">
                {products.map((item, idx) => {
                  const imageSrc =
                    item.image ||
                    item.image_url ||
                    item.imageUrl ||
                    (item.gallery?.[0] ?? "");
                  const rentalPrice = parseNumber(
                    item?.rental_price ?? item?.rentalPrice ?? item?.price
                  );
                  const securityDeposit = parseNumber(
                    item?.security_deposit ?? item?.securityDeposit ?? item?.deposit
                  );
                  return (
                    <div key={idx} className="flex space-x-4 p-3 bg-gray-50 rounded-lg">
                      {imageSrc ? (
                        <img 
                          src={imageSrc} 
                          alt={getName(item)} 
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                          No image
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{getName(item)}</h4>
                        <p className="text-sm text-gray-600">Rental: ₹{rentalPrice.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Deposit: ₹{securityDeposit.toFixed(2)}</p>
                        <p className="text-sm font-semibold text-gray-800">
                          Subtotal: ₹{(rentalPrice + securityDeposit).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Grand Total: ₹{totalPrice.toFixed(2)}</h2>
              </div>
            </div>
          </aside>
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

export default Buy;





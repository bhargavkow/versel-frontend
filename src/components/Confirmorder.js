import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const ConfirmOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const orderPayload =
    location.state?.orderPayload ||
    JSON.parse(localStorage.getItem("orderPayload")) ||
    {};

  React.useEffect(() => {
    if (orderPayload && Object.keys(orderPayload).length > 0) {
      localStorage.setItem("orderPayload", JSON.stringify(orderPayload));
    }
  }, [orderPayload]);

  const { address, products, totalPrice } = orderPayload;

  const getName = (p) =>
    p?.name || p?.cloth_name || p?.clothName || p?.title || "Product";

  const formatPrice = (price) => {
    return price && !isNaN(price) ? price.toFixed(2) : "0.00";
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Order Confirmation
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Shipping Address */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Shipping Address
              </h3>
              <div className="space-y-2 text-gray-600">
                <p>
                  <strong>Address Type:</strong> {address?.address_type}
                </p>
                <p>
                  <strong>Name:</strong> {address?.first_name}{" "}
                  {address?.last_name}
                </p>
                <p>
                  <strong>Street Address:</strong> {address?.street_address}
                </p>
                <p>
                  <strong>City:</strong> {address?.city}, {address?.state}{" "}
                  {address?.postal_code}
                </p>
                <p>
                  <strong>Country:</strong> {address?.country}
                </p>
                <p>
                  <strong>Email:</strong> {address?.email}
                </p>
                <p>
                  <strong>Phone:</strong> {address?.phone_number}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Order Summary
              </h3>
              <div className="space-y-6">
                {products?.map((item, idx) => {
                  const imageSrc =
                    item.image ||
                    item.image_url ||
                    item.imageUrl ||
                    item.gallery?.[0] ||
                    "";
                  const rentalPrice =
                    item?.rental_price ?? item?.rentalPrice ?? item?.price;
                  const securityDeposit =
                    item?.security_deposit ??
                    item?.securityDeposit ??
                    item?.deposit;

                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-4 border-b pb-4"
                    >
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={getName(item)}
                          className="w-24 h-24 object-fit rounded"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-sm text-gray-500 rounded">
                          No image
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {getName(item)}
                        </h4>
                        <p>Rental: ₹{formatPrice(rentalPrice)}</p>
                        <p>Deposit: ₹{formatPrice(securityDeposit)}</p>
                        <p className="font-medium">
                          Subtotal: ₹
                          {formatPrice(rentalPrice + securityDeposit)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <h2 className="text-2xl font-bold mt-6 text-gray-800">
                Total Price: ₹{formatPrice(totalPrice)}
              </h2>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-10 flex flex-col md:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/Bag")}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded transition"
            >
              Go to Bag
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded transition"
            >
              Go to Home
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ConfirmOrder;

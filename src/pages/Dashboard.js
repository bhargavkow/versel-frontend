import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Dashboard Overview</h1>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
        >
          Logout
        </button>
      </div>

      <p className="mt-4 text-gray-700">Quick stats about orders, users, and payments.</p>

      <div className="flex gap-6 mt-8">
        <div className="p-6 bg-gray-100 rounded-lg shadow-lg w-1/3">
          <h3 className="text-xl font-medium text-gray-800">Orders</h3>
          <p className="text-2xl font-bold text-gray-900">120</p>
        </div>
        <div className="p-6 bg-gray-100 rounded-lg shadow-lg w-1/3">
          <h3 className="text-xl font-medium text-gray-800">Payments</h3>
          <p className="text-2xl font-bold text-gray-900">$12,500</p>
        </div>
        <div className="p-6 bg-gray-100 rounded-lg shadow-lg w-1/3">
          <h3 className="text-xl font-medium text-gray-800">Users</h3>
          <p className="text-2xl font-bold text-gray-900">85</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React from "react";

const Sidebar = ({ setPage }) => {
  return (
    <div className="sidebar">
      <h2 className="logo">Admin Panel</h2>
      <ul>
        <li onClick={() => setPage("dashboard")}>Dashboard</li>
        <li onClick={() => setPage("order")}>Orders</li>
        <li onClick={() => setPage("payment")}>Payments</li>
        <li onClick={() => setPage("users")}>Users</li>
        <li onClick={() => setPage("Addproduct")}>Add Product</li>
      </ul>
    </div>
  );
};

export default Sidebar;

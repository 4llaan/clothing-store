import React from "react";
import "./CSS/Admin.css";
import Sidebar from "../Components/Sidebar/Sidebar";
import AddProduct from "../Components/AddProduct/AddProduct";
import { Route, Routes } from "react-router-dom";
import ListProduct from "../Components/ListProduct/ListProduct";
import ListUser from "../Components/ListUser/ListUser"; 
import Orders from "../Components/Orders/Orders";
import SellerRequest from "../Components/SellerRequest/SellerRequest"

const Admin = () => {

  return (
    <div className="admin">
      <Sidebar />
      <Routes>
        <Route path="/addproduct" element={<AddProduct />} />
        <Route path="/listproduct" element={<ListProduct />} />
        <Route path="/listusers" element={<ListUser />} />
        <Route path="/Orders" element={<Orders />} />
        <Route path="/SellerRequest" element={<SellerRequest/>} />


      </Routes>
    </div>
  );
};

export default Admin;

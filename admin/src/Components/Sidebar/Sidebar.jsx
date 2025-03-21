import React from "react";
import './Sidebar.css';
import add_product_icon from '../Assets/Product_Cart.svg';
import list_product_icon from '../Assets/Product_list_icon.svg';
import users_icon from '../Assets/users_icon.svg';  // New icon for users
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <Link to='/addproduct' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={add_product_icon} alt="" />
          <p>Add Product</p>
        </div>
      </Link>
      <Link to='/listproduct' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={list_product_icon} alt="" />
          <p>Product List</p>
        </div>
      </Link>
      <Link to='/listusers' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={users_icon} alt="" />
          <p>All Users</p>
        </div>
      </Link>
      <Link to='/Orders' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={users_icon} alt="" />
          <p>Orders</p>
        </div>
      </Link>
      <Link to='/SellerRequest' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={users_icon} alt="" />
          <p>Seller Request</p>
        </div>
      </Link>
      <Link to='/ApprovedProducts' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={list_product_icon} alt="" />
          <p>Approved Products</p>
        </div>
      </Link>
    </div>
  )
}

export default Sidebar;

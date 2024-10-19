
import React, { useEffect, useState } from "react";
import "./CSS/ShopCategory.css";
import dropdown_icon from '../Components/Assets/dropdown_icon.png';
import Item from "../Components/Item/Item"; // Ensure this component links to product details
import { Link } from "react-router-dom";

const ShopCategory = (props) => {
  const [allproducts, setAllProducts] = useState([]);

  const fetchInfo = () => { 
    fetch('http://localhost:4000/allproducts') 
      .then((res) => res.json()) 
      .then((data) => setAllProducts(data));
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  return (
    <div className="shopcategory">
      <img src={props.banner} className="shopcategory-banner" alt="" />
      <div className="shopcategory-indexSort">
        <p><span>Showing 1 - 12</span> out of {allproducts.length} Products</p>
        <div className="shopcategory-sort">Sort by  <img src={dropdown_icon} alt="" /></div>
      </div>
      <div className="shopcategory-products">
        {allproducts.map((item, i) => {
          if (props.category === item.category) {
            return (
              <Link key={i} to={`/product/${item._id}`} style={{ textDecoration: 'none' }}>
                <Item 
                  id={item._id} // Use _id if that is the unique identifier
                  name={item.name} 
                  image={item.image}  
                  new_price={item.new_price} 
                  old_price={item.old_price} 
                />
              </Link>
            );
          } else {
            return null;
          }
        })}
      </div>
      <div className="shopcategory-loadmore">
        <Link to='/' style={{ textDecoration: 'none' }}>Explore More</Link>
      </div>
    </div>
  );
};

export default ShopCategory;
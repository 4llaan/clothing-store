import React, { useEffect, useState } from "react";
import "./CSS/ShopCategory.css";
import dropdown_icon from '../Components/Assets/dropdown_icon.png';
import Item from "../Components/Item/Item";
import { Link } from "react-router-dom";

const ShopCategory = (props) => {
  const [allproducts, setAllProducts] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [priceSortOrder, setPriceSortOrder] = useState("default"); // State for price sorting order

  const fetchInfo = () => { 
    fetch('http://localhost:4000/allproducts') 
      .then((res) => res.json()) 
      .then((data) => setAllProducts(data));
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  // Filtered products based on category and selected subcategory
  let filteredProducts = allproducts.filter(
    (item) => 
      props.category === item.category && 
      (selectedSubcategory === "All" || selectedSubcategory === item.subcategory)
  );

  // Sort products based on priceSortOrder
  if (priceSortOrder === "lowToHigh") {
    filteredProducts = filteredProducts.sort((a, b) => a.new_price - b.new_price);
  } else if (priceSortOrder === "highToLow") {
    filteredProducts = filteredProducts.sort((a, b) => b.new_price - a.new_price);
  }

  
  return (
    <div className="shopcategory">
      <img src={props.banner} className="shopcategory-banner" alt="" />
      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1 - {filteredProducts.length}</span> out of {filteredProducts.length} Products
        </p>
        
        {/* Dropdown for sorting by subcategory */}
        <div className="shopcategory-sort">Sort by :  <select
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="shopcategory-dropdown"
          >
            <option value="All">All</option>
            {Array.from(new Set(
              allproducts
                .filter(item => item.category === props.category)
                .map(item => item.subcategory)
            )).map((subcategory, index) => (
              <option key={index} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
        </div>

        {/* New Dropdown for sorting by price */}
        <div className="shopcategory-price-sort">
          Price : 
          
          <select
            onChange={(e) => setPriceSortOrder(e.target.value)}
            className="shopcategory-dropdown"
          >
            <option value="default">Default</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="shopcategory-products">
        {filteredProducts.map((item, i) => (
          <Link key={i} to={`/product/${item._id}`} style={{ textDecoration: 'none' }}>
            <Item 
              id={item._id} 
              name={item.name} 
              image={item.image}  
              new_price={item.new_price} 
              old_price={item.old_price} 
              subcategory={item.subcategory}
            />
          </Link>
        ))}
      </div>
      
      <div className="shopcategory-loadmore">
        <Link to='/' style={{ textDecoration: 'none' }}>Explore More</Link>
      </div>
    </div>
  );
};

export default ShopCategory;

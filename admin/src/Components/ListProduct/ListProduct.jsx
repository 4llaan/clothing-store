import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png'
import { backend_url, currency } from "../../App";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [error, setError] = useState(null);

  const fetchInfo = async () => {
    try {
      const response = await fetch(`${backend_url}/allproducts`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllProducts(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please check if the backend server is running.");
      setAllProducts([]);
    }
  }

  useEffect(() => {
    fetchInfo();
  }, [])

  const removeProduct = async (id) => {
    try {
      const response = await fetch(`${backend_url}/removeproduct`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchInfo();
    } catch (err) {
      console.error("Error removing product:", err);
      setError("Failed to remove product. Please try again.");
    }
  }

  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      {error && <div className="error-message" style={{color: 'red', padding: '10px'}}>{error}</div>}
      <div className="listproduct-format-main">
        <p>Products</p> <p>Title</p> <p>Old Price</p> <p>New Price</p> <p>Category</p> <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((e, index) => (
          <div key={index}>
            <div className="listproduct-format-main listproduct-format">
              <img className="listproduct-product-icon" src={backend_url + e.image} alt="" />
              <p className="cartitems-product-title">{e.name}</p>
              <p>{currency}{e.old_price || 0}</p>
              <p>{currency}{e.new_price || 0}</p>
              <p>{e.category}</p>
              <img className="listproduct-remove-icon" onClick={() => { removeProduct(e.id) }} src={cross_icon} alt="" />
            </div>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;

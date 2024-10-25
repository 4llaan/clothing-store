import React, { useContext, useState } from "react";
import "./ProductDisplay.css";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";

const ProductDisplay = ({ product }) => {
  const { addToCart } = useContext(ShopContext);
  const [selectedSize, setSelectedSize] = useState(null); // State to track selected size

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = (productId) => {
    if (!selectedSize) {
      alert("Please select a size before adding to the cart.");
      return;
    }
    addToCart(productId, selectedSize); // Pass selected size to the cart
    alert("Product added to cart!");
  };

  const handleBuyNow = (productId) => {
    if (!selectedSize) {
      alert("Please select a size before buying.");
      return;
    }
    // Proceed with the buy now logic here, passing selected size if necessary
    alert("Proceeding to checkout!");
  };

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img src={backend_url + product.image} alt="img" />
          <img src={backend_url + product.image} alt="img" />
          <img src={backend_url + product.image} alt="img" />
          <img src={backend_url + product.image} alt="img" />
        </div>
        <div className="productdisplay-img">
          <img className="productdisplay-main-img" src={backend_url + product.image} alt="img" />
        </div>
      </div>
      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        <div className="productdisplay-right-stars">
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_dull_icon} alt="" />
          <p>(122)</p>
        </div>
        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">{currency}{product.old_price}</div>
          <div className="productdisplay-right-price-new">{currency}{product.new_price}</div>
        </div>
        <div className="productdisplay-right-description">
          {product.description}
        </div>
        <div className="productdisplay-right-size">
          <h1>Select Size</h1>
          <div className="productdisplay-right-sizes">
            {["S", "M", "L", "XL", "XXL"].map((size) => (
              <div
                key={size}
                className={`size-option ${selectedSize === size ? "selected" : ""}`}
                onClick={() => handleSizeSelect(size)}
              >
                {size}
              </div>
            ))}
          </div>
        </div>
        <button className="productdisplay-buy-now" onClick={() => handleBuyNow(product.id)}>BUY NOW</button>
        <button className="productdisplay-add-to-cart" onClick={() => handleAddToCart(product.id)}>ADD TO CART</button>
        <p className="productdisplay-right-category">
          <span>Category :</span> {product.category} {product.subcategory ? `, ${product.subcategory}` : ""}
        </p>
        <p className="productdisplay-right-category"><span>Tags :</span> Modern, Latest</p>
      </div>
    </div>
  );
};

export default ProductDisplay;

import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import "./ProductDisplay.css";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";
import { useParams } from 'react-router-dom';

const ProductDisplay = () => {
  const { addToCart } = useContext(ShopContext);
  const { productId } = useParams(); // Get the product ID from the URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null); // State to track selected size
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${backend_url}/product/${productId}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = (productId) => {
    if (!localStorage.getItem("auth-token")) {
      alert("Please login to add items to cart");
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      alert("Please select a size before adding to the cart.");
      return;
    }
    addToCart(productId, selectedSize);
    alert("Product added to cart!");
  };

  const handleBuyNow = () => {
    if (!localStorage.getItem("auth-token")) {
      alert("Please login to continue");
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      alert("Please select a size before buying.");
      return;
    }
    
    navigate('/checkout', { 
      state: { 
        productDetails: {
          id: product._id,
          name: product.name,
          image: product.image,
          price: product.new_price,
          size: selectedSize,
          quantity: 1,
          description: product.description,
          category: product.category
        }
      }
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img src={`${backend_url}${product.image}`} alt={product.name} />
        </div>
        <div className="productdisplay-img">
          <img className="productdisplay-main-img" src={`${backend_url}${product.image}`} alt={product.name} />
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
        <div className="productdisplay-right-category">
          <span>Category: {product.category}</span>
          <br />
          <span>Subcategory: {product.subcategory}</span>
        </div>
        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">
            {currency}{product.old_price || 0}
          </div>
          <div className="productdisplay-right-price-new">
            {currency}{product.new_price || 0}
          </div>
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
        <button className="productdisplay-buy-now" onClick={handleBuyNow}>BUY NOW</button>
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

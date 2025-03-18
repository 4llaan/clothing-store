import React, { useState } from 'react';
import { backend_url } from '../App';
import './CSS/OrderReview.css'; // Create this file for styling

const OrderReview = ({ productDetails, onNext }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = Array.isArray(productDetails.images) ? productDetails.images : [productDetails.image];

  if (!productDetails) return <p>Loading product details...</p>;

  return (
    <div className="container py-5" style={{ padding: '20px' }}>
      <div className="card mb-3" style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <div className="card-body">
          <h5 className="card-title mb-4">Review Your Order</h5>
          
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="main-image">
              <img
                src={`${backend_url}${images[currentImageIndex]}`}
                alt={productDetails.name}
                style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="thumbnail-strip">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={`${backend_url}${image}`}
                      alt={`${productDetails.name} thumbnail ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="product-info mt-4">
            <h6 className="mb-2">{productDetails.name}</h6>
            <p className="text-muted mb-1">Category: {productDetails.category}</p>
            {productDetails.subcategory && (
              <p className="text-muted mb-1">Subcategory: {productDetails.subcategory}</p>
            )}
            <p className="text-muted mb-1">Size: {productDetails.size}</p>
            <p className="text-muted mb-1">Price: ₹{productDetails.price}</p>
            <p className="text-muted mb-0">Quantity: {productDetails.quantity}</p>
          </div>
          
          {/* Order Summary */}
          <div className="mt-4 pt-3 border-top">
            <div className="d-flex justify-content-between">
              <span>Subtotal:</span>
              <span>₹{productDetails.price * productDetails.quantity}</span>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="d-flex justify-content-between mt-2 fw-bold">
              <span>Total:</span>
              <span>₹{productDetails.price * productDetails.quantity}</span>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        className="btn btn-primary float-end" 
        onClick={onNext}
        style={{ 
          backgroundColor: '#007bff', 
          border: 'none', 
          padding: '10px 20px', 
          borderRadius: '5px', 
          color: '#fff' 
        }}
      >
        Continue to Shipping
      </button>
    </div>
  );
};

export default OrderReview; 
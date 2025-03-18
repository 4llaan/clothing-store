import React, { useContext, useState } from "react";
import "./CartItems.css";
import cross_icon from "../Assets/cart_cross_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";
import { useNavigate } from 'react-router-dom';
import ImageModal from '../ImageModal/ImageModal';

const CartItems = () => {
  const { products, thriftProducts, cartItems, removeFromCart, getTotalCartAmount, updateCartItemQuantity } = useContext(ShopContext);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!localStorage.getItem("auth-token")) {
      alert("Please login to checkout");
      return;
    }

    // Prepare cart items for review
    const checkoutItems = Object.entries(cartItems)
      .filter(([_, itemInfo]) => itemInfo && itemInfo.quantity > 0)
      .map(([productId, itemInfo]) => {
        const regularProduct = products.find((p) => p.id === Number(productId));
        const thriftProduct = thriftProducts.find((p) => p._id === productId);
        const product = regularProduct || thriftProduct;
        if (!product) return null;
        
        return {
          id: productId.toString(),
          name: product.name || product.productName,
          price: product.new_price || product.price,
          quantity: itemInfo.quantity,
          size: itemInfo.size || 'N/A',
          images: product.images || [product.image],
          subTotal: (product.new_price || product.price) * itemInfo.quantity,
          isThriftProduct: Boolean(thriftProduct)
        };
      })
      .filter(item => item !== null);

    if (checkoutItems.length === 0) {
      alert('No valid items in cart');
      return;
    }

    // Navigate to review page with cart items
    navigate('/review-order', {
      state: {
        cartItems: checkoutItems,
        totalAmount: getTotalCartAmount(),
        fromCart: true
      }
    });
  };

  return (
    <div className="cartitems">
      {selectedImage && (
        <ImageModal 
          image={`${backend_url}${selectedImage}`}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Size</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {Object.entries(cartItems).map(([itemId, itemInfo]) => {
        if (!itemInfo) return null;
        
        // Find product in either regular or thrift products
        const regularProduct = products.find((p) => p.id === Number(itemId));
        const thriftProduct = thriftProducts.find((p) => p._id === itemId);
        const product = regularProduct || thriftProduct;
        
        if (product && itemInfo.quantity > 0) {
          const productImages = product.images || [product.image];
          const productPrice = product.new_price || product.price;
          const productName = product.name || product.productName;
          const isThriftProduct = Boolean(thriftProduct);
          
          return (
            <div key={itemId}>
              <div className="cartitems-format-main cartitems-format">
                <div className="cartitems-product-images">
                  <img 
                    className="cartitems-product-icon" 
                    src={`${backend_url}${productImages[0]}`} 
                    alt={productName}
                    onClick={() => setSelectedImage(productImages[0])}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {productImages.length > 1 && (
                    <div className="cartitems-product-thumbnails">
                      {productImages.slice(1).map((image, index) => (
                        <img
                          key={index}
                          src={`${backend_url}${image}`}
                          alt={`${productName} view ${index + 2}`}
                          className="cartitems-thumbnail"
                          onClick={() => setSelectedImage(image)}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="cartitems-product-title">{productName}</p>
                <p>{itemInfo.size || 'N/A'}</p>
                <p>{currency}{productPrice}</p>
                <div className="cartitems-quantity-controls">
                  {isThriftProduct ? (
                    <p className="cartitems-quantity">1</p>
                  ) : (
                    <>
                      <button 
                        onClick={() => updateCartItemQuantity(itemId, itemInfo.quantity - 1)}
                        className="quantity-btn"
                        disabled={itemInfo.quantity <= 1}
                      >
                        -
                      </button>
                      <p className="cartitems-quantity">{itemInfo.quantity}</p>
                      <button 
                        onClick={() => updateCartItemQuantity(itemId, itemInfo.quantity + 1)}
                        className="quantity-btn"
                      >
                        +
                      </button>
                    </>
                  )}
                </div>
                <p>{currency}{productPrice * itemInfo.quantity}</p>
                <img
                  onClick={() => removeFromCart(itemId)}
                  className="cartitems-remove-icon"
                  src={cross_icon}
                  alt=""
                />
              </div>
              <hr />
            </div>
          );
        }
        return null;
      })}
      
      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>{currency}{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>{currency}{getTotalCartAmount()}</h3>
            </div>
          </div>
          <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cartitems-promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder="promo code" />
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;

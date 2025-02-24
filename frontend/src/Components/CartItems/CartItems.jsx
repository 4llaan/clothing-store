import React, { useContext } from "react";
import "./CartItems.css";
import cross_icon from "../Assets/cart_cross_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";
import { useNavigate } from 'react-router-dom';

const CartItems = () => {
  const { products, cartItems, removeFromCart, getTotalCartAmount, updateCartItemQuantity } = useContext(ShopContext);
  const navigate = useNavigate();

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
        const product = products.find(p => p.id === Number(productId));
        if (!product) return null;
        return {
          id: productId,
          name: product.name,
          price: product.new_price,
          quantity: itemInfo.quantity,
          size: itemInfo.size || 'N/A',
          image: product.image,
          subTotal: product.new_price * itemInfo.quantity
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
        totalAmount: getTotalCartAmount()
      }
    });
  };

  return (
    <div className="cartitems">
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
        const product = products.find((p) => p.id === Number(itemId));
        if (product && itemInfo.quantity > 0) {
          return (
            <div key={itemId}>
              <div className="cartitems-format-main cartitems-format">
                <img className="cartitems-product-icon" src={backend_url + product.image} alt="" />
                <p className="cartitems-product-title">{product.name}</p>
                <p>{itemInfo.size || 'N/A'}</p>
                <p>{currency}{product.new_price}</p>
                <div className="cartitems-quantity-controls">
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
                    
                  </button>
                </div>
                <p>{currency}{product.new_price * itemInfo.quantity}</p>
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

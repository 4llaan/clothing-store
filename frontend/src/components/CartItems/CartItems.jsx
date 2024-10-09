import React, { useContext } from 'react';
import './CartItem.css';
import { ShopContext } from '../../context/ShopContext';
import cart_cross_icon from '../Assets/cart_cross_icon.png';

const CartItems = () => {
  const { all_product, cartItems, removeFromCart } = useContext(ShopContext);

  // Log the cart items and product data for debugging
  console.log('All Products:', all_product);
  console.log('Cart Items:', cartItems);

  return (
    <div className='cartitems'>
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {all_product.map((e) => {
        if (cartItems[e.id] > 0) { // Check if the product has been added to the cart
          return (
            <div key={e.id}>
              <div className="cartitems-format">
                <img src={e.image} alt={e.name} className='carticon-product-icon' />
                <p>{e.name}</p>
                <p>Rs.{e.new_price}</p>
                <button className='carttitem-quality'>{cartItems[e.id]}</button>
                <p>Rs.{e.new_price * cartItems[e.id]}</p>
                <img
                  src={cart_cross_icon}
                  onClick={() => removeFromCart(e.id)}
                  alt="Remove"
                />
              </div>
              <hr />
            </div>
          );
        }
        return null; // Skip products not in the cart
      })}
   
   <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>${0}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>${0}</h3>
            </div>
          </div>
          <button>PROCEED TO CHECKOUT</button>
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

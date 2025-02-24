import React, { createContext, useEffect, useState } from "react";
import { backend_url } from "../App";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [userProfile, setUserProfile] = useState(null);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${backend_url}/api/profile`, {
        headers: {
          'auth-token': localStorage.getItem('auth-token')
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    // Fetch products first
    fetch(`${backend_url}/allproducts`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(err => console.error('Error fetching products:', err));

    // Then fetch cart data if user is logged in
    if (localStorage.getItem("auth-token")) {
      fetchUserProfile();
      fetch(`${backend_url}/getcart`, {
        method: 'POST',
        headers: {
          Accept: 'application/form-data',
          'auth-token': localStorage.getItem("auth-token"),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(),
      })
        .then((resp) => resp.json())
        .then((data) => { setCartItems(data || {}); })
        .catch(err => console.error('Error fetching cart:', err));
    }
  }, []);

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      if (cartItems[itemId] && cartItems[itemId].quantity) {
        const product = products.find((p) => p.id === Number(itemId));
        if (product) {
          const price = Number(product.new_price) || 0;
          totalAmount += cartItems[itemId].quantity * price;
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((total, item) => total + (item?.quantity || 0), 0);
  };

  const addToCart = (itemId, size) => {
    if (!localStorage.getItem("auth-token")) {
      alert("Please Login");
      return;
    }
    fetch(`${backend_url}/addtocart`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'auth-token': `${localStorage.getItem("auth-token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId, size }),
    })
    .then(response => response.json())
    .then(data => setCartItems(data || {}));
  };

  const removeFromCart = (itemId) => {
    fetch(`${backend_url}/removefromcart`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'auth-token': `${localStorage.getItem("auth-token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId }),
    })
    .then(response => response.json())
    .then(data => setCartItems(data || {}));
  };

  const updateCartItemQuantity = (itemId, quantity) => {
    if (!localStorage.getItem("auth-token")) {
      alert("Please Login");
      return;
    }
    
    fetch(`${backend_url}/updatecartquantity`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'auth-token': `${localStorage.getItem("auth-token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId, quantity }),
    })
    .then(response => response.json())
    .then(data => setCartItems(data || {}));
  };

  const contextValue = { products, getTotalCartItems, cartItems, addToCart, removeFromCart, getTotalCartAmount, updateCartItemQuantity, userProfile };
  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;

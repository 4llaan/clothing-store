import React, { createContext, useEffect, useState } from "react";
import { backend_url } from "../App";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
  const [products, setProducts] = useState([]);
  const [thriftProducts, setThriftProducts] = useState([]);
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
    // Fetch both regular and thrift products
    Promise.all([
      fetch(`${backend_url}/allproducts`).then(res => res.json()),
      fetch(`${backend_url}/api/seller-data/approved-products`).then(res => res.json())
    ])
    .then(([regularProducts, thriftData]) => {
      setProducts(regularProducts);
      setThriftProducts(thriftData.data || []);
    })
    .catch(err => console.error('Error fetching products:', err));

    // Fetch cart data if user is logged in
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
        // Check both regular and thrift products
        const regularProduct = products.find((p) => p.id === Number(itemId));
        const thriftProduct = thriftProducts.find((p) => p._id === itemId);
        const product = regularProduct || thriftProduct;

        if (product) {
          const price = Number(product.new_price || product.price) || 0;
          totalAmount += cartItems[itemId].quantity * price;
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((total, item) => total + (item?.quantity || 0), 0);
  };

  const addToCart = async (productId, size, isThriftProduct = false) => {
    if (!localStorage.getItem("auth-token")) {
      alert("Please Login");
      return;
    }

    try {
      // For thrift products, check if it's already in cart
      if (isThriftProduct && cartItems[productId]) {
        alert("Thrift items can only be added once");
        return;
      }

      const response = await fetch(`${backend_url}/addtocart`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem("auth-token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: productId, size, isThriftProduct }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      const data = await response.json();
      setCartItems(prev => ({
        ...prev,
        [productId]: {
          ...data,
          size,
          quantity: isThriftProduct ? 1 : (prev[productId]?.quantity || 0) + 1,
          isThriftProduct
        }
      }));
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const refreshCart = async () => {
    if (localStorage.getItem("auth-token")) {
      try {
        const response = await fetch(`${backend_url}/getcart`, {
          method: 'POST',
          headers: {
            Accept: 'application/form-data',
            'auth-token': localStorage.getItem("auth-token"),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(),
        });
        const data = await response.json();
        setCartItems(data || {});
      } catch (err) {
        console.error('Error refreshing cart:', err);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`${backend_url}/removefromcart`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem("auth-token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      });
      const data = await response.json();
      setCartItems(data || {});
      await refreshCart();
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const updateCartItemQuantity = (itemId, quantity) => {
    if (!localStorage.getItem("auth-token")) {
      alert("Please Login");
      return;
    }

    // Check if it's a thrift product
    const isThriftProduct = thriftProducts.find(p => p._id === itemId);
    if (isThriftProduct) {
      alert("Thrift items quantity cannot be modified");
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

  const contextValue = { 
    products, 
    thriftProducts,
    getTotalCartItems, 
    cartItems, 
    addToCart, 
    removeFromCart, 
    getTotalCartAmount, 
    updateCartItemQuantity, 
    userProfile,
    refreshCart
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;

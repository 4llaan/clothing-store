import React, { createContext, useState } from "react"; // Use createContext with a capital 'C'
import all_product from "../components/Assets/all_product.js";

export const ShopContext = createContext(null); // Corrected createContext

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < all_product.length+1; index++) {
      cart[index] = 0;
    }
    return cart;
  };


const ShopContextProvider = (props) => {
    const [cartItems,setCartItems] = useState(getDefaultCart());

    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        console.log(cartItems);

    }

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    }

    const contextValue = { all_product,cartItems,addToCart,removeFromCart }; // Renamed contextvalue to contextValue for consistency

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
}

export default ShopContextProvider;

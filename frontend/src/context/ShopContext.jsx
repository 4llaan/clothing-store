import React, { createContext } from "react"; // Use createContext with a capital 'C'
import all_product from "../components/Assets/all_product.js";

export const ShopContext = createContext(null); // Corrected createContext

const ShopContextProvider = (props) => {
     
    const contextValue = { all_product }; // Renamed contextvalue to contextValue for consistency
    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
}

export default ShopContextProvider;

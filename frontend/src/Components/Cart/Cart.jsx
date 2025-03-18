const handleCheckout = () => {
    // Convert cart items to array and add necessary information
    const checkoutItems = Object.entries(cartItems).map(([id, item]) => {
        // Find if this is a thrift product
        const thriftProduct = thriftProducts.find(p => p._id === id);
        
        return {
            id: id,
            ...item,
            isThriftProduct: Boolean(thriftProduct) // Will be true if found in thrift products
        };
    });

    navigate('/review-order', {
        state: {
            cartItems: checkoutItems,
            totalAmount: getTotalCartAmount(),
            fromCart: true
        }
    });
}; 
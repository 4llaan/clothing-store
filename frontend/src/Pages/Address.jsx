import React, { useContext, useEffect } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { backend_url } from '../App';

const Address = ({ address, setAddress, onNext, productDetails }) => {
  const { userProfile } = useContext(ShopContext);

  useEffect(() => {
    if (userProfile && !address.name && !address.email) {
      setAddress(prev => ({
        ...prev,
        name: userProfile.name || '',
        email: userProfile.email || ''
      }));
    }
  }, [userProfile, setAddress, address.name, address.email]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value
    }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  
  const handlePayment = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load Razorpay. Check your internet connection.");
      return;
    }
  
    try {
      const amount = productDetails.price * productDetails.quantity * 100; // Convert to paise
      
      const response = await fetch(`${backend_url}/api/orders/create-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem("auth-token")
        },
        body: JSON.stringify({
          amount,
          currency: "INR"
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Order creation failed');
      }
  
      const options = {
        key: "rzp_test_7qXqryRXwyy9GP",
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: "Your Shop Name",
        description: "Order Payment",
        handler: async (response) => {
          try {
            const paymentPayload = {
              ...address,
              paymentId: response.razorpay_payment_id,
              amount: data.order.amount / 100,
              products: [{
                ...productDetails,
                size: productDetails.size,
                subTotal: productDetails.price * productDetails.quantity
              }]
            };
  
            const saveResponse = await fetch(`${backend_url}/api/orders/save`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem("auth-token")
              },
              body: JSON.stringify(paymentPayload)
            });
  
            const saveData = await saveResponse.json();
            if (saveData.success) {
              alert("Payment Successful! Order placed.");
              onNext();
            } else {
              alert(saveData.message || "Error saving order details.");
            }
          } catch (error) {
            console.error("Error saving order:", error);
            alert("Error saving order details. Please contact support.");
          }
        },
        theme: { color: "#3399cc" }
      };
  
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert(error.message || "Payment failed. Please try again.");
    }
  };
  

  return (
    <div style={{ padding: '20px' }}>
      {/* Order Summary */}
      <div className="order-summary" style={{ 
        marginBottom: '20px', 
        padding: '15px',
        border: '1px solid #eee',
        borderRadius: '8px'
      }}>
        <h4>Order Summary</h4>
        <div className="d-flex align-items-center mb-3">
          <img
            src={`${backend_url}${productDetails.image}`}
            alt={productDetails.name}
            style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: '4px' }}
          />
          <div className="ms-3">
            <h6 className="mb-1">{productDetails.name}</h6>
            <p className="text-muted mb-0">Size: {productDetails.size}</p>
            <p className="text-muted mb-0">Price: ₹{productDetails.price}</p>
          </div>
        </div>
        <div className="border-top pt-2">
          <div className="d-flex justify-content-between">
            <span>Total Amount:</span>
            <span className="fw-bold">₹{productDetails.price * productDetails.quantity}</span>
          </div>
        </div>
      </div>

      {/* Address Form */}
      <h3 style={{ color: '#343a40', marginBottom: '20px' }}>Shipping Address</h3>
      {["name", "email", "phone", "street", "city", "state", "zipCode", "country"].map((field, index) => (
        <div key={index} className="form-group mb-4">
          <input
            type="text"
            className="form-control"
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            name={field}
            value={address[field]}
            onChange={handleAddressChange}
            required
          />
        </div>
      ))}

      <button className="btn btn-primary" onClick={handlePayment} style={{ marginTop: '10px' }}>
        Place Order
      </button>
    </div>
  );
};

export default Address;

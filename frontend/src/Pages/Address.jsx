import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { backend_url } from '../App';

const Address = ({ address, setAddress, onNext, productDetails }) => {
  const { userProfile } = useContext(ShopContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = Array.isArray(productDetails.images) ? productDetails.images : [productDetails.image];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (!token) return;

        const response = await fetch(`${backend_url}/api/auth/getuser`, {
          headers: {
            'Content-Type': 'application/json',
            'auth-token': token
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setAddress(prev => ({
              ...prev,
              name: data.user.name || '',
              email: data.user.email || '',
              phone: data.user.address?.phone || '',
              street: data.user.address?.street || '',
              city: data.user.address?.city || '',
              state: data.user.address?.state || '',
              zipCode: data.user.address?.zipCode || '',
              country: data.user.address?.country || ''
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [setAddress]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value.trim()
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
      const amount = productDetails.price * productDetails.quantity * 100;
      
      // Log the productDetails to debug
      console.log('Product Details:', productDetails);
      
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
              name: address.name,
              email: address.email,
              phone: address.phone,
              address: {
                street: address.street,
                city: address.city,
                state: address.state,
                zipCode: address.zipCode,
                country: address.country
              },
              paymentId: response.razorpay_payment_id,
              amount: data.order.amount / 100,
              products: [{
                productId: productDetails.id,
                productTitle: productDetails.name,
                quantity: productDetails.quantity,
                price: productDetails.price,
                subTotal: productDetails.price * productDetails.quantity,
                images: productDetails.images,
                size: productDetails.size
              }]
            };

            console.log('Payment Payload:', paymentPayload);

            const requiredFields = ['street', 'city', 'state', 'zipCode', 'country'];
            const missingFields = requiredFields.filter(field => !address[field]);
            
            if (missingFields.length > 0) {
              alert(`Please fill in all required address fields: ${missingFields.join(', ')}`);
              return;
            }
  
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
  
  const validateForm = () => {
    const requiredFields = ['name', 'email', 'phone', 'street', 'city', 'state', 'zipCode', 'country'];
    const missingFields = requiredFields.filter(field => !address[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }
    return true;
  };

  const handlePaymentClick = () => {
    if (validateForm()) {
      handlePayment();
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
        <div className="d-flex align-items-start">
          {/* Product Images */}
          <div className="product-images" style={{ marginRight: '15px' }}>
            <img
              src={`${backend_url}${images[currentImageIndex]}`}
              alt={productDetails.name}
              style={{ 
                width: "100px", 
                height: "100px", 
                objectFit: "contain", 
                borderRadius: '4px' 
              }}
            />
            {images.length > 1 && (
              <div className="thumbnail-strip" style={{
                display: 'flex',
                gap: '5px',
                marginTop: '5px'
              }}>
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={`${backend_url}${image}`}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: '30px',
                      height: '30px',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      borderRadius: '2px',
                      border: currentImageIndex === index ? '2px solid #007bff' : 'none'
                    }}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="ms-3">
            <h6 className="mb-1">{productDetails.name}</h6>
            <p className="text-muted mb-0">Size: {productDetails.size}</p>
            <p className="text-muted mb-0">Price: ₹{productDetails.price}</p>
          </div>
        </div>
        <div className="border-top pt-2 mt-3">
          <div className="d-flex justify-content-between">
            <span>Total Amount:</span>
            <span className="fw-bold">₹{productDetails.price * productDetails.quantity}</span>
          </div>
        </div>
      </div>

      {/* Updated Address Form section */}
      <h3 style={{ color: '#343a40', marginBottom: '20px' }}>Shipping Address</h3>
      <div className="form-group mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Full Name"
          name="name"
          value={address.name}
          onChange={handleAddressChange}
          required
          readOnly
        />
      </div>
      <div className="form-group mb-4">
        <input
          type="email"
          className="form-control"
          placeholder="Email"
          name="email"
          value={address.email}
          onChange={handleAddressChange}
          required
          readOnly
        />
      </div>
      <div className="form-group mb-4">
        <input
          type="tel"
          className="form-control"
          placeholder="Phone Number"
          name="phone"
          value={address.phone}
          onChange={handleAddressChange}
          required
          pattern="[0-9]{10}"
          title="Please enter a valid 10-digit phone number"
        />
      </div>
      <div className="form-group mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Street Address"
          name="street"
          value={address.street}
          onChange={handleAddressChange}
          required
        />
      </div>
      <div className="form-group mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="City"
          name="city"
          value={address.city}
          onChange={handleAddressChange}
          required
        />
      </div>
      <div className="form-group mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="State"
          name="state"
          value={address.state}
          onChange={handleAddressChange}
          required
        />
      </div>
      <div className="form-group mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="ZIP Code"
          name="zipCode"
          value={address.zipCode}
          onChange={handleAddressChange}
          required
        />
      </div>
      <div className="form-group mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Country"
          name="country"
          value={address.country}
          onChange={handleAddressChange}
          required
        />
      </div>

      <button 
        className="btn btn-primary" 
        onClick={handlePaymentClick} 
        style={{ marginTop: '10px' }}
      >
        Place Order
      </button>
    </div>
  );
};

export default Address;

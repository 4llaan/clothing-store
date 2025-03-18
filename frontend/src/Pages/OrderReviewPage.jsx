import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { backend_url } from '../App';
import ImageModal from '../Components/ImageModal/ImageModal';
import { ShopContext } from '../Context/ShopContext';

const OrderReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, totalAmount } = location.state || {};
  const [selectedImage, setSelectedImage] = useState(null);
  const [address, setAddress] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const { refreshCart } = useContext(ShopContext);

  useEffect(() => {
    if (!cartItems) {
      navigate('/cart');
      return;
    }

    // Fetch user details when component mounts
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${backend_url}/api/auth/getuser`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': token
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }

        const data = await response.json();
        if (data.success) {
          console.log('User details fetched:', data.user);
          setAddress({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.address?.phone || '',
            street: data.user.address?.street || '',
            city: data.user.address?.city || '',
            state: data.user.address?.state || '',
            zipCode: data.user.address?.zipCode || '',
            country: data.user.address?.country || ''
          });
        } else {
          console.error('Failed to fetch user details:', data.message);
          alert('Failed to fetch user details. Please try logging in again.');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        alert('Error fetching user details. Please try logging in again.');
        navigate('/login');
      }
    };

    fetchUserProfile();
  }, [cartItems, navigate]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
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

  const handlePaymentSuccess = async (response) => {
    try {
      // Save order details
      const saveResponse = await fetch(`${backend_url}/api/orders/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem("auth-token")
        },
        body: JSON.stringify({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          amount: totalAmount,
          products: cartItems.map(item => ({
            productId: item.id.toString(),
            productTitle: item.name,
            quantity: item.quantity,
            price: item.price,
            subTotal: item.price * item.quantity,
            images: item.images || [item.image],
            size: item.size,
            isThriftProduct: item.isThriftProduct
          })),
          name: address.name,
          email: address.email,
          phone: address.phone,
          address: {
            street: address.street,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country
          }
        })
      });

      const saveData = await saveResponse.json();
      if (saveData.success) {
        try {
          // Process thrift products
          for (const item of cartItems) {
            if (item.isThriftProduct) {
              // Update stock status
              const stockResponse = await fetch(`${backend_url}/api/seller-data/update-stock/${item.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({ stock: 'out_of_stock' })
              });

              if (stockResponse.ok) {
                // Dispatch event to notify GoThrift about stock update
                window.dispatchEvent(new CustomEvent('stockUpdated'));
              }

              // Remove from cart if it was added
              await fetch(`${backend_url}/removefromcart`, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'auth-token': localStorage.getItem('auth-token'),
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId: item.id })
              });
            }
          }

          // If there's a callback for order completion, call it
          if (location.state?.onOrderComplete) {
            location.state.onOrderComplete();
          }

          await refreshCart();
        } catch (error) {
          console.error('Error processing thrift products:', error);
        }

        alert("Payment Successful! Order placed.");
        localStorage.removeItem('cartItems');
        navigate('/your-orders');
      } else {
        throw new Error(saveData.message || 'Failed to save order');
      }
    } catch (error) {
      console.error("Error processing order:", error);
      alert("Payment successful but order processing failed. Please contact support.");
    }
  };

  const handleProceedToPayment = async () => {
    // Validate all address fields
    const requiredFields = ['name', 'email', 'phone', 'street', 'city', 'state', 'zipCode', 'country'];
    for (let field of requiredFields) {
      if (!address[field]) {
        alert(`Please enter your ${field}`);
        return;
      }
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load Razorpay. Check your internet connection.");
      return;
    }

    try {
      // Create Razorpay order
      const orderResponse = await fetch(`${backend_url}/api/orders/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem("auth-token")
        },
        body: JSON.stringify({
          amount: totalAmount * 100, // Convert to paise
          currency: "INR"
        })
      });

      const orderData = await orderResponse.json();
      if (!orderData.success) {
        throw new Error(orderData.message || 'Order creation failed');
      }

      // Configure Razorpay options
      const options = {
        key: "rzp_test_7qXqryRXwyy9GP",
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        order_id: orderData.order.id,
        name: "Your Shop Name",
        description: "Order Payment",
        handler: handlePaymentSuccess,
        prefill: {
          name: address.name,
          email: address.email,
          contact: address.phone
        },
        theme: {
          color: "#3399cc"
        }
      };

      // Initialize Razorpay
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error("Payment Error:", error);
      alert(error.message || "Payment failed. Please try again.");
    }
  };

  return (
    <div className="order-review-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Add Image Modal */}
      {selectedImage && (
        <ImageModal 
          image={`${backend_url}${selectedImage}`}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <h2>Review Your Order</h2>

      {/* Cart Items Review */}
      <div className="cart-items-review" style={{ marginTop: '20px' }}>
        {cartItems?.map((item, index) => (
          <div key={index} className="cart-item" style={{
            display: 'flex',
            padding: '15px',
            borderBottom: '1px solid #eee',
            marginBottom: '10px'
          }}>
            {/* Product Images Section */}
            <div className="product-images" style={{ marginRight: '20px' }}>
              {/* Main Image */}
              {item.images && item.images.length > 0 ? (
                <img 
                  src={`${backend_url}${item.images[0]}`} 
                  alt={item.name}
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    objectFit: 'cover', 
                    marginBottom: '5px',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onClick={() => setSelectedImage(item.images[0])}
                />
              ) : (
                <div style={{ 
                  width: '100px', 
                  height: '100px', 
                  backgroundColor: '#eee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px'
                }}>
                  No Image
                </div>
              )}

              {/* Thumbnail Strip */}
              {item.images && item.images.length > 1 && (
                <div style={{ 
                  display: 'flex', 
                  gap: '5px', 
                  marginTop: '5px'
                }}>
                  {item.images.slice(1).map((image, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={`${backend_url}${image}`}
                      alt={`${item.name} view ${imgIndex + 2}`}
                      style={{ 
                        width: '30px', 
                        height: '30px', 
                        objectFit: 'cover',
                        cursor: 'pointer',
                        borderRadius: '2px'
                      }}
                      onClick={() => setSelectedImage(image)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="item-details" style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '10px' }}>{item.name}</h3>
              <p style={{ margin: '5px 0' }}>Size: {item.size}</p>
              <p style={{ margin: '5px 0' }}>Quantity: {item.quantity}</p>
              <p style={{ margin: '5px 0' }}>Price: ₹{item.price}</p>
              <p style={{ margin: '5px 0' }}>Subtotal: ₹{item.subTotal}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Address Form */}
      <div className="address-form" style={{ 
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px'
      }}>
        <h3>Shipping Address</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={address.name}
              onChange={handleAddressChange}
              style={inputStyle}
              readOnly
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={address.email}
              onChange={handleAddressChange}
              style={inputStyle}
              readOnly
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={address.phone}
              onChange={handleAddressChange}
              style={inputStyle}
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <input
              type="text"
              name="street"
              placeholder="Street Address"
              value={address.street}
              onChange={handleAddressChange}
              style={inputStyle}
            />
          </div>
          <input
            type="text"
            name="city"
            placeholder="City"
            value={address.city}
            onChange={handleAddressChange}
            style={inputStyle}
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={address.state}
            onChange={handleAddressChange}
            style={inputStyle}
          />
          <input
            type="text"
            name="zipCode"
            placeholder="ZIP Code"
            value={address.zipCode}
            onChange={handleAddressChange}
            style={inputStyle}
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={address.country}
            onChange={handleAddressChange}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Order Summary */}
      <div className="order-summary" style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px'
      }}>
        <h3>Order Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <span>Subtotal:</span>
          <span>₹{totalAmount}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <span>Shipping:</span>
          <span>Free</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid #dee2e6',
          fontWeight: 'bold'
        }}>
          <span>Total:</span>
          <span>₹{totalAmount}</span>
        </div>
      </div>

      {/* Shipping Address Display */}
      <div className="shipping-address" style={{ 
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <h4>Shipping Address</h4>
        <div style={{ 
          marginTop: '10px',
          display: 'grid',
          gap: '8px'
        }}>
          <p><strong>Name:</strong> {address.name}</p>
          <p><strong>Email:</strong> {address.email}</p>
          <p><strong>Phone:</strong> {address.phone || 'Not set'}</p>
          <p><strong>Address:</strong> {address.street || 'Not set'}</p>
          <p><strong>City:</strong> {address.city || 'Not set'}</p>
          <p><strong>State:</strong> {address.state || 'Not set'}</p>
          <p><strong>ZIP Code:</strong> {address.zipCode || 'Not set'}</p>
          <p><strong>Country:</strong> {address.country || 'Not set'}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <button 
          onClick={() => navigate('/cart')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Back to Cart
        </button>
        <button 
          onClick={handleProceedToPayment}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

// Common input style
const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px'
};

export default OrderReviewPage; 
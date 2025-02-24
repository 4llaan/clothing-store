import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import { backend_url } from '../App';
import OrderReview from './OrderReview';
import Address from './Address';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productDetails } = location.state || {};
  const { userProfile } = useContext(ShopContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [address, setAddress] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const handleNext = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handleSubmit = async () => {
    if (!localStorage.getItem('auth-token')) {
      alert('Please login to place order');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${backend_url}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('auth-token')
        },
        body: JSON.stringify({
          productId: productDetails.id,
          selectedSize: productDetails.size,
          quantity: productDetails.quantity,
          totalAmount: productDetails.price * productDetails.quantity,
          shippingAddress: address,
          orderDetails: {
            productName: productDetails.name,
            category: productDetails.category,
            description: productDetails.description
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Order placed successfully!');
        navigate('/');
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    }
  };

  if (!productDetails) {
    return <div>No product details found</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
      {currentStep === 0 && (
        <OrderReview 
          productDetails={productDetails}
          onNext={handleNext} 
        />
      )}
      {currentStep === 1 && (
        <Address 
          address={address} 
          setAddress={setAddress} 
          onNext={handleSubmit}
          productDetails={productDetails}
        />
      )}
    </div>
  );
};

export default Checkout; 
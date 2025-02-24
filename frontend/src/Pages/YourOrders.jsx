import React, { useEffect, useState } from 'react';
import { backend_url } from '../App';
import './CSS/YourOrders.css';

const YourOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${backend_url}/api/orders/my-orders`, {
          headers: {
            'auth-token': localStorage.getItem('auth-token')
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Loading your orders...</div>;
  if (error) return <div>Error: {error}</div>;
  if (orders.length === 0) return <div>No orders found</div>;

  return (
    <div className="your-orders" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Your Orders</h2>
      {orders.map((order, index) => (
        <div key={index} className="order-card" style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div className="order-header" style={{ marginBottom: '15px' }}>
            <h3>Order #{order._id}</h3>
            <p>Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Total Amount: ₹{order.amount}</p>
          </div>

          <div className="shipping-details" style={{ marginBottom: '15px' }}>
            <h4>Shipping Details</h4>
            <p>{order.name}</p>
            <p>{order.phone}</p>
            {order.address && (
              <>
                <p>{order.address.street}</p>
                <p>{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                <p>{order.address.country}</p>
              </>
            )}
          </div>

          <div className="order-items">
            <h4>Order Items</h4>
            {order.products.map((product, productIndex) => (
              <div key={productIndex} className="order-item" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #eee'
              }}>
                <img 
                  src={`${backend_url}${product.image}`} 
                  alt={product.productTitle}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', marginRight: '15px' }}
                />
                <div className="item-details">
                  <h5>{product.productTitle}</h5>
                  <p><strong>Size:</strong> {product.size || 'N/A'}</p>
                  <p><strong>Quantity:</strong> {product.quantity}</p>
                  <p><strong>Price:</strong> ₹{product.price}</p>
                  <p><strong>Subtotal:</strong> ₹{product.subTotal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default YourOrders;

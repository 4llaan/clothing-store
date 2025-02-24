import React, { useEffect, useState } from 'react';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/orders/all-orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem("auth-token"),
          },
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

  const handleOrderClick = (orderId) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null); // Close the detail view if clicking the same order
    } else {
      setSelectedOrder(orderId); // Open the detail view for the clicked order
    }
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="orders-container">
      <h2>All Orders</h2>
      <div className="orders-list">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Items</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order._id}>
                <tr 
                  onClick={() => handleOrderClick(order._id)}
                  className={`order-row ${selectedOrder === order._id ? 'selected' : ''}`}
                >
                  <td>{order._id.slice(-6)}</td>
                  <td>{order.name || 'N/A'}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>₹{order.amount || 0}</td>
                  <td>{order.products?.length || 0} items</td>
                  <td>
                    <span className="status-badge">
                      {order.status || 'Pending'}
                    </span>
                  </td>
                </tr>
                
                {/* Detailed view that shows when row is clicked */}
                {selectedOrder === order._id && (
                  <tr>
                    <td colSpan="6">
                      <div className="order-details">
                        <div className="customer-info">
                          <h4>Customer Details</h4>
                          <p>Name: {order.name || 'N/A'}</p>
                          <p>Email: {order.email || 'N/A'}</p>
                          <p>Phone: {order.phone || 'N/A'}</p>
                        </div>

                        {order.address && (
                          <div className="shipping-address">
                            <h4>Shipping Address</h4>
                            <p>{order.address.street || 'N/A'}</p>
                            <p>
                              {order.address.city || 'N/A'}, 
                              {order.address.state || 'N/A'} 
                              {order.address.zipCode || 'N/A'}
                            </p>
                            <p>{order.address.country || 'N/A'}</p>
                          </div>
                        )}

                        <div className="order-items">
                          <h4>Order Items</h4>
                          {order.products && order.products.map((product, index) => (
                            <div key={index} className="order-item">
                              <div className="product-info">
                                {product.image && (
                                  <img 
                                    src={`http://localhost:4000${product.image}`} 
                                    alt={product.productTitle || 'Product'}
                                    onError={(e) => {
                                      e.target.src = 'placeholder-image-url';
                                      e.target.onerror = null;
                                    }}
                                  />
                                )}
                                <div className="product-details">
                                  <h5>{product.productTitle || 'Untitled Product'}</h5>
                                  <p>Size: {product.size || 'N/A'}</p>
                                  <p>Quantity: {product.quantity || 0}</p>
                                  <p>Price: ₹{product.price || 0}</p>
                                  <p>Subtotal: ₹{product.subTotal || 0}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="payment-info">
                          <h4>Payment Information</h4>
                          <p>Payment ID: {order.paymentId || 'N/A'}</p>
                          <p>Total Amount: ₹{order.amount || 0}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;

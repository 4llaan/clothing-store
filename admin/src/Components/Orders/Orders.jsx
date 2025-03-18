import React, { useEffect, useState } from 'react';
import './Orders.css';
import { backend_url } from '../../App';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

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
          // Process orders to ensure images array exists for each product
          const processedOrders = data.orders.map(order => ({
            ...order,
            products: order.products.map(product => ({
              ...product,
              images: product.images || [product.image] // Convert single image to array if needed
            }))
          }));
          setOrders(processedOrders);
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
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setStatusUpdateLoading(true);
      const response = await fetch(`${backend_url}/api/orders/update-status/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem("auth-token"),
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        // Update the orders state with the new status
        setOrders(orders.map(order => 
          order._id === orderId 
            ? {
                ...order,
                products: order.products.map(product => ({
                  ...product,
                  status: newStatus
                }))
              }
            : order
        ));
      } else {
        alert('Failed to update status: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    } finally {
      setStatusUpdateLoading(false);
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
                    <select
                      value={order.products[0]?.status || 'Pending'}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={statusUpdateLoading}
                      className={`status-select ${(order.products[0]?.status || 'pending').toLowerCase()}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
                
                {selectedOrder === order._id && (
                  <tr className="order-details-row">
                    <td colSpan="6">
                      <div className="order-details">
                        <div className="order-details-grid">
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

                          <div className="payment-info">
                            <h4>Payment Information</h4>
                            <p>Payment ID: {order.paymentId || 'N/A'}</p>
                            <p>Total Amount: ₹{order.amount || 0}</p>
                          </div>
                        </div>

                        <div className="order-items">
                          <h4>Order Items</h4>
                          <div className="order-items-grid">
                            {order.products && order.products.map((product, index) => (
                              <div key={index} className="order-item-card">
                                <div className="product-images-scroll">
                                  {product.images && product.images.map((image, imgIndex) => (
                                    <img 
                                      key={imgIndex}
                                      src={`${backend_url}${image}`}
                                      alt={`${product.productTitle} - ${imgIndex + 1}`}
                                      className="product-image"
                                      onError={(e) => {
                                        e.target.src = 'placeholder-image-url';
                                        e.target.onerror = null;
                                      }}
                                    />
                                  ))}
                                </div>
                                <div className="product-details">
                                  <h5>{product.productTitle || 'Untitled Product'}</h5>
                                  <p>Size: {product.size || 'N/A'}</p>
                                  <p>Quantity: {product.quantity || 0}</p>
                                  <p>Price: ₹{product.price || 0}</p>
                                  <p>Subtotal: ₹{product.subTotal || 0}</p>
                                </div>
                              </div>
                            ))}
                          </div>
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

import React, { useEffect, useState } from 'react';
import { backend_url } from '../App';
import './CSS/YourOrders.css';
import ImageModal from '../Components/ImageModal/ImageModal';

const YourOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    const statusColors = {
      'Pending': '#fff3cd',
      'Processing': '#cce5ff',
      'Shipped': '#d4edda',
      'Delivered': '#c3e6cb',
      'Cancelled': '#f8d7da'
    };
    return statusColors[status] || '#fff3cd';
  };

  if (loading) return <div>Loading your orders...</div>;
  if (error) return <div>Error: {error}</div>;
  if (orders.length === 0) return <div>No orders found</div>;

  return (
    <div className="your-orders" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {selectedImage && (
        <ImageModal 
          image={`${backend_url}${selectedImage}`}
          onClose={() => setSelectedImage(null)}
        />
      )}

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
                <div className="product-images" style={{ marginRight: '15px' }}>
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={`${backend_url}${product.images[0]}`}
                      alt={product.productTitle}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => setSelectedImage(product.images[0])}
                    />
                  ) : (
                    <div style={{ width: '80px', height: '80px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      No Image
                    </div>
                  )}
                  
                  {product.images && product.images.length > 1 && (
                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                      {product.images.slice(1).map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={`${backend_url}${image}`}
                          alt={`${product.productTitle} view ${imgIndex + 2}`}
                          style={{ width: '30px', height: '30px', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => setSelectedImage(image)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="item-details">
                  <h5>{product.productTitle}</h5>
                  <p><strong>Size:</strong> {product.size || 'N/A'}</p>
                  <p><strong>Quantity:</strong> {product.quantity}</p>
                  <p><strong>Price:</strong> ₹{product.price}</p>
                  <p><strong>Subtotal:</strong> ₹{product.subTotal}</p>
                  <div 
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(product.status),
                      color: '#000',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      marginTop: '8px',
                      fontWeight: 'bold'
                    }}
                  >
                    Status: {product.status || 'Pending'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="order-status" style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px'
          }}>
            <h4>Overall Order Status</h4>
            <div 
              className="status-badge"
              style={{
                backgroundColor: getStatusColor(order.products[0]?.status),
                color: '#000',
                padding: '6px 12px',
                borderRadius: '4px',
                display: 'inline-block',
                marginTop: '8px',
                fontWeight: 'bold'
              }}
            >
              {order.products[0]?.status || 'Pending'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default YourOrders;

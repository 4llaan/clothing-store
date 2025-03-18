import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerRequest.css";

const SellerRequest = () => {
    const [sellerData, setSellerData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCard, setExpandedCard] = useState(null);
    const backend_url = 'http://localhost:4000';
    const navigate = useNavigate();

    useEffect(() => {
        fetchSellerData();
    }, []);

    const fetchSellerData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${backend_url}/api/seller-data/all`, {
                headers: {
                    'auth-token': localStorage.getItem("auth-token"),
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                setSellerData(result.data);
            } else {
                throw new Error(result.message || 'Failed to fetch seller data');
            }
        } catch (err) {
            console.error("Error fetching seller data:", err);
            setError(err.message === 'Failed to fetch' ? 
                'Unable to connect to server. Please check if the server is running.' : 
                err.message
            );
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (dataId, status) => {
        try {
            const response = await fetch(`${backend_url}/api/seller-data/status/${dataId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem("auth-token")
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            const data = await response.json();
            
            if (data.success) {
                fetchSellerData(); // Refresh the list
                if (status === 'approved') {
                    navigate('/ApprovedProducts');
                }
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    const handlePayment = async (item) => {
        try {
            // Create order
            const response = await fetch(`${backend_url}/api/payment/seller-payout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem("auth-token")
                },
                body: JSON.stringify({
                    amount: item.price,
                    upiId: item.userInfo.upiId,
                    sellerName: item.userInfo.name
                })
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to create payment');
            }

            const options = {
                key: data.key_id, // Get key from backend
                amount: data.order.amount,
                currency: data.order.currency,
                order_id: data.order.id,
                name: "Seller Payout",
                description: `Payout to ${item.userInfo.name}`,
                handler: async function (response) {
                    try {
                        // Verify payment
                        const verifyRes = await fetch(`${backend_url}/api/payment/verify`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'auth-token': localStorage.getItem("auth-token")
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();
                        
                        if (verifyData.success) {
                            // Update status after successful payment verification
                            const statusUpdateRes = await fetch(`${backend_url}/api/seller-data/status/${item._id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'auth-token': localStorage.getItem("auth-token")
                                },
                                body: JSON.stringify({
                                    status: 'approved',
                                    paymentInfo: {
                                        razorpayOrderId: response.razorpay_order_id,
                                        razorpayPaymentId: response.razorpay_payment_id,
                                        paymentDate: new Date()
                                    }
                                })
                            });

                            const statusData = await statusUpdateRes.json();
                            if (statusData.success) {
                                alert('Payment successful and product approved!');
                                navigate('/ApprovedProducts');
                            }
                        }
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: item.userInfo.name,
                    email: item.userInfo.email,
                },
                notes: {
                    upiId: item.userInfo.upiId
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                alert('Payment failed. Please try again.');
            });
            paymentObject.open();

        } catch (error) {
            console.error("Payment error:", error);
            alert("Payment failed: " + error.message);
        }
    };

    const ProductPreview = ({ item, onClick }) => (
        <div className="request-card preview" onClick={onClick}>
            <div className="request-header">
                <h2>{item.productName}</h2>
                <span className={`status-badge ${item.status}`}>
                    {item.status}
                </span>
            </div>
            
            <div className="preview-content">
                <div className="preview-image">
                    <img 
                        src={`${backend_url}${item.images[0]}`} 
                        alt={item.productName}
                    />
                </div>
                
                <div className="preview-details">
                    <p><strong>Price:</strong> ₹{item.price}</p>
                    <p><strong>Seller:</strong> {item.userInfo.name}</p>
                    <p><strong>Category:</strong> {item.category} - {item.type}</p>
                    <button className="view-details-btn">View Details</button>
                </div>
            </div>
        </div>
    );

    const ProductDetails = ({ item, onClose }) => (
        <div className="request-card expanded">
            <div className="request-header">
                <h2>{item.productName}</h2>
                <div className="header-actions">
                    <span className={`status-badge ${item.status}`}>
                        {item.status}
                    </span>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
            </div>

            {/* Seller Information Section */}
            <div className="seller-info">
                <h3>Seller Information</h3>
                <div className="seller-details">
                    <p><strong>Name:</strong> {item.userInfo.name}</p>
                    <p><strong>Email:</strong> {item.userInfo.email}</p>
                    <p><strong>UPI ID:</strong> {item.userInfo.upiId}</p>
                    <p><strong>Phone:</strong> {item.userInfo.address.phone}</p>
                    
                    <div className="address-details">
                        <h4>Address:</h4>
                        <p>{item.userInfo.address.street}</p>
                        <p>{item.userInfo.address.city}, {item.userInfo.address.state}</p>
                        <p>{item.userInfo.address.zipCode}</p>
                        <p>{item.userInfo.address.country}</p>
                    </div>

                    <div className="document-section">
                        <strong>Verification Document:</strong>
                        <a 
                            href={`${backend_url}${item.userInfo.document}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="document-link"
                        >
                            View Document
                        </a>
                    </div>
                </div>
            </div>

            {/* Product Information */}
            <div className="product-images">
                {item.images.map((image, index) => (
                    <img
                        key={index}
                        src={`${backend_url}${image}`}
                        alt={`Product ${index + 1}`}
                        onClick={() => window.open(`${backend_url}${image}`, '_blank')}
                    />
                ))}
            </div>

            <div className="product-details">
                <p><strong>Price:</strong> ₹{item.price}</p>
                <p><strong>Category:</strong> {item.category}</p>
                <p><strong>Type:</strong> {item.type}</p>
                
                {item.type === 'tops' && (
                    <p><strong>Size:</strong> {item.size}</p>
                )}
                
                {item.type === 'bottoms' && (
                    <>
                        <p><strong>Waist:</strong> {item.waist}</p>
                        <p><strong>Length:</strong> {item.length}</p>
                    </>
                )}
                
                <div className="description">
                    <strong>Details:</strong>
                    <p>{item.productDetails}</p>
                </div>
            </div>

            {item.status === 'pending' && (
                <div className="action-buttons">
                    <button
                        className="approve-btn"
                        onClick={() => handlePayment(item)}
                    >
                        Approve & Pay
                    </button>
                    <button
                        className="reject-btn"
                        onClick={() => {
                            const feedback = prompt('Please provide rejection reason:');
                            if (feedback) {
                                handleStatusUpdate(item._id, 'rejected');
                            }
                        }}
                    >
                        Reject
                    </button>
                </div>
            )}

            <div className="request-footer">
                <small>Submitted: {new Date(item.createdAt).toLocaleString()}</small>
            </div>
        </div>
    );

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading seller data...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={fetchSellerData} className="retry-button">
                Try Again
            </button>
        </div>
    );

    return (
        <div className="seller-requests-container">
            <h1>Seller Product Requests</h1>
            {sellerData.length === 0 ? (
                <div className="no-requests">
                    <p>No pending requests found</p>
                </div>
            ) : (
                <div className="requests-grid">
                    {sellerData.map((item) => (
                        expandedCard === item._id ? (
                            <ProductDetails 
                                key={item._id}
                                item={item} 
                                onClose={() => setExpandedCard(null)}
                            />
                        ) : (
                            <ProductPreview 
                                key={item._id}
                                item={item}
                                onClick={() => setExpandedCard(item._id)}
                            />
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

export default SellerRequest;

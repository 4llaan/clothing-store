import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/MyRequests.css';

const MyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const navigate = useNavigate();
    const backend_url = 'http://localhost:4000';

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            const authToken = localStorage.getItem("auth-token");
            if (!authToken) {
                navigate('/login');
                return;
            }

            // Get the user ID first
            const userResponse = await fetch(`${backend_url}/api/auth/getuser`, {
                headers: {
                    'auth-token': authToken
                }
            });
            const userData = await userResponse.json();

            if (!userData.success) {
                throw new Error('Failed to fetch user data');
            }

            // Then fetch seller requests for this user
            const response = await fetch(`${backend_url}/api/seller-data/user/${userData.user.id}`, {
                headers: {
                    'auth-token': authToken
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch requests');
            }

            const data = await response.json();
            if (data.success) {
                setRequests(data.data);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'approved': return 'status-approved';
            case 'rejected': return 'status-rejected';
            default: return '';
        }
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case 'pending':
                return 'Your request is being reviewed by our team.';
            case 'approved':
                return 'Congratulations! Your product has been approved and payment has been completed .';
            case 'rejected':
                return 'Unfortunately, your request was not approved.';
            default:
                return '';
        }
    };

    const handleRequestClick = (request) => {
        setSelectedRequest(request);
    };

    const closeModal = () => {
        setSelectedRequest(null);
    };

    const handleCancelRequest = async (requestId) => {
        try {
            const response = await fetch(`${backend_url}/api/seller-data/${requestId}`, {
                method: 'DELETE',
                headers: {
                    'auth-token': localStorage.getItem('auth-token')
                }
            });

            const data = await response.json();
            if (data.success) {
                // Remove the cancelled request from the state
                setRequests(requests.filter(req => req._id !== requestId));
                // Close modal if open
                setSelectedRequest(null);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error cancelling request:', error);
            alert('Failed to cancel request. Please try again.');
        }
    };

    // Product Details Modal Component
    const ProductDetailsModal = ({ request, onClose }) => {
        const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

        if (!request) return null;

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                    
                    <div className="modal-header">
                        <h2>{request.productName}</h2>
                        <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                    </div>

                    {/* Add Cancel Request Button for pending requests */}
                    {request.status === 'pending' && (
                        <div className="cancel-request-section">
                            {isConfirmingCancel ? (
                                <div className="confirm-cancel">
                                    <p>Are you sure you want to cancel this request?</p>
                                    <div className="confirm-buttons">
                                        <button 
                                            className="confirm-yes"
                                            onClick={() => handleCancelRequest(request._id)}
                                        >
                                            Yes, Cancel
                                        </button>
                                        <button 
                                            className="confirm-no"
                                            onClick={() => setIsConfirmingCancel(false)}
                                        >
                                            No, Keep
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    className="cancel-request-btn"
                                    onClick={() => setIsConfirmingCancel(true)}
                                >
                                    Cancel Request
                                </button>
                            )}
                        </div>
                    )}

                    <div className="status-message">
                        {getStatusMessage(request.status)}
                    </div>

                    <div className="modal-body">
                        <div className="image-gallery">
                            {request.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={`${backend_url}${image}`}
                                    alt={`Product ${index + 1}`}
                                    className="gallery-image"
                                    onClick={() => window.open(`${backend_url}${image}`, '_blank')}
                                />
                            ))}
                        </div>

                        <div className="product-info">
                            <div className="info-section">
                                <h3>Product Details</h3>
                                <p><strong>Price:</strong> ₹{request.price}</p>
                                <p><strong>Category:</strong> {request.category}</p>
                                <p><strong>Type:</strong> {request.type}</p>
                                
                                {request.type === 'tops' && (
                                    <p><strong>Size:</strong> {request.size}</p>
                                )}
                                
                                {request.type === 'bottoms' && (
                                    <>
                                        <p><strong>Waist:</strong> {request.waist}</p>
                                        <p><strong>Length:</strong> {request.length}</p>
                                    </>
                                )}
                            </div>

                            <div className="info-section">
                                <h3>Description</h3>
                                <p>{request.productDetails}</p>
                            </div>

                            {request.status === 'rejected' && request.adminFeedback && (
                                <div className="info-section feedback-section">
                                    <h3>Rejection Feedback</h3>
                                    <p>{request.adminFeedback}</p>
                                </div>
                            )}

                            <div className="info-section">
                                <h3>Request Timeline</h3>
                                <p><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                                {request.updatedAt !== request.createdAt && (
                                    <p><strong>Last Updated:</strong> {new Date(request.updatedAt).toLocaleString()}</p>
                                )}
                            </div>

                            {request.status === 'approved' && (
                                <div className="info-section success-section">
                                    <h3>Product Status</h3>
                                    <p>Your product is now listed in Go Thrift!</p>
                                    <button 
                                        className="view-listing-btn"
                                        onClick={() => navigate('/gothrift')}
                                    >
                                        View in Go Thrift
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Modify the request card to show cancel option
    const RequestCard = ({ request }) => (
        <div 
            className={`request-card ${request.status}`}
            onClick={() => handleRequestClick(request)}
        >
            <div className="request-header">
                <h2>{request.productName}</h2>
                <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
            </div>

            <div className="product-images">
                <img
                    src={`${backend_url}${request.images[0]}`}
                    alt={request.productName}
                    className="main-image"
                />
                <div className="image-count">
                    {request.images.length} photos
                </div>
            </div>

            <div className="request-details">
                <p className="price">₹{request.price}</p>
                <p className="category">{request.category} - {request.type}</p>
                <div className="status-message">
                    {getStatusMessage(request.status)}
                </div>
                <div className="request-date">
                    Submitted: {new Date(request.createdAt).toLocaleDateString()}
                </div>
            </div>

            {request.status === 'pending' && (
                <button 
                    className="quick-cancel-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRequestClick(request);
                    }}
                >
                    Cancel Request
                </button>
            )}

            {request.status === 'rejected' && request.adminFeedback && (
                <div className="feedback-box">
                    <strong>Rejection Reason:</strong>
                    <p>{request.adminFeedback}</p>
                </div>
            )}
        </div>
    );

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your requests...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={fetchMyRequests} className="retry-button">Try Again</button>
        </div>
    );

    return (
        <div className="my-requests-container">
            <h1>My Selling Requests</h1>
            
            {requests.length === 0 ? (
                <div className="no-requests">
                    <p>You haven't submitted any selling requests yet.</p>
                    <button onClick={() => navigate('/sellerform')} className="submit-request-btn">
                        Submit a Request
                    </button>
                </div>
            ) : (
                <div className="requests-grid">
                    {requests.map((request) => (
                        <RequestCard key={request._id} request={request} />
                    ))}
                </div>
            )}

            {selectedRequest && (
                <ProductDetailsModal 
                    request={selectedRequest} 
                    onClose={closeModal} 
                />
            )}
        </div>
    );
};

export default MyRequests; 
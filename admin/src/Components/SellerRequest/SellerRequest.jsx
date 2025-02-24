import React, { useEffect, useState } from "react";
import "./SellerRequest.css";

const SellerRequest = () => {
    const [requests, setRequests] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const backend_url = 'http://localhost:4000'; // Add your backend URL

    useEffect(() => {
        fetchRequests();
        fetchUserInfo();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await fetch(`${backend_url}/api/seller-requests`);
            if (!response.ok) {
                throw new Error('Failed to fetch requests');
            }
            const data = await response.json();
            console.log("Fetched requests:", data); // For debugging
            setRequests(data);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching requests:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserInfo = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/user-info', {
                method: 'GET',
                headers: {
                    'auth-token': localStorage.getItem("auth-token"),
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }
            const data = await response.json();
            setUserInfo(data);
        } catch (err) {
            console.error('Error fetching user info:', err);
        }
    };

    const handleAccept = async (id) => {
        try {
            const response = await fetch(`${backend_url}/api/accept-product/${id}`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to accept product');
            }
            // Remove the accepted request from the list
            setRequests(requests.filter(request => request._id !== id));
        } catch (err) {
            console.error('Error accepting product:', err);
            alert('Failed to accept product. Please try again.');
        }
    };

    const handleReject = async (id) => {
        try {
            const response = await fetch(`${backend_url}/api/reject-product/${id}`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to reject product');
            }
            // Remove the rejected request from the list
            setRequests(requests.filter(request => request._id !== id));
        } catch (err) {
            console.error('Error rejecting product:', err);
            alert('Failed to reject product. Please try again.');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (requests.length === 0) return <div>No pending requests</div>;

    return (
        <div className="seller-requests-container">
            <h1>Seller Requests</h1>
            {userInfo && (
                <div className="user-info">
                    <h2>User Information</h2>
                    <p><strong>Name:</strong> {userInfo.name}</p>
                    <p><strong>Email:</strong> {userInfo.email}</p>
                </div>
            )}
            <div className="requests-grid">
                {requests.map(request => (
                    <div key={request._id} className="request-card">
                        <div className="seller-info">
                            <h3>Seller Information</h3>
                            <p><strong>Name:</strong> {request.userName}</p>
                            <p><strong>Email:</strong> {request.userEmail}</p>
                            <p><strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="image-container">
                            {request.images && request.images[0] && (
                                <img 
                                    src={`${backend_url}${request.images[0]}`} 
                                    alt={request.name} 
                                />
                            )}
                        </div>
                        <div className="request-details">
                            <h2>{request.name}</h2>
                            <p className="description">{request.description}</p>
                            <div className="specs">
                                <p>Price: ₹{request.new_price}</p>
                                <p>Size: {request.size}</p>
                                <p>Category: {request.category}</p>
                                <div className="measurements">
                                    <p>Length: {request.length}cm</p>
                                    <p>Chest: {request.chest}cm</p>
                                    <p>Shoulder: {request.shoulder}cm</p>
                                </div>
                            </div>
                            <div className="action-buttons">
                                <button 
                                    className="accept-btn"
                                    onClick={() => handleAccept(request._id)}
                                >
                                    Accept
                                </button>
                                <button 
                                    className="reject-btn"
                                    onClick={() => handleReject(request._id)}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SellerRequest;

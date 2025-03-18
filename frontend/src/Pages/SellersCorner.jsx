import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/SellersCorner.css' // Import the CSS for styling

const SellersCorner = () => {
  const navigate = useNavigate();

  const handleViewRequests = () => {
    const authToken = localStorage.getItem("auth-token");
    if (!authToken) {
      alert("Please login to view your requests");
      navigate('/login');
      return;
    }
    navigate('/my-requests');
  };

  return (
    <div className="sellers-corner">
      <header className="sellers-corner-header">
        <h1>Begin your selling journey on SHOPPER</h1>
        <p>Join SHOPPER as a seller and start your thrifting business today</p>
        <div className="sellers-corner-buttons">
          <a href="/sellerform" className="btn start-selling-btn">Start selling</a>
          <button 
            onClick={handleViewRequests} 
            className="btn view-requests-btn"
          >
            View Your Requests
          </button>
        </div>
      </header>
    
      <footer className="sellers-corner-footer">
        <p><a href="/disclaimer">
          "All items listed in our thrifted area are pre-owned and approved by our team for quality. 
          While we strive for accuracy, slight variations in condition may occur. No returns or 
          exchanges are accepted. Please review product details carefully before purchasing."
        </a></p>
      </footer>
    </div>
  );
};

export default SellersCorner;

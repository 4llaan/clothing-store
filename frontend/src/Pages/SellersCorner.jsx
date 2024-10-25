import React from 'react';
import './CSS/SellersCorner.css' // Import the CSS for styling
import logo from '../Components//Assets/logo.png';


const SellersCorner = () => {
  return (
    <div className="sellers-corner">
      <header className="sellers-corner-header">
        <h1>Begin your selling journey on SHOPPER</h1>
        <p>Login or register as a seller on SHOPPER and pay lower selling fees with every order</p>
        <div className="sellers-corner-buttons">
          <a href="/login" className="btn login-btn">Log in</a>
          <a href="/sellerform" className="btn start-selling-btn">Start selling</a>
          <a href="/know-more" className="btn know-more-btn">Know More</a>
        </div>
      </header>
    
      <footer className="sellers-corner-footer">
        <p><a href="/disclaimer">"All items listed in our thrifted area are pre-owned and approved by our team for quality. While we strive for accuracy, slight variations in condition may occur. No returns or exchanges are accepted. Please review product details carefully before purchasing."</a></p>
      </footer>
    </div>
  );
};

export default SellersCorner;

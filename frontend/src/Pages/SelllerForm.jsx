// Components/Pages/SellerForm.js
import React, { useState } from 'react';
import './CSS/SellerForm.css'; // Include your styles

const SellerForm = () => {
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      shopName,
      description,
      profilePicture,
    };
    console.log('Form Data Submitted:', formData);
    alert('Your seller profile has been submitted for approval!');
    // You can add logic to send data to your backend here
  };

  return (
    <div className="seller-form-container">
      <h1>Seller Profile Setup</h1>
      <form onSubmit={handleSubmit} className="seller-form">
        <label>Shop Name</label>
        <input
          type="text"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          required
        />

        <label>Shop Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label>Profile Picture</label>
        <input
          type="file"
          onChange={(e) => setProfilePicture(e.target.files[0])}
        />

        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default SellerForm;

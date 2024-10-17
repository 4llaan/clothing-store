import React, { useEffect, useState } from 'react';
import './Profile.css';  // You can create a CSS file for styling if needed
import default_profile from '../Assets/default_profile.png';  // Default profile picture

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profilePic: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Fetch user data from the server
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('auth-token');  // Get the token from localStorage

      if (token) {
        try {
          const response = await fetch('http://localhost:4000/api/profile', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'auth-token': token  // Include the token in the request header
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUserData(data);  // Set the fetched user data in the state
            setFormData({
              name: data.name,
              email: data.email,
              profilePic: data.profilePic || default_profile,
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
          } else {
            console.error("Failed to fetch user data");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        console.log("No token found, user not logged in");
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    // Simple password validation
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        const response = await fetch('http://localhost:4000/api/updateprofile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': token
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            profilePic: formData.profilePic,
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          })
        });

        if (response.ok) {
          const updatedUserData = await response.json();
          setUserData(updatedUserData);
          setIsEditing(false);  // Close edit mode
          alert("Profile updated successfully!");
        } else {
          alert("Failed to update profile.");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h2>Profile Details</h2>

      {isEditing ? (
        <form className="profile-form" onSubmit={handleProfileUpdate}>


          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Current Password:</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="Enter current password"
            />
          </div>

          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter new password"
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm new password"
            />
          </div>

          <button type="submit" className="save-btn">Save Changes</button>
          <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        <div className="profile-card">
          <img
            src={userData.profilePic || default_profile}  // Use user's profile picture if available, else default
            alt="Profile"
            className="profile-image"
          />
          <div className="profile-info">
            <p><strong>Name:</strong> {userData.name}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Joined:</strong> {new Date(userData.date).toLocaleDateString()}</p>
          </div>
          <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default Profile;

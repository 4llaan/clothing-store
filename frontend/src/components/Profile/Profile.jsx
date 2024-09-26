import React, { useEffect, useState } from 'react';
import './Profile.css';  // You can create a CSS file for styling if needed
import default_profile from '../Assets/default_profile.png';  // Default profile picture

const Profile = () => {
  const [userData, setUserData] = useState(null);

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

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h2>Profile Details</h2>
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
      </div>
    </div>
  );
};

export default Profile;

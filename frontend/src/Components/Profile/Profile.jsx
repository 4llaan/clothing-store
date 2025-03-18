import React, { useEffect, useState } from 'react';
import './Profile.css';  // You can create a CSS file for styling if needed
import default_profile from '../Assets/default_profile.png';  // Default profile picture
import { SHOP_ADDRESS } from '../../constants/shopInfo';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const backend_url = 'http://localhost:4000';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profilePic: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    upiId: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  });

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentError, setDocumentError] = useState('');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        const response = await fetch(`${backend_url}/api/auth/getuser`, {
          headers: {
            'Content-Type': 'application/json',
            'auth-token': token
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('User data:', data); // Debug log
          if (data.success && data.user) {
            setUserData(data.user);
            setFormData({
              name: data.user.name || '',
              email: data.user.email || '',
              profilePic: data.user.profilePic || '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
              upiId: data.user.upiId || '',
              street: data.user.address?.street || '',
              city: data.user.address?.city || '',
              state: data.user.address?.state || '',
              zipCode: data.user.address?.zipCode || '',
              country: data.user.address?.country || '',
              phone: data.user.address?.phone || ''
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    
    if (formData.newPassword) {
      if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
      if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
      if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      setSelectedImage(file);

      // Upload image immediately when selected
      const formData = new FormData();
      formData.append('profilePic', file);

      try {
        const token = localStorage.getItem('auth-token');
        const response = await fetch(`${backend_url}/api/upload-profile-pic`, {
          method: 'POST',
          headers: {
            'auth-token': token
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            profilePic: data.imageUrl
          }));
          // Refresh profile data
          fetchUserProfile();
        } else {
          alert('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image');
      }
    }
  };

  const handleDocumentChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setDocumentError('File size should be less than 5MB');
        return;
      }
      
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        setDocumentError('Only PDF, JPEG, and PNG files are allowed');
        return;
      }

      setSelectedDocument(file);
      setDocumentError('');

      // Upload document
      const formData = new FormData();
      formData.append('document', file);

      try {
        const token = localStorage.getItem('auth-token');
        const response = await fetch(`${backend_url}/api/upload-document`, {
          method: 'POST',
          headers: {
            'auth-token': token
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            document: data.documentUrl
          }));
          // Refresh profile data
          fetchUserProfile();
        } else {
          setDocumentError('Failed to upload document');
        }
      } catch (error) {
        console.error('Error uploading document:', error);
        setDocumentError('Error uploading document');
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        const updateData = {
          name: formData.name,
          email: formData.email,
          upiId: formData.upiId,
          address: {
            street: formData.street || '',
            city: formData.city || '',
            state: formData.state || '',
            zipCode: formData.zipCode || '',
            country: formData.country || '',
            phone: formData.phone || ''
          }
        };

        // Add password fields only if new password is provided
        if (formData.newPassword) {
          updateData.currentPassword = formData.currentPassword;
          updateData.newPassword = formData.newPassword;
        }

        const response = await fetch(`${backend_url}/api/auth/updateprofile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': token
          },
          body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (response.ok) {
          setUserData(data.user);
          setIsEditing(false);
          // Update form data with the returned user data
          setFormData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            upiId: data.user.upiId || '',
            street: data.user.address?.street || '',
            city: data.user.address?.city || '',
            state: data.user.address?.state || '',
            zipCode: data.user.address?.zipCode || '',
            country: data.user.address?.country || '',
            phone: data.user.address?.phone || ''
          }));
          alert('Profile updated successfully!');
        } else {
          setErrors({ submit: data.message || 'Failed to update profile' });
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        setErrors({ submit: 'Error updating profile' });
      }
    }
  };

  const getProfileImageUrl = (profilePic) => {
    if (!profilePic) return default_profile;
    return `${backend_url}${profilePic}`;
  };

  const getDocumentUrl = (documentPath) => {
    if (!documentPath) return null;
    return `${backend_url}${documentPath}`;
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2>Profile Details</h2>

      {isEditing ? (
        <form className="profile-form" onSubmit={handleProfileUpdate}>
          <div className="profile-pic-section">
            <img
              src={getProfileImageUrl(formData.profilePic)}
              alt="Profile Preview"
              className="profile-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = default_profile;
              }}
            />
            <div className="profile-pic-upload">
              <label htmlFor="profile-pic" className="upload-btn">
                Choose New Picture
              </label>
              <input
                type="file"
                id="profile-pic"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3>Change Password</h3>
            <div className="form-group">
              <label>Current Password:</label>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
              />
              {errors.currentPassword && <span className="error">{errors.currentPassword}</span>}
            </div>

            <div className="form-group">
              <label>New Password:</label>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              />
              {errors.newPassword && <span className="error">{errors.newPassword}</span>}
            </div>

            <div className="form-group">
              <label>Confirm New Password:</label>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>

            <div className="show-password">
              <label>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                /> Show Password
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>Payment Information</h3>
            <div className="form-group">
              <label>UPI ID:</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                placeholder="Enter your UPI ID"
                pattern="[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z]{2,64}"
                title="Please enter a valid UPI ID (e.g., username@upi)"
              />
              <small className="form-text">Format: username@upi (e.g., johndoe@okicici)</small>
            </div>
          </div>

          <div className="form-section">
            <h3>Address Information</h3>
            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter your phone number"
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
              />
            </div>

            <div className="form-group">
              <label>Street Address:</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({...formData, street: e.target.value})}
                placeholder="Enter your street address"
              />
            </div>

            <div className="form-group">
              <label>City:</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="Enter your city"
              />
            </div>

            <div className="form-group">
              <label>State:</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                placeholder="Enter your state"
              />
            </div>

            <div className="form-group">
              <label>ZIP Code:</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                placeholder="Enter your ZIP code"
              />
            </div>

            <div className="form-group">
              <label>Country:</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                placeholder="Enter your country"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Document Verification</h3>
            <div className="form-group">
              <label>Upload Valid Document (ID proof):</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleDocumentChange}
                className="file-input"
              />
              {documentError && <span className="error">{documentError}</span>}
              {userData.document && (
                <div className="document-preview">
                  <p className="document-status">
                    Document Added
                  </p>
                  {userData.document.match(/\.(jpg|jpeg|png)$/i) ? (
                    <img 
                      src={getDocumentUrl(userData.document)} 
                      alt="Document Preview" 
                      className="document-image"
                    />
                  ) : (
                    <a 
                      href={getDocumentUrl(userData.document)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="document-link"
                    >
                      View Document
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {errors.submit && <div className="error-message">{errors.submit}</div>}

          <div className="button-group">
            <button type="submit" className="save-btn">Save Changes</button>
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={() => {
                setIsEditing(false);
                setErrors({});
                setFormData(prev => ({
                  ...prev,
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                  street: userData.address?.street || '',
                  city: userData.address?.city || '',
                  state: userData.address?.state || '',
                  zipCode: userData.address?.zipCode || '',
                  country: userData.address?.country || '',
                  phone: userData.address?.phone || ''
                }));
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-card">
          <div className="profile-pic-container">
            <img
              src={getProfileImageUrl(userData.profilePic)}
              alt="Profile"
              className="profile-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = default_profile;
              }}
            />
          </div>
          <div className="profile-info">
            <div className="user-details">
              <h3>User Information</h3>
              <p><strong>Name:</strong> {userData.name}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Member Since:</strong> {new Date(userData.date).toLocaleDateString()}</p>
            </div>

            <div className="payment-info">
              <h3>Payment Information</h3>
              <p>
                <strong>UPI ID: </strong>
                <span className={userData.upiId ? 'upi-value' : 'not-set'}>
                  {userData.upiId || 'Not set'}
                </span>
              </p>
            </div>

            <div className="address-info">
              <h3>Your Address</h3>
              <div className="address-details">
                <p><strong>Phone:</strong> {userData.address?.phone || 'Not set'}</p>
                <p><strong>Street:</strong> {userData.address?.street || 'Not set'}</p>
                <p><strong>City:</strong> {userData.address?.city || 'Not set'}</p>
                <p><strong>State:</strong> {userData.address?.state || 'Not set'}</p>
                <p><strong>ZIP Code:</strong> {userData.address?.zipCode || 'Not set'}</p>
                <p><strong>Country:</strong> {userData.address?.country || 'Not set'}</p>
              </div>
            </div>

            <div className="shop-address">
              <h3>Shop Address</h3>
              <p>{SHOP_ADDRESS.name}</p>
              <p>{SHOP_ADDRESS.location}</p>
              <p>{SHOP_ADDRESS.street}</p>
              <p>{SHOP_ADDRESS.city} - {SHOP_ADDRESS.pincode}</p>
              <p>{SHOP_ADDRESS.state}, {SHOP_ADDRESS.country}</p>
            </div>

            <div className="document-info">
              <h3>Document Information</h3>
              <p>
                <strong>Document Status: </strong>
                <span className={`status-badge ${userData.document ? 'added' : 'not-uploaded'}`}>
                  {userData.document ? 'Added' : 'Not uploaded'}
                </span>
              </p>
              {userData.document && (
                <div className="document-preview">
                  {userData.document.match(/\.(jpg|jpeg|png)$/i) ? (
                    <div className="image-preview-container">
                      <img 
                        src={getDocumentUrl(userData.document)} 
                        alt="Document Preview" 
                        className="document-image"
                      />
                      <p className="preview-label">ID Document Preview</p>
                    </div>
                  ) : (
                    <div className="document-link-container">
                      <a 
                        href={getDocumentUrl(userData.document)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="document-link"
                      >
                        View Document
                      </a>
                      <p className="document-type">PDF Document</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import '../Pages/CSS/SellerForm.css' // Assuming you have a CSS file for styling
import { useNavigate } from 'react-router-dom';
import { SHOP_ADDRESS } from '../constants/shopInfo';

// Define the backend URL
const backend_url = 'http://localhost:4000';

function SellerForm() {
    const navigate = useNavigate();
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [productDetails, setProductDetails] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState('');
    const [size, setSize] = useState('');
    const [waist, setWaist] = useState('');
    const [length, setLength] = useState('');
    const [images, setImages] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [errors, setErrors] = useState({});
    const [userVerification, setUserVerification] = useState({
        hasUpi: false,
        hasDocument: false,
    });
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        checkUserVerification();
        fetchUserProfile();
    }, []);

    const checkUserVerification = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${backend_url}/api/auth/getuser`, {
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                }
            });

            const data = await response.json();
            if (data.success) {
                setUserVerification({
                    hasUpi: !!data.user.upiId,
                    hasDocument: !!data.user.document,
                });
            }
        } catch (error) {
            console.error('Error checking user verification:', error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${backend_url}/api/auth/getuser`, {
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                }
            });

            const data = await response.json();
            if (data.success) {
                setUserProfile(data.user);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    // Validation functions
    const validateProductName = (name) => {
        if (!name.trim()) return 'Product name is required';
        if (name.length < 3) return 'Product name must be at least 3 characters';
        if (name.length > 50) return 'Product name must be less than 50 characters';
        return '';
    };

    const validatePrice = (price) => {
        if (!price) return 'Price is required';
        if (isNaN(price)) return 'Price must be a number';
        if (price <= 0) return 'Price must be greater than 0';
        if (price > 100000) return 'Price must be less than 1,00,000';
        return '';
    };

    const validateProductDetails = (details) => {
        if (!details.trim()) return 'Product details are required';
        if (details.length < 20) return 'Product details must be at least 20 characters';
        if (details.length > 500) return 'Product details must be less than 500 characters';
        return '';
    };

    const validateImages = (images) => {
        if (images.length === 0) return 'At least one image is required';
        if (images.length > 5) return 'Maximum 5 images allowed';
        
        for (let image of images) {
            if (image.size > 5 * 1024 * 1024) return 'Each image must be less than 5MB';
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(image.type)) {
                return 'Only JPG, JPEG, and PNG images are allowed';
            }
        }
        return '';
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const imageError = validateImages(files);
        
        if (imageError) {
            setErrors(prev => ({ ...prev, images: imageError }));
            return;
        }
        
        setImages(files);
        setErrors(prev => ({ ...prev, images: '' }));
    };

    const handleImageRemove = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        
        const imageError = validateImages(newImages);
        setErrors(prev => ({ ...prev, images: imageError }));
    };

    const validateForm = () => {
        const newErrors = {
            productName: validateProductName(productName),
            price: validatePrice(price),
            productDetails: validateProductDetails(productDetails),
            category: !category ? 'Category is required' : '',
            type: !type ? 'Type is required' : '',
            images: validateImages(images)
        };

        // Validate size for tops
        if (type === 'tops' && !size) {
            newErrors.size = 'Size is required for tops';
        }

        // Validate measurements for bottoms
        if (type === 'bottoms') {
            if (!waist) newErrors.waist = 'Waist measurement is required';
            if (!length) newErrors.length = 'Length measurement is required';
            if (category !== 'kids' && (isNaN(waist) || waist <= 0)) {
                newErrors.waist = 'Waist must be a valid number';
            }
            if (isNaN(length) || length <= 0) {
                newErrors.length = 'Length must be a valid number';
            }
        }

        console.log('Form validation errors:', newErrors); // Debug log

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userProfile) {
            setErrors(prev => ({
                ...prev,
                submit: 'User profile information not available'
            }));
            return;
        }

        if (!userVerification.hasUpi || !userVerification.hasDocument) {
            setErrors(prev => ({
                ...prev,
                submit: 'Please add your UPI ID and upload a valid document in your profile before selling.'
            }));
            return;
        }

        if (!validateForm()) {
            return;
        }

        const authToken = localStorage.getItem("auth-token");
        if (!authToken) {
            alert("Please login to submit a product");
            return;
        }
        
        try {
            // Upload images first
            const uploadedImages = [];
            for (const image of images) {
                const formData = new FormData();
                formData.append('product', image);
                
                const uploadResponse = await fetch(`${backend_url}/upload`, {
                    method: 'POST',
                    headers: {
                        'auth-token': authToken
                    },
                    body: formData,
                });
                
                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload images');
                }
                
                const uploadData = await uploadResponse.json();
                if (uploadData.success) {
                    uploadedImages.push(uploadData.image_url);
                }
            }

            if (uploadedImages.length === 0) {
                throw new Error('No images were uploaded successfully');
            }

            // Prepare product data with user information
            const productData = {
                name: productName,
                price: parseFloat(price),
                description: productDetails,
                category: category,
                type: type,
                images: uploadedImages,
                ...(type === 'tops' && { size }),
                ...(type === 'bottoms' && {
                    waist: category === 'kids' ? waist : parseFloat(waist),
                    length: parseFloat(length)
                })
            };

            console.log('Submitting product data:', productData); // Debug log

            // Submit to seller data only
            const response = await fetch(`${backend_url}/api/seller-data/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit data');
            }

            const data = await response.json();
            
            if (data.success) {
                // Clear form
                setProductName('');
                setPrice('');
                setProductDetails('');
                setCategory('');
                setType('');
                setSize('');
                setWaist('');
                setLength('');
                setImages([]);
                setErrors({});
                
                // Show success popup
                setShowPopup(true);
                
                // Redirect after delay
                setTimeout(() => {
                    navigate('/my-requests');
                }, 2000);
            } else {
                throw new Error(data.message || 'Failed to submit data');
            }
        } catch (error) {
            console.error('Error submitting data:', error);
            setErrors(prev => ({ 
                ...prev, 
                submit: error.message || 'Error submitting request. Please try again.' 
            }));
        }
    };

    const closePopup = () => {
        setShowPopup(false); // Close the popup
    };

    // Reset dependent fields when category changes
    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setType('');
        setSize('');
        setWaist('');
        setLength('');
    };

    // Reset size/measurements when type changes
    const handleTypeChange = (e) => {
        setType(e.target.value);
        setSize('');
        setWaist('');
        setLength('');
    };

    return (
        <div className="seller-form-container">
            <div className="form-section">
                <h1>Seller Form</h1>
                
                {/* Shop Address Section */}
                <div className="shop-address-section">
                    <h2>Shop Details</h2>
                    <div className="shop-address-card">
                        <h3>{SHOP_ADDRESS.name}</h3>
                        <p>{SHOP_ADDRESS.location}</p>
                        <p>{SHOP_ADDRESS.street}</p>
                        <p>{SHOP_ADDRESS.city} - {SHOP_ADDRESS.pincode}</p>
                        <p>{SHOP_ADDRESS.state}, {SHOP_ADDRESS.country}</p>
                    </div>
                    <p className="address-note"></p>
                </div>

                {/* User Profile Information Section */}
                {userProfile && (
                    <div className="user-profile-section">
                        <h3>Seller Information</h3>
                        <div className="user-info-card">
                            <div className="user-info-item">
                                <span className="info-label">Name:</span>
                                <span className="info-value">{userProfile.name}</span>
                            </div>
                            <div className="user-info-item">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{userProfile.email}</span>
                            </div>
                            <div className="user-info-item">
                                <span className="info-label">UPI ID:</span>
                                <span className="info-value">{userProfile.upiId || 'Not set'}</span>
                            </div>
                            
                            {/* Address Information */}
                            <div className="address-info">
                                <h4>Contact & Address</h4>
                                <div className="user-info-item">
                                    <span className="info-label">Phone:</span>
                                    <span className="info-value">{userProfile.address?.phone || 'Not set'}</span>
                                </div>
                                <div className="user-info-item">
                                    <span className="info-label">Street:</span>
                                    <span className="info-value">{userProfile.address?.street || 'Not set'}</span>
                                </div>
                                <div className="user-info-item">
                                    <span className="info-label">City:</span>
                                    <span className="info-value">{userProfile.address?.city || 'Not set'}</span>
                                </div>
                                <div className="user-info-item">
                                    <span className="info-label">State:</span>
                                    <span className="info-value">{userProfile.address?.state || 'Not set'}</span>
                                </div>
                                <div className="user-info-item">
                                    <span className="info-label">ZIP Code:</span>
                                    <span className="info-value">{userProfile.address?.zipCode || 'Not set'}</span>
                                </div>
                                <div className="user-info-item">
                                    <span className="info-label">Country:</span>
                                    <span className="info-value">{userProfile.address?.country || 'Not set'}</span>
                                </div>
                            </div>

                            {/* Document Information */}
                            <div className="document-info">
                                <h4>Document Status</h4>
                                <div className="user-info-item">
                                    <span className="info-label">Document:</span>
                                    <span className={`info-value ${userProfile.document ? 'verified' : 'pending'}`}>
                                        {userProfile.document ? 'Uploaded' : 'Not Uploaded'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Add a button to edit profile if information is missing */}
                        {(!userProfile.upiId || !userProfile.document || !userProfile.address?.phone) && (
                            <div className="complete-profile-warning">
                                <p>Please complete your profile information before selling</p>
                                <button 
                                    className="edit-profile-btn"
                                    onClick={() => navigate('/profile')}
                                >
                                    Complete Profile
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Add verification status section */}
                <div className="verification-status">
                    <h3>Seller Verification </h3>
                    <div className="status-items">
                        <div className={`status-item ${userVerification.hasUpi ? 'verified' : 'pending'}`}>
                            <span className="status-label">UPI ID:</span>
                            <span className="status-value">
                                {userVerification.hasUpi ? 'Added' : 'Not Added'}
                            </span>
                        </div>
                        <div className={`status-item ${userVerification.hasDocument ? 'added' : 'missing'}`}>
                            <span className="status-label">valid document:</span>
                            <span className="status-value">
                                {userVerification.hasDocument ? 'Added' : 'Not Uploaded'}
                            </span>
                        </div>
                    </div>
                    {(!userVerification.hasUpi || !userVerification.hasDocument) && (
                        <div className="verification-message">
                            <p>To start selling, please complete your profile verification:</p>
                            <button 
                                className="complete-profile-btn"
                                onClick={() => navigate('/profile')}
                            >
                                Complete Profile Verification
                            </button>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="seller-form">
                    <div className="form-group">
                        <label htmlFor="productName">Product Name</label>
                        <input
                            type="text"
                            id="productName"
                            value={productName}
                            onChange={(e) => {
                                setProductName(e.target.value);
                                setErrors(prev => ({ ...prev, productName: validateProductName(e.target.value) }));
                            }}
                            className={errors.productName ? 'error-input' : ''}
                        />
                        {errors.productName && <span className="error-message">{errors.productName}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="price">Price</label>
                        <input
                            type="number"
                            id="price"
                            value={price}
                            onChange={(e) => {
                                setPrice(e.target.value);
                                setErrors(prev => ({ ...prev, price: validatePrice(e.target.value) }));
                            }}
                            className={errors.price ? 'error-input' : ''}
                        />
                        {errors.price && <span className="error-message">{errors.price}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            value={category}
                            onChange={handleCategoryChange}
                            required
                        >
                            <option value="">Select a category</option>
                            <option value="mens">Mens</option>
                            <option value="womens">Womens</option>
                            <option value="kids">Kids</option>
                        </select>
                    </div>

                    {/* For Mens Category */}
                    {category === 'mens' && (
                        <div className="form-group">
                            <label htmlFor="type">Type</label>
                            <select
                                id="type"
                                value={type}
                                onChange={handleTypeChange}
                                required
                            >
                                <option value="">Select type</option>
                                <option value="tops">Tops</option>
                                <option value="bottoms">Bottoms</option>
                            </select>
                        </div>
                    )}

                    {/* For Womens Category */}
                    {category === 'womens' && (
                        <div className="form-group">
                            <label htmlFor="type">Type</label>
                            <select
                                id="type"
                                value={type}
                                onChange={handleTypeChange}
                                required
                            >
                                <option value="">Select type</option>
                                <option value="tops">Tops</option>
                                <option value="bottoms">Bottoms</option>
                            </select>
                        </div>
                    )}

                    {/* For Kids Category */}
                    {category === 'kids' && (
                        <div className="form-group">
                            <label htmlFor="type">Type</label>
                            <select
                                id="type"
                                value={type}
                                onChange={handleTypeChange}
                                required
                            >
                                <option value="">Select type</option>
                                <option value="tops">Tops</option>
                                <option value="bottoms">Bottoms</option>
                            </select>
                        </div>
                    )}

                    {/* Size options for Tops - All Categories */}
                    {(category === 'mens' || category === 'womens' || category === 'kids') && type === 'tops' && (
                        <div className="form-group">
                            <label htmlFor="size">Size</label>
                            <select
                                id="size"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                required
                            >
                                <option value="">Select size</option>
                                {category === 'kids' ? (
                                    // Kids sizes
                                    <>
                                        <option value="2-3Y">2-3 Years</option>
                                        <option value="4-5Y">4-5 Years</option>
                                        <option value="6-7Y">6-7 Years</option>
                                        <option value="8-9Y">8-9 Years</option>
                                        <option value="10-11Y">10-11 Years</option>
                                        <option value="12-13Y">12-13 Years</option>
                                    </>
                                ) : (
                                    // Adult sizes
                                    <>
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                        <option value="XXL">XXL</option>
                                    </>
                                )}
                            </select>
                        </div>
                    )}

                    {/* Measurements for Bottoms - All Categories */}
                    {(category === 'mens' || category === 'womens' || category === 'kids') && type === 'bottoms' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="waist">
                                    {category === 'kids' ? 'Waist Size (Age)' : 'Waist Size (inches)'}
                                </label>
                                {category === 'kids' ? (
                                    <select
                                        id="waist"
                                        value={waist}
                                        onChange={(e) => setWaist(e.target.value)}
                                        required
                                    >
                                        <option value="">Select age group</option>
                                        <option value="2-3Y">2-3 Years</option>
                                        <option value="4-5Y">4-5 Years</option>
                                        <option value="6-7Y">6-7 Years</option>
                                        <option value="8-9Y">8-9 Years</option>
                                        <option value="10-11Y">10-11 Years</option>
                                        <option value="12-13Y">12-13 Years</option>
                                    </select>
                                ) : (
                                    <input
                                        type="number"
                                        id="waist"
                                        value={waist}
                                        onChange={(e) => setWaist(e.target.value)}
                                        required
                                    />
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="length">Length (inches)</label>
                                <input
                                    type="number"
                                    id="length"
                                    value={length}
                                    onChange={(e) => setLength(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label htmlFor="productDetails">Product Details</label>
                        <textarea
                            id="productDetails"
                            value={productDetails}
                            onChange={(e) => setProductDetails(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="images">Upload Images</label>
                        <input
                            type="file"
                            id="images"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                    <div className="image-preview">
                        {Array.from(images).map((image, index) => (
                            <div key={index} className="image-thumbnail-container">
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt={`Preview ${index + 1}`}
                                    className="image-thumbnail"
                                />
                                <span onClick={() => handleImageRemove(index)} className="remove-image-cross">✖</span>
                            </div>
                        ))}
                    </div>
                    {errors.images && <div className="error-message">{errors.images}</div>}
                    {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
                    <button type="submit" className="submit-btn">Submit Selling Request</button>
                </form>
            </div>
            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <button className="close-button" onClick={() => setShowPopup(false)}>×</button>
                        <div className="success-icon">✓</div>
                        <h2>Request Submitted!</h2>
                        <p>Your product has been submitted for review. We'll notify you once it's approved.</p>
                    </div>
                </div>
            )}
            <div className="design-section"></div> {/* This section can be styled further */}
        </div>
    );
}

export default SellerForm;

import React, { useState } from 'react';
import '../Pages/CSS/SellerForm.css' // Assuming you have a CSS file for styling

// Define the backend URL
const backend_url = 'http://localhost:4000';

function SellerForm() {
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [size, setSize] = useState('');
    const [length, setLength] = useState('');
    const [chest, setChest] = useState('');
    const [shoulder, setShoulder] = useState('');
    const [productDetails, setProductDetails] = useState('');
    const [category, setCategory] = useState(''); // New state for category
    const [images, setImages] = useState([]);
    const [showPopup, setShowPopup] = useState(false); // New state for popup visibility

    const handleImageChange = (e) => {
        setImages([...e.target.files]);
    };

    const handleImageRemove = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
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
                
                const uploadData = await uploadResponse.json();
                if (uploadData.success) {
                    uploadedImages.push(uploadData.image_url);
                }
            }

            // Prepare product data
            const productData = {
                name: productName,
                description: productDetails,
                price: parseFloat(price),
                size: size,
                length: parseFloat(length),
                chest: parseFloat(chest),
                shoulder: parseFloat(shoulder),
                category: category,
                images: uploadedImages,
            };

            // Submit product
            const response = await fetch(`${backend_url}/submit-product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify(productData),
            });

            const data = await response.json();
            if (data.success) {
                setShowPopup(true);
                // Clear form fields
                setProductName('');
                setPrice('');
                setSize('');
                setLength('');
                setChest('');
                setShoulder('');
                setProductDetails('');
                setCategory('');
                setImages([]);
                alert("Product submitted successfully!");
            } else {
                alert(data.message || 'Failed to submit product');
            }
        } catch (error) {
            console.error('Error submitting product:', error);
            alert('Error submitting product. Please try again.');
        }
    };

    const closePopup = () => {
        setShowPopup(false); // Close the popup
    };

    return (
        <div className="seller-form-container">
            <div className="form-section">
                <h1>Seller Form</h1>
                <form onSubmit={handleSubmit} className="seller-form">
                    <div className="form-group">
                        <label htmlFor="productName">Product Name</label>
                        <input
                            type="text"
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Price</label>
                        <input
                            type="number"
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="size">Size</label>
                        <input
                            type="text"
                            id="size"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="length">Length</label>
                        <input
                            type="number"
                            id="length"
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="chest">Chest</label>
                        <input
                            type="number"
                            id="chest"
                            value={chest}
                            onChange={(e) => setChest(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="shoulder">Shoulder</label>
                        <input
                            type="number"
                            id="shoulder"
                            value={shoulder}
                            onChange={(e) => setShoulder(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <input
                            type="text"
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                    </div>
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
                    <button type="submit" className="submit-btn">Submit Selling Request</button>
                </form>
            </div>
            {showPopup && ( // Popup for submission confirmation
                <div className="popup-overlay">
                    <div className="popup-content">
                        <span className="close" onClick={closePopup}>&times;</span>
                        <h2>Submission Successful</h2>
                        <p>Product submitted to administrator. Please wait for the Gmail notification.</p>
                    </div>
                </div>
            )}
            <div className="design-section"></div> {/* This section can be styled further */}
        </div>
    );
}

export default SellerForm;

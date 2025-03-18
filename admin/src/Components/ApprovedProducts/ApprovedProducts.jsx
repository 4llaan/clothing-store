import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './ApprovedProducts.css';

const ApprovedProducts = () => {
    const [approvedProducts, setApprovedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const backend_url = 'http://localhost:4000';
    const location = useLocation();

    useEffect(() => {
        fetchApprovedProducts();
    }, [location]);

    const fetchApprovedProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${backend_url}/api/seller-data/approved-products`, {
                headers: {
                    'auth-token': localStorage.getItem("auth-token"),
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                setApprovedProducts(result.data);
            } else {
                throw new Error(result.message || 'Failed to fetch approved products');
            }
        } catch (err) {
            console.error("Error fetching approved products:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const ProductCard = ({ product }) => {
        // Format the date with a fallback
        const formatDate = (dateString) => {
            if (!dateString) return 'Date not available';
            
            try {
                return new Date(dateString).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (error) {
                console.error('Error formatting date:', error);
                return 'Invalid date';
            }
        };

        return (
            <div className="product-card" onClick={() => setSelectedProduct(product)}>
                <div className="product-image">
                    <img src={`${backend_url}${product.images[0]}`} alt={product.productName} />
                    <div className="image-count">
                        <span>{product.images.length} photos</span>
                    </div>
                </div>
                <div className="product-info">
                    <h3>{product.productName}</h3>
                    <div className="price-category">
                        <span className="price">₹{product.price}</span>
                        <span className="category">{product.category} · {product.type}</span>
                    </div>
                    <div className="seller-preview">
                        <span>Seller: {product.userInfo.name}</span>
                    </div>
                    <div className="approval-date">
                        <span>Approved: {formatDate(product.updatedAt)}</span>
                    </div>
                </div>
            </div>
        );
    };

    const ProductModal = ({ product, onClose }) => {
        const [stockStatus, setStockStatus] = useState(product.stock || 'in_stock');
        const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
        const [isDeleting, setIsDeleting] = useState(false);
        
        const handleStockUpdate = async (newStatus) => {
            try {
                const response = await fetch(`${backend_url}/api/seller-data/update-stock/${product._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': localStorage.getItem('auth-token')
                    },
                    body: JSON.stringify({ stock: newStatus })
                });

                const data = await response.json();
                if (data.success) {
                    setStockStatus(newStatus);
                    // Update the product in the parent component
                    fetchApprovedProducts(); // This will refresh the entire list
                    // Optionally close the modal
                    onClose();
                }
            } catch (error) {
                console.error('Error updating stock status:', error);
            }
        };

        const handleDeleteProduct = async () => {
            try {
                setIsDeleting(true);

                const response = await fetch(`${backend_url}/api/seller-data/delete-approved/${product._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                if (data.success) {
                    // Update the products list
                    fetchApprovedProducts();
                    // Close the modal
                    onClose();
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product. Please try again.');
            } finally {
                setIsDeleting(false);
            }
        };

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <button className="modal-close" onClick={onClose}>×</button>
                    
                    <div className="modal-gallery">
                        <div className="main-image">
                            <img src={`${backend_url}${product.images[0]}`} alt={product.productName} />
                        </div>
                        <div className="image-thumbnails">
                            {product.images.map((image, index) => (
                                <img 
                                    key={index}
                                    src={`${backend_url}${image}`}
                                    alt={`${product.productName} ${index + 1}`}
                                    onClick={() => window.open(`${backend_url}${image}`, '_blank')}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="modal-details">
                        <div className="product-header">
                            <h2>{product.productName}</h2>
                            <span className="price">₹{product.price}</span>
                        </div>

                        <div className="details-section">
                            <h3>Product Details</h3>
                            <div className="specs-grid">
                                <div className="spec-item">
                                    <span className="label">Category</span>
                                    <span className="value">{product.category}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="label">Type</span>
                                    <span className="value">{product.type}</span>
                                </div>
                                {product.type === 'tops' && (
                                    <div className="spec-item">
                                        <span className="label">Size</span>
                                        <span className="value">{product.size}</span>
                                    </div>
                                )}
                                {product.type === 'bottoms' && (
                                    <>
                                        <div className="spec-item">
                                            <span className="label">Waist</span>
                                            <span className="value">{product.waist}</span>
                                        </div>
                                        <div className="spec-item">
                                            <span className="label">Length</span>
                                            <span className="value">{product.length}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="description">
                                <h4>Description</h4>
                                <p>{product.productDetails}</p>
                            </div>
                        </div>

                        <div className="seller-section">
                            <h3>Seller Information</h3>
                            <div className="seller-details">
                                <div className="seller-primary">
                                    <p><strong>Name:</strong> {product.userInfo.name}</p>
                                    <p><strong>Email:</strong> {product.userInfo.email}</p>
                                    <p><strong>Phone:</strong> {product.userInfo.address.phone}</p>
                                    <p><strong>UPI ID:</strong> {product.userInfo.upiId}</p>
                                </div>
                                
                                <div className="seller-document">
                                    <h4>Verification Document</h4>
                                    <div className="document-preview">
                                        <a 
                                            href={`${backend_url}${product.userInfo.document}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="document-link"
                                        >
                                            <img 
                                                src={`${backend_url}${product.userInfo.document}`}
                                                alt="Seller Document"
                                                className="document-thumbnail"
                                            />
                                            <span>View Document</span>
                                        </a>
                                    </div>
                                </div>

                                <div className="seller-address">
                                    <h4>Address</h4>
                                    <p>{product.userInfo.address.street}</p>
                                    <p>{product.userInfo.address.city}, {product.userInfo.address.state}</p>
                                    <p>{product.userInfo.address.zipCode}</p>
                                    <p>{product.userInfo.address.country}</p>
                                </div>
                            </div>
                        </div>

                        <div className="approval-info">
                            <small>Approved on: {new Date(product.updatedAt).toLocaleString()}</small>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="stock-management">
                            <h3>Stock Management</h3>
                            <div className="stock-controls">
                                <button 
                                    className={`stock-button ${stockStatus === 'in_stock' ? 'active' : ''}`}
                                    onClick={() => handleStockUpdate('in_stock')}
                                >
                                    In Stock
                                </button>
                                <button 
                                    className={`stock-button ${stockStatus === 'out_of_stock' ? 'active' : ''}`}
                                    onClick={() => handleStockUpdate('out_of_stock')}
                                >
                                    Out of Stock
                                </button>
                            </div>
                        </div>

                        <div className="divider"></div>

                        <div className="delete-section">
                            <h3>Danger Zone</h3>
                            {isConfirmingDelete ? (
                                <div className="confirm-delete">
                                    <p>Are you sure you want to delete this product? This action cannot be undone.</p>
                                    <div className="confirm-buttons">
                                        <button 
                                            className={`confirm-delete-btn ${isDeleting ? 'loading' : ''}`}
                                            onClick={handleDeleteProduct}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? '' : 'Yes, Delete Product'}
                                        </button>
                                        <button 
                                            className="cancel-delete-btn"
                                            onClick={() => setIsConfirmingDelete(false)}
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    className="delete-product-btn"
                                    onClick={() => setIsConfirmingDelete(true)}
                                >
                                    Delete Product
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading approved products...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={fetchApprovedProducts} className="retry-button">
                Try Again
            </button>
        </div>
    );

    return (
        <div className="approved-products-container">
            <h1>Approved Products</h1>
            {approvedProducts.length === 0 ? (
                <div className="no-products">
                    <p>No approved products found</p>
                </div>
            ) : (
                <div className="products-grid">
                    {approvedProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
            
            {selectedProduct && (
                <ProductModal 
                    product={selectedProduct} 
                    onClose={() => setSelectedProduct(null)} 
                />
            )}
        </div>
    );
};

export default ApprovedProducts; 
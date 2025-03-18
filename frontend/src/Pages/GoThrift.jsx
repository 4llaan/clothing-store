// GoThrift.js
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/GoThrift.css' // Optional: Add custom styling
import { ShopContext } from '../Context/ShopContext';

const GoThrift = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        type: ''
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const navigate = useNavigate();
    const { addToCart, cartItems } = useContext(ShopContext);
    
    // Make sure this matches your actual backend URL
    const backend_url = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
    const [stockFilter, setStockFilter] = useState('all');
    const [cartMessage, setCartMessage] = useState({ show: false, type: '', text: '' });

    // Add debounce function
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${backend_url}/api/seller-data/approved-products?stock=${stockFilter}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('Error details:', error);
            setError('Failed to load products. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Debounced version of fetchProducts
    const debouncedFetchProducts = React.useCallback(
        debounce(fetchProducts, 1000),
        []
    );

    // Effect for initial load and polling
    useEffect(() => {
        fetchProducts(); // Initial fetch

        // Set up polling every 60 seconds instead of 30
        const interval = setInterval(debouncedFetchProducts, 60000);

        return () => {
            clearInterval(interval);
        };
    }, [stockFilter]);

    // Effect to refresh when cart changes - use debounced version
    useEffect(() => {
        debouncedFetchProducts();
    }, [cartItems]);

    // Effect to listen for custom events
    useEffect(() => {
        // Listen for payment completion event
        const handlePaymentComplete = () => {
            console.log('Payment completed, refreshing products');
            fetchProducts();
        };

        window.addEventListener('paymentComplete', handlePaymentComplete);

        return () => {
            window.removeEventListener('paymentComplete', handlePaymentComplete);
        };
    }, []);

    // Function to force refresh products
    const forceRefreshProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${backend_url}/api/seller-data/approved-products?stock=${stockFilter}&t=${Date.now()}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Error refreshing products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredProducts = products.filter(product => {
        if (filters.category && product.category !== filters.category) return false;
        if (filters.type && product.type !== filters.type) return false;
        return true;
    });

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setSelectedImage(0);
    };

    const showCartMessage = (type, text) => {
        setCartMessage({ show: true, type, text });
        setTimeout(() => setCartMessage({ show: false, type: '', text: ''}), 3000);
    };

    const ProductModal = ({ product, onClose }) => {
        const handleAddToCart = async () => {
            try {
                if (!localStorage.getItem("auth-token")) {
                    showCartMessage('error', 'Please login to add items to cart');
                    return;
                }

                // Use the addToCart function from ShopContext
                const size = product.type === 'tops' ? product.size : 
                           product.type === 'bottoms' ? `W${product.waist}/L${product.length}` : '';
                
                await addToCart(product._id, size, true);
                showCartMessage('success', 'Added to cart successfully!');
                
                // Refresh products after adding to cart
                fetchProducts();
            } catch (error) {
                console.error('Error adding to cart:', error);
                showCartMessage('error', 'Failed to add to cart');
            }
        };

        const handleBuyNow = () => {
            if (!localStorage.getItem("auth-token")) {
                showCartMessage('error', 'Please login to proceed');
                return;
            }

            // Prepare the order details in the format expected by the review page
            const checkoutItems = [{
                id: product._id,
                name: product.productName,
                price: product.price,
                quantity: 1,
                size: product.type === 'tops' ? product.size : 
                      product.type === 'bottoms' ? `W${product.waist}/L${product.length}` : 'N/A',
                images: product.images,
                subTotal: product.price,
                category: product.category,
                type: product.type,
                sellerId: product.userInfo._id,
                sellerName: product.userInfo.name,
                sellerEmail: product.userInfo.email,
                productDetails: product.productDetails,
                isThriftProduct: true
            }];

            navigate('/review-order', {
                state: {
                    cartItems: checkoutItems,
                    totalAmount: product.price,
                    fromCart: false,
                    isThriftProduct: true
                }
            });
        };

        if (!product) return null;

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <button className="modal-close" onClick={onClose}>×</button>
                    
                    <div className="modal-gallery">
                        <div className="main-image">
                            <img 
                                src={`${backend_url}${product.images[selectedImage]}`} 
                                alt={product.productName}
                            />
                        </div>
                        <div className="image-thumbnails">
                            {product.images.map((image, index) => (
                                <img 
                                    key={index}
                                    src={`${backend_url}${image}`}
                                    alt={`${product.productName} ${index + 1}`}
                                    className={selectedImage === index ? 'active' : ''}
                                    onClick={() => setSelectedImage(index)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="modal-details">
                        <div className="product-header">
                            <h2>{product.productName}</h2>
                            <div className="price-stock-container">
                                <span className="price">
                                    {new Intl.NumberFormat('en-IN', {
                                        style: 'currency',
                                        currency: 'INR',
                                        maximumFractionDigits: 0
                                    }).format(product.price)}
                                </span>
                                <span className={`stock-badge ${product.stock || 'in_stock'}`}>
                                    {product.stock === 'out_of_stock' ? 'Out of Stock' : 'In Stock'}
                                </span>
                            </div>
                        </div>

                        <div className="product-actions">
                            <button 
                                className="add-to-cart-btn"
                                onClick={handleAddToCart}
                                disabled={product.stock === 'out_of_stock'}
                            >
                                <span className="icon">🛒</span>
                                Add to Cart
                            </button>
                            <button 
                                className="buy-now-btn"
                                onClick={handleBuyNow}
                                disabled={product.stock === 'out_of_stock'}
                            >
                                <span className="icon">⚡</span>
                                Buy Now
                            </button>
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
                                {product.type === 'tops' && product.size && (
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
                                <p><strong>Name:</strong> {product.userInfo.name}</p>
                                <p><strong>Email:</strong> {product.userInfo.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ProductCard = ({ product }) => {
        const formatPrice = (price) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(price);
        };

        return (
            <div 
                className="product-card"
                onClick={() => handleProductClick(product)}
            >
                <div className="product-image">
                    <img 
                        src={`${backend_url}${product.images[0]}`} 
                        alt={product.productName}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-image.jpg';
                        }}
                    />
                    {product.images.length > 1 && (
                        <div className="image-count">
                            <span>{product.images.length} photos</span>
                        </div>
                    )}
                    <div className="product-category">
                        {product.category} · {product.type}
                    </div>
                    <div className={`stock-status ${product.stock || 'in_stock'}`}>
                        {product.stock === 'out_of_stock' ? 'Out of Stock' : 'In Stock'}
                    </div>
                </div>
                <div className="product-info">
                    <h3>{product.productName}</h3>
                    <div className="product-details">
                        {product.type === 'tops' && product.size && (
                            <span className="size">Size: {product.size}</span>
                        )}
                        {product.type === 'bottoms' && (
                            <div className="size-info">
                                {product.waist && <span className="size">Waist: {product.waist}</span>}
                                {product.length && <span className="size">Length: {product.length}</span>}
                            </div>
                        )}
                    </div>
                    <div className="price-container">
                        <span className="price">{formatPrice(product.price)}</span>
                    </div>
                    <div className="seller-info">
                        <small>Seller: {product.userInfo.name}</small>
                    </div>
                    <p className="description">
                        {product.productDetails.length > 100 
                            ? `${product.productDetails.slice(0, 100)}...` 
                            : product.productDetails}
                    </p>
                </div>
            </div>
        );
    };

    // Effect to listen for stock updates
    useEffect(() => {
        const handleStockUpdate = () => {
            console.log('Stock update detected, refreshing products');
            forceRefreshProducts();
        };

        window.addEventListener('stockUpdated', handleStockUpdate);

        return () => {
            window.removeEventListener('stockUpdated', handleStockUpdate);
        };
    }, []);

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={fetchProducts} className="retry-button">Try Again</button>
        </div>
    );

    return (
        <div className="go-thrift">
            <div className="header-section">
                <h1>Welcome to Go Thrift</h1>
                <p>Discover pre-loved fashion at amazing prices</p>
            </div>

            <div className="filters-section">
                <select 
                    name="category" 
                    value={filters.category} 
                    onChange={handleFilterChange}
                    className="category-filter"
                >
                    <option value="">All Categories</option>
                    <option value="mens">Men's</option>
                    <option value="womens">Women's</option>
                    <option value="kids">Kids</option>
                </select>

                <select 
                    name="type" 
                    value={filters.type} 
                    onChange={handleFilterChange}
                    className="type-filter"
                >
                    <option value="">All Types</option>
                    <option value="tops">Tops</option>
                    <option value="bottoms">Bottoms</option>
                </select>

                <select 
                    name="stock" 
                    value={stockFilter} 
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="stock-filter"
                >
                    <option value="all">All Items</option>
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                </select>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="no-products">
                    <p>No products available for the selected filters.</p>
                </div>
            ) : (
                <div className="product-grid">
                    {filteredProducts.map(product => (
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

            {cartMessage.show && (
                <div className={`cart-message ${cartMessage.type}`}>
                    {cartMessage.text}
                </div>
            )}
        </div>
    );
};

export default GoThrift;

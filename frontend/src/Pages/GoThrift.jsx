// GoThrift.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/GoThrift.css' // Optional: Add custom styling

const GoThrift = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const backend_url = 'http://localhost:4000'; // Add your backend URL

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${backend_url}/api/accepted-products`);
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="go-thrift">
            <h1>Welcome to Go Thrift</h1>
            <p>Discover a wide range of pre-loved, thrifted items at unbeatable prices.</p>
            <div className="product-grid">
                {products.map(product => (
                    <div 
                        key={product.id} 
                        className="product-card"
                        onClick={() => handleProductClick(product.id)}
                    >
                        <div className="product-image">
                            <img 
                                src={`${backend_url}${product.image}`} 
                                alt={product.name} 
                            />
                        </div>
                        <div className="product-info">
                            <h3>{product.name}</h3>
                            <p className="description">{product.description}</p>
                            <div className="price-container">
                                <span className="new-price">₹{product.new_price}</span>
                                {product.old_price && (
                                    <span className="old-price">₹{product.old_price}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GoThrift;

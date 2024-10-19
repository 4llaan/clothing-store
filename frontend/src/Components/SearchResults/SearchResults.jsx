import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom'; // Import Link for navigation
import './SearchResults.css'; // Add CSS for styling
import { backend_url } from '../../App'; // Import backend URL if necessary

const SearchResults = () => {
  const [products, setProducts] = useState([]); // State to hold the search results
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q'); // Extract query param from URL

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/search?query=${query}`);
        const data = await response.json();

        if (response.ok) {
          setProducts(data.results); // Adjusting to match the response structure
        } else {
          setError(data.message || 'Failed to fetch search results'); // Enhanced error handling
        }
      } catch (err) {
        setError('Something went wrong while fetching the search results.');
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    } else {
      setProducts([]); // Reset products if no query
    }
  }, [query]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="search-results">
      <h2>Search Results for "{query}"</h2>
      {products.length > 0 ? (
        <div className="search-results-grid">
          {products.map((product) => (
            <div key={product._id} className="search-result-item">
              {/* Wrap product image and name with Link */}
              <Link to={`/product/${product._id}`}>
                <img 
                  src={`${backend_url}${product.image}`} 
                  alt={product.name} 
                  className="search-product-image" 
                />
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>New Price: {product.new_price}</p>
                <p>Old Price: {product.old_price}</p>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div>No products found for "{query}".</div>
      )}
    </div>
  );
};

export default SearchResults;

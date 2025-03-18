import React, { useEffect, useState } from 'react';
import './RelatedProducts.css';
import Item from '../Item/Item';
import { backend_url } from '../../App';
import { useNavigate } from 'react-router-dom';

const RelatedProducts = ({ category, id }) => {
  const [related, setRelated] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (category) {
      fetch(`${backend_url}/relatedproducts`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: category }),
      })
        .then((res) => res.json())
        .then((data) => {
          // Process data to ensure images array exists for each product
          const processedData = data.map(item => ({
            ...item,
            images: item.images || [item.image]
          }));
          setRelated(processedData);
        })
        .catch((error) => console.error('Error fetching related products:', error));
    }
  }, [category]);

  const handleProductClick = (productId) => {
    // Navigate to the product page
    navigate(`/product/${productId}`);
    // Scroll to top
    window.scrollTo(0, 0);
  };

  return (
    <div className='relatedproducts'>
      <h1>Related Products</h1>
      <hr />
      <div className="relatedproducts-item">
        {related.map((item) => {
          // Don't show the current product in related products
          if (id !== item._id) {
            return (
              <div 
                key={item._id} 
                onClick={() => handleProductClick(item._id)}
                className="related-item-wrapper"
              >
                <Item
                  id={item._id}
                  name={item.name}
                  images={item.images}  // Pass images array instead of single image
                  new_price={item.new_price}
                  old_price={item.old_price}
                  subcategory={item.subcategory}
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default RelatedProducts;

import React from 'react';
import './Item.css';
import { Link } from 'react-router-dom';
import { backend_url, currency } from '../../App';

const Item = (props) => {
  // Use the first image from the images array
  const displayImage = Array.isArray(props.images) && props.images.length > 0 
    ? props.images[0] 
    : props.image; // Fallback to single image for backward compatibility

  return (
    <div className='item'>
      {/* Product Image */}
      <Link to={`/product/${props.id}`}>
        <img onClick={window.scrollTo(0, 0)} src={backend_url + displayImage} alt="product" />
      </Link>

      {/* Product Name */}
      <p>{props.name}</p>

      {/* Subcategory (New Addition) */}
      {props.subcategory && (
        <div className="item-subcategory">
          Subcategory: {props.subcategory}
        </div>
      )}

      {/* Prices */}
      <div className="item-prices">
        <div className="item-price-new">{currency}{props.new_price}</div>
        <div className="item-price-old">{currency}{props.old_price}</div>
      </div>
    </div>
  );
}

export default Item;

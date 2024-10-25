import React from 'react';
import './Item.css';
import { Link } from 'react-router-dom';
import { backend_url, currency } from '../../App';

const Item = (props) => {
  return (
    <div className='item'>
      {/* Product Image */}
      <Link to={`/product/${props.id}`}>
        <img onClick={window.scrollTo(0, 0)} src={backend_url + props.image} alt="product" />
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

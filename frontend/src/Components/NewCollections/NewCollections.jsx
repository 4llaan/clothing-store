import React from 'react';
import './NewCollections.css';
import Item from '../Item/Item';

const NewCollections = (props) => {
  return (
    <div className="new-collections">
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="collections">
        {props.data.map((item, index) => {
          // Convert single image to array if needed
          const images = Array.isArray(item.images) ? item.images : [item.image];
          
          return (
            <Item
              id={item._id}
              key={index}
              name={item.name}
              images={images} // Pass images array instead of single image
              new_price={item.new_price}
              old_price={item.old_price}
              subcategory={item.subcategory}
            />
          );
        })}
      </div>
    </div>
  );
};

export default NewCollections;

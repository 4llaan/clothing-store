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
          return (
            <Item
              id={item._id}  // Ensure this is the correct unique ID
              key={index}
              name={item.name}
              image={item.image}
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

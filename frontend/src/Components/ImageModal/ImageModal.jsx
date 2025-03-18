import React from 'react';
import './ImageModal.css';

const ImageModal = ({ image, onClose }) => {
  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content">
        <span className="image-modal-close" onClick={onClose}>&times;</span>
        <img src={image} alt="Full size" className="image-modal-img" />
      </div>
    </div>
  );
};

export default ImageModal; 
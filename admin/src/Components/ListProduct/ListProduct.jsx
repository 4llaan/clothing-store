import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png'
import { backend_url, currency } from "../../App";
// import edit_icon from '../Assets/edit_icon.png';
import upload_area from "../Assets/upload_area.svg";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInfo = async () => {
    try {
      const response = await fetch(`${backend_url}/allproducts`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Process data to ensure images array exists for each product
      const processedData = data.map(item => ({
        ...item,
        images: item.images || [item.image] // Convert single image to array if needed
      }));
      setAllProducts(processedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please check if the backend server is running.");
      setAllProducts([]);
    }
  }

  useEffect(() => {
    fetchInfo();
  }, []);

  const removeProduct = async (id) => {
    try {
      const response = await fetch(`${backend_url}/removeproduct`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchInfo();
    } catch (err) {
      console.error("Error removing product:", err);
      setError("Failed to remove product. Please try again.");
    }
  }

  const handleEditClick = (product) => {
    setEditingProduct({
      ...product,
      new_price: product.new_price.toString(),
      old_price: product.old_price.toString()
    });
    setNewImages([]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prevImages => [...prevImages, ...files]);
  };

  const removeNewImage = (index) => {
    setNewImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setEditingProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    setLoading(true);

    try {
      // First upload new images if any
      const imageUrls = [...editingProduct.images]; // Start with existing images
      
      for (let image of newImages) {
        const formData = new FormData();
        formData.append("product", image);

        const imageResponse = await fetch(`${backend_url}/upload`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        });

        if (!imageResponse.ok) {
          throw new Error(`Image upload failed`);
        }

        const dataObj = await imageResponse.json();
        if (dataObj.success) {
          imageUrls.push(dataObj.image_url);
        }
      }

      // Update product with new data
      const updatedProduct = {
        id: editingProduct._id, // Make sure to use _id instead of id
        name: editingProduct.name,
        category: editingProduct.category,
        subcategory: editingProduct.subcategory,
        new_price: Number(editingProduct.new_price),
        old_price: Number(editingProduct.old_price),
        images: imageUrls,
        description: editingProduct.description
      };

      console.log('Sending update request with data:', updatedProduct); // Debug log

      const response = await fetch(`${backend_url}/updateproduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      const data = await response.json();
      if (data.success) {
        alert('Product updated successfully');
        setEditingProduct(null);
        setNewImages([]);
        await fetchInfo();
      } else {
        throw new Error(data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert(error.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      {error && <div className="error-message" style={{color: 'red', padding: '10px'}}>{error}</div>}
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
        <p>Edit</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product, index) => (
          <div key={index}>
            <div className="listproduct-format-main listproduct-format">
              <div className="product-images-container">
                {product.images && product.images.map((image, imgIndex) => (
                  <img
                    key={imgIndex}
                    className="listproduct-product-icon"
                    src={`${backend_url}${image}`}
                    alt={`${product.name} - ${imgIndex + 1}`}
                  />
                ))}
              </div>
              <p className="cartitems-product-title">{product.name}</p>
              <p>{currency}{product.old_price || 0}</p>
              <p>{currency}{product.new_price || 0}</p>
              <p>{product.category}</p>
              <img 
                className="listproduct-remove-icon" 
                onClick={() => removeProduct(product.id)} 
                src={cross_icon} 
                alt="remove" 
              />
              <button 
                className="listproduct-edit-icon" 
                onClick={() => handleEditClick(product)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                ✎
              </button>
            </div>
            <hr />
          </div>
        ))}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h2>Edit Product</h2>
            
            <div className="edit-form">
              <div className="form-group">
                <label>New Price:</label>
                <input
                  type="number"
                  value={editingProduct.new_price}
                  onChange={(e) => setEditingProduct({...editingProduct, new_price: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Old Price:</label>
                <input
                  type="number"
                  value={editingProduct.old_price}
                  onChange={(e) => setEditingProduct({...editingProduct, old_price: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Current Images:</label>
                <div className="image-preview-container">
                  {editingProduct.images.map((image, index) => (
                    <div key={index} className="image-preview">
                      <img src={`${backend_url}${image}`} alt={`Product ${index + 1}`} />
                      <button type="button" onClick={() => removeExistingImage(index)}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Add New Images:</label>
                <div className="image-upload-container">
                  <label htmlFor="file-input" className="upload-label">
                    <img src={upload_area} alt="Upload" />
                    <span>Click to upload images</span>
                  </label>
                  <input
                    type="file"
                    id="file-input"
                    onChange={handleImageChange}
                    multiple
                    accept="image/*"
                    hidden
                  />
                </div>

                <div className="image-preview-container">
                  {newImages.map((image, index) => (
                    <div key={index} className="image-preview">
                      <img src={URL.createObjectURL(image)} alt={`New ${index + 1}`} />
                      <button type="button" onClick={() => removeNewImage(index)}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="edit-modal-buttons">
                <button onClick={handleUpdateProduct} disabled={loading}>
                  {loading ? "Updating..." : "Update Product"}
                </button>
                <button onClick={() => setEditingProduct(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListProduct;

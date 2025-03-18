import React, { useState } from "react";
import "./AddProduct.css";
import upload_area from "../Assets/upload_area.svg";
import { backend_url } from "../../App";

const AddProduct = () => {
  const [images, setImages] = useState([]); // Changed to array for multiple images
  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    images: [], // Changed to array
    category: "women",
    subcategory: "",
    new_price: "",
    old_price: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Subcategory options for men, women, and kids
  const subcategories = {
    women: ["T-Shirt", "Top", "Bottoms", "Jeans", "Hoodies","Shirts"],
    men: ["T-Shirt", "Bottoms", "Jeans", "Hoodies","Shirts"],
    kid: ["T-Shirt", "Shorts", "Jeans", "Jackets","Shirts"], // Add subcategory for kids
  };

  const validateForm = () => {
    if (!productDetails.name || !productDetails.description || images.length === 0 || !productDetails.new_price || !productDetails.old_price || !productDetails.subcategory) {
      alert("Please fill all fields and upload at least one image.");
      return false;
    }
    return true;
  };

  const addProduct = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Upload all images
      const imageUrls = [];
      for (let image of images) {
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
          throw new Error(`Image upload failed with status: ${imageResponse.status}`);
        }

        const dataObj = await imageResponse.json();
        if (dataObj.success) {
          imageUrls.push(dataObj.image_url);
        }
      }

      // Add product with all image URLs
      const product = {
        ...productDetails,
        images: imageUrls,
        new_price: Number(productDetails.new_price),
        old_price: Number(productDetails.old_price)
      };

      const productResponse = await fetch(`${backend_url}/addproduct`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      if (!productResponse.ok) {
        throw new Error(`Product addition failed with status: ${productResponse.status}`);
      }

      const productData = await productResponse.json();
      if (productData.success) {
        alert("Product Added");
        // Clear form
        setProductDetails({
          name: "",
          description: "",
          images: [],
          category: "women",
          subcategory: "",
          new_price: "",
          old_price: "",
        });
        setImages([]);
      } else {
        alert("Failed to add product");
      }
    } catch (err) {
      setError("An error occurred while adding the product.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prevImages => [...prevImages, ...files]);
  };

  const removeImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  return (
    <div className="addproduct">
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input
          type="text"
          name="name"
          value={productDetails.name}
          onChange={changeHandler}
          placeholder="Type here"
        />
      </div>
      <div className="addproduct-itemfield">
        <p>Product description</p>
        <input
          type="text"
          name="description"
          value={productDetails.description}
          onChange={changeHandler}
          placeholder="Type here"
        />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Old Price</p>
          <input
            type="number"
            name="old_price"
            value={productDetails.old_price}
            onChange={changeHandler}
            placeholder="Type here"
          />
        </div>
        <div className="addproduct-itemfield">
          <p>New Price</p>
          <input
            type="number"
            name="new_price"
            value={productDetails.new_price}
            onChange={changeHandler}
            placeholder="Type here"
          />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product category</p>
        <select
          value={productDetails.category}
          name="category"
          className="add-product-selector"
          onChange={changeHandler}
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option> {/* Added Kid category */}
        </select>
      </div>

      {/* Conditionally render subcategory dropdown for women, men, and kid */}
      {(productDetails.category === "women" || productDetails.category === "men" || productDetails.category === "kid") && (
        <div className="addproduct-itemfield">
          <p>Product subcategory</p>
          <select
            value={productDetails.subcategory}
            name="subcategory"
            className="add-product-selector"
            onChange={changeHandler}
          >
            <option value="">Select subcategory</option>
            {subcategories[productDetails.category].map((subcat, index) => (
              <option key={index} value={subcat}>{subcat}</option>
            ))}
          </select>
        </div>
      )}

      <div className="addproduct-itemfield">
        <p>Product images</p>
        <div className="image-upload-container">
          <label htmlFor="file-input" className="upload-label">
            <img
              className="addproduct-thumbnail-img"
              src={upload_area}
              alt="Upload"
            />
            <span>Click to upload images</span>
          </label>
          <input
            onChange={handleImageChange}
            type="file"
            name="images"
            id="file-input"
            accept="image/*"
            multiple
            hidden
          />
        </div>
        
        <div className="image-preview-container">
          {images.map((image, index) => (
            <div key={index} className="image-preview">
              <img
                src={URL.createObjectURL(image)}
                alt={`Preview ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="remove-image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <button className="addproduct-btn" onClick={addProduct} disabled={loading}>
        {loading ? "Adding..." : "ADD"}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default AddProduct;

import React, { useState } from "react";
import "./AddProduct.css";
import upload_area from "../Assets/upload_area.svg";
import { backend_url } from "../../App";

const AddProduct = () => {
  const [image, setImage] = useState(null); // Changed initial state to null
  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    image: "",
    category: "women",
    subcategory: "", // New state for subcategory
    new_price: "",
    old_price: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Subcategory options for men, women, and kids
  const subcategories = {
    women: ["T-Shirt", "Top", "Bottoms", "Jeans", "Hoodies"],
    men: ["T-Shirt", "Bottoms", "Jeans", "Hoodies"],
    kid: ["T-Shirt", "Shorts", "Jeans", "Jackets"], // Add subcategory for kids
  };

  const validateForm = () => {
    // Basic validation
    if (!productDetails.name || !productDetails.description || !image || !productDetails.new_price || !productDetails.old_price || !productDetails.subcategory) {
      alert("Please fill all fields and upload an image.");
      return false;
    }
    return true;
  };

  const addProduct = async () => {
    if (!validateForm()) {
      return; // Exit if validation fails
    }

    setLoading(true);
    setError(null);

    try {
      let dataObj;

      // Create FormData for image upload
      const formData = new FormData();
      formData.append("product", image);

      // Debugging logs
      console.log("Uploading image...");

      // Upload image
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

      dataObj = await imageResponse.json();
      console.log(dataObj); // Log response from the image upload

      if (dataObj.success) {
        const product = { ...productDetails, image: dataObj.image_url };

        // Debugging logs
        console.log("Adding product...");

        // Add product details
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
        console.log(productData); // Log response from adding product

        if (productData.success) {
          alert("Product Added");
          // Clear form after successful submission
          setProductDetails({
            name: "",
            description: "",
            image: "",
            category: "women",
            subcategory: "", // Clear subcategory
            new_price: "",
            old_price: "",
          });
          setImage(null); // Reset image state
        } else {
          alert("Failed to add product");
        }
      } else {
        alert("Image upload failed");
      }
    } catch (err) {
      setError("An error occurred while adding the product.");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        <p>Product image</p>
        <label htmlFor="file-input">
          <img
            className="addproduct-thumbnail-img"
            src={!image ? upload_area : URL.createObjectURL(image)}
            alt=""
          />
        </label>
        <input
          onChange={(e) => setImage(e.target.files[0])}
          type="file"
          name="image"
          id="file-input"
          accept="image/*"
          hidden
        />
      </div>
      <button className="addproduct-btn" onClick={addProduct} disabled={loading}>
        {loading ? "Adding..." : "ADD"}
      </button>
      {error && <p className="error-message">{error}</p>} {/* Display error message */}
    </div>
  );
};

export default AddProduct;

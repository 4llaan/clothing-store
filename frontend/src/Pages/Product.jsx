import React, { useContext, useEffect, useState } from 'react';
import Breadcrums from '../Components/Breadcrums/Breadcrums';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox';
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';

const Product = () => {
  const { products } = useContext(ShopContext);
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const foundProduct = products.find((item) => item._id === productId); // Make sure to use _id
    console.log("Found Product:", foundProduct); // Debugging output
    setProduct(foundProduct);
  }, [products, productId]);

  return product ? (
    <div>
      <Breadcrums product={product} />
      <ProductDisplay product={product} />
      <DescriptionBox />
      <RelatedProducts id={product._id} category={product.category} />
    </div>
  ) : <div>Product not found</div>; // Handle not found case
};

export default Product;

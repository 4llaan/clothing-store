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
    window.scrollTo(0, 0); // Scroll to top when product changes
    const foundProduct = products.find((item) => item._id === productId);
    setProduct(foundProduct);
  }, [products, productId]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Breadcrums product={product} />
      <ProductDisplay product={product} />
      <DescriptionBox />
      <RelatedProducts id={product._id} category={product.category} />
    </div>
  );
};

export default Product;

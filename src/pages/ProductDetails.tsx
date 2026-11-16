import { useParams } from 'react-router-dom';
import Product from '../components/products/product/Product.tsx';

const ProductDetails = () => {
  const { id_product: productId } = useParams<{ id_product: string }>();
  return <Product id_product={productId} />;
};

export default ProductDetails;

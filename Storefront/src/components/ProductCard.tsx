import React from 'react';
import './ProductCard.css';

export type StorefrontProduct = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imagePath: string | null;
};

type ProductCardProps = {
  product: StorefrontProduct;
  onPress?: (productId: number) => void;
  onOrder?: (product: StorefrontProduct) => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onOrder }) => {
  const handleClick = () => {
    onPress?.(product.id);
  };

  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOrder?.(product);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="product-image-container">
        {product.imagePath ? (
          <img src={product.imagePath} alt={product.name} className="product-image" />
        ) : (
          <div className="product-image product-placeholder">
            <div className="placeholder-icon">📦</div>
            <span className="placeholder-text">No Image</span>
          </div>
        )}
      </div>
      
      <div className="product-info">
        <div className="product-header">
          <div className="product-details">
            <span className="product-name">{product.name}</span>
            <p className="product-id">ID: {product.id}</p>
          </div>
          <span className="product-price">{typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price).toFixed(2)} DZD</span>
        </div>
        <button
          className="order-button"
          onClick={handleOrderClick}
          type="button"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;



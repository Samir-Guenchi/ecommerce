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
  onAddToCart?: (product: StorefrontProduct) => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onAddToCart }) => {
  const handleClick = () => {
    onPress?.(product.id);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
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
        <div className="product-overlay">
          <button
            className="add-to-cart-overlay"
            onClick={handleAddToCartClick}
            type="button"
          >
            Add to Cart
          </button>
        </div>
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.description && (
          <p className="product-description">
            {product.description.length > 120
              ? `${product.description.substring(0, 120)}...`
              : product.description}
          </p>
        )}
        <div className="product-footer">
          <span className="product-price">{product.price.toFixed(2)} DZD</span>
          <button
            className="add-to-cart-button"
            onClick={handleAddToCartClick}
            type="button"
          >
            🛒
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;



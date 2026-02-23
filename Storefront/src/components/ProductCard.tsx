import React from 'react';
import { PackageIcon } from './icons/Icons';
import { getImageUrl } from '../config/api.config';
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPress?.(product.id);
    }
  };

  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOrder?.(product);
  };

  const handleOrderKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onOrder?.(product);
    }
  };

  const formattedPrice = typeof product.price === 'number'
    ? product.price.toFixed(2)
    : parseFloat(product.price).toFixed(2);

  const imageUrl = getImageUrl(product.imagePath);

  const productAltText = imageUrl
    ? `${product.name}${product.description ? ' - ' + product.description : ''}`
    : undefined;

  return (
    <div
      className="product-card"
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-label={`Voir les détails de ${product.name}, ${formattedPrice} DZD`}
    >
      <div className="product-image-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productAltText}
            className="product-image"
          />
        ) : (
          <div className="product-image product-placeholder">
            <PackageIcon
              size={48}
              color="#999"
              aria-label="Aucune image de produit disponible"
            />
            <span className="placeholder-text">Aucune image</span>
          </div>
        )}
      </div>

      <div className="product-info">
        <div className="product-header">
          <div className="product-details">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-id" aria-label={`Identifiant produit ${product.id}`}>
              ID: {product.id}
            </p>
          </div>
          <span className="product-price" aria-label={`Prix: ${formattedPrice} dinars algériens`}>
            {formattedPrice} DZD
          </span>
        </div>
        <button
          className="order-button"
          onClick={handleOrderClick}
          onKeyPress={handleOrderKeyPress}
          type="button"
          aria-label={`Ajouter ${product.name} au panier`}
        >
          Ajouter au panier
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

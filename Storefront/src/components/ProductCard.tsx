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
  const [imgFailed, setImgFailed] = React.useState(false);

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

  const numPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const formattedPrice = numPrice.toLocaleString('fr-DZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const rawImageUrl = getImageUrl(product.imagePath);
  const imageUrl = !imgFailed && rawImageUrl ? rawImageUrl : null;

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
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <div className="product-image product-placeholder">
            <PackageIcon
              size={44}
              color="#999"
              aria-label="Aucune image de produit disponible"
            />
            <span className="placeholder-text">Produit artisanal</span>
          </div>
        )}
      </div>

      <div className="product-info">
        <div className="product-header">
          <div className="product-details">
            <p className="product-id" aria-label={`Identifiant produit ${product.id}`}>
              REF #{product.id}
            </p>
            <h3 className="product-name">{product.name}</h3>
          </div>
          <span className="product-price" aria-label={`Prix: ${formattedPrice} dinars algériens`}>
            {formattedPrice} <span style={{ fontSize: '0.85em', fontWeight: 600 }}>DZD</span>
          </span>
        </div>
        <button
          className="order-button"
          onClick={handleOrderClick}
          onKeyPress={handleOrderKeyPress}
          type="button"
          aria-label={`Ajouter ${product.name} au panier`}
        >
          Commander cet article
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

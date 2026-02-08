import React from 'react';
import { Product } from '../services/marketplace.api';
import './ProductGrid.css';

interface ProductGridProps {
    products: Product[];
    onProductClick?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick }) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-DZ', {
            style: 'currency',
            currency: 'DZD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="product-grid">
            {products.map((product) => (
                <div
                    key={product.id}
                    className="product-card"
                    onClick={() => onProductClick?.(product)}
                    role="button"
                    tabIndex={0}
                >
                    <div className="product-image-container">
                        {product.imagePath ? (
                            <img
                                src={product.imagePath}
                                alt={product.name}
                                className="product-image"
                                loading="lazy"
                            />
                        ) : (
                            <div className="product-image-placeholder">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="M21 15l-5-5L5 21" />
                                </svg>
                            </div>
                        )}
                        {product.stock < 10 && product.stock > 0 && (
                            <span className="low-stock-badge">Plus que {product.stock}!</span>
                        )}
                        {product.stock === 0 && (
                            <span className="out-of-stock-badge">Rupture de stock</span>
                        )}
                    </div>

                    <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-store">{product.store.name}</p>
                        <div className="product-footer">
                            <span className="product-price">{formatPrice(product.price)}</span>
                            <span className="product-location">📍 {product.store.location}</span>
                        </div>
                    </div>
                </div>
            ))}

            {products.length === 0 && (
                <div className="no-products">
                    <p>Aucun produit trouvé</p>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;

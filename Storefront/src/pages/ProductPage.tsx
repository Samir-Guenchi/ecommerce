import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storefrontAPI } from '../services/api.service';
import StoreHeader, { StorefrontStore } from '../components/StoreHeader';
import { StorefrontProduct } from '../components/ProductCard';
import './ProductPage.css';

const getDomainFromHostname = (): string => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // For development, use URL param
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('domain') || '';
  }
  // Assuming main domain is algeriepost.dz
  const parts = hostname.split('.');
  if (parts.length > 2 && parts[parts.length - 2] === 'algeriepost' && parts[parts.length - 1] === 'dz') {
    return parts[0];
  }
  return '';
};

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const domain = getDomainFromHostname();
  const navigate = useNavigate();
  const [store, setStore] = useState<StorefrontStore | null>(null);
  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = async () => {
    if (!domain || !productId) {
      setError('Store domain and product ID are required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const parsedId = parseInt(productId, 10);
      if (isNaN(parsedId)) {
        throw new Error('Invalid product ID');
      }
      const response = await storefrontAPI.getProductForStore(domain, parsedId);
      setStore(response.store);
      setProduct(response.product);
    } catch (err: any) {
      console.error('Failed to load product', err);
      setError(err?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [domain, productId]);

  const handleAddToCart = async () => {
    if (!product || !domain) return;
    try {
      await storefrontAPI.createTransactionForStore(domain, {
        amount: product.price,
        transactionType: 'payment',
        transactionReference: `cart-${product.id}-${Date.now()}`,
      });
      alert(`Added to cart: ${product.name} reserved for checkout.`);
    } catch (err: any) {
      alert(`Could not add to cart: ${err?.message || 'Please try again.'}`);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="product-page">
        <div className="centered">
          <div className="spinner"></div>
          <p className="helper-text">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product || !store) {
    return (
      <div className="product-page">
        <div className="centered">
          <p className="error-text">{error || 'Product not found'}</p>
          <button onClick={handleGoBack} className="back-button">
            Back to store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-content">
        <StoreHeader store={store} />
        <div className="product-card">
          {product.imagePath ? (
            <img
              src={product.imagePath}
              alt={product.name}
              className="product-detail-image"
            />
          ) : null}
          <h1 className="product-name">{product.name}</h1>
          {product.description ? (
            <p className="product-description">{product.description}</p>
          ) : (
            <p className="product-description">No description provided.</p>
          )}
          <p className="product-price">{product.price.toFixed(2)} DZD</p>
          <button className="cta-button" onClick={handleAddToCart}>
            Add to Cart
          </button>
          <button onClick={handleGoBack} className="secondary-cta">
            Back to store
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;



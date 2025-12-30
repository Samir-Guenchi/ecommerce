import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storefrontAPI } from '../services/api.service';
import ProductCard, { StorefrontProduct } from '../components/ProductCard';
import './StorePage.css';

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

const StorePage: React.FC = () => {
  const { domain: paramDomain } = useParams<{ domain: string }>();
  const domain = paramDomain || getDomainFromHostname();
  const [store, setStore] = useState<StorefrontStore | null>(null);
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStore = async () => {
    if (!domain) {
      setError('Store domain is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await storefrontAPI.getStoreByDomain(domain);
      setStore(response.store);
      setProducts(response.products);
    } catch (err: any) {
      console.error('Failed to load store', err);
      setError(err?.message || 'Failed to load store');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, [domain]);

  const handleAddToCart = async (product: StorefrontProduct) => {
    if (!domain) return;
    try {
      await storefrontAPI.createTransactionForStore(domain, {
        amount: product.price,
        transactionType: 'payment',
      });
      alert(`Added to cart: ${product.name} reserved for checkout.`);
    } catch (err: any) {
      alert(`Could not add to cart: ${err?.message || 'Please try again.'}`);
    }
  };

  const handleProductClick = (productId: number) => {
    window.location.href = `/product/${productId}?domain=${domain}`;
  };

  if (loading) {
    return (
      <div className="store-page">
        <div className="centered">
          <div className="spinner"></div>
          <p className="helper-text">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="store-page">
        <div className="centered">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="store-page">
        <div className="centered">
          <p className="helper-text">Store not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-page">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="nav-title">{store.name}</h1>
          <div className="nav-actions">
            <button className="cart-button">
              🛒 Cart (0)
            </button>
          </div>
        </div>
      </nav>
      
      <header className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Welcome to {store.name}</h2>
          <p className="hero-description">
            {store.description || 'Discover amazing products curated just for you.'}
          </p>
          {store.location && <p className="hero-location">📍 {store.location}</p>}
        </div>
        <div className="hero-image">
          <div className="hero-placeholder">
            <span>Store Banner</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="products-section">
          <h3 className="section-title">Our Products</h3>
          {products.length === 0 ? (
            <div className="no-products">
              <p className="no-products-text">No products available yet.</p>
              <p className="no-products-subtext">Check back soon for new arrivals!</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={handleProductClick}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 {store.name}. Powered by Algerie Post.</p>
        </div>
      </footer>
    </div>
  );
};

export default StorePage;



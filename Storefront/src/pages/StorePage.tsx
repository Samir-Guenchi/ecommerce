import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storefrontAPI } from '../services/api.service';
import ProductCard, { StorefrontProduct } from '../components/ProductCard';
import { StorefrontStore } from '../components/StoreHeader';
import OrderModal from '../components/OrderModal';
import Navigation from '../components/Navigation';
import './StorePage.css';

const getDomainFromHostname = (): string => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('domain') || '';
  }
  const parts = hostname.split('.');
  if (parts.length > 2 && parts[parts.length - 2] === 'algeriepost' && parts[parts.length - 1] === 'dz') {
    return parts[0];
  }
  return '';
};

const StorePage: React.FC = () => {
  const { domain: paramDomain } = useParams<{ domain: string }>();
  const navigate = useNavigate();
  const domain = paramDomain || getDomainFromHostname();
  const [store, setStore] = useState<StorefrontStore | null>(null);
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<StorefrontProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  useEffect(() => {
    if (!store || !domain) return;

    let scrollTracked = false;
    const handleScroll = () => {
      if (scrollTracked) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight * 0.5) {
        scrollTracked = true;
        storefrontAPI.trackEventForStore(domain, 'view_content', {
          page: 'store',
          action: 'scroll',
          scrollDepth: '50%',
        }).catch(err => console.error('Failed to track scroll event:', err));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [store, domain]);

  const handleOrder = async (product: StorefrontProduct) => {
    setSelectedProduct(product);
    
    // Track AddToCart event for Meta Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'AddToCart', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'DZD'
      });
    }
  };

  const handlePlaceOrder = async (orderData: any) => {
    if (!domain) return;
    try {
      await storefrontAPI.createOrderForStore(domain, orderData);
      
      // Track Purchase event for Meta Pixel
      if (typeof window !== 'undefined' && (window as any).fbq && selectedProduct) {
        (window as any).fbq('track', 'Purchase', {
          content_name: selectedProduct.name,
          content_ids: [selectedProduct.id],
          content_type: 'product',
          value: selectedProduct.price,
          currency: 'DZD'
        });
      }
      
      alert('Order placed successfully!');
      setSelectedProduct(null);
    } catch (err: any) {
      alert(`Could not place order: ${err?.message || 'Please try again.'}`);
    }
  };

  const handleProductClick = (productId: number) => {
    window.location.href = `/product/${productId}?domain=${domain}`;
  };

  const categories = ['all', 'electronics', 'fashion', 'home', 'beauty', 'sports'];
  const filteredProducts = products; // Category filtering removed as products don't have category field

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
      <Navigation
        storeName={store.name}
        domain={domain}
        onNavigate={(path) => navigate(path)}
        storeTheme={store.storefrontTheme}
        storeLanguage={store.storefrontLanguage}
      />

      {/* Modern Hero Section */}
      <header className="modern-hero">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        
        <div className="hero-container">
          <div className="hero-content-wrapper">
            <div className="hero-badge-group">
              <span className="hero-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="currentColor"/>
                </svg>
                Trusted by AlgeriePoste
              </span>
              <span className="hero-badge secondary">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Verified Store
              </span>
            </div>
            
            <h1 className="hero-main-title">{store.name}</h1>
            <p className="hero-description">
              {store.description || 'Discover amazing products with fast delivery across Algeria'}
            </p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value">{products.length}+</div>
                <div className="stat-label">Products</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-value">4.8</div>
                <div className="stat-label">Rating</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-value">Fast</div>
                <div className="stat-label">Delivery</div>
              </div>
            </div>

            <div className="hero-actions">
              <button className="hero-btn primary" onClick={() => document.querySelector('.products-main')?.scrollIntoView({ behavior: 'smooth' })}>
                <span>Explore Products</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="hero-btn secondary" onClick={() => navigate(`/contact?domain=${domain}`)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Contact Store</span>
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card card-1">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Secure Payment</span>
            </div>
            <div className="visual-card card-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M16 3H1V16H16V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 8H20L23 11V16H16V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/>
                <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Fast Shipping</span>
            </div>
            <div className="visual-card card-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
              <span>Top Rated</span>
            </div>
          </div>
        </div>
      </header>

      {/* Category Pills */}
      <div className="category-section">
        <div className="category-container">
          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <main className="products-main">
        <div className="products-container">
          <div className="section-header-modern">
            <div>
              <h2 className="section-title-modern">Featured Products</h2>
              <p className="section-subtitle-modern">Handpicked items just for you</p>
            </div>
            <div className="products-count-badge">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="no-products-modern">
              <div className="no-products-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                  <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>No products found</h3>
              <p>Try selecting a different category or check back later</p>
            </div>
          ) : (
            <div className="products-grid-modern">
              {filteredProducts.map((product, index) => (
                <div key={product.id} style={{ animationDelay: `${index * 0.05}s` }}>
                  <ProductCard
                    product={product}
                    onPress={handleProductClick}
                    onOrder={handleOrder}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>Secure Shopping</h3>
            <p>Your data is protected with industry-standard encryption</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M16 3H1V16H16V3Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 8H20L23 11V16H16V8Z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/>
                <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Fast Delivery</h3>
            <p>Get your orders delivered quickly across Algeria</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Easy Returns</h3>
            <p>14-day return policy for your peace of mind</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="modern-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="/AlgeriePoste.png" alt="AlgeriePoste" />
              </div>
              <p>Trusted e-commerce platform powered by AlgeriePoste</p>
            </div>
            <div className="footer-links">
              <h4>Shop</h4>
              <a href="#">All Products</a>
              <a href="#">New Arrivals</a>
              <a href="#">Best Sellers</a>
            </div>
            <div className="footer-links">
              <h4>Support</h4>
              <a href={`/contact?domain=${domain}`}>Contact Us</a>
              <a href="#">Shipping Info</a>
              <a href="#">Track Order</a>
            </div>
            <div className="footer-links">
              <h4>Legal</h4>
              <a href={`/policies?domain=${domain}`}>Privacy Policy</a>
              <a href={`/policies?domain=${domain}`}>Terms of Service</a>
              <a href={`/policies?domain=${domain}`}>Returns</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 AlgeriePoste. All rights reserved.</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          domain={domain}
          onClose={() => setSelectedProduct(null)}
          onOrder={handlePlaceOrder}
        />
      )}
    </div>
  );
};

export default StorePage;

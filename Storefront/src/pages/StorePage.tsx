import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storefrontAPI } from '../services/api.service';
import ProductCard, { StorefrontProduct } from '../components/ProductCard';
import { StorefrontStore } from '../components/StoreHeader';
import OrderModal from '../components/OrderModal';
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
  const navigate = useNavigate();
  const domain = paramDomain || getDomainFromHostname();
  const [store, setStore] = useState<StorefrontStore | null>(null);
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<StorefrontProduct | null>(null);

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

  // Track scroll/view content event
  useEffect(() => {
    if (!store || !domain) return;

    let scrollTracked = false;
    const handleScroll = () => {
      if (scrollTracked) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Track when user has scrolled at least 50% of the page
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
  };

  const handlePlaceOrder = async (orderData: any) => {
    if (!domain) return;
    try {
      await storefrontAPI.createOrderForStore(domain, orderData);
      alert('Order placed successfully!');
      setSelectedProduct(null);
    } catch (err: any) {
      alert(`Could not place order: ${err?.message || 'Please try again.'}`);
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
        <div className="nav-wrapper">
          <div className="nav-left">
            <div className="logo">{store.name.charAt(0)}</div>
          </div>
          <div className="nav-center">
            <div className="nav-menu">
              <a href="#" className="nav-link active">Home</a>
              <a href="#" onClick={() => navigate(`/contact?domain=${domain}`)} className="nav-link">Contact</a>
              <a href="#" onClick={() => navigate(`/policies?domain=${domain}`)} className="nav-link">Policies</a>
            </div>
          </div>
          <div className="nav-right">
            <button className="nav-icon-button" title="Search">⌕</button>
            <button className="nav-icon-button" title="Favorites">♡</button>
            <button className="cart-button" title="Cart">⊞</button>
          </div>
        </div>
        <div className="nav-banner">
          <p>{store.description || 'Free Shipping on Orders $50+'}</p>
        </div>
      </nav>
      
      <header className="hero-section">
        <div className="hero-banner">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <span className="hero-badge">New Season</span>
            <h2 className="hero-title">{store.name}</h2>
            <p className="hero-subtitle">Curated Collection</p>
            <button className="hero-cta">Shop Now</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="content-wrapper">
          <aside className="filters-sidebar">
            <div className="filter-group">
              <h4 className="filter-title">Filters</h4>
              <div className="filter-item">
                <input type="checkbox" id="new-arrivals" />
                <label htmlFor="new-arrivals">New Arrivals</label>
              </div>
              <div className="filter-item">
                <input type="checkbox" id="sale" />
                <label htmlFor="sale">Sale Items</label>
              </div>
            </div>
            <div className="filter-group">
              <h4 className="filter-title">Sort</h4>
              <select className="sort-select">
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </aside>

          <section className="products-section">
            <div className="section-header">
              <h3 className="section-title">Featured Products</h3>
              <span className="product-count">{products.length} items</span>
            </div>
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
                    onOrder={handleOrder}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-wrapper">
          <div className="footer-section">
            <h5>About</h5>
            <ul>
              <li><a href="#">About {store.name}</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h5>Support</h5>
            <ul>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Shipping</a></li>
              <li><a href="#">Returns</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h5>Legal</h5>
            <ul>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 AlgeriePost. All rights reserved.</p>
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
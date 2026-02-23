import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storefrontAPI } from '../services/api.service';
import { getImageUrl } from '../config/api.config';
import { StorefrontStore } from '../components/StoreHeader';
import { StorefrontProduct } from '../components/ProductCard';
import Navigation from '../components/Navigation';
import { PackageIcon, TruckIcon, ReturnIcon, ShieldIcon } from '../components/icons/Icons';
import algeriaCities from '../../../static/willayas/algeria_cities.json';
import shippingPrices from '../../../static/shipping prices/shipping_prices.json';
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

  // Order form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [commune, setCommune] = useState('');
  const [deliveryType, setDeliveryType] = useState<'stop_desk' | 'domicile'>('domicile');
  const [communes, setCommunes] = useState<string[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [total, setTotal] = useState(0);

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
      
      // Track ViewContent event for Meta Pixel
      if (typeof window !== 'undefined' && (window as any).fbq && response.product) {
        (window as any).fbq('track', 'ViewContent', {
          content_name: response.product.name,
          content_ids: [response.product.id],
          content_type: 'product',
          value: response.product.price,
          currency: 'DZD'
        });
      }
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

  // Track scroll/view content event for product page
  useEffect(() => {
    if (!store || !product || !domain) return;

    let scrollTracked = false;
    const handleScroll = () => {
      if (scrollTracked) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Track when user has scrolled at least 30% of the product page
      if (scrollTop + windowHeight >= documentHeight * 0.3) {
        scrollTracked = true;
        storefrontAPI.trackEventForStore(domain, 'view_content', {
          page: 'product',
          productId: product.id,
          action: 'scroll',
          scrollDepth: '30%',
        }).catch(err => console.error('Failed to track product scroll event:', err));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [store, product, domain]);

  // Track form fill event
  useEffect(() => {
    if (!product || !domain) return;

    const hasFormData = fullName || phone || wilaya || commune;
    if (hasFormData) {
      storefrontAPI.trackEventForStore(domain, 'form_fill', {
        page: 'product',
        productId: product.id,
        fields: {
          fullName: !!fullName,
          phone: !!phone,
          wilaya: !!wilaya,
          commune: !!commune,
          deliveryType: deliveryType,
        },
      }).catch(err => console.error('Failed to track form fill event:', err));
    }
  }, [fullName, phone, wilaya, commune, deliveryType, product, domain]);

  const wilayas = [...new Set(algeriaCities.map((city: any) => city.wilaya_name))];

  useEffect(() => {
    if (wilaya) {
      const filteredCommunes = algeriaCities
        .filter((city: any) => city.wilaya_name === wilaya)
        .map((city: any) => city.commune_name);
      setCommunes([...new Set(filteredCommunes)]);
      setCommune('');
    }
  }, [wilaya]);

  useEffect(() => {
    if (product && wilaya && deliveryType) {
      const key = deliveryType === 'stop_desk' ? 'Tarif Stop Desk Classique' : 'Tarif à Domicile Classique';
      const cost = (shippingPrices as any)[wilaya]?.[key] || 0;
      setShippingCost(cost);
      const productPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price);
      setTotal(productPrice + cost);
    }
  }, [wilaya, deliveryType, product]);

  const handleOrderSubmit = async () => {
    if (!product || !domain) return;
    if (!fullName || !phone || !wilaya || !commune) {
      alert('Please fill all fields');
      return;
    }
    try {
      const response = await storefrontAPI.createOrderForStore(domain, {
        productId: product.id,
        quantity: 1,
        fullName,
        phone,
        wilaya,
        commune,
        deliveryType,
      });
      alert(`Order placed successfully! Order ID: ${response.order.id}`);
      // Reset form
      setFullName('');
      setPhone('');
      setWilaya('');
      setCommune('');
      setDeliveryType('domicile');
    } catch (err: any) {
      alert(`Could not place order: ${err?.message || 'Please try again.'}`);
    }
  };

  const handleGoBack = () => {
    navigate(`/?domain=${domain}`);
  };

  const imageUrl = getImageUrl(product?.imagePath || null);

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
      <Navigation
        storeName={store.name}
        domain={domain}
        onNavigate={(path) => navigate(path)}
        storeTheme={store.storefrontTheme}
        storeLanguage={store.storefrontLanguage}
      />

      <main className="product-main">
        <div className="breadcrumb-nav">
          <button className="back-link" onClick={handleGoBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <div className="breadcrumb">
            <a href={`/?domain=${domain}`}>Home</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Products</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="current">{product.name}</span>
          </div>
        </div>

        <div className="product-container">
          {/* Left: Images */}
          <div className="product-images">
            {imageUrl ? (
              <>
                <div className="main-image-wrapper">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="main-image"
                  />
                </div>
                <div className="thumbnail-images">
                  <div className="thumbnail active">
                    <img src={imageUrl} alt="View 1" />
                  </div>
                  <div className="thumbnail">
                    <img src={imageUrl} alt="View 2" />
                  </div>
                  <div className="thumbnail">
                    <img src={imageUrl} alt="View 3" />
                  </div>
                  <div className="thumbnail">
                    <img src={imageUrl} alt="View 4" />
                  </div>
                </div>
              </>
            ) : (
              <div className="main-image-placeholder">
                <PackageIcon size={60} color="#9ca3af" aria-label="No product image available" />
                <p>No image available</p>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="product-details">
            <h1 className="product-title">{product.name}</h1>

            <div className="product-rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill="#FFCD00">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                ))}
              </div>
              <span className="rating-text">4.8</span>
              <span className="review-count">(127 reviews)</span>
            </div>

            <div className="product-price-section">
              <div className="price-row">
                <span className="price">{(typeof product.price === 'number' ? product.price : parseFloat(product.price)).toFixed(2)} DZD</span>
                <span className="original-price">{((typeof product.price === 'number' ? product.price : parseFloat(product.price)) * 1.2).toFixed(2)} DZD</span>
              </div>
              <div className="tax-info">Tax included. Shipping calculated at checkout.</div>
            </div>

            {product.description && (
              <div className="product-description">
                <p>{product.description}</p>
              </div>
            )}

            <div className="order-form">
              <h3 className="form-title">Order Information</h3>
              
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label>Wilaya</label>
                <select value={wilaya} onChange={(e) => setWilaya(e.target.value)}>
                  <option value="">Select Wilaya</option>
                  {wilayas.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Commune</label>
                <select value={commune} onChange={(e) => setCommune(e.target.value)} disabled={!wilaya}>
                  <option value="">Select Commune</option>
                  {communes.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Delivery Type</label>
                <div className="delivery-options">
                  <label className={`delivery-option ${deliveryType === 'domicile' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      value="domicile"
                      checked={deliveryType === 'domicile'}
                      onChange={(e) => setDeliveryType(e.target.value as 'domicile')}
                    />
                    <div className="delivery-content">
                      <span className="delivery-title">Home Delivery</span>
                      <span className="delivery-price">{(shippingPrices as any)[wilaya]?.['Tarif à Domicile Classique'] || 0} DZD</span>
                    </div>
                  </label>
                  <label className={`delivery-option ${deliveryType === 'stop_desk' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      value="stop_desk"
                      checked={deliveryType === 'stop_desk'}
                      onChange={(e) => setDeliveryType(e.target.value as 'stop_desk')}
                    />
                    <div className="delivery-content">
                      <span className="delivery-title">Stop Desk</span>
                      <span className="delivery-price">{(shippingPrices as any)[wilaya]?.['Tarif Stop Desk Classique'] || 0} DZD</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Product Price:</span>
                  <span className="summary-value">{(typeof product.price === 'number' ? product.price : parseFloat(product.price)).toFixed(2)} DZD</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span className="summary-value">{shippingCost.toFixed(2)} DZD</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span className="summary-value">{total.toFixed(2)} DZD</span>
                </div>
              </div>

              <button className="order-button" onClick={handleOrderSubmit}>
                Place Order
              </button>
            </div>

            <div className="trust-badges">
              <div className="trust-item">
                <TruckIcon size={20} color="#1E3A8A" aria-label="Free delivery" />
                <span>Free delivery over 5000 DZD</span>
              </div>
              <div className="trust-item">
                <ReturnIcon size={20} color="#1E3A8A" aria-label="Easy returns" />
                <span>30-day return policy</span>
              </div>
              <div className="trust-item">
                <ShieldIcon size={20} color="#1E3A8A" aria-label="Secure payment" />
                <span>Secure payment</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
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
    </div>
  );
};

export default ProductPage;
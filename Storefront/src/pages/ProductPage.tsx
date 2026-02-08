import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storefrontAPI } from '../services/api.service';
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
      />

      <main className="product-main">
        <button className="breadcrumb-button" onClick={handleGoBack}>
          ← Back to products
        </button>

        <div className="product-container">
          <div className="product-images">
            {product.imagePath ? (
              <div className="main-image-wrapper">
                <img
                  src={product.imagePath}
                  alt={product.name}
                  className="main-image"
                />
              </div>
            ) : (
              <div className="main-image-placeholder">
                <PackageIcon size={64} color="#999" aria-label="Aucune image de produit disponible" />
              </div>
            )}
            <div className="thumbnail-images">
              {product.imagePath && (
                <>
                  <div className="thumbnail active">
                    <img src={product.imagePath} alt="Thumbnail 1" />
                  </div>
                  <div className="thumbnail">
                    <img src={product.imagePath} alt="Thumbnail 2" />
                  </div>
                  <div className="thumbnail">
                    <img src={product.imagePath} alt="Thumbnail 3" />
                  </div>
                  <div className="thumbnail">
                    <img src={product.imagePath} alt="Thumbnail 4" />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="product-details">
            <div className="breadcrumb">Home / Products / {product.name}</div>

            <h1 className="product-title">{product.name}</h1>

            <div className="product-meta">
              <span className="product-category">Category</span>
              <div className="color-options">
                <div className="color-label">Colors available: 6</div>
                <div className="color-swatches">
                  <div className="color-swatch" style={{ backgroundColor: '#000' }}></div>
                  <div className="color-swatch" style={{ backgroundColor: '#fff', border: '1px solid #ddd' }}></div>
                  <div className="color-swatch" style={{ backgroundColor: '#666' }}></div>
                </div>
              </div>
            </div>

            <div className="product-price-section">
              <span className="price">${(typeof product.price === 'number' ? product.price : parseFloat(product.price)).toFixed(2)}</span>
              <span className="original-price">${((typeof product.price === 'number' ? product.price : parseFloat(product.price)) * 1.2).toFixed(2)}</span>
            </div>

            <p className="product-description">{product.description || 'No description available.'}</p>

            <div className="size-section">
              <label className="section-label">Select Size</label>
              <div className="size-grid">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button key={size} className="size-btn">{size}</button>
                ))}
              </div>
            </div>

            <div className="order-form">
              <h3>Place Your Order</h3>
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
                  <label>
                    <input
                      type="radio"
                      value="domicile"
                      checked={deliveryType === 'domicile'}
                      onChange={(e) => setDeliveryType(e.target.value as 'domicile')}
                    />
                    Domicile ({(shippingPrices as any)[wilaya]?.['Tarif à Domicile Classique'] || 0} DZD)
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="stop_desk"
                      checked={deliveryType === 'stop_desk'}
                      onChange={(e) => setDeliveryType(e.target.value as 'stop_desk')}
                    />
                    Stop Desk ({(shippingPrices as any)[wilaya]?.['Tarif Stop Desk Classique'] || 0} DZD)
                  </label>
                </div>
              </div>
              <div className="order-summary">
                <div className="summary-item">
                  <span>Product Price:</span>
                  <span>{(typeof product.price === 'number' ? product.price : parseFloat(product.price)).toFixed(2)} DZD</span>
                </div>
                <div className="summary-item">
                  <span>Shipping:</span>
                  <span>{shippingCost.toFixed(2)} DZD</span>
                </div>
                <div className="summary-item total">
                  <span>Total:</span>
                  <span>{total.toFixed(2)} DZD</span>
                </div>
              </div>
              <button className="order-button" onClick={handleOrderSubmit}>
                Place Order
              </button>
            </div>

            <div className="product-info-section">
              <div className="info-item">
                <div className="info-icon">
                  <TruckIcon size={24} color="var(--color-primary)" aria-label="Livraison gratuite" />
                </div>
                <div>
                  <p className="info-title">Livraison Gratuite</p>
                  <p className="info-text">Pour les commandes de plus de 5000 DA</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon">
                  <ReturnIcon size={24} color="var(--color-primary)" aria-label="Retours faciles" />
                </div>
                <div>
                  <p className="info-title">Retours Faciles</p>
                  <p className="info-text">Politique de retour de 30 jours</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon">
                  <ShieldIcon size={24} color="var(--color-primary)" aria-label="Paiement sécurisé" />
                </div>
                <div>
                  <p className="info-title">Paiement Sécurisé</p>
                  <p className="info-text">Paiement 100% sécurisé</p>
                </div>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default ProductPage;
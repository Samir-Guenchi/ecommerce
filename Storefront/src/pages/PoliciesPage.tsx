import React from 'react';
import { useNavigate } from 'react-router-dom';

const PoliciesPage: React.FC = () => {
  const navigate = useNavigate();
  const domain = new URLSearchParams(window.location.search).get('domain') || '';

  return (
    <div className="policies-page">
      <nav className="navbar">
        <div className="nav-wrapper">
          <div className="nav-left">
            <div className="logo">A</div>
          </div>
          <div className="nav-center">
            <div className="nav-menu">
              <a href="#" onClick={() => navigate(`/?domain=${domain}`)} className="nav-link">Home</a>
              <a href="#" onClick={() => navigate(`/contact?domain=${domain}`)} className="nav-link">Contact</a>
              <a href="#" className="nav-link active">Policies</a>
            </div>
          </div>
          <div className="nav-right">
            <button className="nav-icon-button" title="Search">⌕</button>
            <button className="nav-icon-button" title="Favorites">♡</button>
            <button className="cart-button" title="Cart">⊞</button>
          </div>
        </div>
        <div className="nav-banner">
          <p>Our Policies</p>
        </div>
      </nav>

      <main className="main-content">
        <div className="content-wrapper">
          <h1>Store Policies</h1>
          <section>
            <h2>Return Policy</h2>
            <p>We accept returns within 30 days of purchase.</p>
          </section>
          <section>
            <h2>Shipping Policy</h2>
            <p>Free shipping on orders over 5000 DZD.</p>
          </section>
          <section>
            <h2>Privacy Policy</h2>
            <p>We respect your privacy and protect your personal information.</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PoliciesPage;
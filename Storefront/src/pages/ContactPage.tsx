import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const domain = new URLSearchParams(window.location.search).get('domain') || '';

  return (
    <div className="contact-page">
      <nav className="navbar">
        <div className="nav-wrapper">
          <div className="nav-left">
            <div className="logo">A</div>
          </div>
          <div className="nav-center">
            <div className="nav-menu">
              <a href="#" onClick={() => navigate(`/?domain=${domain}`)} className="nav-link">Home</a>
              <a href="#" className="nav-link active">Contact</a>
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
          <p>Contact Us</p>
        </div>
      </nav>

      <main className="main-content">
        <div className="content-wrapper">
          <h1>Contact Us</h1>
          <p>Get in touch with us for any questions or support.</p>
          <div className="contact-info">
            <p>Email: support@algeriepost.dz</p>
            <p>Phone: +213 XX XX XX XX</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
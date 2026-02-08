import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const domain = new URLSearchParams(window.location.search).get('domain') || '';

  return (
    <div className="contact-page">
      <Navigation
        storeName="Store"
        domain={domain}
        onNavigate={(path) => navigate(path)}
      />

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
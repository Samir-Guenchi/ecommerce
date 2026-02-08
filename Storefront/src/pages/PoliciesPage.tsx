import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const PoliciesPage: React.FC = () => {
  const navigate = useNavigate();
  const domain = new URLSearchParams(window.location.search).get('domain') || '';

  return (
    <div className="policies-page">
      <Navigation
        storeName="Store"
        domain={domain}
        onNavigate={(path) => navigate(path)}
      />

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
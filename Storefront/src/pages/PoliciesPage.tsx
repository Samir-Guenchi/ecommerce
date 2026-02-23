import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import './PoliciesPage.css';

const PoliciesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const domain = searchParams.get('domain') || '';
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'shipping' | 'returns'>('privacy');

  const policies = {
    privacy: {
      title: 'Privacy Policy',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      content: [
        {
          heading: 'Information We Collect',
          text: 'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include your name, email address, shipping address, and payment information.',
        },
        {
          heading: 'How We Use Your Information',
          text: 'We use the information we collect to process your orders, communicate with you, improve our services, and comply with legal obligations. We never sell your personal information to third parties.',
        },
        {
          heading: 'Data Security',
          text: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
        },
        {
          heading: 'Your Rights',
          text: 'You have the right to access, correct, or delete your personal information. You can also object to processing or request data portability. Contact us to exercise these rights.',
        },
      ],
    },
    terms: {
      title: 'Terms of Service',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      content: [
        {
          heading: 'Acceptance of Terms',
          text: 'By accessing and using this platform, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services.',
        },
        {
          heading: 'User Accounts',
          text: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.',
        },
        {
          heading: 'Prohibited Activities',
          text: 'You may not use our platform for any illegal purposes, to transmit harmful code, to infringe on intellectual property rights, or to engage in fraudulent activities.',
        },
        {
          heading: 'Limitation of Liability',
          text: 'We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.',
        },
      ],
    },
    shipping: {
      title: 'Shipping Policy',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M16 3H1V16H16V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 8H20L23 11V16H16V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      content: [
        {
          heading: 'Processing Time',
          text: 'Orders are typically processed within 1-2 business days. You will receive a confirmation email once your order has been shipped with tracking information.',
        },
        {
          heading: 'Delivery Times',
          text: 'Standard delivery within Algeria takes 3-7 business days. Express delivery is available for 1-3 business days. Delivery times may vary during peak seasons.',
        },
        {
          heading: 'Shipping Costs',
          text: 'Shipping costs are calculated based on the weight and destination of your order. Free shipping is available for orders over 5,000 DZD within major cities.',
        },
        {
          heading: 'International Shipping',
          text: 'Currently, we only ship within Algeria. International shipping options may become available in the future. Please check back for updates.',
        },
      ],
    },
    returns: {
      title: 'Return & Refund Policy',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      content: [
        {
          heading: 'Return Window',
          text: 'You have 14 days from the date of delivery to return items for a full refund. Items must be unused, in original packaging, and in the same condition as received.',
        },
        {
          heading: 'Return Process',
          text: 'To initiate a return, contact our customer service team with your order number. We will provide you with a return authorization and shipping instructions.',
        },
        {
          heading: 'Refund Processing',
          text: 'Once we receive and inspect your return, we will process your refund within 5-7 business days. Refunds will be issued to the original payment method.',
        },
        {
          heading: 'Non-Returnable Items',
          text: 'Certain items cannot be returned, including perishable goods, custom-made products, personal care items, and sale items marked as final sale.',
        },
      ],
    },
  };

  const currentPolicy = policies[activeTab];

  return (
    <div className="policies-page">
      <Navigation
        storeName="Store"
        domain={domain}
        onNavigate={(path) => navigate(path)}
      />

      <div className="policies-container">
        <div className="policies-hero">
          <div className="policies-hero-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="policies-title">Our Policies</h1>
          <p className="policies-subtitle">Everything you need to know about shopping with us</p>
        </div>

        <div className="policies-tabs">
          {Object.entries(policies).map(([key, policy]) => (
            <button
              key={key}
              className={`tab-button ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key as any)}
            >
              <span className="tab-icon">{policy.icon}</span>
              <span className="tab-label">{policy.title}</span>
            </button>
          ))}
        </div>

        <div className="policies-content">
          <div className="policy-header">
            <div className="policy-icon">{currentPolicy.icon}</div>
            <h2 className="policy-title">{currentPolicy.title}</h2>
          </div>

          <div className="policy-sections">
            {currentPolicy.content.map((section, index) => (
              <div key={index} className="policy-section">
                <h3 className="section-heading">{section.heading}</h3>
                <p className="section-text">{section.text}</p>
              </div>
            ))}
          </div>

          <div className="policy-footer">
            <div className="footer-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p>Last updated: January 2025. If you have any questions about our policies, please contact our support team.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;

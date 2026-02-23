import React from 'react';
import './StoreHeader.css';

export type StorefrontStore = {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  domain: string | null;
  storefrontTheme?: string | null;
  storefrontLanguage?: string | null;
};

type StoreHeaderProps = {
  store: StorefrontStore;
};

const StoreHeader: React.FC<StoreHeaderProps> = ({ store }) => {
  return (
    <div className="store-header">
      <h1 className="store-title">{store.name}</h1>
      {store.domain ? <p className="store-domain">{store.domain}</p> : null}
      {store.description ? (
        <p className="store-description">{store.description}</p>
      ) : (
        <p className="store-description">Discover curated products from this seller.</p>
      )}
      {store.location ? (
        <p className="store-location">📍 {store.location}</p>
      ) : null}
    </div>
  );
};

export default StoreHeader;



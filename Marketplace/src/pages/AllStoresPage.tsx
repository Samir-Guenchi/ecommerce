import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStores } from '../services/marketplace.api';
import './AllStoresPage.css';

const AllStoresPage: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['all-stores'],
        queryFn: () => getStores({ limit: 50 }),
    });

    return (
        <div className="all-stores-page">
            <div className="container">
                <h1>Toutes les Boutiques</h1>

                {isLoading && <div className="loading">Chargement...</div>}

                {data && (
                    <div className="stores-grid">
                        {data.stores.map((store: any) => (
                            <a key={store.id} href={`/stores/${store.domain}`} className="store-card">
                                <div className="store-card-header">
                                    <h3>{store.name}</h3>
                                    <span className="product-count">{store.productCount} produits</span>
                                </div>
                                <p className="store-location">📍 {store.location}</p>
                                <p className="store-description">{store.description}</p>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllStoresPage;

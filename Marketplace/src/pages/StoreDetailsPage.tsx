import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStoreByDomain } from '../services/marketplace.api';
import ProductGrid from '../components/ProductGrid';
import './StoreDetailsPage.css';

const StoreDetailsPage: React.FC = () => {
    const { domain } = useParams<{ domain: string }>();

    const { data: store, isLoading, error } = useQuery({
        queryKey: ['store', domain],
        queryFn: () => getStoreByDomain(domain!),
    });

    if (isLoading) return <div className="loading">Chargement...</div>;
    if (error) return <div className="error">Boutique non trouvée</div>;

    return (
        <div className="store-details-page">
            <div className="store-header">
                <div className="container">
                    <h1>{store.name}</h1>
                    <p className="store-location">📍 {store.location}</p>
                    <p className="store-description">{store.description}</p>
                </div>
            </div>

            <div className="container">
                <h2>Produits ({store.products?.length || 0})</h2>
                <ProductGrid products={store.products || []} />
            </div>
        </div>
    );
};

export default StoreDetailsPage;

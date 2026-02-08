import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ProductGrid from '../components/ProductGrid';
import CategoryFilter from '../components/CategoryFilter';
import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '../services/marketplace.api';
import './HomePage.css';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch featured products
    const { data: featuredProducts, isLoading } = useQuery({
        queryKey: ['featured-products'],
        queryFn: () => searchProducts({ limit: 8 }),
    });

    const handleSearch = (query: string) => {
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <div className="homepage">
            {/* Hero Section */}
            <header className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Marketplace Algérie Poste
                    </h1>
                    <p className="hero-subtitle">
                        Découvrez des milliers de produits artisanaux et traditionnels algériens
                    </p>

                    <SearchBar
                        onSearch={handleSearch}
                        placeholder="Rechercher des produits, magasins..."
                        large
                    />

                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">1,200+</span>
                            <span className="stat-label">Vendeurs</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">15,000+</span>
                            <span className="stat-label">Produits</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">48</span>
                            <span className="stat-label">Wilayas</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Categories */}
            <section className="categories-section">
                <h2>Explorer par catégorie</h2>
                <CategoryFilter onSelectCategory={(cat) => navigate(`/search?category=${cat}`)} />
            </section>

            {/* Featured Products */}
            <section className="featured-section">
                <div className="section-header">
                    <h2>Produits en vedette</h2>
                    <button
                        className="view-all-btn"
                        onClick={() => navigate('/search')}
                    >
                        Voir tout →
                    </button>
                </div>

                {isLoading ? (
                    <div className="loading">Chargement...</div>
                ) : (
                    <ProductGrid products={featuredProducts?.products || []} />
                )}
            </section>

            {/* Popular Stores */}
            <section className="stores-section">
                <div className="section-header">
                    <h2>Boutiques populaires</h2>
                    <button
                        className="view-all-btn"
                        onClick={() => navigate('/stores')}
                    >
                        Toutes les boutiques →
                    </button>
                </div>

                <div className="store-grid">
                    {/* TODO: Fetch and display popular stores */}
                    <p>Les boutiques seront affichées ici</p>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="features-section">
                <h2>Pourquoi choisir Algérie Poste?</h2>
                <div className="features-grid">
                    <div className="feature">
                        <div className="feature-icon">🚚</div>
                        <h3>Livraison rapide</h3>
                        <p>Livraison à domicile dans toute l'Algérie</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">🔐</div>
                        <h3>Paiement sécurisé</h3>
                        <p>Transactions protégées et fiables</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">📦</div>
                        <h3>Suivi en temps réel</h3>
                        <p>Suivez votre colis en direct avec GPS</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">🇩🇿</div>
                        <h3>Produits 100% algériens</h3>
                        <p>Soutenez les artisans locaux</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="marketplace-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>Marketplace</h4>
                        <ul>
                            <li><a href="/search">Tous les produits</a></li>
                            <li><a href="/stores">Toutes les boutiques</a></li>
                            <li><a href="/categories">Catégories</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Aide</h4>
                        <ul>
                            <li><a href="/help">Centre d'aide</a></li>
                            <li><a href="/shipping">Livraison</a></li>
                            <li><a href="/returns">Retours</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>À propos</h4>
                        <ul>
                            <li><a href="/about">À propos de nous</a></li>
                            <li><a href="/contact">Contact</a></li>
                            <li><a href="/policies">Politiques</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2024 Algérie Poste. Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;

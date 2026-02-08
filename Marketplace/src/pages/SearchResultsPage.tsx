import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SearchBar from '../components/SearchBar';
import ProductGrid from '../components/ProductGrid';
import CategoryFilter from '../components/CategoryFilter';
import { searchProducts } from '../services/marketplace.api';
import './SearchResultsPage.css';

const SearchResultsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryKey: ['search', query, category, page],
        queryFn: () => searchProducts({ q: query, category, page, limit: 20 }),
    });

    const handleSearch = (newQuery: string) => {
        setSearchParams({ q: newQuery });
        setPage(1);
    };

    const handleCategoryChange = (newCategory: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('category', newCategory);
        setSearchParams(params);
        setPage(1);
    };

    return (
        <div className="search-results-page">
            <header className="search-header">
                <div className="container">
                    <h1>Marketplace Algérie Poste</h1>
                    <SearchBar
                        onSearch={handleSearch}
                        initialValue={query}
                        placeholder="Rechercher des produits..."
                    />
                </div>
            </header>

            <main className="search-content container">
                <aside className="filters-sidebar">
                    <h3>Catégories</h3>
                    <CategoryFilter
                        onSelectCategory={handleCategoryChange}
                        selectedCategory={category}
                    />

                    <div className="filter-section">
                        <h4>Prix</h4>
                        <input type="range" min="0" max="100000" className="price-slider" />
                    </div>

                    <div className="filter-section">
                        <h4>Wilaya</h4>
                        <select className="wilaya-select">
                            <option value="">Toutes les wilayas</option>
                            <option value="Alger">Alger</option>
                            <option value="Oran">Oran</option>
                            <option value="Constantine">Constantine</option>
                        </select>
                    </div>
                </aside>

                <div className="results-main">
                    {query && (
                        <div className="results-header">
                            <h2>
                                Résultats pour "{query}"
                                {data && <span className="result-count"> ({data.pagination.total} produits)</span>}
                            </h2>
                        </div>
                    )}

                    {isLoading && <div className="loading">Chargement des produits...</div>}
                    {error && <div className="error">Erreur de chargement</div>}

                    {data && <ProductGrid products={data.products} />}

                    {data && data.pagination.totalPages > 1 && (
                        <div className="pagination">
                            {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    className={`page-button ${page === pageNum ? 'active' : ''}`}
                                    onClick={() => setPage(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SearchResultsPage;

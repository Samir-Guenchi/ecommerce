import React, { useState } from 'react';
import './SearchBar.css';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    large?: boolean;
    initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = 'Rechercher...',
    large = false,
    initialValue = '',
}) => {
    const [query, setQuery] = useState(initialValue);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <form
            className={`search-bar ${large ? 'search-bar-large' : ''}`}
            onSubmit={handleSubmit}
            role="search"
        >
            <div className="search-input-wrapper">
                <svg
                    className="search-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>

                <input
                    type="search"
                    className="search-input"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Rechercher des produits"
                />

                <button
                    type="submit"
                    className="search-button"
                    aria-label="Lancer la recherche"
                >
                    Rechercher
                </button>
            </div>
        </form>
    );
};

export default SearchBar;

import React from 'react';
import { SearchIcon, HeartIcon, CartIcon } from './icons/Icons';
import './Navigation.css';

interface NavigationProps {
    storeName: string;
    domain: string;
    onNavigate: (path: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ storeName, domain, onNavigate }) => {
    const handleNavigation = (path: string, e: React.MouseEvent) => {
        e.preventDefault();
        onNavigate(path);
    };

    return (
        <nav className="navigation" role="navigation" aria-label="Navigation principale">
            <div className="nav-container">
                <div className="nav-left">
                    <div className="logo" aria-label={`${storeName} - Page d'accueil`}>
                        {storeName.charAt(0)}
                    </div>
                </div>

                <div className="nav-center">
                    <div className="nav-menu" role="menubar">
                        <a
                            href="/"
                            className="nav-link active"
                            role="menuitem"
                            onClick={(e) => handleNavigation(`/?domain=${domain}`, e)}
                        >
                            Accueil
                        </a>
                        <a
                            href="/contact"
                            className="nav-link"
                            role="menuitem"
                            onClick={(e) => handleNavigation(`/contact?domain=${domain}`, e)}
                        >
                            Contact
                        </a>
                        <a
                            href="/policies"
                            className="nav-link"
                            role="menuitem"
                            onClick={(e) => handleNavigation(`/policies?domain=${domain}`, e)}
                        >
                            Politiques
                        </a>
                    </div>
                </div>

                <div className="nav-right">
                    <button
                        className="nav-icon-button"
                        aria-label="Rechercher des produits"
                        title="Rechercher"
                    >
                        <SearchIcon size={20} aria-label="Rechercher" />
                    </button>
                    <button
                        className="nav-icon-button"
                        aria-label="Voir les favoris"
                        title="Favoris"
                    >
                        <HeartIcon size={20} aria-label="Favoris" />
                    </button>
                    <button
                        className="nav-icon-button cart-button"
                        aria-label="Voir le panier"
                        title="Panier"
                    >
                        <CartIcon size={20} aria-label="Panier" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;

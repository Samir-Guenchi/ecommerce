import React, { useState, useEffect } from 'react';
import { SearchIcon, HeartIcon, CartIcon, SunIcon, MoonIcon, HomeIcon, MailIcon, FileTextIcon, MenuIcon, CloseIcon, PackageIcon } from './icons/Icons';
import './Navigation.css';

interface NavigationProps {
    storeName: string;
    domain: string;
    onNavigate: (path: string) => void;
    storeTheme?: string | null;
    storeLanguage?: string | null;
}

const Navigation: React.FC<NavigationProps> = ({ storeName, domain, onNavigate, storeTheme, storeLanguage }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState('fr');
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Language translations
    const translations = {
        en: {
            home: 'Home',
            products: 'Products',
            contact: 'Contact',
            policies: 'Policies',
            about: 'About',
            search: 'Search products',
            favorites: 'View favorites',
            cart: 'View cart',
            lightMode: 'Enable light mode',
            darkMode: 'Enable dark mode',
            navigation: 'Main navigation',
            homepage: 'Homepage',
            language: 'Language',
            menu: 'Menu',
            closeMenu: 'Close menu',
        },
        fr: {
            home: 'Accueil',
            products: 'Produits',
            contact: 'Contact',
            policies: 'Politiques',
            about: 'À propos',
            search: 'Rechercher des produits',
            favorites: 'Voir les favoris',
            cart: 'Voir le panier',
            lightMode: 'Activer le mode clair',
            darkMode: 'Activer le mode sombre',
            navigation: 'Navigation principale',
            homepage: "Page d'accueil",
            language: 'Langue',
            menu: 'Menu',
            closeMenu: 'Fermer le menu',
        },
        ar: {
            home: 'الرئيسية',
            products: 'المنتجات',
            contact: 'اتصل بنا',
            policies: 'السياسات',
            about: 'من نحن',
            search: 'البحث عن المنتجات',
            favorites: 'عرض المفضلة',
            cart: 'عرض السلة',
            lightMode: 'تفعيل الوضع الفاتح',
            darkMode: 'تفعيل الوضع الداكن',
            navigation: 'التنقل الرئيسي',
            homepage: 'الصفحة الرئيسية',
            language: 'اللغة',
            menu: 'القائمة',
            closeMenu: 'إغلاق القائمة',
        },
    };

    const t = (key: keyof typeof translations.en) => {
        return translations[currentLanguage as keyof typeof translations]?.[key] || translations.en[key];
    };

    useEffect(() => {
        // Apply store language preference
        let lang = 'fr';
        
        if (storeLanguage === 'en' || storeLanguage === 'fr' || storeLanguage === 'ar') {
            lang = storeLanguage;
        } else {
            // Auto mode - detect browser language
            const browserLang = navigator.language.split('-')[0];
            if (browserLang === 'ar' || browserLang === 'en' || browserLang === 'fr') {
                lang = browserLang;
            }
        }
        
        setCurrentLanguage(lang);
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    }, [storeLanguage]);

    useEffect(() => {
        // Apply store theme preference
        let isDark = false;
        
        if (storeTheme === 'dark') {
            isDark = true;
        } else if (storeTheme === 'light') {
            isDark = false;
        } else {
            // Auto mode - check saved preference or system preference
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        }
        
        setDarkMode(isDark);
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }, [storeTheme]);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const changeLanguage = (lang: 'en' | 'fr' | 'ar') => {
        setCurrentLanguage(lang);
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        localStorage.setItem('language', lang);
        setShowLangMenu(false);
    };

    const handleNavigation = (path: string, e: React.MouseEvent) => {
        e.preventDefault();
        onNavigate(path);
    };

    return (
        <nav className="navigation" role="navigation" aria-label={t('navigation')}>
            <div className="nav-container">
                <div className="nav-left">
                    <div className="logo" aria-label={`${storeName} - ${t('homepage')}`}>
                        <img src="/AlgeriePoste.png" alt="AlgeriePoste" />
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
                            {t('home')}
                        </a>
                        <a
                            href="/"
                            className="nav-link"
                            role="menuitem"
                            onClick={(e) => {
                                e.preventDefault();
                                document.querySelector('.products-main')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            {t('products')}
                        </a>
                        <a
                            href="/contact"
                            className="nav-link"
                            role="menuitem"
                            onClick={(e) => handleNavigation(`/contact?domain=${domain}`, e)}
                        >
                            {t('contact')}
                        </a>
                        <a
                            href="/policies"
                            className="nav-link"
                            role="menuitem"
                            onClick={(e) => handleNavigation(`/policies?domain=${domain}`, e)}
                        >
                            {t('policies')}
                        </a>
                    </div>
                </div>

                <div className="nav-right">
                    <div className="language-switcher">
                        <button
                            className="nav-icon-button lang-button"
                            onClick={() => setShowLangMenu(!showLangMenu)}
                            aria-label={t('language')}
                            title={t('language')}
                        >
                            <span className="lang-text">{currentLanguage.toUpperCase()}</span>
                        </button>
                        {showLangMenu && (
                            <div className="lang-menu">
                                <button onClick={() => changeLanguage('en')} className={currentLanguage === 'en' ? 'active' : ''}>
                                    🇬🇧 English
                                </button>
                                <button onClick={() => changeLanguage('fr')} className={currentLanguage === 'fr' ? 'active' : ''}>
                                    🇫🇷 Français
                                </button>
                                <button onClick={() => changeLanguage('ar')} className={currentLanguage === 'ar' ? 'active' : ''}>
                                    🇩🇿 العربية
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        className="nav-icon-button theme-toggle"
                        onClick={toggleDarkMode}
                        aria-label={darkMode ? t('lightMode') : t('darkMode')}
                        title={darkMode ? t('lightMode') : t('darkMode')}
                    >
                        {darkMode ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                    </button>
                    <button
                        className="nav-icon-button search-button desktop-only"
                        aria-label={t('search')}
                        title={t('search')}
                    >
                        <SearchIcon size={20} aria-label={t('search')} />
                    </button>
                    <button
                        className="nav-icon-button heart-button desktop-only"
                        aria-label={t('favorites')}
                        title={t('favorites')}
                    >
                        <HeartIcon size={20} aria-label={t('favorites')} />
                    </button>
                    <button
                        className="nav-icon-button cart-button"
                        aria-label={t('cart')}
                        title={t('cart')}
                    >
                        <CartIcon size={20} aria-label={t('cart')} />
                    </button>
                    <button
                        className="nav-icon-button mobile-menu-button mobile-only"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        aria-label="Menu"
                    >
                        <MenuIcon size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
                <div className="mobile-menu">
                    <div className="mobile-menu-header">
                        <span className="mobile-menu-title">{t('menu')}</span>
                        <button 
                            className="mobile-menu-close"
                            onClick={() => setShowMobileMenu(false)}
                            aria-label={t('closeMenu')}
                        >
                            <CloseIcon size={18} />
                        </button>
                    </div>
                    
                    <div className="mobile-menu-links">
                        <a
                            href="/"
                            className="mobile-menu-link"
                            onClick={(e) => {
                                handleNavigation(`/?domain=${domain}`, e);
                                setShowMobileMenu(false);
                            }}
                        >
                            <span className="menu-icon"><HomeIcon size={16} /></span>
                            {t('home')}
                        </a>
                        <a
                            href="/"
                            className="mobile-menu-link"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowMobileMenu(false);
                                setTimeout(() => {
                                    document.querySelector('.products-main')?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                            }}
                        >
                            <span className="menu-icon"><PackageIcon size={16} /></span>
                            {t('products')}
                        </a>
                        <a
                            href="/contact"
                            className="mobile-menu-link"
                            onClick={(e) => {
                                handleNavigation(`/contact?domain=${domain}`, e);
                                setShowMobileMenu(false);
                            }}
                        >
                            <span className="menu-icon"><MailIcon size={16} /></span>
                            {t('contact')}
                        </a>
                        <a
                            href="/policies"
                            className="mobile-menu-link"
                            onClick={(e) => {
                                handleNavigation(`/policies?domain=${domain}`, e);
                                setShowMobileMenu(false);
                            }}
                        >
                            <span className="menu-icon"><FileTextIcon size={16} /></span>
                            {t('policies')}
                        </a>
                    </div>
                    
                    <div className="mobile-menu-divider"></div>
                    
                    <div className="mobile-menu-section">
                        <div className="mobile-menu-label">{t('language')}</div>
                        <div className="mobile-lang-buttons">
                            <button 
                                onClick={() => { changeLanguage('en'); setShowMobileMenu(false); }}
                                className={currentLanguage === 'en' ? 'active' : ''}
                            >
                                🇬🇧 English
                            </button>
                            <button 
                                onClick={() => { changeLanguage('fr'); setShowMobileMenu(false); }}
                                className={currentLanguage === 'fr' ? 'active' : ''}
                            >
                                🇫🇷 Français
                            </button>
                            <button 
                                onClick={() => { changeLanguage('ar'); setShowMobileMenu(false); }}
                                className={currentLanguage === 'ar' ? 'active' : ''}
                            >
                                🇩🇿 العربية
                            </button>
                        </div>
                    </div>
                    
                    <div className="mobile-menu-divider"></div>
                    
                    <div className="mobile-menu-actions">
                        <button 
                            className="mobile-action-button"
                            onClick={() => {
                                setShowMobileMenu(false);
                            }}
                        >
                            <SearchIcon size={20} />
                            <span>{t('search')}</span>
                        </button>
                        <button 
                            className="mobile-action-button"
                            onClick={() => {
                                setShowMobileMenu(false);
                            }}
                        >
                            <HeartIcon size={20} />
                            <span>{t('favorites')}</span>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation;

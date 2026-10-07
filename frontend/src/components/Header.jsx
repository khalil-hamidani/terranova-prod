import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Calendar, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import logoDark from '../assets/logo-TerraNova.png';
import logoLight from '../assets/logo-light.png';
import './Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getTotalItems, setIsCartOpen } = useCart();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const logo = isDark ? logoDark : logoLight;
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const totalItems = getTotalItems();

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="container header-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" aria-label="TerraNova Accueil">
          <img src={logo} alt="TerraNova Logo" className="brand-img" />
          <div className="brand-text">
            <span className="brand-name">{t('brand_name')}</span>
            <span className="brand-tagline">{t('brand_tagline', 'Eco-Service')}</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Navigation principale">
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-item ${isActive('/')}`} onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}>
                {t('nav_home')}
              </Link>
            </li>
            <li>
              <Link to="/services" className={`nav-item ${isActive('/services')}`} onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}>
                {t('nav_services')}
              </Link>
            </li>
            <li>
              <Link to="/products" className={`nav-item ${isActive('/products')}`} onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}>
                {t('nav_products')}
              </Link>
            </li>
            <li>
              <Link to="/appointment" className={`nav-item ${isActive('/appointment')}`} onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}>
                {t('nav_appointment')}
              </Link>
            </li>
            <li>
              <Link to="/contact" className={`nav-item ${isActive('/contact')}`} onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}>
                {t('nav_contact')}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Header Right Actions */}
        <div className="header-actions">
          {/* Quick Appointment CTA (Desktop) */}
          <Link to="/appointment" className="btn btn-primary btn-sm header-cta-desktop">
            <Calendar size={15} />
            <span>{t('book_call')}</span>
          </Link>

          {/* Language Switcher */}
          <LanguageToggle />

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Shopping Cart Button */}
          <button
            type="button"
            className="cart-trigger-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label={`${t('cart')} (${totalItems})`}
            title={t('cart')}
          >
            <ShoppingCart size={19} strokeWidth={2} />
            {totalItems > 0 && (
              <span className="cart-badge-count">{totalItems}</span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer & Backdrop Portaled to Body (avoids backdrop-filter containing block trap) */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {mobileMenuOpen && (
            <div
              className="mobile-backdrop"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
          )}

          <div
            className={`mobile-drawer ${mobileMenuOpen ? 'drawer-open' : ''}`}
            aria-hidden={!mobileMenuOpen}
          >
            <div className="mobile-drawer-header">
              <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
                <img src={logo} alt="TerraNova Logo" className="brand-img" />
                <div className="brand-text">
                  <span className="brand-name">{t('brand_name')}</span>
                  <span className="brand-tagline">{t('brand_tagline', 'Eco-Service')}</span>
                </div>
              </Link>
              <button
                type="button"
                className="mobile-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fermer le menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="mobile-nav-list">
              <Link to="/" className={`mobile-nav-item ${isActive('/')}`} onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}>
                {t('nav_home')}
              </Link>
              <Link to="/services" className={`mobile-nav-item ${isActive('/services')}`} onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}>
                {t('nav_services')}
              </Link>
              <Link to="/products" className={`mobile-nav-item ${isActive('/products')}`} onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}>
                {t('nav_products')}
              </Link>
              <Link to="/appointment" className={`mobile-nav-item ${isActive('/appointment')}`} onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}>
                {t('nav_appointment')}
              </Link>
              <Link to="/contact" className={`mobile-nav-item ${isActive('/contact')}`} onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}>
                {t('nav_contact')}
              </Link>
              <Link to="/admin" className="mobile-nav-item mobile-admin-link" onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}>
                <ShieldCheck size={16} />
                <span>{t('admin_console')}</span>
              </Link>
            </nav>

            <div className="mobile-drawer-footer">
              <Link
                to="/appointment"
                className="btn btn-primary btn-full-width"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar size={16} />
                <span>{t('book_call')}</span>
              </Link>
              <div className="mobile-theme-row">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
};

export default Header;

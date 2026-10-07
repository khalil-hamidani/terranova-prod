import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Leaf, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import logoDark from '../assets/logo-TerraNova.png';
import logoLight from '../assets/logo-light.png';
import './Footer.css';

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Footer = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const logo = isDark ? logoDark : logoLight;

  return (
    <footer className="footer">
      <div className="container">
        {/* Main 4-Column Footer Grid */}
        <div className="footer-grid">
          {/* Column 1: Brand Info */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-brand">
              <img src={logo} alt="TerraNova Logo" className="footer-brand-img" />
              <div className="footer-brand-text">
                <span className="footer-brand-name">{t('brand_name')}</span>
                <span className="footer-brand-tagline">{t('brand_tagline', 'Eco-Service')}</span>
              </div>
            </Link>
            <p className="footer-desc">
              {t('footer_brand_desc')}
            </p>
            <div className="footer-social-links">
              <a
                href="https://www.instagram.com/terra.nova.dz"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                aria-label="Instagram TerraNova"
              >
                <InstagramIcon size={17} />
                <span dir="ltr">@terra.nova.dz</span>
              </a>
            </div>
          </div>

          {/* Column 2: Nos Solutions */}
          <div className="footer-col">
            <h4 className="footer-col-title">{t('footer_col_solutions')}</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/services">{t('footer_sol_gardening')}</Link>
              </li>
              <li>
                <Link to="/services">{t('footer_sol_cleaning')}</Link>
              </li>
              <li>
                <Link to="/products">{t('footer_sol_compost')}</Link>
              </li>
              <li>
                <Link to="/products">{t('footer_sol_fertilizer')}</Link>
              </li>
              <li>
                <Link to="/products">{t('footer_sol_machines')}</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Liens Rapides */}
          <div className="footer-col">
            <h4 className="footer-col-title">{t('footer_col_nav')}</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/">{t('nav_home')}</Link>
              </li>
              <li>
                <Link to="/services">{t('nav_services')}</Link>
              </li>
              <li>
                <Link to="/products">{t('nav_products')}</Link>
              </li>
              <li>
                <Link to="/appointment">{t('nav_appointment')}</Link>
              </li>
              <li>
                <Link to="/contact">{t('nav_contact')}</Link>
              </li>
              <li>
                <Link to="/admin" className="footer-admin-link">
                  <ShieldCheck size={14} />
                  <span>{t('admin_console')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Horaires */}
          <div className="footer-col contact-col">
            <h4 className="footer-col-title">{t('footer_col_contact')}</h4>
            <ul className="footer-contact-list">
              <li className="contact-item">
                <MapPin size={17} className="contact-icon" />
                <span>{t('contact_addr_city')}</span>
              </li>
              <li className="contact-item">
                <Phone size={17} className="contact-icon" />
                <a href="tel:+213784472366">
                  <span dir="ltr">+213 7 84 47 23 66</span>
                </a>
              </li>
              <li className="contact-item">
                <Mail size={17} className="contact-icon" />
                <a href="mailto:terranova.pro1@gmail.com">terranova.pro1@gmail.com</a>
              </li>
              <li className="contact-item">
                <Clock size={17} className="contact-icon" />
                <span>{t('footer_hours')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} {t('brand_name')} {t('brand_tagline', 'Eco-Service')}. {t('footer_copyright')}
          </p>
          <div className="footer-bottom-badges">
            <span className="eco-pill">
              <Leaf size={13} />
              <span>{t('footer_eco_badge')}</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

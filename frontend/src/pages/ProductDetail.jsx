import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Leaf,
  CheckCircle2,
  AlertCircle,
  Package,
  Sparkles,
  Share2,
  Check,
  Clock,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const API_BASE = '/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language, isRTL } = useLanguage();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch product data and catalog for similar items
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setQuantity(1);
    setAddedToast(false);

    const fetchProductData = async () => {
      try {
        const [prodRes, allRes] = await Promise.all([
          axios.get(`${API_BASE}/products/${id}`),
          axios.get(`${API_BASE}/products`)
        ]);

        if (!isMounted) return;

        if (prodRes.data) {
          setProduct(prodRes.data);

          // Filter similar items (exclude current product)
          if (Array.isArray(allRes.data)) {
            const others = allRes.data.filter(p => String(p.id) !== String(id));
            // Prioritize same category
            const sameCategory = others.filter(p => p.category === prodRes.data.category);
            const remainder = others.filter(p => p.category !== prodRes.data.category);
            setSimilarProducts([...sameCategory, ...remainder].slice(0, 4));
          }
        } else {
          setError(t('product_not_found'));
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load product details:', err);
        setError(t('product_not_found'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProductData();

    return () => {
      isMounted = false;
    };
  }, [id, t]);

  useEffect(() => {
    if (product) {
      const name = (language === 'ar' && product.name_ar) ? product.name_ar : product.name;
      document.title = `${name} — TerraNova`;
    }
  }, [language, product]);

  const handleQtyChange = (delta) => {
    const maxStock = product?.stock && product.stock > 0 ? product.stock : 99;
    setQuantity(prev => Math.max(1, Math.min(prev + delta, maxStock)));
  };

  const handleAddToCart = () => {
    if (!product || (product.stock !== undefined && product.stock <= 0)) return;
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
    }, 4000);
  };

  const handleBuyNow = () => {
    if (!product || (product.stock !== undefined && product.stock <= 0)) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Parse features helper (newline, bullet, or comma)
  const parseFeatures = (text) => {
    if (!text) return [];
    if (text.includes('\n')) {
      return text.split('\n').map(s => s.trim().replace(/^[-•*]\s*/, '')).filter(Boolean);
    }
    if (text.includes('•')) {
      return text.split('•').map(s => s.trim()).filter(Boolean);
    }
    return [text.trim()];
  };

  if (loading) {
    return (
      <div className="product-detail-page-state">
        <div className="spinner"></div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page-state">
        <div className="not-found-card">
          <AlertCircle size={48} className="not-found-icon" />
          <h2>{t('product_not_found')}</h2>
          <p>{t('product_not_found_desc')}</p>
          <Link to="/products" className="btn btn-primary">
            {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span>{t('product_back_to_shop')}</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isArabic = language === 'ar';
  const displayName = (isArabic && product.name_ar) ? product.name_ar : product.name;
  const displayCategory = (isArabic && product.category_ar) ? product.category_ar : product.category;
  const displayType = (isArabic && product.type_ar) ? product.type_ar : product.type;
  const displayDescription = (isArabic && product.description_ar) ? product.description_ar : product.description;
  const displayFeatures = (isArabic && product.features_ar) ? product.features_ar : product.features;
  const displayUsageInstructions = (isArabic && product.usageInstructions_ar) ? product.usageInstructions_ar : product.usageInstructions;
  const featuresList = parseFeatures(displayFeatures);

  return (
    <div className={`product-detail-page ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {addedToast && (
        <div className="product-toast-banner animate-fade-in" role="status">
          <div className="toast-content">
            <CheckCircle2 size={18} className="toast-icon-check" />
            <span>{t('product_added_to_cart_toast')}</span>
          </div>
          <div className="toast-actions">
            <button
              type="button"
              className="toast-checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              <span>{t('product_order_now')}</span>
              {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      )}

      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="product-breadcrumbs" aria-label="Breadcrumbs">
          <Link to="/" className="breadcrumb-link">
            {t('product_breadcrumb_home')}
          </Link>
          <span className="breadcrumb-separator">
            {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </span>
          <Link to="/products" className="breadcrumb-link">
            {t('product_breadcrumb_shop')}
          </Link>
          {displayCategory && (
            <>
              <span className="breadcrumb-separator">
                {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </span>
              <span className="breadcrumb-current-cat">{displayCategory}</span>
            </>
          )}
          <span className="breadcrumb-separator">
            {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </span>
          <span className="breadcrumb-current-item" title={displayName}>
            {displayName}
          </span>
        </nav>

        {/* Back Link */}
        <div className="product-back-bar">
          <Link to="/products" className="back-to-catalog-link">
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            <span>{t('product_back_to_shop')}</span>
          </Link>

          <button
            type="button"
            className="share-btn"
            onClick={handleShare}
            title="Copier le lien du produit"
          >
            {copiedLink ? <Check size={16} className="text-success" /> : <Share2 size={16} />}
            <span>{copiedLink ? (isRTL ? 'تم النسخ!' : 'Lien copié !') : (isRTL ? 'مشاركة' : 'Partager')}</span>
          </button>
        </div>

        {/* Main Product Showcase Grid */}
        <div className="product-showcase-grid">
          {/* Left Column: Visual Gallery & Trust Badges */}
          <div className="product-gallery-pane">
            <div className="product-main-visual">
              {product.imageURL ? (
                <img
                  src={product.imageURL}
                  alt={displayName}
                  className="product-hero-image"
                />
              ) : (
                <div className="product-fallback-visual">
                  <Package size={72} strokeWidth={1.5} />
                  <span>TerraNova Bio</span>
                </div>
              )}

              {/* Floating Badges */}
              <div className="product-visual-badges">
                {displayCategory && (
                  <span className="p-badge p-badge-category">
                    {displayCategory}
                  </span>
                )}
                <span className="p-badge p-badge-bio">
                  <Leaf size={13} />
                  <span>100% Bio</span>
                </span>
              </div>
            </div>

            {/* Trust Assurance Grid */}
            <div className="product-trust-grid">
              <div className="trust-item">
                <div className="trust-icon-box">
                  <Leaf size={18} />
                </div>
                <div>
                  <strong>{t('product_badge_bio')}</strong>
                  <span>Formulation écologique certifiée</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-box">
                  <Truck size={18} />
                </div>
                <div>
                  <strong>{t('product_badge_delivery')}</strong>
                  <span>Expédition rapide à domicile</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-box">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <strong>{t('product_badge_cod')}</strong>
                  <span>Règlement en espèces à réception</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-box">
                  <Sparkles size={18} />
                </div>
                <div>
                  <strong>{t('product_badge_support')}</strong>
                  <span>Accompagnement expert TerraNova</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Specifications & Purchase Actions */}
          <div className="product-info-pane">
            {/* Header tags */}
            <div className="product-meta-tags">
              {displayCategory && (
                <span className="meta-tag meta-tag-cat">{displayCategory}</span>
              )}
              {displayType && (
                <span className="meta-tag meta-tag-type">{displayType}</span>
              )}
              <span className={`meta-tag meta-tag-stock ${isOutOfStock ? 'stock-out' : 'stock-in'}`}>
                <span className="stock-dot"></span>
                <span>
                  {isOutOfStock
                    ? t('out_of_stock')
                    : (product.stock ? `${product.stock} ${t('in_stock')}` : t('in_stock'))}
                </span>
              </span>
            </div>

            {/* Product Title */}
            <h1 className="product-detail-title">{displayName}</h1>

            {/* Price Box */}
            <div className="product-price-section">
              <div className="price-main-display">
                <span className="price-digits">
                  {Number(product.price ?? product.amount ?? 0).toLocaleString('fr-DZ')}
                </span>
                <span className="price-currency">{t('currency')}</span>
              </div>
              <span className="price-ttc-label">{isArabic ? 'شامل الرسوم • الدفع عند الاستلام' : 'TTC • Paiement à la réception'}</span>
            </div>

            {/* Commercial Description */}
            <div className="product-desc-box">
              <p>
                {displayDescription ||
                  (isArabic
                    ? "حل بيولوجي عالي الفعالية مطور من تيرا نوفا لتجديد حيوية نباتاتكم وإثراء التربة وتحقيق نمو نباتي طبيعي."
                    : "Solution biologique haute performance développée par TerraNova pour régénérer la vitalité de vos plantes, enrichir le microbiote du sol et maximiser la croissance végétale naturelle.")}
              </p>
            </div>

            {/* Key Features List */}
            {featuresList.length > 0 && (
              <div className="product-spec-block">
                <h3 className="spec-block-title">
                  <Sparkles size={18} className="spec-title-icon" />
                  <span>{t('product_features')}</span>
                </h3>
                <ul className="spec-features-list">
                  {featuresList.map((feat, idx) => (
                    <li key={idx} className="spec-feature-item">
                      <CheckCircle2 size={16} className="feature-check-icon" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Usage Instructions Box */}
            {displayUsageInstructions && (
              <div className="product-usage-card">
                <div className="usage-card-header">
                  <Clock size={17} className="usage-icon" />
                  <h4 className="usage-card-title">{t('product_usage')}</h4>
                </div>
                <p className="usage-card-text">{displayUsageInstructions}</p>
              </div>
            )}

            {/* Purchase Control Zone */}
            <div className="product-purchase-box">
              <div className="quantity-select-row">
                <span className="qty-label">{t('product_qty')}</span>
                <div className="qty-stepper-control">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleQtyChange(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Diminuer la quantité"
                  >
                    -
                  </button>
                  <span className="stepper-value">{quantity}</span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleQtyChange(1)}
                    disabled={isOutOfStock || (product.stock && quantity >= product.stock)}
                    aria-label="Augmenter la quantité"
                  >
                    +
                  </button>
                </div>
                <div className="line-total-estimate">
                  <span>Total : </span>
                  <strong>
                    {(Number(product.price ?? product.amount ?? 0) * quantity).toLocaleString('fr-DZ')} {t('currency')}
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="product-cta-buttons">
                <button
                  type="button"
                  className="btn btn-secondary btn-detail-cart"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  <ShoppingBag size={18} />
                  <span>{t('add_to_cart')}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary btn-detail-buy"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                >
                  <span>{t('product_order_now')}</span>
                  {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar / Related Products Carousel/Grid */}
        {similarProducts.length > 0 && (
          <section className="product-similar-section">
            <div className="similar-section-header">
              <div>
                <h2 className="similar-title">{t('product_similar_title')}</h2>
                <p className="similar-subtitle">{t('product_similar_sub')}</p>
              </div>
              <Link to="/products" className="view-all-catalog-link">
                <span>{t('product_back_to_shop')}</span>
                {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </Link>
            </div>

            <div className="similar-products-grid">
              {similarProducts.map((simProd) => {
                const sName = (isArabic && simProd.name_ar) ? simProd.name_ar : simProd.name;
                const sCat = (isArabic && simProd.category_ar) ? simProd.category_ar : simProd.category;
                return (
                  <div
                    key={simProd.id}
                    className="similar-card"
                    onClick={() => navigate(`/products/${simProd.id}`)}
                  >
                    <div className="similar-thumb">
                      {simProd.imageURL ? (
                        <img src={simProd.imageURL} alt={sName} />
                      ) : (
                        <div className="similar-fallback">
                          <Package size={32} />
                        </div>
                      )}
                      {sCat && (
                        <span className="similar-cat-chip">{sCat}</span>
                      )}
                    </div>
                    <div className="similar-body">
                      <h3 className="similar-prod-name">{sName}</h3>
                      <div className="similar-foot">
                        <span className="similar-price">
                        {Number(simProd.price ?? simProd.amount ?? 0).toLocaleString('fr-DZ')} {t('currency')}
                      </span>
                      <span className="similar-view-btn">
                        {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Check,
  AlertCircle,
  Package,
  RotateCcw,
  Sparkles,
  Tag,
  Leaf,
  Eye,
  ArrowRight
} from 'lucide-react';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './Products.css';

const formatPrice = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  return Number(value).toLocaleString('fr-DZ');
};

const getImageSrc = (product) => {
  return product.imageURL || product.imageUrl || product.image || '';
};

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart, showSuccess } = useCart();
  const { t, language, isRtl } = useLanguage();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(t('products_err_msg'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search Logic
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      filter === 'all' ||
      p.category?.toLowerCase() === filter.toLowerCase() ||
      p.category_ar?.toLowerCase() === filter.toLowerCase() ||
      p.type?.toLowerCase() === filter.toLowerCase() ||
      p.type_ar?.toLowerCase() === filter.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      p.name?.toLowerCase().includes(q) ||
      p.name_ar?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.description_ar?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.category_ar?.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (e, product) => {
    if (e && e.stopPropagation) e.stopPropagation();
    addToCart(product);
    const prodName = (language === 'ar' && product.name_ar) ? product.name_ar : product.name;
    const msgTemplate = t('products_added_msg');
    const msg = msgTemplate.replace('{name}', prodName);
    showSuccess(t('products_added_title'), msg);
  };

  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  const categories = [
    { id: 'all', label: t('products_filter_all') },
    { id: 'engrais', label: t('products_filter_engrais') },
    { id: 'biofertilisant', label: t('products_filter_biofert') },
    { id: 'compost', label: t('products_filter_compost') },
    { id: 'liquide', label: t('products_filter_liquide') },
    { id: 'solide', label: t('products_filter_solide') },
    { id: 'machine', label: t('products_filter_machine') }
  ];

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Leaf size={14} />
            <span>{t('products_tag')}</span>
          </div>
          <h1 className="page-title">{t('products_title')}</h1>
          <p className="page-subtitle">
            {t('products_sub')}
          </p>
        </div>

        {/* Filter & Search Bar Controls */}
        <div className="catalog-controls-bar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder={t('products_search_ph')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                &times;
              </button>
            )}
          </div>

          <div className="category-pills-row">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`filter-pill ${filter === cat.id ? 'active' : ''}`}
                onClick={() => setFilter(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="catalog-error-box">
            <div className="error-icon-wrap">
              <AlertCircle size={28} />
            </div>
            <div className="error-text-wrap">
              <h3>{t('products_err_title')}</h3>
              <p>{error}</p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={loadProducts}>
              <RotateCcw size={15} />
              <span>{t('products_retry')}</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="products-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="product-skeleton-card">
                <div className="skeleton-image" />
                <div className="skeleton-line title" />
                <div className="skeleton-line desc" />
                <div className="skeleton-line price" />
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const imageSrc = getImageSrc(product);
              const inStock = (product.stock ?? 0) > 0;

              return (
                <div
                  key={product.id}
                  className="product-card-modern"
                  onClick={() => handleViewProduct(product.id)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleViewProduct(product.id);
                    }
                  }}
                  aria-label={`Voir les détails de ${product.name}`}
                >
                  <div className="product-card-image-wrap">
                    {imageSrc ? (
                      <img
                        className="product-card-img"
                        src={imageSrc}
                        alt={product.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.classList.add('has-fallback');
                        }}
                      />
                    ) : (
                      <div className="product-image-fallback">
                        <Package size={40} strokeWidth={1.5} />
                      </div>
                    )}

                    {(product.category || product.category_ar) && (
                      <span className="product-badge-category">
                        {(language === 'ar' && product.category_ar) ? product.category_ar : product.category}
                      </span>
                    )}

                    <div className="product-card-hover-overlay">
                      <span className="hover-view-tag">
                        <Eye size={15} />
                        <span>{t('product_btn_view_details')}</span>
                      </span>
                    </div>
                  </div>

                  <div className="product-card-body">
                    <h3 className="product-card-title">
                      {(language === 'ar' && product.name_ar) ? product.name_ar : product.name}
                    </h3>

                    {(product.description || product.description_ar) && (
                      <p className="product-card-description">
                        {(language === 'ar' && product.description_ar) ? product.description_ar : product.description}
                      </p>
                    )}

                    <div className="product-meta-row">
                      <div className="product-stock-pill">
                        {inStock ? (
                          <span className="stock-in">
                            <Check size={13} strokeWidth={2.5} />
                            <span>{t('products_stock_in')} ({product.stock})</span>
                          </span>
                        ) : (
                          <span className="stock-out">
                            <AlertCircle size={13} />
                            <span>{t('products_stock_out')}</span>
                          </span>
                        )}
                      </div>

                      {(product.type || product.type_ar) && (
                        <span className="product-type-pill">
                          {(language === 'ar' && product.type_ar) ? product.type_ar : product.type}
                        </span>
                      )}
                    </div>

                    <div className="product-card-bottom">
                      <div className="product-price-box">
                        <span className="price-label">{t('products_price_label')}</span>
                        <span className="price-amount">
                          {formatPrice(product.price ?? product.amount)} {t('currency', 'DA')}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm add-cart-btn"
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={!inStock}
                        title={inStock ? t('products_add_to_cart') : t('products_stock_out')}
                      >
                        <ShoppingCart size={15} />
                        <span>{t('products_add_to_cart')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="catalog-empty-state">
            <div className="empty-icon-wrap">
              <Package size={48} strokeWidth={1.3} />
            </div>
            <h3>{t('products_empty_title')}</h3>
            <p>
              {t('products_empty_desc')}
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
            >
              {t('products_reset_filters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;

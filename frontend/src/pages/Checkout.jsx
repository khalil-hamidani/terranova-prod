import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Truck,
  ArrowLeft,
  ArrowRight,
  Package,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './Checkout.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ALGERIAN_WILAYAS = [
  '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna',
  '06 - Béjaïa', '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira',
  '11 - Tamanrasset', '12 - Tébessa', '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou',
  '16 - Alger', '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda',
  '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma', '25 - Constantine',
  '26 - Médéa', '27 - Mostaganem', '28 - M\'Sila', '29 - Mascara', '30 - Ouargla',
  '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arréridj', '35 - Boumerdès',
  '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela',
  '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Naâma',
  '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane', '49 - Timimoun', '50 - Bordj Badji Mokhtar',
  '51 - Ouled Djellal', '52 - Béni Abbès', '53 - In Salah', '54 - In Guezzam', '55 - Touggourt',
  '56 - Djanet', '57 - El M\'Ghair', '58 - El Meniaa'
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { t, language, isRtl } = useLanguage();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    wilaya: '',
    commune: '',
    adresse: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const total = getTotalPrice();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError(t('checkout_empty_cart_sub'));
      return;
    }

    if (!formData.wilaya) {
      setError(language === 'ar' ? 'يرجى اختيار الولاية' : 'Veuillez sélectionner votre wilaya');
      return;
    }

    setLoading(true);

    try {
      const items = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const response = await fetch(`${API_BASE}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          items,
          paymentMethod: 'cod'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setConfirmedOrder({
          orderNumber: data.orderNumber,
          customer: { ...formData },
          items: [...cart],
          totalAmount: total
        });
        clearCart();
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } else {
        setError(data.error || 'Erreur lors de la validation de la commande');
      }
    } catch (err) {
      console.error('Order error:', err);
      setError('Erreur de connexion avec le serveur. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================================
     SUCCESS CONFIRMATION SCREEN
     ========================================================================= */
  if (confirmedOrder) {
    return (
      <div className="checkout-page checkout-success-page">
        <div className="container">
          <div className="checkout-success-card">
            <div className="success-icon-badge">
              <CheckCircle2 size={46} strokeWidth={2.2} />
            </div>

            <h1 className="success-title">{t('checkout_success_heading')}</h1>
            <p className="success-subtitle">
              {t('checkout_success_message')}{' '}
              <strong className="order-number-badge">#{confirmedOrder.orderNumber}</strong>
            </p>

            <div className="success-callout-box">
              <div className="callout-icon">
                <Clock size={22} />
              </div>
              <div className="callout-text">
                <strong>{t('checkout_success_note')}</strong>
                <p>
                  {language === 'ar'
                    ? `سيتم التوصيل إلى: ${confirmedOrder.customer.commune}، ${confirmedOrder.customer.wilaya}. الهاتف: ${confirmedOrder.customer.telephone}`
                    : `Livraison prévue à : ${confirmedOrder.customer.commune}, ${confirmedOrder.customer.wilaya}. Téléphone : ${confirmedOrder.customer.telephone}`}
                </p>
              </div>
            </div>

            <div className="success-items-box">
              <h3 className="success-items-title">{t('checkout_items_ordered')}</h3>
              <div className="success-items-list">
                {confirmedOrder.items.map((item) => (
                  <div key={item.id} className="success-item-row">
                    <div className="success-item-name">
                      <span className="qty-tag">{item.quantity}x</span>
                      <span>{(language === 'ar' && item.name_ar) ? item.name_ar : item.name}</span>
                    </div>
                    <span className="success-item-price">
                      {Number(item.price * item.quantity).toLocaleString('fr-DZ')} {t('currency', 'DA')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="success-total-row">
                <span>Total</span>
                <strong>
                  {Number(confirmedOrder.totalAmount).toLocaleString('fr-DZ')} {t('currency', 'DA')}
                </strong>
              </div>
            </div>

            <div className="success-actions-row">
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/products')}
              >
                <ShoppingBag size={17} />
                <span>{t('checkout_btn_shop')}</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/')}
              >
                <span>{t('checkout_btn_home')}</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     EMPTY CART STATE
     ========================================================================= */
  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-empty-box">
            <div className="empty-cart-icon-wrap">
              <ShoppingBag size={48} strokeWidth={1.4} />
            </div>
            <h2>{t('checkout_empty_cart_title')}</h2>
            <p>{t('checkout_empty_cart_sub')}</p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/products')}
            >
              <ShoppingBag size={17} />
              <span>{t('checkout_btn_shop')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     CHECKOUT FORM & SUMMARY
     ========================================================================= */
  return (
    <div className="checkout-page">
      <div className="container">
        {/* Page Header */}
        <div className="checkout-header">
          <button
            type="button"
            className="checkout-back-link"
            onClick={() => navigate('/products')}
          >
            <ArrowLeft size={16} />
            <span>{t('checkout_btn_shop')}</span>
          </button>
          <h1 className="checkout-title">{t('checkout_page_title')}</h1>
          <p className="checkout-subtitle">{t('checkout_page_sub')}</p>
        </div>

        {error && (
          <div className="checkout-error-alert">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="checkout-layout">
          {/* Left Form: Delivery Information */}
          <div className="checkout-form-container">
            <form onSubmit={handleSubmit} id="checkout-form">
              <div className="form-card">
                <div className="form-card-header">
                  <div className="form-card-icon">
                    <User size={20} />
                  </div>
                  <div>
                    <h2 className="form-card-title">{t('checkout_delivery_info')}</h2>
                    <span className="form-card-desc">
                      {language === 'ar' ? 'المعلومات الشخصية وعنوان التسليم' : 'Coordonnées & adresse de livraison'}
                    </span>
                  </div>
                </div>

                <div className="checkout-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="prenom">
                      {t('checkout_lbl_prenom')}
                    </label>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      className="form-control"
                      placeholder={t('checkout_ph_prenom')}
                      value={formData.prenom}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="nom">
                      {t('checkout_lbl_nom')}
                    </label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      className="form-control"
                      placeholder={t('checkout_ph_nom')}
                      value={formData.nom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="checkout-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="telephone">
                      {t('checkout_lbl_phone')}
                    </label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      className="form-control"
                      placeholder={t('checkout_ph_phone')}
                      value={formData.telephone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      {t('checkout_lbl_email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      placeholder={t('checkout_ph_email')}
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="checkout-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="wilaya">
                      {t('checkout_lbl_wilaya')}
                    </label>
                    <select
                      id="wilaya"
                      name="wilaya"
                      className="form-control"
                      value={formData.wilaya}
                      onChange={handleChange}
                      required
                    >
                      <option value="">{t('checkout_ph_wilaya')}</option>
                      {ALGERIAN_WILAYAS.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="commune">
                      {t('checkout_lbl_commune')}
                    </label>
                    <input
                      type="text"
                      id="commune"
                      name="commune"
                      className="form-control"
                      placeholder={t('checkout_ph_commune')}
                      value={formData.commune}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="adresse">
                    {t('checkout_lbl_address')}
                  </label>
                  <input
                    type="text"
                    id="adresse"
                    name="adresse"
                    className="form-control"
                    placeholder={t('checkout_ph_address')}
                    value={formData.adresse}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="notes">
                    {t('checkout_notes_label')}
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="form-control"
                    rows="2"
                    placeholder={t('checkout_notes_ph')}
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                {/* Cash on Delivery Payment Badge */}
                <div className="payment-method-box">
                  <div className="payment-badge-header">
                    <ShieldCheck size={22} className="payment-check-icon" />
                    <div>
                      <strong>{t('checkout_payment_badge')}</strong>
                      <p>{t('checkout_payment_desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Summary Card */}
          <div className="checkout-summary-container">
            <div className="summary-card">
              <h2 className="summary-title">{t('checkout_order_summary')}</h2>

              <div className="summary-items-list">
                {cart.map((item) => (
                  <div key={item.id} className="summary-item">
                    <div className="summary-item-left">
                      {item.imageURL || item.imageUrl || item.image ? (
                        <img
                          src={item.imageURL || item.imageUrl || item.image}
                          alt={item.name}
                          className="summary-item-thumb"
                        />
                      ) : (
                        <div className="summary-item-thumb-fallback">
                          <Package size={20} />
                        </div>
                      )}
                      <div className="summary-item-meta">
                        <span className="summary-item-name">
                          {(language === 'ar' && item.name_ar) ? item.name_ar : item.name}
                        </span>
                        <span className="summary-item-qty">
                          {t('product_qty')}: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="summary-item-total">
                      {Number(item.price * item.quantity).toLocaleString('fr-DZ')} {t('currency', 'DA')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-breakdown">
                <div className="breakdown-row">
                  <span>Sous-total</span>
                  <span>{Number(total).toLocaleString('fr-DZ')} {t('currency', 'DA')}</span>
                </div>
                <div className="breakdown-row">
                  <span>Livraison</span>
                  <span className="delivery-free-tag">
                    {language === 'ar' ? 'حسب الولاية (عند التأكيد)' : 'Selon wilaya'}
                  </span>
                </div>
                <div className="breakdown-row total-row">
                  <span>Total</span>
                  <strong className="summary-total-price">
                    {Number(total).toLocaleString('fr-DZ')} {t('currency', 'DA')}
                  </strong>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="btn btn-primary btn-lg btn-confirm-order"
                disabled={loading}
              >
                {loading ? (
                  <span>{t('checkout_confirming')}</span>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>{t('checkout_btn_confirm')}</span>
                  </>
                )}
              </button>

              <div className="checkout-trust-points">
                <div className="trust-point">
                  <Truck size={16} />
                  <span>{t('checkout_guarantee_1')}</span>
                </div>
                <div className="trust-point">
                  <CheckCircle2 size={16} />
                  <span>{t('checkout_guarantee_2')}</span>
                </div>
                <div className="trust-point">
                  <ShieldCheck size={16} />
                  <span>{t('checkout_guarantee_3')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

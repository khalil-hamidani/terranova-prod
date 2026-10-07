import { useState } from 'react';
import { X, ShoppingBag, Send, MapPin, User, Phone, Mail, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './Modal.css';

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

const CheckoutModal = () => {
  const { cart, getTotalPrice, clearCart, isCheckoutOpen, setIsCheckoutOpen, showSuccess } = useCart();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    wilaya: '',
    commune: '',
    adresse: ''
  });

  const handleChange = (e) => {
    const { id, value, name } = e.target;
    const fieldName = id || name;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const items = cart.map(item => ({
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
          items
        })
      });

      const data = await response.json();

      if (response.ok && data.whatsappUrl) {
        clearCart();
        setIsCheckoutOpen(false);
        resetForm();
        const successMsg = t('checkout_success_desc')
          .replace('{orderNumber}', data.orderNumber);
        showSuccess(t('checkout_success_title'), successMsg);
        window.location.href = data.whatsappUrl;
      } else {
        alert(data.error || 'Erreur lors de la création de la commande');
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      wilaya: '',
      commune: '',
      adresse: ''
    });
  };

  if (!isCheckoutOpen) return null;

  const total = getTotalPrice();

  return (
    <div className="modal active">
      <div className="modal-backdrop" onClick={() => setIsCheckoutOpen(false)} />
      <div className="modal-content checkout-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <ShoppingBag size={20} className="modal-icon" />
            <h2>{t('checkout_title')}</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsCheckoutOpen(false)}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <form id="checkoutForm" onSubmit={handleSubmit}>
            {/* Customer Info Section */}
            <div className="checkout-section">
              <h3 className="checkout-section-title">
                <User size={16} />
                <span>{t('checkout_customer_info')}</span>
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="nom">{t('checkout_lbl_nom')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nom"
                    placeholder={t('checkout_ph_nom')}
                    value={formData.nom}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prenom">{t('checkout_lbl_prenom')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="prenom"
                    placeholder={t('checkout_ph_prenom')}
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="telephone">
                    <Phone size={13} />
                    <span>{t('checkout_lbl_phone')}</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="telephone"
                    placeholder={t('checkout_ph_phone')}
                    value={formData.telephone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    <Mail size={13} />
                    <span>{t('checkout_lbl_email')}</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder={t('checkout_ph_email')}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address Section */}
            <div className="checkout-section">
              <h3 className="checkout-section-title">
                <MapPin size={16} />
                <span>{t('checkout_delivery_addr')}</span>
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="wilaya">{t('checkout_lbl_wilaya')}</label>
                  <select
                    className="form-control"
                    id="wilaya"
                    value={formData.wilaya}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('checkout_ph_wilaya')}</option>
                    {ALGERIAN_WILAYAS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="commune">{t('checkout_lbl_commune')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="commune"
                    placeholder={t('checkout_ph_commune')}
                    value={formData.commune}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="adresse">{t('checkout_lbl_address')}</label>
                <textarea
                  className="form-control"
                  id="adresse"
                  rows="2"
                  placeholder={t('checkout_ph_address')}
                  value={formData.adresse}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Order Total Overview */}
            <div className="checkout-order-summary">
              <div className="order-summary-row">
                <span>{t('checkout_items_count')}</span>
                <strong>{cart.reduce((sum, item) => sum + item.quantity, 0)}</strong>
              </div>
              <div className="order-summary-row total">
                <span>{t('checkout_total_pay')}</span>
                <span className="total-highlight">
                  {Number(total).toLocaleString('fr-DZ')} {t('currency', 'DA')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-footer checkout-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsCheckoutOpen(false)}
                disabled={loading}
              >
                {t('checkout_btn_back')}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <Send size={16} />
                <span>{loading ? t('checkout_preparing') : t('checkout_btn_confirm')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;

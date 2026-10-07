import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './Modal.css';

const CartModal = () => {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
  } = useCart();
  const { t, language } = useLanguage();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  const total = getTotalPrice();

  return (
    <div className="modal active">
      <div className="modal-backdrop" onClick={() => setIsCartOpen(false)} />
      <div className="modal-content cart-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <ShoppingBag size={20} className="modal-icon" />
            <h2>{t('cart_title')}</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Fermer le panier"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {cart.length === 0 ? (
            <div className="empty-cart-state">
              <div className="empty-cart-icon">
                <ShoppingBag size={48} strokeWidth={1.2} />
              </div>
              <h3>{t('cart_empty_title')}</h3>
              <p>{t('cart_empty_sub')}</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsCartOpen(false)}
              >
                {t('cart_btn_explore')}
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">
                      {(language === 'ar' && item.name_ar) ? item.name_ar : item.name}
                    </span>
                    <span className="cart-item-price">
                      {Number(item.price).toLocaleString('fr-DZ')} {t('currency', 'DA')}
                    </span>
                  </div>

                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button
                        type="button"
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, -1)}
                        aria-label="Diminuer la quantité"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        type="button"
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label="Augmenter la quantité"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Supprimer ${item.name}`}
                      title="Supprimer l'article"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="cart-summary-box">
              <div className="cart-total-row">
                <span className="total-label">{t('cart_total_label')}</span>
                <span className="total-value">
                  {Number(total).toLocaleString('fr-DZ')} {t('currency', 'DA')}
                </span>
              </div>
              <p className="cart-delivery-note">
                {t('cart_delivery_note')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCartOpen(false)}
            >
              {t('cart_btn_continue')}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCheckout}
            >
              <span>{t('cart_btn_checkout')}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;

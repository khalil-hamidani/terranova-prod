import { CheckCircle2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './Modal.css';

const SuccessModal = () => {
  const { successModal, closeSuccess } = useCart();
  const { t } = useLanguage();

  if (!successModal.isOpen) return null;

  return (
    <div className="modal active">
      <div className="modal-backdrop" onClick={closeSuccess} />
      <div className="modal-content success-modal">
        <button
          type="button"
          className="modal-close-corner"
          onClick={closeSuccess}
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        <div className="success-icon-wrap">
          <CheckCircle2 size={56} strokeWidth={1.8} className="success-check-icon" />
        </div>

        <h2 className="success-modal-title">{successModal.title}</h2>
        <p className="success-modal-message">{successModal.message}</p>

        <div className="success-modal-actions">
          <button type="button" className="btn btn-primary btn-full-width" onClick={closeSuccess}>
            {t('success_btn_close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;

import { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Leaf,
  CheckCircle2,
  HelpCircle,
  Building,
  ExternalLink
} from 'lucide-react';
import { sendContactMessage } from '../services/api';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './Contact.css';

const Contact = () => {
  const { showSuccess } = useCart();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomComplet: '',
    email: '',
    telephone: '',
    sujet: '',
    message: ''
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendContactMessage(formData);
      const successMsg = t('contact_success_desc')
        .replace('{name}', formData.nomComplet)
        .replace('{subject}', formData.sujet || t('contact_sub_other'));

      showSuccess(t('contact_success_title'), successMsg);

      // Reset form
      setFormData({
        nomComplet: '',
        email: '',
        telephone: '',
        sujet: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact submit error:', error);
      alert(t('contact_error_alert'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Leaf size={14} />
            <span>{t('contact_tag')}</span>
          </div>
          <h1 className="page-title">{t('contact_title')}</h1>
          <p className="page-subtitle">
            {t('contact_sub')}
          </p>
        </div>

        <div className="contact-layout">
          {/* Left Column: Contact Cards */}
          <div className="contact-info-column">
            <div className="contact-info-card">
              <h2 className="info-card-title">{t('contact_info_title')}</h2>
              <p className="info-card-desc">
                {t('contact_info_desc')}
              </p>

              <div className="contact-detail-items">
                <div className="contact-detail-row">
                  <div className="contact-icon-box">
                    <MapPin size={20} />
                  </div>
                  <div className="contact-detail-content">
                    <span className="detail-label">{t('contact_addr_label')}</span>
                    <strong>{t('contact_addr_city')}</strong>
                    <span className="detail-sub">{t('contact_addr_sub')}</span>
                  </div>
                </div>

                <div className="contact-detail-row">
                  <div className="contact-icon-box">
                    <Phone size={20} />
                  </div>
                  <div className="contact-detail-content">
                    <span className="detail-label">{t('contact_phone_label')}</span>
                    <a href="tel:+213784472366" className="detail-link">
                      <span dir="ltr">+213 7 84 47 23 66</span>
                    </a>
                    <span className="detail-sub">{t('contact_phone_sub')}</span>
                  </div>
                </div>

                <div className="contact-detail-row">
                  <div className="contact-icon-box">
                    <Mail size={20} />
                  </div>
                  <div className="contact-detail-content">
                    <span className="detail-label">{t('contact_mail_label')}</span>
                    <a href="mailto:terranova.pro1@gmail.com" className="detail-link">
                      terranova.pro1@gmail.com
                    </a>
                    <span className="detail-sub">{t('contact_mail_sub')}</span>
                  </div>
                </div>

                <div className="contact-detail-row">
                  <div className="contact-icon-box">
                    <Clock size={20} />
                  </div>
                  <div className="contact-detail-content">
                    <span className="detail-label">{t('contact_hours_label')}</span>
                    <strong>{t('contact_hours_days')}</strong>
                    <span className="detail-sub">{t('contact_hours_sub')}</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Live Trigger */}
              <div className="whatsapp-help-box">
                <div className="whatsapp-help-header">
                  <MessageCircle size={22} className="whatsapp-icon" />
                  <div>
                    <strong>{t('contact_whatsapp_title')}</strong>
                    <p>{t('contact_whatsapp_desc')}</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/213784472366?text=Bonjour%20TerraNova,%20je%20souhaite%20des%20renseignements%20sur%20vos%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-full-width"
                >
                  <MessageCircle size={16} />
                  <span>{t('contact_whatsapp_btn')}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-column">
            <div className="contact-form-card">
              <h2 className="form-card-title">{t('contact_form_title')}</h2>
              <p className="form-card-desc">
                {t('contact_form_desc')}
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="nomComplet">{t('contact_lbl_fullname')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nomComplet"
                    placeholder={t('contact_ph_fullname')}
                    value={formData.nomComplet}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">{t('contact_lbl_email')}</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder={t('contact_ph_email')}
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="telephone">{t('contact_lbl_phone')}</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="telephone"
                      placeholder={t('contact_ph_phone')}
                      value={formData.telephone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="sujet">{t('contact_lbl_subject')}</label>
                  <select
                    className="form-control"
                    id="sujet"
                    value={formData.sujet}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('contact_sub_prompt')}</option>
                    <option value="Intervention Jardinage">{t('contact_sub_gardening')}</option>
                    <option value="Intervention Nettoyage">{t('contact_sub_cleaning')}</option>
                    <option value="Achat Produits">{t('contact_sub_products')}</option>
                    <option value="Machines Valorisation">{t('contact_sub_machines')}</option>
                    <option value="Partenariat">{t('contact_sub_partner')}</option>
                    <option value="Autre">{t('contact_sub_other')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="message">{t('contact_lbl_msg')}</label>
                  <textarea
                    className="form-control"
                    id="message"
                    rows="5"
                    placeholder={t('contact_ph_msg')}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-full-width contact-submit-btn"
                  disabled={loading}
                >
                  <Send size={17} />
                  <span>{loading ? t('contact_sending') : t('contact_btn_send')}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Interactive Google Map Section */}
        <div className="contact-map-section">
          <div className="contact-map-header">
            <div className="contact-map-info">
              <h2 className="contact-map-title">
                <MapPin size={22} className="map-title-icon" />
                {t('contact_map_title')}
              </h2>
              <p className="contact-map-sub">{t('contact_map_sub')}</p>
            </div>
            <a
              href="https://goo.gl/maps/sMEtvoWenJLvrxyi8?g_st=ac"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline contact-map-external-btn"
            >
              <span>{t('contact_map_btn')}</span>
              <ExternalLink size={16} />
            </a>
          </div>

          <div className="contact-map-wrapper">
            <iframe
              title="Google Map TerraNova"
              src="https://maps.google.com/maps?q=36.718335,3.142643&hl=fr&z=15&output=embed"
              width="100%"
              height="420"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

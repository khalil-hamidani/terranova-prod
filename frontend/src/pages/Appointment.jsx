import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Trees,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Send,
  Leaf,
  Layers
} from 'lucide-react';
import { createAppointment } from '../services/api';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './Appointment.css';

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

const Appointment = () => {
  const { showSuccess } = useCart();
  const { t } = useLanguage();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    serviceType: 'jardinage',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    wilaya: '',
    commune: '',
    surface: '',
    servicesSpecifiques: '',
    datePreferee: '',
    heurePreferee: '09:00',
    notes: ''
  });

  // Pre-select service from URL query params (e.g. ?service=nettoyage)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const serviceParam = params.get('service');
    if (serviceParam === 'jardinage' || serviceParam === 'nettoyage') {
      setFormData(prev => ({ ...prev, serviceType: serviceParam }));
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleServiceSelect = (type) => {
    setFormData(prev => ({ ...prev, serviceType: type }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createAppointment(formData);
      const serviceName = formData.serviceType === 'jardinage' 
        ? t('appointment_gardening_title') 
        : t('appointment_cleaning_title');
      const successMsg = t('appointment_success_desc')
        .replace('{name}', `${formData.prenom} ${formData.nom}`)
        .replace('{service}', serviceName)
        .replace('{date}', formData.datePreferee)
        .replace('{time}', formData.heurePreferee);

      showSuccess(t('appointment_success_title'), successMsg);

      // Reset form
      setFormData({
        serviceType: 'jardinage',
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        wilaya: '',
        commune: '',
        surface: '',
        servicesSpecifiques: '',
        datePreferee: '',
        heurePreferee: '09:00',
        notes: ''
      });
    } catch (error) {
      console.error('Appointment error:', error);
      alert(t('appointment_error_alert'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-page">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Calendar size={14} />
            <span>{t('appointment_tag')}</span>
          </div>
          <h1 className="page-title">{t('appointment_title')}</h1>
          <p className="page-subtitle">
            {t('appointment_sub')}
          </p>
        </div>

        <div className="appointment-layout">
          {/* Main Booking Form */}
          <div className="appointment-card-main">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Prestation Choice */}
              <div className="form-section-block">
                <label className="block-title">
                  <span className="step-num">1</span>
                  <span>{t('appointment_step1_label')}</span>
                </label>
                <div className="service-choice-grid">
                  <div
                    className={`service-choice-card ${formData.serviceType === 'jardinage' ? 'active' : ''}`}
                    onClick={() => handleServiceSelect('jardinage')}
                  >
                    <div className="choice-icon">
                      <Trees size={24} strokeWidth={1.8} />
                    </div>
                    <div className="choice-info">
                      <h4>{t('appointment_gardening_title')}</h4>
                      <p>{t('appointment_gardening_desc')}</p>
                    </div>
                  </div>

                  <div
                    className={`service-choice-card ${formData.serviceType === 'nettoyage' ? 'active' : ''}`}
                    onClick={() => handleServiceSelect('nettoyage')}
                  >
                    <div className="choice-icon">
                      <Sparkles size={24} strokeWidth={1.8} />
                    </div>
                    <div className="choice-info">
                      <h4>{t('appointment_cleaning_title')}</h4>
                      <p>{t('appointment_cleaning_desc')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Personal Info */}
              <div className="form-section-block">
                <label className="block-title">
                  <span className="step-num">2</span>
                  <span>{t('appointment_step2_label')}</span>
                </label>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="nom">{t('appointment_lbl_nom')}</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nom"
                      placeholder={t('appointment_ph_nom')}
                      value={formData.nom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="prenom">{t('appointment_lbl_prenom')}</label>
                    <input
                      type="text"
                      className="form-control"
                      id="prenom"
                      placeholder={t('appointment_ph_prenom')}
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
                      <span>{t('appointment_lbl_phone')}</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="telephone"
                      placeholder={t('appointment_ph_phone')}
                      value={formData.telephone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      <Mail size={13} />
                      <span>{t('appointment_lbl_email')}</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder={t('appointment_ph_email')}
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Location & Surface */}
              <div className="form-section-block">
                <label className="block-title">
                  <span className="step-num">3</span>
                  <span>{t('appointment_step3_label')}</span>
                </label>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="wilaya">
                      <MapPin size={13} />
                      <span>{t('appointment_lbl_wilaya')}</span>
                    </label>
                    <select
                      className="form-control"
                      id="wilaya"
                      value={formData.wilaya}
                      onChange={handleChange}
                      required
                    >
                      <option value="">{t('appointment_ph_wilaya')}</option>
                      {ALGERIAN_WILAYAS.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="commune">{t('appointment_lbl_commune')}</label>
                    <input
                      type="text"
                      className="form-control"
                      id="commune"
                      placeholder={t('appointment_ph_commune')}
                      value={formData.commune}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="surface">
                      <Layers size={13} />
                      <span>{t('appointment_lbl_surface')}</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="surface"
                      placeholder={t('appointment_ph_surface')}
                      value={formData.surface}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="servicesSpecifiques">
                      {t('appointment_lbl_specifics')}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="servicesSpecifiques"
                      placeholder={t('appointment_ph_specifics')}
                      value={formData.servicesSpecifiques}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Preferred Date & Time */}
              <div className="form-section-block">
                <label className="block-title">
                  <span className="step-num">4</span>
                  <span>{t('appointment_step4_label')}</span>
                </label>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="datePreferee">
                      <Calendar size={13} />
                      <span>{t('appointment_lbl_date')}</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="datePreferee"
                      value={formData.datePreferee}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="heurePreferee">
                      <Clock size={13} />
                      <span>{t('appointment_lbl_time')}</span>
                    </label>
                    <select
                      className="form-control"
                      id="heurePreferee"
                      value={formData.heurePreferee}
                      onChange={handleChange}
                      required
                    >
                      <option value="08:30">{t('appointment_time_morn1')}</option>
                      <option value="10:00">{t('appointment_time_morn2')}</option>
                      <option value="11:30">{t('appointment_time_noon')}</option>
                      <option value="14:00">{t('appointment_time_aft1')}</option>
                      <option value="15:30">{t('appointment_time_aft2')}</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="notes">{t('appointment_lbl_notes')}</label>
                  <textarea
                    className="form-control"
                    id="notes"
                    rows="3"
                    placeholder={t('appointment_ph_notes')}
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full-width appointment-submit-btn"
                disabled={loading}
              >
                <Send size={18} />
                <span>{loading ? t('appointment_submitting') : t('appointment_btn_submit')}</span>
              </button>
            </form>
          </div>

          {/* Reassurance Sidebar */}
          <aside className="appointment-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-card-title">{t('appointment_sidebar_title')}</h3>
              <ul className="sidebar-benefits-list">
                <li>
                  <div className="benefit-icon">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="benefit-text">
                    <strong>{t('appointment_benefit1_title')}</strong>
                    <p>{t('appointment_benefit1_desc')}</p>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="benefit-text">
                    <strong>{t('appointment_benefit2_title')}</strong>
                    <p>{t('appointment_benefit2_desc')}</p>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon">
                    <Leaf size={16} />
                  </div>
                  <div className="benefit-text">
                    <strong>{t('appointment_benefit3_title')}</strong>
                    <p>{t('appointment_benefit3_desc')}</p>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon">
                    <Clock size={16} />
                  </div>
                  <div className="benefit-text">
                    <strong>{t('appointment_benefit4_title')}</strong>
                    <p>{t('appointment_benefit4_desc')}</p>
                  </div>
                </li>
              </ul>

              <div className="sidebar-contact-box">
                <span className="sidebar-contact-label">{t('appointment_sidebar_urgent')}</span>
                <a href="tel:+213784472366" className="sidebar-phone-link">
                  <Phone size={15} />
                  <span dir="ltr">+213 7 84 47 23 66</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Appointment;

import { useNavigate } from 'react-router-dom';
import {
  Trees,
  Sparkles,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Clock,
  Leaf,
  Layers,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Services.css';

const Services = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleBookService = (serviceType) => {
    navigate(`/appointment?service=${serviceType}`);
  };

  return (
    <div className="services-page">
      <div className="container">
        {/* Page Header */}
        <div className="section-header">
          <div className="section-tag">
            <Leaf size={14} />
            <span>{t('services_tag')}</span>
          </div>
          <h1 className="page-title">{t('services_title')}</h1>
          <p className="page-subtitle">
            {t('services_sub')}
          </p>
        </div>

        {/* Dual Flagship Services Grid */}
        <div className="services-showcase-grid">
          {/* Card 1: Jardinage & Aménagement Paysager */}
          <div className="service-card-premium">
            <div className="service-card-header">
              <div className="service-icon-wrapper">
                <Trees size={32} strokeWidth={1.8} />
              </div>
              <div className="service-header-text">
                <span className="service-category-tag">{t('services_gardening_tag')}</span>
                <h2 className="service-card-title">{t('services_gardening_title')}</h2>
              </div>
            </div>

            <p className="service-card-description">
              {t('services_gardening_desc')}
            </p>

            <div className="service-features-list">
              <h3 className="features-title">{t('services_gardening_includes')}</h3>
              <ul>
                <li>
                  <CheckCircle2 size={16} className="feature-check-icon" />
                  <span>{t('services_gardening_f1')}</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="feature-check-icon" />
                  <span>{t('services_gardening_f2')}</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="feature-check-icon" />
                  <span>{t('services_gardening_f3')}</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="feature-check-icon" />
                  <span>{t('services_gardening_f4')}</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="feature-check-icon" />
                  <span>{t('services_gardening_f5')}</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="feature-check-icon" />
                  <span>{t('services_gardening_f6')}</span>
                </li>
              </ul>
            </div>

            <div className="service-card-footer">
              <div className="service-pricing-pill">
                <span>{t('services_gardening_pricing')}</span>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleBookService('jardinage')}
              >
                <Calendar size={16} />
                <span>{t('services_gardening_btn')}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Nettoyage Écologique */}
          <div className="service-card-premium">
            <div className="service-card-header">
              <div className="service-icon-wrapper">
                <Sparkles size={32} strokeWidth={1.8} />
              </div>
              <div className="service-header-text">
                <span className="service-category-tag">{t('services_cleaning_tag')}</span>
                <h2 className="service-card-title">{t('services_cleaning_title')}</h2>
              </div>
            </div>

            <p className="service-card-description">
              {t('services_cleaning_desc')}
            </p>

            <div className="service-features-list">
              <h3 className="features-title">{t('services_cleaning_includes')}</h3>
              <ul>
                <li>
                  <CheckCircle2 size={16} className="feature-check-icon" />
                  <span>{t('services_cleaning_f1')}</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="feature-check-icon" />
                  <span>{t('services_cleaning_f2')}</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="feature-check-icon" />
                  <span>{t('services_cleaning_f3')}</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="feature-check-icon" />
                  <span>{t('services_cleaning_f4')}</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="feature-check-icon" />
                  <span>{t('services_cleaning_f5')}</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="feature-check-icon" />
                  <span>{t('services_cleaning_f6')}</span>
                </li>
              </ul>
            </div>

            <div className="service-card-footer">
              <div className="service-pricing-pill">
                <span>{t('services_cleaning_pricing')}</span>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleBookService('nettoyage')}
              >
                <Calendar size={16} />
                <span>{t('services_cleaning_btn')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================
            LEALIFE 4-STEP WORKFLOW SECTION
            =================================================================== */}
        <div className="service-workflow-section">
          <div className="section-header">
            <div className="section-tag">
              <Layers size={14} />
              <span>{t('services_workflow_tag')}</span>
            </div>
            <h2 className="section-title">{t('services_workflow_title')}</h2>
            <p className="section-subtitle">
              {t('services_workflow_sub')}
            </p>
          </div>

          <div className="workflow-steps-grid">
            <div className="workflow-step-card">
              <div className="workflow-step-badge">{t('services_step1_badge')}</div>
              <h3 className="workflow-step-title">{t('services_step1_title')}</h3>
              <p className="workflow-step-desc">
                {t('services_step1_desc')}
              </p>
            </div>

            <div className="workflow-step-card">
              <div className="workflow-step-badge">{t('services_step2_badge')}</div>
              <h3 className="workflow-step-title">{t('services_step2_title')}</h3>
              <p className="workflow-step-desc">
                {t('services_step2_desc')}
              </p>
            </div>

            <div className="workflow-step-card">
              <div className="workflow-step-badge">{t('services_step3_badge')}</div>
              <h3 className="workflow-step-title">{t('services_step3_title')}</h3>
              <p className="workflow-step-desc">
                {t('services_step3_desc')}
              </p>
            </div>

            <div className="workflow-step-card">
              <div className="workflow-step-badge">{t('services_step4_badge')}</div>
              <h3 className="workflow-step-title">{t('services_step4_title')}</h3>
              <p className="workflow-step-desc">
                {t('services_step4_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="services-bottom-card">
          <div className="bottom-card-content">
            <FileCheck size={28} className="bottom-card-icon" />
            <div>
              <h3>{t('services_bottom_title')}</h3>
              <p>{t('services_bottom_desc')}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/contact')}
          >
            <span>{t('services_bottom_btn')}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Services;

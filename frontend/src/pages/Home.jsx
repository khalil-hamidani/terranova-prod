import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Award,
  Users,
  Sparkles,
  Trees,
  Sprout,
  Droplets,
  Cpu,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ChevronDown,
  Search,
  Wrench,
  Hammer,
  Eye,
  Star,
  Quote,
  HelpCircle,
  ClipboardCheck,
  Settings2,
  Rocket
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useCountUp } from '../hooks/useCountUp';
import { useScrollReveal } from '../hooks/useScrollReveal';
import logoDark from '../assets/logo-TerraNova.png';
import logoLight from '../assets/logo-light.png';
import './Home.css';

/* =========================================================================
   ANIMATED STAT CARD (count-up from 0)
   ========================================================================= */
const AnimatedStat = ({ rawValue, label, caption }) => {
  const { ref, displayValue } = useCountUp(rawValue, 2200);
  return (
    <div className="stat-card" ref={ref}>
      <div className="stat-number">{displayValue}</div>
      <div className="stat-label">{label}</div>
      <p className="stat-caption">{caption}</p>
    </div>
  );
};

/* =========================================================================
   SCROLL-REVEAL WRAPPER
   ========================================================================= */
const Reveal = ({ children, className = '', delay = 0, direction = 'up' }) => {
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.12 });
  const dirClass = `reveal-${direction}`;
  return (
    <div
      ref={ref}
      className={`reveal-wrap ${dirClass} ${isRevealed ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* =========================================================================
   FAQ ITEM (accordion)
   ========================================================================= */
const FaqItem = ({ question, answer, isOpen, onToggle }) => {
  const contentRef = useRef(null);
  return (
    <div className={`faq-item ${isOpen ? 'faq-open' : ''}`}>
      <button type="button" className="faq-question" onClick={onToggle}>
        <span>{question}</span>
        <ChevronDown size={20} className="faq-chevron" />
      </button>
      <div
        className="faq-answer-wrap"
        style={{
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight || 200}px` : '0px',
        }}
      >
        <p className="faq-answer" ref={contentRef}>{answer}</p>
      </div>
    </div>
  );
};

/* =========================================================================
   HOME PAGE COMPONENT
   ========================================================================= */
const Home = () => {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const { isDark } = useTheme();
  const logo = isDark ? logoDark : logoLight;
  const [activeDomain, setActiveDomain] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [cursorGlow, setCursorGlow] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  /* Cursor-following glow (desktop only) */
  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setCursorGlow({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const domainCards = [
    {
      id: 'machines',
      badge: t('home_cat_machines_badge'),
      tags: (t('home_cat_machines_tags') || '').split('\u2022').map((s) => s.trim()),
      title: t('home_cat_machines_title'),
      desc: t('home_cat_machines_desc'),
      link: '/products',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
    },
    {
      id: 'fertilizer',
      badge: t('home_cat_fertilizer_badge'),
      tags: (t('home_cat_fertilizer_tags') || '').split('\u2022').map((s) => s.trim()),
      title: t('home_cat_fertilizer_title'),
      desc: t('home_cat_fertilizer_desc'),
      link: '/products',
      image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop&q=80',
    },
    {
      id: 'compost',
      badge: t('home_cat_compost_badge'),
      tags: (t('home_cat_compost_tags') || '').split('\u2022').map((s) => s.trim()),
      title: t('home_cat_compost_title'),
      desc: t('home_cat_compost_desc'),
      link: '/products',
      image: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=1200&auto=format&fit=crop&q=80',
    },
    {
      id: 'services',
      badge: t('home_cat_services_badge'),
      tags: (t('home_cat_services_tags') || '').split('\u2022').map((s) => s.trim()),
      title: t('home_cat_services_title'),
      desc: t('home_cat_services_desc'),
      link: '/services',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&auto=format&fit=crop&q=80',
    },
  ];

  const processSteps = [
    { icon: <Search size={28} strokeWidth={1.6} />, num: t('home_process_step1_num'), title: t('home_process_step1_title'), desc: t('home_process_step1_desc') },
    { icon: <ClipboardCheck size={28} strokeWidth={1.6} />, num: t('home_process_step2_num'), title: t('home_process_step2_title'), desc: t('home_process_step2_desc') },
    { icon: <Rocket size={28} strokeWidth={1.6} />, num: t('home_process_step3_num'), title: t('home_process_step3_title'), desc: t('home_process_step3_desc') },
    { icon: <Eye size={28} strokeWidth={1.6} />, num: t('home_process_step4_num'), title: t('home_process_step4_title'), desc: t('home_process_step4_desc') },
  ];

  const testimonials = [
    { text: t('home_testimonial_1_text'), name: t('home_testimonial_1_name'), role: t('home_testimonial_1_role') },
    { text: t('home_testimonial_2_text'), name: t('home_testimonial_2_name'), role: t('home_testimonial_2_role') },
    { text: t('home_testimonial_3_text'), name: t('home_testimonial_3_name'), role: t('home_testimonial_3_role') },
  ];

  const faqItems = [
    { q: t('home_faq_q1'), a: t('home_faq_a1') },
    { q: t('home_faq_q2'), a: t('home_faq_a2') },
    { q: t('home_faq_q3'), a: t('home_faq_a3') },
    { q: t('home_faq_q4'), a: t('home_faq_a4') },
    { q: t('home_faq_q5'), a: t('home_faq_a5') },
  ];

  const marqueeItems = [
    t('home_marquee_1'), t('home_marquee_2'), t('home_marquee_3'), t('home_marquee_4'),
    t('home_marquee_5'), t('home_marquee_6'), t('home_marquee_7'), t('home_marquee_8'),
  ];

  return (
    <div className="home-page">
      {/* ===================================================================
          HERO SECTION
          =================================================================== */}
      <section
        className="hero-section"
        ref={heroRef}
        onMouseMove={handleMouseMove}
      >
        {/* Cursor-following ambient glow */}
        <div
          className="hero-cursor-glow"
          style={{
            left: `${cursorGlow.x}px`,
            top: `${cursorGlow.y}px`,
          }}
        />

        <div className="container">
          <div className="hero-grid">
            <Reveal direction="left">
              <div className="hero-content">
                <div className="section-tag hero-tag">
                  <Leaf size={14} className="text-primary" />
                  <span>{t('home_hero_tag')}</span>
                </div>

                <h1 className="hero-title">
                  {t('home_hero_title')}
                </h1>

                <p className="hero-description">
                  {t('home_hero_desc')}
                </p>

                <div className="hero-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate('/services')}
                  >
                    <span>{t('home_hero_btn_services')}</span>
                    <ArrowRight size={17} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg"
                    onClick={() => navigate('/products')}
                  >
                    <ShoppingBag size={17} />
                    <span>{t('home_hero_btn_shop')}</span>
                  </button>
                </div>

                <div className="hero-trust-bar">
                  <div className="trust-item">
                    <CheckCircle2 size={16} className="trust-icon" />
                    <span>{t('home_trust_eco')}</span>
                  </div>
                  <div className="trust-item">
                    <CheckCircle2 size={16} className="trust-icon" />
                    <span>{t('home_trust_perf')}</span>
                  </div>
                  <div className="trust-item">
                    <CheckCircle2 size={16} className="trust-icon" />
                    <span>{t('home_trust_team')}</span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="right" delay={200}>
              <div className="hero-media">
                <div className="hero-card-main">
                  <div className="hero-brand-badge">
                    <img src={logo} alt="TerraNova Logo" className="hero-logo-img" />
                    <div className="hero-brand-meta">
                      <span className="hero-brand-title">{t('brand_name')}</span>
                      <span className="hero-brand-sub">{t('home_brand_sub')}</span>
                    </div>
                  </div>

                  <div className="hero-quote-card hero-float-1">
                    <p className="hero-quote-text">
                      {t('home_quote_text')}
                    </p>
                    <div className="hero-quote-footer">
                      <span className="quote-badge">{t('home_quote_badge')}</span>
                    </div>
                  </div>

                  <div className="hero-mini-kpi hero-float-2">
                    <span className="kpi-num">{t('home_stat_patents_num')}</span>
                    <span className="kpi-label">{t('home_kpi_patents')}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================================================================
          INFINITE MARQUEE RIBBON
          =================================================================== */}
      <section className="marquee-section">
        <div className="marquee-track">
          <div className="marquee-content">
            {[...marqueeItems, ...marqueeItems].map((item, idx) => (
              <span key={idx} className="marquee-item">
                <Leaf size={14} className="marquee-leaf" />
                {item}
              </span>
            ))}
          </div>
          <div className="marquee-content" aria-hidden="true">
            {[...marqueeItems, ...marqueeItems].map((item, idx) => (
              <span key={`dup-${idx}`} className="marquee-item">
                <Leaf size={14} className="marquee-leaf" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          STATS SECTION (Animated Count-Up)
          =================================================================== */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <AnimatedStat
              rawValue={t('home_stat_patents_num')}
              label={t('home_stat_patents_lbl')}
              caption={t('home_stat_patents_desc')}
            />
            <AnimatedStat
              rawValue={t('home_stat_products_num')}
              label={t('home_stat_products_lbl')}
              caption={t('home_stat_products_desc')}
            />
            <AnimatedStat
              rawValue={t('home_stat_valor_num')}
              label={t('home_stat_valor_lbl')}
              caption={t('home_stat_valor_desc')}
            />
            <AnimatedStat
              rawValue={t('home_stat_interv_num')}
              label={t('home_stat_interv_lbl')}
              caption={t('home_stat_interv_desc')}
            />
          </div>
        </div>
      </section>

      {/* ===================================================================
          CORE VALUES SECTION
          =================================================================== */}
      <section className="values-section">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <div className="section-tag">
                <Leaf size={14} />
                <span>{t('home_values_tag')}</span>
              </div>
              <h2 className="section-title">{t('home_values_title')}</h2>
              <p className="section-subtitle">
                {t('home_values_sub')}
              </p>
            </div>
          </Reveal>

          <div className="values-grid">
            <Reveal delay={0}>
              <div className="value-card">
                <div className="value-icon-box">
                  <ShieldCheck size={26} strokeWidth={1.8} />
                </div>
                <h3 className="value-title">{t('home_val_durability_title')}</h3>
                <p className="value-desc">
                  {t('home_val_durability_desc')}
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="value-card">
                <div className="value-icon-box">
                  <Award size={26} strokeWidth={1.8} />
                </div>
                <h3 className="value-title">{t('home_val_excellence_title')}</h3>
                <p className="value-desc">
                  {t('home_val_excellence_desc')}
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="value-card">
                <div className="value-icon-box">
                  <Users size={26} strokeWidth={1.8} />
                </div>
                <h3 className="value-title">{t('home_val_team_title')}</h3>
                <p className="value-desc">
                  {t('home_val_team_desc')}
                </p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="value-card">
                <div className="value-icon-box">
                  <Sparkles size={26} strokeWidth={1.8} />
                </div>
                <h3 className="value-title">{t('home_val_innovation_title')}</h3>
                <p className="value-desc">
                  {t('home_val_innovation_desc')}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================================================================
          PROCESS / METHOD SECTION (4 Steps)
          =================================================================== */}
      <section className="process-section">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <div className="section-tag">
                <Settings2 size={14} />
                <span>{t('home_process_tag')}</span>
              </div>
              <h2 className="section-title">{t('home_process_title')}</h2>
              <p className="section-subtitle">{t('home_process_sub')}</p>
            </div>
          </Reveal>

          <div className="process-grid">
            {processSteps.map((step, idx) => (
              <Reveal key={idx} delay={idx * 150}>
                <div className="process-step">
                  <div className="process-step-header">
                    <span className="process-num">{step.num}</span>
                    <div className="process-icon-box">{step.icon}</div>
                  </div>
                  <div className="process-connector" />
                  <h3 className="process-step-title">{step.title}</h3>
                  <p className="process-step-desc">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          SERVICES & PRODUCTS PREVIEW (Domain Cards)
          =================================================================== */}
      <section className="catalog-preview-section">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <div className="section-tag">
                <Trees size={14} />
                <span>{t('home_catalog_tag')}</span>
              </div>
              <h2 className="section-title">{t('home_catalog_title')}</h2>
              <p className="section-subtitle">
                {t('home_catalog_sub')}
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="cs_card_1_group domain-card-group">
              {domainCards.map((card, idx) => {
                const isActive = activeDomain === idx;
                return (
                  <div
                    key={card.id}
                    className={`cs_card cs_style_1 cs_hover_active cs_heading_bg cs_bg_filed domain-expand-card ${
                      isActive ? 'active' : ''
                    }`}
                    style={{ backgroundImage: `url(${card.image})` }}
                    onMouseEnter={() => setActiveDomain(idx)}
                    onClick={() => setActiveDomain(idx)}
                    aria-label={card.title}
                  >
                    {/* High contrast gradient overlay for typography */}
                    <div className="cs_card_overlay" />

                    <div className="cs_card_top">
                      <div className="cs_card_tags">
                        <span className="cs_card_tag cs_card_badge_highlight">
                          {card.badge}
                        </span>
                        {card.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="cs_card_tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="cs_card_bottom">
                      <h3 className="cs_card_title cs_white_color">{card.title}</h3>
                      <p className="cs_card_subtitle cs_white_color">{card.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================================================================
          TESTIMONIALS SECTION
          =================================================================== */}
      <section className="testimonials-section">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <div className="section-tag">
                <Star size={14} />
                <span>{t('home_testimonials_tag')}</span>
              </div>
              <h2 className="section-title">{t('home_testimonials_title')}</h2>
              <p className="section-subtitle">{t('home_testimonials_sub')}</p>
            </div>
          </Reveal>

          <div className="testimonials-grid">
            {testimonials.map((item, idx) => (
              <Reveal key={idx} delay={idx * 120}>
                <div className="testimonial-card">
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <Quote size={28} className="testimonial-quote-icon" />
                  <p className="testimonial-text">{item.text}</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">
                      {item.name.charAt(0)}
                    </div>
                    <div className="testimonial-meta">
                      <span className="testimonial-name">{item.name}</span>
                      <span className="testimonial-role">{item.role}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          FAQ SECTION
          =================================================================== */}
      <section className="faq-section">
        <div className="container">
          <div className="faq-layout">
            <Reveal direction="left">
              <div className="faq-header-side">
                <div className="section-tag">
                  <HelpCircle size={14} />
                  <span>{t('home_faq_tag')}</span>
                </div>
                <h2 className="section-title">{t('home_faq_title')}</h2>
                <p className="section-subtitle">{t('home_faq_sub')}</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg faq-contact-btn"
                  onClick={() => navigate('/contact')}
                >
                  <span>{t('home_cta_btn_contact')}</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </Reveal>

            <Reveal direction="right" delay={100}>
              <div className="faq-list">
                {faqItems.map((item, idx) => (
                  <FaqItem
                    key={idx}
                    question={item.q}
                    answer={item.a}
                    isOpen={openFaq === idx}
                    onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
                  />
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================================================================
          BOTTOM CTA SECTION
          =================================================================== */}
      <section className="cta-section">
        <div className="container">
          <Reveal>
            <div className="cta-box">
              <div className="cta-content">
                <div className="section-tag cta-tag">
                  <Calendar size={14} />
                  <span>{t('home_cta_tag')}</span>
                </div>
                <h2 className="cta-title">
                  {t('home_cta_title')}
                </h2>
                <p className="cta-subtitle">
                  {t('home_cta_sub')}
                </p>
              </div>
              <div className="cta-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate('/appointment')}
                >
                  <Calendar size={17} />
                  <span>{t('home_cta_btn_book')}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={() => navigate('/contact')}
                >
                  <span>{t('home_cta_btn_contact')}</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;

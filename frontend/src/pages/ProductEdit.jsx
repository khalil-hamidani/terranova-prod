import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  X,
  Package,
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  Globe,
  DollarSign,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import logoDark from '../assets/logo-TerraNova.png';
import logoLight from '../assets/logo-light.png';
import './ProductEdit.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const standardCategories = [
  'Biofertilisant',
  'Compost',
  'Engrais',
  'Terreau',
  'Graines & Plantes',
  'Outils & Équipements',
  'Paillage & Protection'
];

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language, isRtl } = useLanguage();
  const { isDark } = useTheme();
  const logo = isDark ? logoDark : logoLight;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Language tab inside the edit form ('fr' | 'ar')
  const [formLang, setFormLang] = useState('fr');

  // Image Upload state
  const [imageUploadMode, setImageUploadMode] = useState('link'); // 'upload' | 'link'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Form State
  const [customCategory, setCustomCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    category: 'Biofertilisant',
    category_ar: '',
    type: '',
    type_ar: '',
    price: '',
    stock: '',
    imageURL: '',
    description: '',
    description_ar: '',
    features: '',
    features_ar: '',
    usageInstructions: '',
    usageInstructions_ar: ''
  });

  useEffect(() => {
    // 1. Verify admin token
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }

    // 2. Fetch product details
    fetchProduct(token);
  }, [id]);

  const fetchProduct = async (token) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(t('error_product_not_found') || 'Produit introuvable');
      }

      const p = await res.json();
      const isCustom = p.category && !standardCategories.includes(p.category);
      setCustomCategory(isCustom ? p.category : '');

      setFormData({
        name: p.name || '',
        name_ar: p.name_ar || '',
        category: isCustom ? 'Autre' : (p.category || 'Biofertilisant'),
        category_ar: p.category_ar || '',
        type: p.type || '',
        type_ar: p.type_ar || '',
        price: p.price ?? p.amount ?? '',
        stock: p.stock ?? 0,
        imageURL: p.imageURL || p.imageUrl || p.image || '',
        description: p.description || '',
        description_ar: p.description_ar || '',
        features: p.features || '',
        features_ar: p.features_ar || '',
        usageInstructions: p.usageInstructions || '',
        usageInstructions_ar: p.usageInstructions_ar || ''
      });
    } catch (err) {
      setError(err.message || 'Impossible de charger le produit');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(t('img_upload_hint') || 'Image max 10MB');
      return;
    }

    try {
      setUploadingImage(true);
      setUploadError('');

      const token = localStorage.getItem('adminToken');
      const bodyData = new FormData();
      bodyData.append('image', file);

      const res = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: bodyData
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de l’upload');
      }

      const data = await res.json();
      const resolvedUrl = data.imageUrl || data.imageURL || data.url;
      if (resolvedUrl) {
        handleInputChange('imageURL', resolvedUrl);
      }
    } catch (err) {
      setUploadError(err.message || 'Échec de l’envoi de l’image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Le nom du produit en français est obligatoire.');
      return;
    }
    if (formData.price === '' || isNaN(Number(formData.price))) {
      setError('Le prix unitaire est obligatoire et doit être un nombre valide.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const token = localStorage.getItem('adminToken');
      const finalCategory = (formData.category === 'Autre' || !formData.category)
        ? (customCategory.trim() || 'Autre')
        : formData.category;

      const payload = {
        name: formData.name.trim(),
        name_ar: formData.name_ar.trim() || null,
        category: finalCategory,
        category_ar: formData.category_ar.trim() || null,
        type: formData.type.trim() || null,
        type_ar: formData.type_ar.trim() || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10) || 0,
        imageURL: formData.imageURL.trim() || null,
        description: formData.description.trim() || null,
        description_ar: formData.description_ar.trim() || null,
        features: formData.features.trim() || null,
        features_ar: formData.features_ar.trim() || null,
        usageInstructions: formData.usageInstructions.trim() || null,
        usageInstructions_ar: formData.usageInstructions_ar.trim() || null
      };

      const res = await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erreur lors de la mise à jour du produit');
      }

      setSuccessMessage(isRtl ? 'تم تحديث بيانات المنتج بنجاح!' : 'Produit mis à jour avec succès !');

      // Return to admin catalogue bio tab after saving
      setTimeout(() => {
        navigate('/admin?tab=products');
      }, 700);

    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="product-edit-page" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Navbar */}
      <header className="product-edit-header">
        <div className="edit-header-container">
          <div className="edit-header-brand">
            <Link to="/admin?tab=products" className="edit-brand-link">
              <img src={logo} alt="TerraNova" className="edit-logo-img" />
              <div className="edit-brand-text">
                <span className="edit-brand-title">TerraNova</span>
                <span className="edit-brand-tag">Administration</span>
              </div>
            </Link>
          </div>

          <div className="edit-header-actions">
            <ThemeToggle />
            <LanguageToggle />
            <button
              type="button"
              className="btn btn-secondary btn-sm back-to-cat-btn"
              onClick={() => navigate('/admin?tab=products')}
            >
              {isRtl ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
              <span>{isRtl ? 'العودة إلى الكتالوج' : 'Retour au catalogue'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="product-edit-main">
        <div className="product-edit-wrapper">
          {/* Breadcrumb / Title Bar */}
          <div className="edit-breadcrumb-bar">
            <div className="edit-breadcrumb-links">
              <Link to="/admin?tab=products" className="breadcrumb-nav-link">
                {isRtl ? 'الكتالوج البيولوجي' : 'Catalogue bio'}
              </Link>
              <span className="breadcrumb-nav-sep">/</span>
              <span className="breadcrumb-nav-active">
                {isRtl ? 'تعديل المنتج' : 'Modifier le produit'} #{id}
              </span>
            </div>

            <h1 className="edit-main-title">
              {formData.name || (isRtl ? 'تعديل المنتج' : 'Modifier le produit')}
            </h1>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="edit-alert edit-alert-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="edit-alert edit-alert-success">
              <Check size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {loading ? (
            <div className="edit-loading-box">
              <Loader2 size={36} className="edit-spinner" />
              <p>{isRtl ? 'جاري تحميل بيانات المنتج...' : 'Chargement des informations du produit...'}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="product-edit-form">
              <div className="edit-layout-grid">
                
                {/* Left / Main Column: Multilingual Content */}
                <div className="edit-content-column">
                  
                  {/* Language Tab Switcher Card */}
                  <div className="edit-card">
                    <div className="edit-card-header">
                      <div className="card-header-icon-box">
                        <Globe size={18} />
                      </div>
                      <div>
                        <h2 className="edit-card-title">
                          {isRtl ? 'محتوى المنتج متعدد اللغات' : 'Informations multilingues du produit'}
                        </h2>
                        <p className="edit-card-desc">
                          {isRtl
                            ? 'أدخل البيانات بالفرنسية وأضف الترجمة العربية (اختياري) لتظهر للمستخدم عند تغيير اللغة'
                            : 'Remplissez les informations en Français et ajoutez la version Arabe (optionnelle) pour les utilisateurs en arabe'}
                        </p>
                      </div>
                    </div>

                    {/* Language Switch Tabs */}
                    <div className="form-lang-tabs">
                      <button
                        type="button"
                        className={`lang-tab-btn ${formLang === 'fr' ? 'active' : ''}`}
                        onClick={() => setFormLang('fr')}
                      >
                        <span className="flag-tag">FR</span>
                        <span className="tab-label">Français (Obligatoire)</span>
                      </button>

                      <button
                        type="button"
                        className={`lang-tab-btn ${formLang === 'ar' ? 'active' : ''}`}
                        onClick={() => setFormLang('ar')}
                      >
                        <span className="flag-tag">AR</span>
                        <span className="tab-label">العربية (اختياري / Optionnel)</span>
                        {formData.name_ar && <span className="tab-badge-done"><Check size={12} /></span>}
                      </button>
                    </div>

                    {/* Tab 1: Français */}
                    {formLang === 'fr' && (
                      <div className="lang-tab-content" dir="ltr">
                        <div className="edit-form-group">
                          <label className="edit-label">
                            {t('lbl_product_name')} *
                          </label>
                          <input
                            type="text"
                            className="edit-input"
                            placeholder="Ex: Biofertilisant Végétal Liquide 5L"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                          />
                        </div>

                        <div className="edit-form-row">
                          <div className="edit-form-group">
                            <label className="edit-label">
                              {t('lbl_product_category')} *
                            </label>
                            <select
                              className="edit-select"
                              value={formData.category}
                              onChange={(e) => handleInputChange('category', e.target.value)}
                            >
                              {standardCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                              <option value="Autre">Autre...</option>
                            </select>
                          </div>

                          {formData.category === 'Autre' && (
                            <div className="edit-form-group">
                              <label className="edit-label">Catégorie personnalisée</label>
                              <input
                                type="text"
                                className="edit-input"
                                placeholder="Nouvelle catégorie"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                              />
                            </div>
                          )}

                          <div className="edit-form-group">
                            <label className="edit-label">
                              {t('lbl_product_type')}
                            </label>
                            <input
                              type="text"
                              className="edit-input"
                              placeholder="Ex: Bidon 5L, Sac 20kg, Flacon 1L"
                              value={formData.type}
                              onChange={(e) => handleInputChange('type', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="edit-form-group">
                          <label className="edit-label">
                            {t('lbl_product_desc')}
                          </label>
                          <textarea
                            className="edit-textarea"
                            rows={4}
                            placeholder="Description commerciale détaillée du produit..."
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                          />
                        </div>

                        <div className="edit-form-group">
                          <label className="edit-label">
                            {t('lbl_product_features')}
                          </label>
                          <textarea
                            className="edit-textarea"
                            rows={3}
                            placeholder="Ex: 100% Organique • Riche en azote • Stimule la vie microbienne"
                            value={formData.features}
                            onChange={(e) => handleInputChange('features', e.target.value)}
                          />
                          <span className="edit-hint">Séparez les caractéristiques par « • » ou retour à la ligne</span>
                        </div>

                        <div className="edit-form-group">
                          <label className="edit-label">
                            {t('lbl_product_usage')}
                          </label>
                          <textarea
                            className="edit-textarea"
                            rows={3}
                            placeholder="Ex: Diluer 50ml dans 10L d'eau. Arroser au pied des cultures tous les 15 jours."
                            value={formData.usageInstructions}
                            onChange={(e) => handleInputChange('usageInstructions', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Arabe (Optionnel) */}
                    {formLang === 'ar' && (
                      <div className="lang-tab-content arabic-pane" dir="rtl">
                        <div className="arabic-info-notice">
                          <Info size={16} />
                          <span>
                            البيانات العربية اختيارية. في حال تركها فارغة، ستظهر بيانات النسخة الفرنسية تلقائياً للمستخدمين.
                          </span>
                        </div>

                        <div className="edit-form-group">
                          <label className="edit-label">
                            اسم المنتج بالعربية
                          </label>
                          <input
                            type="text"
                            className="edit-input"
                            placeholder="مثال: سماد عضوي نباتي سائل 5 لتر"
                            value={formData.name_ar}
                            onChange={(e) => handleInputChange('name_ar', e.target.value)}
                            dir="rtl"
                          />
                        </div>

                        <div className="edit-form-row">
                          <div className="edit-form-group">
                            <label className="edit-label">
                              الفئة بالعربية
                            </label>
                            <input
                              type="text"
                              className="edit-input"
                              placeholder="مثال: مخصبات حيوية، أسمدة عضوية..."
                              value={formData.category_ar}
                              onChange={(e) => handleInputChange('category_ar', e.target.value)}
                              dir="rtl"
                            />
                          </div>

                          <div className="edit-form-group">
                            <label className="edit-label">
                              النوع أو الحجم بالعربية
                            </label>
                            <input
                              type="text"
                              className="edit-input"
                              placeholder="مثال: دلو 5 لتر، كيس 20 كغ، قارورة 1 لتر"
                              value={formData.type_ar}
                              onChange={(e) => handleInputChange('type_ar', e.target.value)}
                              dir="rtl"
                            />
                          </div>
                        </div>

                        <div className="edit-form-group">
                          <label className="edit-label">
                            الوصف التفصيلي بالعربية
                          </label>
                          <textarea
                            className="edit-textarea"
                            rows={4}
                            placeholder="اكتب وصفاً مفصلاً للمنتج باللغة العربية..."
                            value={formData.description_ar}
                            onChange={(e) => handleInputChange('description_ar', e.target.value)}
                            dir="rtl"
                          />
                        </div>

                        <div className="edit-form-group">
                          <label className="edit-label">
                            المميزات والخصائص بالعربية
                          </label>
                          <textarea
                            className="edit-textarea"
                            rows={3}
                            placeholder="مثال: 100% طبيعي وعضوي • غني بالعناصر الصغرى • يحفز نمو الجذور والأوراق"
                            value={formData.features_ar}
                            onChange={(e) => handleInputChange('features_ar', e.target.value)}
                            dir="rtl"
                          />
                          <span className="edit-hint">افصل بين المميزات بنقطة « • » أو سطر جديد</span>
                        </div>

                        <div className="edit-form-group">
                          <label className="edit-label">
                            طريقة وإرشادات الاستخدام بالعربية
                          </label>
                          <textarea
                            className="edit-textarea"
                            rows={3}
                            placeholder="مثال: يُخفف 50 مل في 10 لترات من الماء. يُسقى به النبات عند الجذور كل أسبوعين."
                            value={formData.usageInstructions_ar}
                            onChange={(e) => handleInputChange('usageInstructions_ar', e.target.value)}
                            dir="rtl"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Pricing, Inventory & Image */}
                <div className="edit-sidebar-column">
                  
                  {/* Pricing & Stock Card */}
                  <div className="edit-card">
                    <div className="edit-card-header">
                      <div className="card-header-icon-box">
                        <DollarSign size={18} />
                      </div>
                      <h2 className="edit-card-title">
                        {isRtl ? 'السعر والمخزون' : 'Prix & Stock'}
                      </h2>
                    </div>

                    <div className="edit-form-group">
                      <label className="edit-label">
                        {t('lbl_product_price')} *
                      </label>
                      <div className="input-with-affix">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="edit-input"
                          placeholder="2800"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          required
                        />
                        <span className="input-affix">{t('currency')}</span>
                      </div>
                    </div>

                    <div className="edit-form-group">
                      <label className="edit-label">
                        {t('lbl_product_stock')} *
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="edit-input"
                        placeholder="10"
                        value={formData.stock}
                        onChange={(e) => handleInputChange('stock', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Image Card */}
                  <div className="edit-card">
                    <div className="edit-card-header">
                      <div className="card-header-icon-box">
                        <ImageIcon size={18} />
                      </div>
                      <h2 className="edit-card-title">
                        {isRtl ? 'صورة المنتج' : 'Photo du produit'}
                      </h2>
                    </div>

                    {/* Image Mode Switcher */}
                    <div className="image-mode-toggles">
                      <button
                        type="button"
                        className={`img-mode-btn ${imageUploadMode === 'link' ? 'active' : ''}`}
                        onClick={() => setImageUploadMode('link')}
                      >
                        <LinkIcon size={14} />
                        <span>{isRtl ? 'رابط / مسار' : 'Lien URL'}</span>
                      </button>
                      <button
                        type="button"
                        className={`img-mode-btn ${imageUploadMode === 'upload' ? 'active' : ''}`}
                        onClick={() => setImageUploadMode('upload')}
                      >
                        <UploadCloud size={14} />
                        <span>{isRtl ? 'رفع ملف' : 'Téléverser'}</span>
                      </button>
                    </div>

                    {imageUploadMode === 'link' ? (
                      <div className="edit-form-group">
                        <input
                          type="text"
                          className="edit-input"
                          placeholder="/products/nom_image.jpg ou https://..."
                          value={formData.imageURL}
                          onChange={(e) => handleInputChange('imageURL', e.target.value)}
                        />
                        <span className="edit-hint">
                          {isRtl ? 'مسار محلي أو رابط ويب مباشر' : 'Chemin local (/products/...) ou URL web'}
                        </span>
                      </div>
                    ) : (
                      <div className="edit-form-group">
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          onChange={handleImageFileChange}
                        />
                        <button
                          type="button"
                          className="upload-dropzone"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? (
                            <Loader2 size={24} className="edit-spinner" />
                          ) : (
                            <UploadCloud size={24} />
                          )}
                          <span>
                            {uploadingImage
                              ? (isRtl ? 'جاري الرفع...' : 'Envoi en cours...')
                              : (isRtl ? 'انقر لاختيار صورة من جهازك' : 'Cliquez pour choisir une image')}
                          </span>
                        </button>
                        {uploadError && <span className="text-danger edit-hint">{uploadError}</span>}
                      </div>
                    )}

                    {/* Live Preview Box */}
                    <div className="image-preview-card">
                      <span className="preview-label">
                        {isRtl ? 'معاينة الصورة الحالية:' : 'Aperçu actuel :'}
                      </span>
                      <div className="preview-img-frame">
                        {formData.imageURL ? (
                          <img
                            src={formData.imageURL}
                            alt="Aperçu"
                            className="preview-img"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="preview-placeholder">
                            <Package size={36} />
                            <span>Aucune image</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Card */}
                  <div className="edit-card edit-actions-card">
                    <button
                      type="submit"
                      className="btn btn-primary btn-block edit-save-btn"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={16} className="edit-spinner" />
                          <span>{isRtl ? 'جاري الحفظ...' : 'Enregistrement...'}</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>{isRtl ? 'حفظ التعديلات' : 'Enregistrer les modifications'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary btn-block"
                      onClick={() => navigate('/admin?tab=products')}
                      disabled={saving}
                    >
                      <X size={16} />
                      <span>{isRtl ? 'إلغاء' : 'Annuler'}</span>
                    </button>
                  </div>

                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

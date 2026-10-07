import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  ShoppingBag,
  MessageSquare,
  LogOut,
  TrendingUp,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  RotateCcw,
  ExternalLink,
  Menu,
  X,
  Eye,
  EyeOff,
  User,
  Lock,
  Phone,
  Mail,
  MapPin,
  Send,
  MessageCircle,
  Check,
  Filter,
  DollarSign,
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
  Loader2,
  ChevronDown
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import logoDark from '../assets/logo-TerraNova.png';
import logoLight from '../assets/logo-light.png';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Admin = () => {
  const navigate = useNavigate();
  const { t, language, isRtl } = useLanguage();
  const { isDark } = useTheme();
  const logo = isDark ? logoDark : logoLight;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard Stats
  const [stats, setStats] = useState(null);
  const [dashboardError, setDashboardError] = useState('');

  // Products
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [customCategory, setCustomCategory] = useState('');
  const [imageUploadMode, setImageUploadMode] = useState('upload'); // 'upload' | 'link'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Biofertilisant',
    type: '',
    imageURL: '',
    stock: '',
    price: '',
    description: '',
    features: '',
    usageInstructions: ''
  });

  // Appointments
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Contacts
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactFilter, setContactFilter] = useState('all');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['dashboard', 'products', 'appointments', 'orders', 'contacts'].includes(tabParam)) {
        setActiveTab(tabParam);
        if (tabParam === 'products') loadProducts();
        else if (tabParam === 'appointments') loadAppointments();
        else if (tabParam === 'orders') loadOrders();
        else if (tabParam === 'contacts') loadContacts();
        else loadDashboardData();
      } else {
        loadDashboardData();
      }
    }
    setLoading(false);
  };

  const formatFriendlyDate = (dateVal) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? dateVal : d.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-DZ');
    } catch {
      return dateVal;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        loadDashboardData();
      } else {
        setLoginError(data.error || 'Identifiants invalides');
      }
    } catch (error) {
      setLoginError('Erreur de connexion au serveur API');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    navigate('/');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const loadDashboardData = async () => {
    setDashboardError('');
    try {
      const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Impossible de charger les statistiques');
      }
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setStats(null);
      setDashboardError(error.message || 'Serveur API indisponible');
    }
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadAppointments = async () => {
    setAppointmentsLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/appointments`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur de chargement des commandes');
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
      setOrdersError(error.message || 'Impossible de récupérer les commandes');
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadContacts = async () => {
    setContactsLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/contacts`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading contacts:', error);
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
    if (tab === 'dashboard') loadDashboardData();
    if (tab === 'products') loadProducts();
    if (tab === 'appointments') loadAppointments();
    if (tab === 'orders') loadOrders();
    if (tab === 'contacts') loadContacts();
  };

  // Product CRUD
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `${API_URL}/admin/products/${editingProduct.id}`
        : `${API_URL}/admin/products`;

      const method = editingProduct ? 'PUT' : 'POST';

      const finalCategory = (productForm.category === 'Autre' || !productForm.category)
        ? (customCategory.trim() || 'Autre')
        : productForm.category;

      const payload = {
        ...productForm,
        category: finalCategory
      };

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setProductForm({ name: '', category: 'Biofertilisant', type: '', imageURL: '', stock: '', price: '', description: '', features: '', usageInstructions: '' });
        setCustomCategory('');
        setEditingProduct(null);
        setProductFormOpen(false);
        setUploadError('');
        loadProducts();
      } else {
        const err = await response.json();
        alert(err.error || 'Erreur lors de la sauvegarde du produit');
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleEditProduct = (product) => {
    navigate(`/admin/products/edit/${product.id}`);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(t('img_upload_hint'));
      return;
    }

    setUploadingImage(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du téléversement');
      }

      setProductForm(prev => ({ ...prev, imageURL: data.url }));
    } catch (err) {
      setUploadError(err.message || 'Erreur d’upload');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce produit du catalogue ?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        loadProducts();
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  // Status updates
  const updateAppointmentStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/admin/appointments/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        loadAppointments();
        if (stats) loadDashboardData();
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        loadOrders();
        loadDashboardData();
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const updateContactStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/admin/contacts/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        loadContacts();
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-spinner" />
        <p>Initialisation de l'espace administration...</p>
      </div>
    );
  }

  // =========================================================================
  // LOGIN SCREEN
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Link to="/" className="admin-login-logo" style={{ marginBottom: 0 }}>
                <img src={logo} alt="TerraNova Logo" />
                <span>{t('brand_name')}</span>
              </Link>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </div>
            <h2>{t('login_title')}</h2>
            <p>{t('login_subtitle')}</p>
          </div>

          {loginError && (
            <div className="login-error-alert">
              <AlertCircle size={18} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                <User size={14} />
                <span>{t('lbl_username')} *</span>
              </label>
              <input
                type="text"
                id="username"
                className="form-control"
                placeholder={t('ph_username')}
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                <Lock size={14} />
                <span>{t('lbl_password')} *</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-control"
                  placeholder={t('ph_password')}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full-width admin-login-btn"
              disabled={loginLoading}
            >
              <Lock size={16} />
              <span>{loginLoading ? t('loading') : t('btn_login')}</span>
            </button>
          </form>

          <div className="admin-login-footer">
            <Link to="/" className="back-site-link">
              <ExternalLink size={14} />
              <span>{t('view_public_site')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ADMIN DASHBOARD LAYOUT
  // =========================================================================
  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="sidebar-brand">
            <img src={logo} alt="TerraNova Logo" className="sidebar-logo" />
            <div className="sidebar-brand-text">
              <span className="brand-title">{t('brand_name')}</span>
              <span className="brand-badge">{t('admin_console')}</span>
            </div>
          </Link>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="admin-nav-menu">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            <LayoutDashboard size={19} />
            <span>{t('tab_dashboard')}</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => handleTabChange('products')}
          >
            <Package size={19} />
            <span>{t('tab_products')}</span>
            {products.length > 0 && <span className="tab-pill">{products.length}</span>}
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => handleTabChange('appointments')}
          >
            <CalendarDays size={19} />
            <span>{t('tab_appointments')}</span>
            {appointments.length > 0 && <span className="tab-pill">{appointments.length}</span>}
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            <ShoppingBag size={19} />
            <span>{t('tab_orders')}</span>
            {orders.length > 0 && <span className="tab-pill">{orders.length}</span>}
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => handleTabChange('contacts')}
          >
            <MessageSquare size={19} />
            <span>{t('tab_contacts')}</span>
            {contacts.length > 0 && <span className="tab-pill">{contacts.length}</span>}
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="sidebar-tools">
            <Link to="/" className="sidebar-site-link" target="_blank" rel="noopener noreferrer">
              <ExternalLink size={15} />
              <span>{t('view_public_site')}</span>
            </Link>
          </div>

          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={17} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-container">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} />
            </button>
            <div className="breadcrumb-box">
              <span className="breadcrumb-root hide-mobile">Admin</span>
              <span className="breadcrumb-sep hide-mobile">/</span>
              <span className="breadcrumb-current">
                {activeTab === 'dashboard' && t('tab_dashboard')}
                {activeTab === 'products' && t('tab_products')}
                {activeTab === 'appointments' && t('tab_appointments')}
                {activeTab === 'orders' && t('tab_orders')}
                {activeTab === 'contacts' && t('tab_contacts')}
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleTabChange(activeTab)}
              title={t('refresh')}
            >
              <RotateCcw size={15} />
              <span className="hide-mobile">{t('refresh')}</span>
            </button>

            <LanguageToggle />
            <ThemeToggle />

            <div className="admin-user-chip">
              <div className="user-avatar">
                <User size={16} />
              </div>
              <div className="user-details hide-mobile">
                <span className="user-name">{t('admin_user')}</span>
                <span className="user-role">{t('admin_role_super')}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="tab-content dashboard-tab">
            <div className="tab-header">
              <div>
                <h1 className="tab-title">{t('overview_title')}</h1>
                <p className="tab-subtitle">{t('overview_subtitle')}</p>
              </div>
            </div>

            {dashboardError && (
              <div className="admin-warning-banner">
                <AlertCircle size={20} />
                <div>
                  <strong>Attention :</strong> {dashboardError}
                </div>
              </div>
            )}

            {/* KPI Metric Cards Grid */}
            <div className="admin-kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon-wrap kpi-revenue">
                  <TrendingUp size={24} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-title">{t('kpi_revenue')}</span>
                  <h3 className="kpi-value">
                    {stats ? `${Number(stats.revenue || 0).toLocaleString('fr-DZ')} ${t('currency')}` : `0 ${t('currency')}`}
                  </h3>
                  <div className="kpi-sub-row">
                    <span className="kpi-sub">
                      {stats?.confirmedOrders !== undefined
                        ? (language === 'ar'
                            ? `${stats.confirmedOrders} طلبيات مؤكدة`
                            : `${stats.confirmedOrders} commande${stats.confirmedOrders > 1 ? 's' : ''} confirmée${stats.confirmedOrders > 1 ? 's' : ''}`)
                        : t('kpi_revenue_sub')}
                    </span>
                    {stats?.pendingRevenue > 0 && (
                      <span className="kpi-pending-tag">
                        {language === 'ar'
                          ? `(+${Number(stats.pendingRevenue).toLocaleString('fr-DZ')} دج في الانتظار)`
                          : `(+${Number(stats.pendingRevenue).toLocaleString('fr-DZ')} DA en attente)`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap kpi-orders">
                  <ShoppingBag size={24} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-title">{t('kpi_orders')}</span>
                  <h3 className="kpi-value">{stats ? stats.orders : 0}</h3>
                  <span className="kpi-sub">{t('kpi_orders_sub')}</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap kpi-appointments">
                  <CalendarDays size={24} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-title">{t('kpi_appointments')}</span>
                  <h3 className="kpi-value">{stats ? stats.appointments : 0}</h3>
                  <span className="kpi-sub">
                    {stats?.pendingAppointments ? `${stats.pendingAppointments} ${t('kpi_appointments_sub')}` : t('all')}
                  </span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap kpi-products">
                  <Package size={24} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-title">{t('kpi_products')}</span>
                  <h3 className="kpi-value">{stats ? stats.products : 0}</h3>
                  <span className="kpi-sub">{t('kpi_products_sub')}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Preview */}
            <div className="dashboard-sections-split">
              <div className="dashboard-section-card">
                <div className="section-card-header">
                  <h3>{t('quick_actions')}</h3>
                </div>
                <div className="quick-actions-list">
                  <button
                    type="button"
                    className="quick-action-item"
                    onClick={() => {
                      handleTabChange('products');
                      setProductFormOpen(true);
                      setEditingProduct(null);
                    }}
                  >
                    <Plus size={18} className="action-icon" />
                    <div className="action-text">
                      <strong>{t('action_add_product')}</strong>
                      <span>{t('action_add_product_sub')}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="quick-action-item"
                    onClick={() => handleTabChange('appointments')}
                  >
                    <CalendarDays size={18} className="action-icon" />
                    <div className="action-text">
                      <strong>{t('action_view_appointments')}</strong>
                      <span>{t('action_view_appointments_sub')}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="quick-action-item"
                    onClick={() => handleTabChange('orders')}
                  >
                    <ShoppingBag size={18} className="action-icon" />
                    <div className="action-text">
                      <strong>{t('action_view_orders')}</strong>
                      <span>{t('action_view_orders_sub')}</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="dashboard-section-card">
                <div className="section-card-header">
                  <h3>{t('recent_orders')}</h3>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleTabChange('orders')}
                  >
                    {t('view_all')}
                  </button>
                </div>
                {stats?.recentOrders?.length > 0 ? (
                  <div className="recent-orders-list">
                    {stats.recentOrders.map((ord) => (
                      <div key={ord.id} className="recent-order-item">
                        <div className="recent-order-meta">
                          <strong>{ord.orderNumber}</strong>
                          <span>{ord.prenom} {ord.nom} ({ord.wilaya})</span>
                        </div>
                        <div className="recent-order-status">
                          <span className={`badge badge-${ord.status === 'delivered' ? 'success' : 'pending'}`}>
                            {ord.status}
                          </span>
                          <strong className="recent-order-price">
                            {Number(ord.totalAmount).toLocaleString('fr-DZ')} DA
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-notice">Aucune commande récente enregistrée.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products Management */}
        {activeTab === 'products' && (
          <div className="tab-content products-tab">
            <div className="tab-header">
              <div>
                <h1 className="tab-title">{t('products_title')}</h1>
                <p className="tab-subtitle">{t('products_subtitle')}</p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (productFormOpen) {
                    setProductFormOpen(false);
                  } else {
                    setEditingProduct(null);
                    setCustomCategory('');
                    setUploadError('');
                    setProductForm({
                      name: '',
                      category: 'Biofertilisant',
                      type: '',
                      imageURL: '',
                      stock: '',
                      price: '',
                      description: ''
                    });
                    setProductFormOpen(true);
                  }
                }}
              >
                {productFormOpen ? <X size={16} /> : <Plus size={16} />}
                <span>{productFormOpen ? t('close_form') : t('new_product')}</span>
              </button>
            </div>

            {/* Product Add / Edit Modal Card */}
            {productFormOpen && (
              <div className="admin-form-card">
                <div className="form-card-top">
                  <h3>{editingProduct ? `${t('modal_edit_product')} « ${editingProduct.name} »` : t('modal_add_product')}</h3>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setProductFormOpen(false)}
                    aria-label={t('close')}
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleProductSubmit} className="product-form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-name">{t('lbl_product_name')}</label>
                    <input
                      type="text"
                      id="prod-name"
                      className="form-control"
                      placeholder={t('ph_product_name')}
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-price">{t('lbl_product_price')}</label>
                    <input
                      type="number"
                      step="0.01"
                      id="prod-price"
                      className="form-control"
                      placeholder={t('ph_product_price')}
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-category">{t('lbl_product_category')}</label>
                    <select
                      id="prod-category"
                      className="form-control"
                      value={
                        ['Biofertilisant', 'Compost', 'Engrais', 'Machine', 'Terreau', 'Graines & Plantes', 'Outils'].includes(productForm.category)
                          ? productForm.category
                          : (productForm.category ? 'Autre' : 'Biofertilisant')
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Autre') {
                          setProductForm({ ...productForm, category: 'Autre' });
                        } else {
                          setProductForm({ ...productForm, category: val });
                          setCustomCategory('');
                        }
                      }}
                      required
                    >
                      <option value="Biofertilisant">{t('cat_biofertilizer')}</option>
                      <option value="Compost">{t('cat_compost')}</option>
                      <option value="Engrais">{t('cat_fertilizer')}</option>
                      <option value="Machine">{t('cat_machine')}</option>
                      <option value="Terreau">{t('cat_soil')}</option>
                      <option value="Graines & Plantes">{t('cat_seeds')}</option>
                      <option value="Outils">{t('cat_tools')}</option>
                      <option value="Autre">{t('cat_other')}</option>
                    </select>

                    {productForm.category === 'Autre' && (
                      <input
                        type="text"
                        className="form-control"
                        style={{ marginTop: '8px' }}
                        placeholder={t('ph_custom_category')}
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        required
                      />
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-type">{t('lbl_product_type')}</label>
                    <input
                      type="text"
                      id="prod-type"
                      className="form-control"
                      placeholder={t('ph_product_type')}
                      value={productForm.type}
                      onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-stock">{t('lbl_product_stock')}</label>
                    <input
                      type="number"
                      id="prod-stock"
                      className="form-control"
                      placeholder={t('ph_product_stock')}
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      required
                    />
                  </div>

                  {/* Product Image Manager: Upload OR Link */}
                  <div className="form-group form-col-span image-manager-group">
                    <label className="form-label">
                      <ImageIcon size={15} />
                      <span>{t('lbl_product_image')}</span>
                    </label>

                    {/* Mode selector pills */}
                    <div className="image-mode-tabs">
                      <button
                        type="button"
                        className={`image-mode-btn ${imageUploadMode === 'upload' ? 'active' : ''}`}
                        onClick={() => setImageUploadMode('upload')}
                      >
                        <UploadCloud size={15} />
                        <span>{t('img_mode_upload')}</span>
                      </button>
                      <button
                        type="button"
                        className={`image-mode-btn ${imageUploadMode === 'link' ? 'active' : ''}`}
                        onClick={() => setImageUploadMode('link')}
                      >
                        <LinkIcon size={15} />
                        <span>{t('img_mode_link')}</span>
                      </button>
                    </div>

                    {/* Mode 1: File Upload Dropzone */}
                    {imageUploadMode === 'upload' && (
                      <div className="image-upload-dropzone">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                          onChange={handleImageFileChange}
                          style={{ display: 'none' }}
                        />
                        <div
                          className="dropzone-inner"
                          onClick={() => fileInputRef.current?.click()}
                          role="button"
                          tabIndex={0}
                        >
                          {uploadingImage ? (
                            <div className="upload-loading-state">
                              <Loader2 size={30} className="admin-spin-icon" />
                              <span>{t('img_uploading')}</span>
                            </div>
                          ) : (
                            <div className="dropzone-prompt">
                              <UploadCloud size={30} className="dropzone-icon" />
                              <p className="dropzone-main-text">{t('img_upload_hint')}</p>
                              <span className="btn btn-secondary btn-sm">{t('img_mode_upload')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mode 2: External Link Input */}
                    {imageUploadMode === 'link' && (
                      <div className="image-link-input-wrapper">
                        <input
                          type="url"
                          className="form-control"
                          placeholder={t('img_link_placeholder')}
                          value={productForm.imageURL}
                          onChange={(e) => setProductForm({ ...productForm, imageURL: e.target.value })}
                        />
                      </div>
                    )}

                    {uploadError && (
                      <div className="form-upload-error">
                        <AlertCircle size={15} />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {/* Live Image Preview Card */}
                    {productForm.imageURL && (
                      <div className="image-preview-card">
                        <div className="image-preview-thumb">
                          <img
                            src={productForm.imageURL}
                            alt="Aperçu produit"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <div className="image-preview-info">
                          <span className="image-preview-label">{t('img_preview_title')}</span>
                          <span className="image-preview-url" title={productForm.imageURL}>
                            {productForm.imageURL}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-danger-soft"
                          onClick={() => setProductForm({ ...productForm, imageURL: '' })}
                          title={t('img_remove')}
                        >
                          <Trash2 size={15} />
                          <span>{t('img_remove')}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-group form-col-span">
                    <label className="form-label" htmlFor="prod-desc">{t('lbl_product_description')}</label>
                    <textarea
                      id="prod-desc"
                      className="form-control"
                      rows="3"
                      placeholder={t('ph_product_description')}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    />
                  </div>

                  <div className="form-group form-col-span">
                    <label className="form-label" htmlFor="prod-features">{t('lbl_product_features')}</label>
                    <textarea
                      id="prod-features"
                      className="form-control"
                      rows="2"
                      placeholder={t('ph_product_features')}
                      value={productForm.features}
                      onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                    />
                  </div>

                  <div className="form-group form-col-span">
                    <label className="form-label" htmlFor="prod-usage">{t('lbl_product_usage')}</label>
                    <textarea
                      id="prod-usage"
                      className="form-control"
                      rows="2"
                      placeholder={t('ph_product_usage')}
                      value={productForm.usageInstructions}
                      onChange={(e) => setProductForm({ ...productForm, usageInstructions: e.target.value })}
                    />
                  </div>

                  <div className="form-actions-row form-col-span">
                    <button type="submit" className="btn btn-primary">
                      <Check size={16} />
                      <span>{editingProduct ? t('btn_update_product') : t('btn_save_product')}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingProduct(null);
                        setProductFormOpen(false);
                      }}
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filter Search */}
            <div className="admin-table-filters">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder={t('search_placeholder')}
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Products Data Table */}
            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>{t('th_preview')}</th>
                    <th>{t('th_name')}</th>
                    <th>{t('th_category')}</th>
                    <th>{t('th_type')}</th>
                    <th>{t('th_stock')}</th>
                    <th>{t('th_price')}</th>
                    <th className="text-right">{t('th_actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {productsLoading ? (
                    <tr>
                      <td colSpan="7" className="table-loading-cell">{t('loading')}</td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="table-empty-cell">{t('no_results')}</td>
                    </tr>
                  ) : (
                    products
                      .filter(p => !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase()) || p.category?.toLowerCase().includes(productSearch.toLowerCase()))
                      .map((product) => (
                        <tr key={product.id}>
                          <td className="table-img-cell">
                            {product.imageURL || product.imageUrl || product.image ? (
                              <img
                                src={product.imageURL || product.imageUrl || product.image}
                                alt={product.name}
                                className="table-thumb"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="table-thumb-fallback">
                                <Package size={20} />
                              </div>
                            )}
                          </td>
                          <td>
                            <strong>{product.name}</strong>
                          </td>
                          <td>
                            <span className="badge badge-sage">{product.category || '-'}</span>
                          </td>
                          <td>{product.type || '-'}</td>
                          <td>
                            <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                              {product.stock > 0 ? `${product.stock} ${t('in_stock')}` : t('out_of_stock')}
                            </span>
                          </td>
                          <td>
                            <strong className="table-price">
                              {Number(product.price ?? product.amount ?? 0).toLocaleString('fr-DZ')} {t('currency')}
                            </strong>
                          </td>
                          <td className="text-right table-actions-cell">
                            <button
                              type="button"
                              className="action-btn edit"
                              onClick={() => handleEditProduct(product)}
                              title={t('edit')}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              className="action-btn delete"
                              onClick={() => handleDeleteProduct(product.id)}
                              title={t('delete')}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Products Mobile Cards View */}
            <div className="admin-mobile-cards products-mobile-cards">
              {productsLoading ? (
                <div className="mobile-loading-card">{t('loading')}</div>
              ) : products.length === 0 ? (
                <div className="mobile-empty-card">{t('no_results')}</div>
              ) : (
                products
                  .filter(p => !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase()) || p.category?.toLowerCase().includes(productSearch.toLowerCase()))
                  .map((product) => {
                    const prodName = language === 'ar' && product.name_ar ? product.name_ar : product.name;
                    const prodCat = language === 'ar' && product.category_ar ? product.category_ar : product.category;
                    return (
                      <div key={product.id} className="mobile-data-card product-mobile-card">
                        <div className="mobile-product-top">
                          <div className="mobile-product-img-wrap">
                            {product.imageURL || product.imageUrl || product.image ? (
                              <img
                                src={product.imageURL || product.imageUrl || product.image}
                                alt={prodName}
                                className="mobile-product-thumb"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="mobile-thumb-fallback">
                                <Package size={24} />
                              </div>
                            )}
                          </div>
                          <div className="mobile-product-meta">
                            <strong className="mobile-product-title">{prodName}</strong>
                            <div className="mobile-tags-row">
                              <span className="badge badge-sage">{prodCat || '-'}</span>
                              {product.type && <span className="mobile-type-tag">{product.type}</span>}
                            </div>
                            <div className="mobile-product-price-row">
                              <strong className="mobile-product-price">
                                {Number(product.price ?? product.amount ?? 0).toLocaleString('fr-DZ')} {t('currency')}
                              </strong>
                              <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                                {product.stock > 0 ? `${product.stock} ${t('in_stock')}` : t('out_of_stock')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mobile-card-actions-grid">
                          <button
                            type="button"
                            className="mobile-btn-action mobile-btn-edit"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Pencil size={15} />
                            <span>{t('edit')}</span>
                          </button>
                          <button
                            type="button"
                            className="mobile-btn-action mobile-btn-delete"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 size={15} />
                            <span>{t('delete')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Appointments Management */}
        {activeTab === 'appointments' && (
          <div className="tab-content appointments-tab">
            <div className="tab-header">
              <div>
                <h1 className="tab-title">{t('appointments_title')}</h1>
                <p className="tab-subtitle">{t('appointments_subtitle')}</p>
              </div>

              {/* Status Filter */}
              <div className="filter-group-tabs">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                  <button
                    key={f}
                    type="button"
                    className={`filter-btn-pill ${appointmentFilter === f ? 'active' : ''}`}
                    onClick={() => setAppointmentFilter(f)}
                  >
                    {f === 'all' && t('filter_all')}
                    {f === 'pending' && t('status_pending')}
                    {f === 'confirmed' && t('status_confirmed')}
                    {f === 'completed' && t('status_completed')}
                    {f === 'cancelled' && t('status_cancelled')}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Réf</th>
                    <th>Prestation</th>
                    <th>Client & Contact</th>
                    <th>Localisation</th>
                    <th>Date & Heure</th>
                    <th>Statut</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentsLoading ? (
                    <tr>
                      <td colSpan="7" className="table-loading-cell">Chargement des rendez-vous...</td>
                    </tr>
                  ) : appointments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="table-empty-cell">Aucun rendez-vous enregistré.</td>
                    </tr>
                  ) : (
                    appointments
                      .filter(apt => appointmentFilter === 'all' || apt.status === appointmentFilter)
                      .map((apt) => (
                        <tr key={apt.id}>
                          <td><strong>#{apt.id}</strong></td>
                          <td>
                            <span className={`badge ${apt.serviceType === 'jardinage' ? 'badge-sage' : 'badge-info'}`}>
                              {apt.serviceType === 'jardinage' ? 'Jardinage' : 'Nettoyage'}
                            </span>
                          </td>
                          <td>
                            <div className="table-client-info">
                              <strong>{apt.prenom} {apt.nom}</strong>
                              <a href={`tel:${apt.telephone}`} className="table-phone-link">
                                <Phone size={12} />
                                <span>{apt.telephone}</span>
                              </a>
                            </div>
                          </td>
                          <td>
                            <span>{apt.commune ? `${apt.commune}, ` : ''}{apt.wilaya || '-'}</span>
                            {apt.surface && <span className="table-sub-detail">({apt.surface} m²)</span>}
                          </td>
                          <td>
                            <div className="table-date-time">
                              <span>{formatFriendlyDate(apt.datePreferee)}</span>
                              <span className="table-time-chip">{apt.heurePreferee}</span>
                            </div>
                          </td>
                          <td>
                            <select
                              className={`status-select ${apt.status}`}
                              value={apt.status}
                              onChange={(e) => updateAppointmentStatus(apt.id, e.target.value)}
                            >
                              <option value="pending">En attente</option>
                              <option value="confirmed">Confirmé</option>
                              <option value="completed">Terminé</option>
                              <option value="cancelled">Annulé</option>
                            </select>
                          </td>
                          <td className="text-right">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSelectedAppointment(apt)}
                            >
                              Détails
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Appointments Mobile Cards View */}
            <div className="admin-mobile-cards appointments-mobile-cards">
              {appointmentsLoading ? (
                <div className="mobile-loading-card">{t('loading')}</div>
              ) : appointments.filter(apt => appointmentFilter === 'all' || apt.status === appointmentFilter).length === 0 ? (
                <div className="mobile-empty-card">{t('no_results')}</div>
              ) : (
                appointments
                  .filter(apt => appointmentFilter === 'all' || apt.status === appointmentFilter)
                  .map((apt) => (
                    <div key={apt.id} className={`mobile-data-card appointment-mobile-card status-${apt.status}`}>
                      <div className="mobile-card-header">
                        <div className="mobile-card-badge-row">
                          <span className="mobile-card-id">#{apt.id}</span>
                          <span className={`badge ${apt.serviceType === 'jardinage' ? 'badge-sage' : 'badge-info'}`}>
                            {apt.serviceType === 'jardinage' ? (language === 'ar' ? 'تهيئة حدائق' : 'Jardinage') : (language === 'ar' ? 'تنظيف بيئي' : 'Nettoyage')}
                          </span>
                        </div>
                        <span className={`mobile-status-pill status-${apt.status}`}>
                          {apt.status === 'pending' && (language === 'ar' ? 'في الانتظار' : 'En attente')}
                          {apt.status === 'confirmed' && (language === 'ar' ? 'مؤكد' : 'Confirmé')}
                          {apt.status === 'completed' && (language === 'ar' ? 'مكتمل' : 'Terminé')}
                          {apt.status === 'cancelled' && (language === 'ar' ? 'ملغى' : 'Annulé')}
                        </span>
                      </div>

                      <div className="mobile-card-body">
                        <div className="mobile-client-line">
                          <div className="mobile-client-avatar">
                            <User size={15} />
                          </div>
                          <div className="mobile-client-details">
                            <strong className="mobile-client-name">{apt.prenom} {apt.nom}</strong>
                            <span className="mobile-client-loc">
                              <MapPin size={13} />
                              <span>{apt.commune ? `${apt.commune}, ` : ''}{apt.wilaya || '-'}</span>
                              {apt.surface && <span className="mobile-surface-chip">({apt.surface} m²)</span>}
                            </span>
                          </div>
                        </div>

                        <div className="mobile-date-slot-card">
                          <CalendarDays size={14} />
                          <span>{formatFriendlyDate(apt.datePreferee)}</span>
                          <span className="mobile-slot-sep">•</span>
                          <Clock size={14} />
                          <span>{apt.heurePreferee}</span>
                        </div>
                      </div>

                      <div className="mobile-card-actions">
                        <div className="mobile-select-wrapper">
                          <select
                            className={`status-select mobile-select ${apt.status}`}
                            value={apt.status}
                            onChange={(e) => updateAppointmentStatus(apt.id, e.target.value)}
                          >
                            <option value="pending">{language === 'ar' ? 'في الانتظار' : 'En attente'}</option>
                            <option value="confirmed">{language === 'ar' ? 'مؤكد' : 'Confirmé'}</option>
                            <option value="completed">{language === 'ar' ? 'مكتمل' : 'Terminé'}</option>
                            <option value="cancelled">{language === 'ar' ? 'ملغى' : 'Annulé'}</option>
                          </select>
                        </div>

                        <a
                          href={`tel:${apt.telephone}`}
                          className="mobile-action-btn mobile-call-btn"
                          title={apt.telephone}
                        >
                          <Phone size={15} />
                          <span>{language === 'ar' ? 'اتصال' : 'Appeler'}</span>
                        </a>

                        <button
                          type="button"
                          className="mobile-action-btn mobile-details-btn"
                          onClick={() => setSelectedAppointment(apt)}
                        >
                          <Eye size={15} />
                          <span>{language === 'ar' ? 'تفاصيل' : 'Détails'}</span>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Appointment Details Modal */}
            {selectedAppointment && (
              <div className="modal active">
                <div className="modal-backdrop" onClick={() => setSelectedAppointment(null)} />
                <div className="modal-content">
                  <div className="modal-drag-indicator" />
                  <div className="modal-header">
                    <h2>Rendez-vous #{selectedAppointment.id}</h2>
                    <button type="button" className="modal-close-btn" onClick={() => setSelectedAppointment(null)}>
                      <X size={18} />
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="modal-details-grid">
                      <div>
                        <span className="detail-meta-label">Client</span>
                        <strong>{selectedAppointment.prenom} {selectedAppointment.nom}</strong>
                      </div>
                      <div>
                        <span className="detail-meta-label">Service</span>
                        <span className="badge badge-sage">{selectedAppointment.serviceType}</span>
                      </div>
                      <div>
                        <span className="detail-meta-label">Téléphone</span>
                        <a href={`tel:${selectedAppointment.telephone}`}>{selectedAppointment.telephone}</a>
                      </div>
                      <div>
                        <span className="detail-meta-label">Email</span>
                        <a href={`mailto:${selectedAppointment.email}`}>{selectedAppointment.email}</a>
                      </div>
                      <div>
                        <span className="detail-meta-label">Localisation</span>
                        <strong>{selectedAppointment.commune}, {selectedAppointment.wilaya}</strong>
                      </div>
                      <div>
                        <span className="detail-meta-label">Date et Heure</span>
                        <strong>{formatFriendlyDate(selectedAppointment.datePreferee)} à {selectedAppointment.heurePreferee}</strong>
                      </div>
                    </div>

                    {selectedAppointment.notes && (
                      <div className="modal-note-box">
                        <span className="detail-meta-label">Notes client</span>
                        <p>{selectedAppointment.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-primary btn-full-width" onClick={() => setSelectedAppointment(null)}>
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Orders Management */}
        {activeTab === 'orders' && (
          <div className="tab-content orders-tab">
            <div className="tab-header">
              <div>
                <h1 className="tab-title">{t('orders_title')}</h1>
                <p className="tab-subtitle">{t('orders_subtitle')}</p>
              </div>

              {/* Status Filter */}
              <div className="filter-group-tabs">
                {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'paid', 'cancelled'].map(f => (
                  <button
                    key={f}
                    type="button"
                    className={`filter-btn-pill ${orderFilter === f ? 'active' : ''}`}
                    onClick={() => setOrderFilter(f)}
                  >
                    {f === 'all' && t('filter_all')}
                    {f === 'pending' && t('status_pending')}
                    {f === 'confirmed' && (language === 'ar' ? 'مؤكدة' : 'Confirmée')}
                    {f === 'processing' && (language === 'ar' ? 'قيد المعالجة' : 'Traitement')}
                    {f === 'shipped' && t('status_shipped')}
                    {f === 'delivered' && t('status_delivered')}
                    {f === 'paid' && t('status_paid')}
                    {f === 'cancelled' && t('status_cancelled')}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Revenue & Performance Summary Strip */}
            <div className="orders-revenue-summary-strip">
              <div className="orders-summary-card revenue-card">
                <div className="summary-card-icon">
                  <TrendingUp size={22} />
                </div>
                <div className="summary-card-info">
                  <span className="summary-label">{language === 'ar' ? 'إجمالي المبيعات المؤكدة' : "Chiffre d'Affaires Confirmé"}</span>
                  <strong className="summary-value">
                    {Number(stats?.revenue || 0).toLocaleString('fr-DZ')} {t('currency')}
                  </strong>
                </div>
              </div>

              <div className="orders-summary-card confirmed-card">
                <div className="summary-card-icon">
                  <CheckCircle2 size={22} />
                </div>
                <div className="summary-card-info">
                  <span className="summary-label">{language === 'ar' ? 'الطلبيات المؤكدة' : 'Commandes Confirmées'}</span>
                  <strong className="summary-value">
                    {orders.filter(o => ['confirmed', 'processing', 'shipped', 'delivered', 'paid'].includes(o.status) || o.paymentStatus === 'paid').length} / {orders.length}
                  </strong>
                </div>
              </div>

              <div className="orders-summary-card pending-card">
                <div className="summary-card-icon">
                  <Clock size={22} />
                </div>
                <div className="summary-card-info">
                  <span className="summary-label">{language === 'ar' ? 'في انتظار التأكيد' : 'En attente de confirmation'}</span>
                  <strong className="summary-value">
                    {orders.filter(o => o.status === 'pending').length} ({Number(orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)).toLocaleString('fr-DZ')} {t('currency')})
                  </strong>
                </div>
              </div>
            </div>

            {ordersError && (
              <div className="admin-warning-banner">
                <AlertCircle size={20} />
                <span>{ordersError}</span>
              </div>
            )}

            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>{t('th_order')}</th>
                    <th>{t('th_client')}</th>
                    <th>{t('th_location')}</th>
                    <th>{t('th_amount')}</th>
                    <th>{t('th_status')}</th>
                    <th>{t('th_date')}</th>
                    <th className="text-right">{t('th_actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersLoading ? (
                    <tr>
                      <td colSpan="7" className="table-loading-cell">{t('loading')}</td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="table-empty-cell">{t('no_results')}</td>
                    </tr>
                  ) : (
                    orders
                      .filter(o => orderFilter === 'all' || o.status === orderFilter)
                      .map((order) => (
                        <tr key={order.id}>
                          <td><strong>{order.orderNumber}</strong></td>
                          <td>
                            <div className="table-client-info">
                              <strong>{order.prenom} {order.nom}</strong>
                              <a href={`tel:${order.telephone}`} className="table-phone-link">
                                <Phone size={12} />
                                <span>{order.telephone}</span>
                              </a>
                            </div>
                          </td>
                          <td>{order.commune ? `${order.commune}, ` : ''}{order.wilaya}</td>
                          <td>
                            <strong className="table-price">
                              {Number(order.totalAmount).toLocaleString('fr-DZ')} {t('currency')}
                            </strong>
                          </td>
                          <td>
                            <select
                              className={`status-select ${order.status}`}
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            >
                              <option value="pending">{t('status_pending')}</option>
                              <option value="confirmed">{language === 'ar' ? 'مؤكدة' : 'Confirmée'}</option>
                              <option value="processing">{language === 'ar' ? 'قيد المعالجة' : 'En traitement'}</option>
                              <option value="shipped">{t('status_shipped')}</option>
                              <option value="delivered">{t('status_delivered')}</option>
                              <option value="paid">{t('status_paid')}</option>
                              <option value="cancelled">{t('status_cancelled')}</option>
                            </select>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-DZ')}</td>
                          <td className="text-right">
                            <div className="order-actions-flex">
                              {order.status === 'pending' && (
                                <button
                                  type="button"
                                  className="btn-quick-confirm"
                                  onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                  title={language === 'ar' ? 'تأكيد الطلبية واحتساب المبيعات' : 'Confirmer la commande'}
                                >
                                  <Check size={14} strokeWidth={2.5} />
                                  <span>{language === 'ar' ? 'تأكيد' : 'Confirmer'}</span>
                                </button>
                              )}
                              <a
                                href={`https://wa.me/${order.telephone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  language === 'ar'
                                    ? `مرحباً ${order.prenom}، نتواصل معك بخصوص طلبك رقم ${order.orderNumber} من تيرا نوفا.`
                                    : `Bonjour ${order.prenom}, nous vous contactons concernant votre commande ${order.orderNumber}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="action-btn-whatsapp"
                                title={t('whatsapp_contact')}
                              >
                                <MessageCircle size={15} />
                              </a>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                {t('details')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Orders Mobile Cards View */}
            <div className="admin-mobile-cards orders-mobile-cards">
              {ordersLoading ? (
                <div className="mobile-loading-card">{t('loading')}</div>
              ) : orders.filter(o => orderFilter === 'all' || o.status === orderFilter).length === 0 ? (
                <div className="mobile-empty-card">{t('no_results')}</div>
              ) : (
                orders
                  .filter(o => orderFilter === 'all' || o.status === orderFilter)
                  .map((order) => {
                    let itemsCount = 1;
                    try {
                      const parsed = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                      if (Array.isArray(parsed)) itemsCount = parsed.length;
                    } catch (e) {
                      itemsCount = 1;
                    }
                    return (
                      <div key={order.id} className={`mobile-data-card order-mobile-card status-${order.status}`}>
                        {/* Card Header: Ref, Date, Status */}
                        <div className="mobile-card-header">
                          <div className="mobile-card-badge-row">
                            <span className="mobile-card-id">{order.orderNumber}</span>
                            <span className="mobile-card-date">
                              <Clock size={12} />
                              <span>{new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-DZ')}</span>
                            </span>
                          </div>
                          <div className="mobile-header-status-wrap">
                            <select
                              className={`mobile-header-status-select status-${order.status}`}
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              aria-label="Statut de la commande"
                            >
                              <option value="pending">{t('status_pending')}</option>
                              <option value="confirmed">{language === 'ar' ? 'مؤكدة' : 'Confirmée'}</option>
                              <option value="processing">{language === 'ar' ? 'قيد المعالجة' : 'En traitement'}</option>
                              <option value="shipped">{t('status_shipped')}</option>
                              <option value="delivered">{t('status_delivered')}</option>
                              <option value="paid">{t('status_paid')}</option>
                              <option value="cancelled">{t('status_cancelled')}</option>
                            </select>
                            <ChevronDown size={13} className="mobile-status-chevron" />
                          </div>
                        </div>

                        {/* Card Body: Client info & Total Amount */}
                        <div className="mobile-card-body">
                          <div className="mobile-client-line">
                            <div className="mobile-client-avatar">
                              <User size={15} />
                            </div>
                            <div className="mobile-client-details">
                              <strong className="mobile-client-name">{order.prenom} {order.nom}</strong>
                              <span className="mobile-client-loc">
                                <MapPin size={13} />
                                <span>{order.commune ? `${order.commune}, ` : ''}{order.wilaya}</span>
                              </span>
                            </div>
                          </div>

                          <div className="mobile-card-finance-bar">
                            <div className="finance-label">
                              <span>{language === 'ar' ? 'المبلغ الإجمالي' : 'Montant Total'}</span>
                              <strong className="finance-amount">
                                {Number(order.totalAmount).toLocaleString('fr-DZ')} {t('currency')}
                              </strong>
                            </div>
                            <span className="mobile-items-chip">
                              <ShoppingBag size={12} />
                              <span>{itemsCount} {language === 'ar' ? 'منتجات' : 'art.'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Quick 1-Click Confirmation if Pending */}
                        {order.status === 'pending' && (
                          <button
                            type="button"
                            className="mobile-btn-quick-confirm"
                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          >
                            <Check size={16} strokeWidth={2.5} />
                            <span>{language === 'ar' ? 'تأكيد الطلبية واحتساب المبيعات' : 'Confirmer la commande (+ Revenu)'}</span>
                          </button>
                        )}

                        {/* Card Footer: 3 balanced spacious action buttons */}
                        <div className="mobile-card-actions mobile-card-actions-3col">
                          <a
                            href={`https://wa.me/${order.telephone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              language === 'ar'
                                ? `مرحباً ${order.prenom}، نتواصل معك بخصوص طلبك رقم ${order.orderNumber} من تيرا نوفا.`
                                : `Bonjour ${order.prenom}, nous vous contactons concernant votre commande ${order.orderNumber}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mobile-action-btn mobile-wa-btn"
                            title="WhatsApp"
                          >
                            <MessageCircle size={15} />
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`tel:${order.telephone}`}
                            className="mobile-action-btn mobile-call-btn"
                            title={order.telephone}
                          >
                            <Phone size={15} />
                            <span>{language === 'ar' ? 'اتصال' : 'Appeler'}</span>
                          </a>

                          <button
                            type="button"
                            className="mobile-action-btn mobile-details-btn"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye size={15} />
                            <span>{language === 'ar' ? 'تفاصيل' : 'Détails'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
              <div className="modal active">
                <div className="modal-backdrop" onClick={() => setSelectedOrder(null)} />
                <div className="modal-content">
                  <div className="modal-drag-indicator" />
                  <div className="modal-header">
                    <h2>{t('modal_order_title')} #{selectedOrder.orderNumber}</h2>
                    <button type="button" className="modal-close-btn" onClick={() => setSelectedOrder(null)}>
                      <X size={18} />
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="modal-details-grid">
                      <div>
                        <span className="detail-meta-label">{t('lbl_client_name')}</span>
                        <strong>{selectedOrder.prenom} {selectedOrder.nom}</strong>
                      </div>
                      <div>
                        <span className="detail-meta-label">{t('lbl_phone')}</span>
                        <a href={`tel:${selectedOrder.telephone}`}>{selectedOrder.telephone}</a>
                      </div>
                      <div>
                        <span className="detail-meta-label">Email</span>
                        <a href={`mailto:${selectedOrder.email}`}>{selectedOrder.email}</a>
                      </div>
                      <div>
                        <span className="detail-meta-label">{t('th_location')}</span>
                        <strong>{selectedOrder.commune}, {selectedOrder.wilaya}</strong>
                      </div>
                      <div className="form-col-span">
                        <span className="detail-meta-label">{t('lbl_address')}</span>
                        <strong>{selectedOrder.adresse}</strong>
                      </div>
                      <div>
                        <span className="detail-meta-label">{t('th_amount')}</span>
                        <strong className="table-price">{Number(selectedOrder.totalAmount).toLocaleString('fr-DZ')} {t('currency')}</strong>
                      </div>
                      <div>
                        <span className="detail-meta-label">{t('th_date')}</span>
                        <span>{new Date(selectedOrder.createdAt).toLocaleString(language === 'ar' ? 'ar-DZ' : 'fr-DZ')}</span>
                      </div>
                      {selectedOrder.notes && (
                        <div className="form-col-span">
                          <span className="detail-meta-label">{t('checkout_notes_label')}</span>
                          <p style={{ marginTop: '4px', fontSize: '14px', color: 'var(--text-body)', background: 'var(--bg-surface-subtle)', padding: '10px 14px', borderRadius: '8px' }}>
                            {selectedOrder.notes}
                          </p>
                        </div>
                      )}
                      {(() => {
                        let itemsList = [];
                        try {
                          itemsList = typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : (selectedOrder.items || []);
                        } catch (e) {
                          itemsList = [];
                        }
                        if (!itemsList || itemsList.length === 0) return null;
                        return (
                          <div className="form-col-span" style={{ marginTop: '10px' }}>
                            <span className="detail-meta-label" style={{ marginBottom: '8px', display: 'block' }}>
                              {t('checkout_items_ordered')} ({itemsList.length})
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {itemsList.map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    background: 'var(--bg-surface-subtle)',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                  }}
                                >
                                  <span>
                                    <strong>{item.quantity}x</strong> {item.productName || item.name}
                                  </span>
                                  <strong style={{ color: 'var(--color-primary)' }}>
                                    {Number(item.subtotal || item.productPrice * item.quantity).toLocaleString('fr-DZ')} {t('currency')}
                                  </strong>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="modal-footer" style={{ display: 'flex', gap: '10px' }}>
                    {selectedOrder.status === 'pending' && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onClick={async () => {
                          await updateOrderStatus(selectedOrder.id, 'confirmed');
                          setSelectedOrder(prev => ({ ...prev, status: 'confirmed' }));
                        }}
                      >
                        <Check size={16} strokeWidth={2.5} />
                        <span>{language === 'ar' ? 'تأكيد الطلبية واحتساب المبيعات' : 'Confirmer la commande'}</span>
                      </button>
                    )}
                    <button type="button" className="btn btn-secondary" style={{ flex: selectedOrder.status === 'pending' ? 'none' : '1', minWidth: '100px' }} onClick={() => setSelectedOrder(null)}>
                      {t('close')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Contacts Inbox */}
        {activeTab === 'contacts' && (
          <div className="tab-content contacts-tab">
            <div className="tab-header">
              <div>
                <h1 className="tab-title">{t('contacts_title')}</h1>
                <p className="tab-subtitle">{t('contacts_subtitle')}</p>
              </div>

              <div className="filter-group-tabs">
                {['all', 'new', 'read', 'responded'].map(f => (
                  <button
                    key={f}
                    type="button"
                    className={`filter-btn-pill ${contactFilter === f ? 'active' : ''}`}
                    onClick={() => setContactFilter(f)}
                  >
                    {f === 'all' && t('filter_all')}
                    {f === 'new' && t('filter_new')}
                    {f === 'read' && t('filter_read')}
                    {f === 'responded' && t('filter_replied')}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>{t('th_ref')}</th>
                    <th>{t('th_sender')}</th>
                    <th>{t('th_coords')}</th>
                    <th>{t('th_subject')}</th>
                    <th>{t('th_status')}</th>
                    <th>{t('th_date')}</th>
                    <th className="text-right">{t('th_actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {contactsLoading ? (
                    <tr>
                      <td colSpan="7" className="table-loading-cell">{t('loading')}</td>
                    </tr>
                  ) : contacts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="table-empty-cell">{t('no_results')}</td>
                    </tr>
                  ) : (
                    contacts
                      .filter(c => contactFilter === 'all' || c.status === contactFilter)
                      .map((c) => (
                        <tr key={c.id}>
                          <td><strong>#{c.id}</strong></td>
                          <td><strong>{c.nomComplet}</strong></td>
                          <td>
                            <div className="table-client-info">
                              <a href={`mailto:${c.email}`} className="table-phone-link">
                                <Mail size={12} />
                                <span>{c.email}</span>
                              </a>
                              {c.telephone && (
                                <a href={`tel:${c.telephone}`} className="table-phone-link">
                                  <Phone size={12} />
                                  <span>{c.telephone}</span>
                                </a>
                              )}
                            </div>
                          </td>
                          <td><strong>{c.sujet || (language === 'ar' ? 'استفسار عام' : 'Demande générale')}</strong></td>
                          <td>
                            <select
                              className={`status-select ${c.status}`}
                              value={c.status}
                              onChange={(e) => updateContactStatus(c.id, e.target.value)}
                            >
                              <option value="new">{t('status_new')}</option>
                              <option value="read">{t('status_read')}</option>
                              <option value="responded">{t('status_replied')}</option>
                            </select>
                          </td>
                          <td>{new Date(c.createdAt).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-DZ')}</td>
                          <td className="text-right">
                            <a
                              href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.sujet || 'Votre message à TerraNova')}`}
                              className="btn btn-secondary btn-sm"
                            >
                              <Mail size={14} />
                              <span>{t('action_reply')}</span>
                            </a>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Contacts Mobile Cards View */}
            <div className="admin-mobile-cards contacts-mobile-cards">
              {contactsLoading ? (
                <div className="mobile-loading-card">{t('loading')}</div>
              ) : contacts.filter(c => contactFilter === 'all' || c.status === contactFilter).length === 0 ? (
                <div className="mobile-empty-card">{t('no_results')}</div>
              ) : (
                contacts
                  .filter(c => contactFilter === 'all' || c.status === contactFilter)
                  .map((c) => (
                    <div key={c.id} className={`mobile-data-card contact-mobile-card status-${c.status}`}>
                      <div className="mobile-card-header">
                        <div className="mobile-card-badge-row">
                          <span className="mobile-card-id">#{c.id}</span>
                          <strong className="mobile-contact-sender">{c.nomComplet}</strong>
                        </div>
                        <span className={`mobile-status-pill status-${c.status}`}>
                          {c.status === 'new' && (language === 'ar' ? 'جديد' : 'Nouveau')}
                          {c.status === 'read' && (language === 'ar' ? 'مقروء' : 'Lu')}
                          {c.status === 'responded' && (language === 'ar' ? 'تم الرد' : 'Répondu')}
                        </span>
                      </div>

                      <div className="mobile-contact-subject-box">
                        <strong className="contact-subject-text">{c.sujet || (language === 'ar' ? 'استفسار عام' : 'Demande générale')}</strong>
                        <span className="contact-date-tag">
                          <Clock size={12} />
                          <span>{new Date(c.createdAt).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-DZ')}</span>
                        </span>
                      </div>

                      {c.message && (
                        <p className="mobile-contact-message-snippet">
                          "{c.message}"
                        </p>
                      )}

                      <div className="mobile-card-actions">
                        <div className="mobile-select-wrapper">
                          <select
                            className={`status-select mobile-select ${c.status}`}
                            value={c.status}
                            onChange={(e) => updateContactStatus(c.id, e.target.value)}
                          >
                            <option value="new">{t('status_new')}</option>
                            <option value="read">{t('status_read')}</option>
                            <option value="responded">{t('status_replied')}</option>
                          </select>
                        </div>

                        {c.telephone && (
                          <a href={`tel:${c.telephone}`} className="mobile-action-btn mobile-call-btn" title={c.telephone}>
                            <Phone size={15} />
                            <span>{language === 'ar' ? 'اتصال' : 'Appeler'}</span>
                          </a>
                        )}

                        <a
                          href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.sujet || 'Votre message à TerraNova')}`}
                          className="mobile-action-btn mobile-reply-btn"
                        >
                          <Mail size={15} />
                          <span>{t('action_reply')}</span>
                        </a>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Modern Native Mobile Bottom Navigation Bar */}
        <nav className="admin-bottom-nav" aria-label="Navigation mobile">
          <button
            type="button"
            className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>{language === 'ar' ? 'الرئيسية' : 'Aperçu'}</span>
          </button>
          <button
            type="button"
            className={`bottom-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            <div className="bottom-nav-icon-wrap">
              <ShoppingBag size={20} />
              {orders.filter(o => o.status === 'pending').length > 0 && (
                <span className="bottom-nav-badge">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </div>
            <span>{language === 'ar' ? 'الطلبيات' : 'Commandes'}</span>
          </button>
          <button
            type="button"
            className={`bottom-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => handleTabChange('products')}
          >
            <Package size={20} />
            <span>{language === 'ar' ? 'المنتجات' : 'Produits'}</span>
          </button>
          <button
            type="button"
            className={`bottom-nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => handleTabChange('appointments')}
          >
            <div className="bottom-nav-icon-wrap">
              <CalendarDays size={20} />
              {appointments.filter(a => a.status === 'pending').length > 0 && (
                <span className="bottom-nav-badge">
                  {appointments.filter(a => a.status === 'pending').length}
                </span>
              )}
            </div>
            <span>{language === 'ar' ? 'المواعيد' : 'RDV'}</span>
          </button>
          <button
            type="button"
            className={`bottom-nav-item ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => handleTabChange('contacts')}
          >
            <div className="bottom-nav-icon-wrap">
              <MessageSquare size={20} />
              {contacts.filter(c => c.status === 'new').length > 0 && (
                <span className="bottom-nav-badge">
                  {contacts.filter(c => c.status === 'new').length}
                </span>
              )}
            </div>
            <span>{language === 'ar' ? 'الرسائل' : 'Messages'}</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default Admin;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { CartProvider } from './context/CartContext'
import ScrollToTop from './components/ScrollToTop'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Appointment from './pages/Appointment'
import Contact from './pages/Contact'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'
import ProductEdit from './pages/ProductEdit'
import CartModal from './components/CartModal'
import CheckoutModal from './components/CheckoutModal'
import SuccessModal from './components/SuccessModal'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <ScrollToTop />
          <CartProvider>
          <Routes>
            {/* Admin Routes (no public header/footer) */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/products/edit/:id" element={<ProductEdit />} />
            <Route path="/admin/product/edit/:id" element={<ProductEdit />} />

            {/* Public Routes (with header/footer) */}
            <Route path="*" element={
              <div className="app">
                <Header />
                <main className="main">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/appointment" element={<Appointment />} />
                    <Route path="/contact" element={<Contact />} />
                  </Routes>
                </main>
                <Footer />
                <CartModal />
                <CheckoutModal />
                <SuccessModal />
              </div>
            } />
          </Routes>
        </CartProvider>
      </Router>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App

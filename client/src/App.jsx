import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FiMessageCircle } from 'react-icons/fi';
import { useSettings } from './context/SettingsContext';

// Storefront Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';

// Admin Components
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import WhatsappOrders from './pages/admin/WhatsappOrders';
import ProductManager from './pages/admin/ProductManager';
import OrderManager from './pages/admin/OrderManager';
import UserManager from './pages/admin/UserManager';
import ThemeSettings from './pages/admin/ThemeSettings';
import CategoryManager from './pages/admin/CategoryManager';
import Analytics from './pages/admin/Analytics';
import Inventory from './pages/admin/Inventory';
import ReviewManager from './pages/admin/ReviewManager';
import CouponManager from './pages/admin/CouponManager';

const StorefrontLayout = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const phone = settings?.contactPhone ? settings.contactPhone.replace(/[^0-9]/g, '') : '923458999091';

  return (
    <>
      <Navbar />
      <CartDrawer />
      <div key={location.pathname} className="page-transition-container">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
      </div>
      <Footer />
      
      {/* Sleek WhatsApp Support Floating Button */}
      <a 
        href={`https://api.whatsapp.com/send?phone=${phone}&text=Hi%20${settings?.storeName || 'drakewears'},%20I%20need%20some%20help.`} 
        onClick={(e) => {
          const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
          if (isMobile) {
            e.preventDefault();
            window.location.href = `whatsapp://send?phone=${phone}&text=Hi%20${settings?.storeName || 'drakewears'},%20I%20need%20some%20help.`;
          }
        }}
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-sticky"
        aria-label="Need Help? Chat on WhatsApp"
      >
        <FiMessageCircle size={22} />
        <span>Need Help?</span>
      </a>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Admin Login (Outside Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="whatsapp-orders" element={<WhatsappOrders />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="settings" element={<ThemeSettings />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="reviews" element={<ReviewManager />} />
          <Route path="coupons" element={<CouponManager />} />
        </Route>
        
        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Storefront */}
        <Route path="/*" element={<StorefrontLayout />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#0E0E0E', color: '#FFFFFF', border: '1px solid #333333' },
          duration: 3000
        }}
      />
    </BrowserRouter>
  );
}

export default App;

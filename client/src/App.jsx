import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { Toaster } from 'react-hot-toast';
import { FiMessageCircle } from 'react-icons/fi';
import { useSettings } from './context/SettingsContext';

// Storefront Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import SiteIntroPreloader from './components/SiteIntroPreloader';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import AnimationDemos from './pages/AnimationDemos';
import ThreeDShowcase from './pages/ThreeDShowcase';
import NavbarDemos from './pages/NavbarDemos';

// Admin Components
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import OrdersSummary from './pages/admin/OrdersSummary';
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
  const phone = settings?.contactPhone ? settings.contactPhone.replace(/[^0-9]/g, '') : '923218254922';

  return (
    <>
      <SiteIntroPreloader />
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
          <Route path="/orders/track" element={<OrderTracking />} />
          <Route path="/track" element={<OrderTracking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
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

const PAGE_TITLES = {
  '/': 'DRAKEWEARS | Modern Luxury Streetwear & Apparel',
  '/shop': 'Shop Streetwear, Baggy Trousers & Hoodies | DRAKEWEARS',
  '/about': 'About Our Atelier & Craftsmanship | DRAKEWEARS',
  '/contact': 'Contact Us & VIP Client Support | DRAKEWEARS',
  '/privacy': 'Privacy Policy | DRAKEWEARS',
  '/cart': 'Shopping Bag | DRAKEWEARS',
  '/checkout': 'Secure Checkout | DRAKEWEARS',
  '/orders': 'My Orders | DRAKEWEARS',
  '/orders/track': 'Track Your Order | DRAKEWEARS',
  '/track': 'Track Your Order | DRAKEWEARS',
  '/profile': 'My Account Profile | DRAKEWEARS',
  '/wishlist': 'My Wishlist | DRAKEWEARS',
  '/terms': 'Terms of Service | DRAKEWEARS',
  '/login': 'Customer Login | DRAKEWEARS',
  '/register': 'Create Account | DRAKEWEARS',
  '/forgot-password': 'Reset Password | DRAKEWEARS',
  '/admin': 'Dashboard | DRAKEWEARS Admin',
  '/admin/login': 'Admin Login | DRAKEWEARS',
  '/admin/orders': 'Manage Orders | DRAKEWEARS Admin',
  '/admin/orders-summary': 'Orders Summary | DRAKEWEARS Admin',
  '/admin/whatsapp-orders': 'WhatsApp Orders | DRAKEWEARS Admin',
  '/admin/products': 'Manage Catalog | DRAKEWEARS Admin',
  '/admin/inventory': 'Stock Inventory | DRAKEWEARS Admin',
  '/admin/categories': 'Categories & Filters | DRAKEWEARS Admin',
  '/admin/coupons': 'Discount Coupons | DRAKEWEARS Admin',
  '/admin/reviews': 'Customer Reviews | DRAKEWEARS Admin',
  '/admin/users': 'Customer Accounts | DRAKEWEARS Admin',
  '/admin/analytics': 'Analytics & Reports | DRAKEWEARS Admin',
  '/admin/settings': 'Brand Customization | DRAKEWEARS Admin',
};

const ScrollRevealManager = () => {
  const location = useLocation();

  useEffect(() => {
    // Dynamic Page Title Update for SEO & UX
    if (PAGE_TITLES[location.pathname]) {
      document.title = PAGE_TITLES[location.pathname];
    } else if (location.pathname.startsWith('/admin')) {
      document.title = 'DRAKEWEARS Admin Portal';
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -20px 0px'
    });

    const attachObservers = () => {
      const elements = document.querySelectorAll('.scroll-reveal:not(.revealed)');
      elements.forEach(el => observer.observe(el));
    };

    attachObservers();
    const t1 = setTimeout(attachObservers, 200);
    const t2 = setTimeout(attachObservers, 600);
    const t3 = setTimeout(attachObservers, 1200);

    // Watch for dynamic DOM changes (e.g. product cards loaded via API)
    const mutationObserver = new MutationObserver(() => {
      attachObservers();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location.pathname]);

  return null;
};

function App() {
  useEffect(() => {
    // Initialize Lenis Smooth Inertial Scrolling
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <ScrollRevealManager />
        <Routes>
          {/* Secret Admin Login (Outside Layout) */}
          <Route path="/drakewearsofficial/login" element={<AdminLogin />} />

          {/* Secret Admin Panel */}
          <Route path="/drakewearsofficial" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="orders-summary" element={<OrdersSummary />} />
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

          {/* Admin Redirection: Support both /admin and /drakewearsofficial */}
          <Route path="/admin/login" element={<Navigate to="/drakewearsofficial/login" replace />} />
          <Route path="/admin/*" element={<Navigate to="/drakewearsofficial" replace />} />
          <Route path="/admin" element={<Navigate to="/drakewearsofficial" replace />} />

          
          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Live Brand Animation Demos */}
          <Route path="/intro-demos" element={<AnimationDemos />} />
          <Route path="/animation-demos" element={<AnimationDemos />} />

          {/* Live 3D UI Showcase */}
          <Route path="/3d-demos" element={<ThreeDShowcase />} />
          <Route path="/3d-ui" element={<ThreeDShowcase />} />

          {/* Live Navbar Design Demos */}
          <Route path="/navbar-demos" element={<NavbarDemos />} />

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
    </ErrorBoundary>
  );
}

export default App;

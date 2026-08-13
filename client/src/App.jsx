import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Storefront Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Accessories from './pages/Accessories';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';

// Admin Components
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductManager from './pages/admin/ProductManager';
import ProductForm from './pages/admin/ProductForm';
import OrderManager from './pages/admin/OrderManager';
import UserManager from './pages/admin/UserManager';
import UserForm from './pages/admin/UserForm';
import CouponManager from './pages/admin/CouponManager';
import ThemeSettings from './pages/admin/ThemeSettings';

const StorefrontLayout = () => (
  <>
    <Navbar />
    <CartDrawer />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/accessories" element={<Accessories />} />
      <Route path="/shop/:slug" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/wishlist" element={<Wishlist />} />
    </Routes>
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Admin Panel */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<ProductManager />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/edit/:id" element={<ProductForm />} />
                  <Route path="orders" element={<OrderManager />} />
                  <Route path="users" element={<UserManager />} />
                  <Route path="users/new" element={<UserForm />} />
                  <Route path="users/edit/:id" element={<UserForm />} />
                  <Route path="coupons" element={<CouponManager />} />
                  <Route path="settings" element={<ThemeSettings />} />
                </Route>
              </Route>
              
              {/* Main Storefront */}
              <Route path="/*" element={<StorefrontLayout />} />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background: '#1a1a2e', color: '#f5f0e8', border: '1px solid #c9a84c' },
                duration: 3000
              }}
            />
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </SettingsProvider>
  </AuthProvider>
  );
}

export default App;

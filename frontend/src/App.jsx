import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider }  from './context/AuthContext.jsx';
import { CartProvider }  from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';

// Layout guards
import Navbar         from './components/Navbar.jsx';
import Footer         from './components/Footer.jsx';
import ScrollToTop    from './components/ScrollToTop.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute     from './components/AdminRoute.jsx';

// Public pages
import HomePage          from './pages/HomePage.jsx';
import ProductsPage      from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage          from './pages/CartPage.jsx';
import CheckoutPage      from './pages/CheckoutPage.jsx';
import QuotePage         from './pages/QuotePage.jsx';
import ContactPage       from './pages/ContactPage.jsx';
import AboutPage         from './pages/AboutPage.jsx';
import LoginPage         from './pages/LoginPage.jsx';
import RegisterPage      from './pages/RegisterPage.jsx';
import ForgotPassword    from './pages/ForgotPassword.jsx';
import ResetPassword     from './pages/ResetPassword.jsx';
import AccountPage       from './pages/AccountPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsOfServicePage from './pages/TermsOfServicePage.jsx';
import ReturnsPage       from './pages/ReturnsPage.jsx';
import WishlistPage      from './pages/WishlistPage.jsx';
import CategoriesPage    from './pages/CategoriesPage.jsx';

// Admin pages
import AdminLayout      from './pages/admin/AdminLayout.jsx';
import AdminDashboard   from './pages/admin/AdminDashboard.jsx';
import AdminCategories  from './pages/admin/AdminCategories.jsx';
import AdminProducts    from './pages/admin/AdminProducts.jsx';
import AdminOrders      from './pages/admin/AdminOrders.jsx';
import AdminQuotes      from './pages/admin/AdminQuotes.jsx';
import AdminUsers       from './pages/admin/AdminUsers.jsx';
import AdminMessages    from './pages/admin/AdminMessages.jsx';
import AdminSettings    from './pages/admin/AdminSettings.jsx';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="public-shell">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ScrollToTop />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#101b2e', color: '#ffffff', borderRadius: '16px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.08)' },
              success: { iconTheme: { primary: '#0d9488', secondary: '#ffffff' } },
            }}
          />
          <Routes>
            {/* ── Admin (no Navbar/Footer) ─────────────────────────────────── */}
            <Route path="/admin/*" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="quotes" element={<AdminQuotes />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* ── Public (with Navbar/Footer) ──────────────────────────────── */}
            <Route path="/*" element={<PublicLayout><Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/quote" element={<QuotePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/returns-policy" element={<ReturnsPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/account/*" element={<ProtectedRoute><AccountPage /></ProtectedRoute>}>
                <Route index element={<div>Loading account...</div>} />
                <Route path="overview" element={<div>Overview placeholder</div>} />
                <Route path="orders" element={<div>Order history placeholder</div>} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="profile" element={<div>Profile placeholder</div>} />
              </Route>
            </Routes></PublicLayout>} />
          </Routes>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

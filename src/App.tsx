import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/AdminLayout';
import AdminLogin from '@/pages/admin/login';
import AdminProducts from '@/pages/admin/Products';
import AdminProductClassification from '@/pages/admin/products/classify';
import AdminCategories from '@/pages/admin/Categories';
import AdminSubcategories from '@/pages/admin/subcategories';
import AdminBrands from '@/pages/admin/brands';
import AdminProductGroups from '@/pages/admin/product-groups';
import AdminOrders from '@/pages/admin/orders';
import AdminSettings from '@/pages/admin/settings';
import AdminDashboard from '@/pages/admin/Dashboard';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import Product from '@/pages/Product';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import OrderConfirmation from '@/pages/OrderConfirmation';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/produkter" element={<Products />} />
        <Route path="/produkter/:id" element={<Product />} />
        <Route path="/kundvagn" element={<Cart />} />
        <Route path="/kassa" element={<Checkout />} />
        <Route path="/order-bekraftelse" element={<OrderConfirmation />} />
        
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/classify" element={<AdminProductClassification />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="subcategories" element={<AdminSubcategories />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="product-groups" element={<AdminProductGroups />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProductsPage from '../pages/products/ProductsPage';
import InventoryPage from '../pages/inventory/InventoryPage';
import CustomersPage from '../pages/customers/CustomersPage';
import OrdersPage from '../pages/orders/OrdersPage';
import SuppliersPage from '../pages/suppliers/SuppliersPage';
import PackagingPage from '../pages/packaging/PackagingPage';
import ShippingPage from '../pages/shipping/ShippingPage';
import ReturnsPage from '../pages/returns/ReturnsPage';
import AccountingPage from '../pages/accounting/AccountingPage';
import CashflowPage from '../pages/cashflow/CashflowPage';
import PlanningPage from '../pages/planning/PlanningPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/shipping" element={<ShippingPage />} />
            <Route path="/returns" element={<ReturnsPage />} />

            <Route element={<ProtectedRoute roles={['admin', 'inventory_manager']} />}>
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/packaging" element={<PackagingPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin', 'accountant']} />}>
              <Route path="/accounting" element={<AccountingPage />} />
              <Route path="/cashflow" element={<CashflowPage />} />
              <Route path="/planning" element={<PlanningPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

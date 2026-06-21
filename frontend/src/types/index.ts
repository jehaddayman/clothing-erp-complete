export type UserRole = 'admin' | 'accountant' | 'inventory_manager' | 'sales_employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  brand?: string;
  color?: string;
  size?: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockThreshold: number;
  images: string[];
  isActive: boolean;
  isLowStock?: boolean;
  createdAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  city?: string;
  totalSpent: number;
  totalOrders: number;
  isActive: boolean;
  notes: { text: string; createdAt: string }[];
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'partial' | 'refunded';

export interface OrderItem {
  product: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: Customer | string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface Supplier {
  _id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone: string;
  totalPurchased: number;
  outstandingBalance: number;
  isActive: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface DashboardSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashFlow: number;
  inventoryValue: number;
  totalProducts: number;
  lowStockAlerts: number;
  monthlySales: { revenue: number; orders: number };
  pendingShipments: number;
  returnedOrders: number;
}

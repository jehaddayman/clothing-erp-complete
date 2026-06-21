import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface NavItem {
  to: string;
  labelKey: string;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', labelKey: 'nav.dashboard' },
  { to: '/products', labelKey: 'nav.products' },
  { to: '/inventory', labelKey: 'nav.inventory', roles: ['admin', 'inventory_manager'] },
  { to: '/customers', labelKey: 'nav.customers' },
  { to: '/orders', labelKey: 'nav.orders' },
  { to: '/suppliers', labelKey: 'nav.suppliers', roles: ['admin', 'inventory_manager'] },
  { to: '/packaging', labelKey: 'nav.packaging', roles: ['admin', 'inventory_manager'] },
  { to: '/shipping', labelKey: 'nav.shipping' },
  { to: '/returns', labelKey: 'nav.returns' },
  { to: '/accounting', labelKey: 'nav.accounting', roles: ['admin', 'accountant'] },
  { to: '/cashflow', labelKey: 'nav.cashflow', roles: ['admin', 'accountant'] },
  { to: '/planning', labelKey: 'nav.planning', roles: ['admin', 'accountant'] },
];

export default function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <aside className="hidden w-64 shrink-0 border-e border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:block">
      <div className="px-5 py-5">
        <h1 className="text-lg font-bold text-primary-600">{t('app.name')}</h1>
      </div>
      <nav className="space-y-1 px-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`
            }
          >
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

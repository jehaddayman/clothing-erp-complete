import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { SUPPORTED_CURRENCIES } from '../config/currency';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currencyCode, setCurrencyCode } = useCurrency();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
      <div />
      <div className="flex items-center gap-3">
        <select
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium dark:border-gray-700 dark:bg-gray-800"
          title="Currency"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>

        <button onClick={toggleLanguage} className="btn-secondary text-xs">
          {i18n.language === 'ar' ? 'English' : 'العربية'}
        </button>

        <button
          onClick={toggleTheme}
          className="btn-secondary text-xs"
          title={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {user && (
          <div className="flex items-center gap-3 ps-3">
            <div className="text-end">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs capitalize text-gray-500 dark:text-gray-400">
                {user.role.replace('_', ' ')}
              </p>
            </div>
            <button onClick={logout} className="btn-secondary text-xs">
              {t('nav.logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

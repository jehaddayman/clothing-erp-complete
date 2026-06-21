export interface CurrencyOption {
  code: string;
  label: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', label: 'US Dollar ($)', locale: 'en-US' },
  { code: 'EGP', label: 'Egyptian Pound (ج.م)', locale: 'ar-EG' },
  { code: 'SAR', label: 'Saudi Riyal (ر.س)', locale: 'ar-SA' },
  { code: 'AED', label: 'UAE Dirham (د.إ)', locale: 'ar-AE' },
  { code: 'EUR', label: 'Euro (€)', locale: 'en-IE' },
  { code: 'GBP', label: 'British Pound (£)', locale: 'en-GB' },
];

export const DEFAULT_CURRENCY_CODE = 'USD';

export const getCurrencyOption = (code: string): CurrencyOption =>
  SUPPORTED_CURRENCIES.find((c) => c.code === code) || SUPPORTED_CURRENCIES[0];

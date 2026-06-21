import { getCurrencyOption, DEFAULT_CURRENCY_CODE } from '../config/currency';

const STORAGE_KEY = 'currencyCode';

export const formatCurrency = (value: number): string => {
  const code = localStorage.getItem(STORAGE_KEY) || DEFAULT_CURRENCY_CODE;
  const option = getCurrencyOption(code);
  return new Intl.NumberFormat(option.locale, {
    style: 'currency',
    currency: option.code,
    maximumFractionDigits: 2,
  }).format(value || 0);
};

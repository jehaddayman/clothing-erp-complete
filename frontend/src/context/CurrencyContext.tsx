import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { DEFAULT_CURRENCY_CODE, getCurrencyOption } from '../config/currency';

interface CurrencyContextValue {
  currencyCode: string;
  setCurrencyCode: (code: string) => void;
  formatCurrency: (value: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const STORAGE_KEY = 'currencyCode';

const getInitialCurrency = (): string => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored || DEFAULT_CURRENCY_CODE;
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currencyCode, setCurrencyCodeState] = useState<string>(getInitialCurrency);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currencyCode);
  }, [currencyCode]);

  const setCurrencyCode = (code: string) => setCurrencyCodeState(code);

  const formatCurrency = useMemo(() => {
    const option = getCurrencyOption(currencyCode);
    const formatter = new Intl.NumberFormat(option.locale, {
      style: 'currency',
      currency: option.code,
      maximumFractionDigits: 2,
    });
    return (value: number) => formatter.format(value || 0);
  }, [currencyCode]);

  return (
    <CurrencyContext.Provider value={{ currencyCode, setCurrencyCode, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextValue => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};

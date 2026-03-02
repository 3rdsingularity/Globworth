// Exchange Rate Service for GlobeWorth
import type { Currency, ExchangeRate } from '@/types';

const CACHE_KEY = 'globeworth_exchange_rates';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Free exchange rate API - using exchangerate-api.com (free tier)
const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

// Fallback rates (approximate) for when API fails
const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  INR: 83.5,
  GBP: 0.79,
  JPY: 150.2,
  CHF: 0.88,
  AUD: 1.53,
  CAD: 1.35,
  SGD: 1.34,
  AED: 3.67,
};

interface CachedRates {
  rates: Record<Currency, number>;
  timestamp: number;
  base: Currency;
}

// Get cached rates from localStorage
const getCachedRates = (): CachedRates | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Error reading cached rates:', error);
  }
  return null;
};

// Save rates to localStorage
const cacheRates = (rates: Record<Currency, number>, base: Currency) => {
  try {
    const cacheData: CachedRates = {
      rates,
      timestamp: Date.now(),
      base,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Error caching rates:', error);
  }
};

// Fetch latest exchange rates
export const fetchExchangeRates = async (base: Currency = 'USD'): Promise<ExchangeRate> => {
  // Check cache first
  const cached = getCachedRates();
  if (cached && cached.base === base && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return {
      base,
      rates: cached.rates,
      timestamp: new Date(cached.timestamp),
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${base}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract only the currencies we support
    const rates: Record<Currency, number> = {} as Record<Currency, number>;
    const supportedCurrencies: Currency[] = ['USD', 'EUR', 'INR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'SGD', 'AED'];
    
    supportedCurrencies.forEach((currency) => {
      if (data.rates[currency]) {
        rates[currency] = data.rates[currency];
      } else if (currency === base) {
        rates[currency] = 1;
      }
    });

    // Cache the rates
    cacheRates(rates, base);

    return {
      base,
      rates,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return cached rates if available, otherwise fallback
    if (cached) {
      return {
        base: cached.base,
        rates: cached.rates,
        timestamp: new Date(cached.timestamp),
      };
    }
    
    // Return fallback rates
    return {
      base,
      rates: FALLBACK_RATES,
      timestamp: new Date(),
    };
  }
};

// Convert amount from one currency to another
export const convertCurrency = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: Record<Currency, number>
): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Convert to USD first (base currency), then to target
  const amountInUSD = fromCurrency === 'USD' ? amount : amount / rates[fromCurrency];
  const convertedAmount = toCurrency === 'USD' ? amountInUSD : amountInUSD * rates[toCurrency];
  
  return Math.round(convertedAmount * 100) / 100;
};

// Get exchange rate between two currencies
export const getExchangeRate = (
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: Record<Currency, number>
): number => {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  
  return convertCurrency(1, fromCurrency, toCurrency, rates);
};

// Format currency amount with symbol
export const formatCurrency = (
  amount: number,
  currency: Currency,
  options: { showSymbol?: boolean; decimals?: number; compact?: boolean } = {}
): string => {
  const { showSymbol = true, decimals = 2, compact = false } = options;
  
  const currencySymbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    INR: '₹',
    GBP: '£',
    JPY: '¥',
    CHF: 'Fr',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    AED: 'د.إ',
  };

  let formattedAmount: string;
  
  if (compact && Math.abs(amount) >= 1000000) {
    formattedAmount = (amount / 1000000).toFixed(decimals) + 'M';
  } else if (compact && Math.abs(amount) >= 1000) {
    formattedAmount = (amount / 1000).toFixed(decimals) + 'K';
  } else {
    formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  if (showSymbol) {
    return `${currencySymbols[currency]}${formattedAmount}`;
  }
  
  return formattedAmount;
};

// Get last updated timestamp
export const getRatesLastUpdated = (): Date | null => {
  const cached = getCachedRates();
  return cached ? new Date(cached.timestamp) : null;
};

// Force refresh rates
export const refreshExchangeRates = async (base: Currency = 'USD'): Promise<ExchangeRate> => {
  // Clear cache
  localStorage.removeItem(CACHE_KEY);
  // Fetch fresh rates
  return fetchExchangeRates(base);
};

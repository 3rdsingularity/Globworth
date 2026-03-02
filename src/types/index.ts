// GlobeWorth - Global Portfolio Tracker Types

// Currency types supported
export type Currency = 'USD' | 'EUR' | 'INR' | 'GBP' | 'JPY' | 'CHF' | 'AUD' | 'CAD' | 'SGD' | 'AED';

export const CURRENCIES: Currency[] = ['USD', 'EUR', 'INR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'SGD', 'AED'];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
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

// Asset Types
export type AssetType = 
  | 'mutual_fund' 
  | 'stock' 
  | 'etf' 
  | 'cash' 
  | 'crypto' 
  | 'real_estate' 
  | 'gold' 
  | 'fixed_deposit' 
  | 'ppf' 
  | 'epf' 
  | 'bank_account' 
  | 'emergency_fund' 
  | 'other';

export const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'stock', label: 'Stock' },
  { value: 'etf', label: 'ETF' },
  { value: 'cash', label: 'Cash' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'gold', label: 'Gold' },
  { value: 'fixed_deposit', label: 'Fixed Deposit' },
  { value: 'ppf', label: 'PPF' },
  { value: 'epf', label: 'EPF' },
  { value: 'bank_account', label: 'Bank Account' },
  { value: 'emergency_fund', label: 'Emergency Fund' },
  { value: 'other', label: 'Other' },
];

// Asset Categories for grouping
export type AssetCategory = 'india' | 'germany' | 'other';

// Asset interface
export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  category: AssetCategory;
  units: number;
  purchasePrice: number;
  currentPrice: number;
  currentValue: number;
  investmentAmount: number;
  currency: Currency;
  notes?: string;
  isin?: string;
  platform?: string;
  autoUpdate: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Liability Types
export type LiabilityType = 'education_loan' | 'personal_loan' | 'credit_card' | 'mortgage' | 'car_loan' | 'other';

export const LIABILITY_TYPES: { value: LiabilityType; label: string }[] = [
  { value: 'education_loan', label: 'Education Loan' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'car_loan', label: 'Car Loan' },
  { value: 'other', label: 'Other' },
];

// Liability interface
export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  outstandingAmount: number;
  interestRate: number;
  emi?: number;
  currency: Currency;
  dueDate?: Date;
  notes?: string;
  lender?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Exchange Rate interface
export interface ExchangeRate {
  base: Currency;
  rates: Record<Currency, number>;
  timestamp: Date;
}

// Snapshot for historical tracking
export interface NetWorthSnapshot {
  id: string;
  date: Date;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  debtRatio: number;
  displayCurrency: Currency;
  exchangeRates: Record<Currency, number>;
  assetBreakdown: Record<AssetType, number>;
  userId: string;
}

// User Settings
export interface UserSettings {
  userId: string;
  displayCurrency: Currency;
  darkMode: boolean;
  livePriceFetching: boolean;
  roundingFormat: 'whole' | 'decimal' | 'thousand';
  emailSummary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User Profile
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  lastLoginAt: Date;
}

// Dashboard Stats
export interface DashboardStats {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  debtRatio: number;
  monthlyChange: number;
  monthlyChangePercent: number;
  topHoldings: Asset[];
  assetAllocation: Record<string, number>;
  currencyExposure: Record<Currency, number>;
  countryExposure: Record<AssetCategory, number>;
}

// Cashflow Entry
export interface CashflowEntry {
  id: string;
  date: Date;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: Currency;
  description: string;
  userId: string;
}

// Monthly Cashflow
export interface MonthlyCashflow {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

// Chart Data
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  assets?: number;
  liabilities?: number;
}

// API Response types
export interface ExchangeRateResponse {
  success: boolean;
  base: string;
  date: string;
  rates: Record<string, number>;
}

// Google Drive Backup
export interface BackupData {
  version: string;
  exportedAt: Date;
  userId: string;
  assets: Asset[];
  liabilities: Liability[];
  settings: UserSettings;
  snapshots: NetWorthSnapshot[];
}

// Import/Export
export interface ExportOptions {
  includeAssets: boolean;
  includeLiabilities: boolean;
  includeSettings: boolean;
  includeSnapshots: boolean;
  format: 'json' | 'csv';
}

// Form States
export interface AssetFormData {
  name: string;
  type: AssetType;
  category: AssetCategory;
  units: number;
  purchasePrice: number;
  currentPrice: number;
  currency: Currency;
  notes?: string;
  isin?: string;
  platform?: string;
  autoUpdate: boolean;
}

export interface LiabilityFormData {
  name: string;
  type: LiabilityType;
  outstandingAmount: number;
  interestRate: number;
  emi?: number;
  currency: Currency;
  dueDate?: Date;
  notes?: string;
  lender?: string;
}

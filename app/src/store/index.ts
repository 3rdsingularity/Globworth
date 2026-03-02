// GlobeWorth - Zustand Store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Asset, 
  Liability, 
  UserSettings, 
  NetWorthSnapshot,
  UserProfile,
  Currency,
  DashboardStats,
  AssetFormData,
  LiabilityFormData
} from '@/types';

import { 
  fetchExchangeRates, 
  convertCurrency
} from '@/lib/exchangeRate';
import {
  getUserAssetsRef,
  getUserLiabilitiesRef,
  getUserSettingsRef,
  getUserSnapshotsRef,
  isDemo,
  getDemoAssets,
  setDemoAssets,
  getDemoLiabilities,
  setDemoLiabilities,
  getDemoSettings,
  setDemoSettings,
  getDemoSnapshots,
  setDemoSnapshots,
} from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from 'firebase/auth';

const demoMode = isDemo();

// Store State Interface
interface GlobeWorthState {
  // Auth
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Data
  assets: Asset[];
  liabilities: Liability[];
  snapshots: NetWorthSnapshot[];
  settings: UserSettings;
  
  // Exchange Rates
  exchangeRates: Record<Currency, number>;
  ratesLastUpdated: Date | null;
  
  // Computed
  dashboardStats: DashboardStats | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Exchange Rate Actions
  fetchRates: () => Promise<void>;
  refreshRates: () => Promise<void>;
  convertAmount: (amount: number, from: Currency, to: Currency) => number;
  
  // Asset Actions
  addAsset: (assetData: AssetFormData) => Promise<void>;
  updateAsset: (id: string, assetData: Partial<AssetFormData>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  loadAssets: () => Promise<void>;
  
  // Liability Actions
  addLiability: (liabilityData: LiabilityFormData) => Promise<void>;
  updateLiability: (id: string, liabilityData: Partial<LiabilityFormData>) => Promise<void>;
  deleteLiability: (id: string) => Promise<void>;
  loadLiabilities: () => Promise<void>;
  
  // Settings Actions
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  
  // Snapshot Actions
  takeSnapshot: () => Promise<void>;
  loadSnapshots: () => Promise<void>;
  
  // Dashboard
  calculateDashboardStats: () => void;
  
  // Data Management
  clearAllData: () => void;
  exportData: () => string;
  importData: (jsonData: string) => Promise<void>;
}

// Default settings
const defaultSettings: UserSettings = {
  userId: '',
  displayCurrency: 'USD',
  darkMode: false,
  livePriceFetching: true,
  roundingFormat: 'decimal',
  emailSummary: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Demo data - sample assets and liabilities
const demoAssets: Asset[] = [
  {
    id: 'demo-asset-1',
    name: 'Apple Inc.',
    type: 'stock',
    category: 'other',
    units: 10,
    purchasePrice: 150.00,
    currentPrice: 175.50,
    currentValue: 1755.00,
    investmentAmount: 1500.00,
    currency: 'USD',
    notes: 'Long term investment',
    isin: 'US0378331005',
    platform: 'N26',
    autoUpdate: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    userId: 'demo-user-123',
  },
  {
    id: 'demo-asset-2',
    name: 'Nippon India Growth Fund',
    type: 'mutual_fund',
    category: 'india',
    units: 500,
    purchasePrice: 250.00,
    currentPrice: 285.75,
    currentValue: 142875.00,
    investmentAmount: 125000.00,
    currency: 'INR',
    notes: 'SIP Investment',
    isin: 'INF204K01XX2',
    platform: 'Zerodha Coin',
    autoUpdate: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    userId: 'demo-user-123',
  },
  {
    id: 'demo-asset-3',
    name: 'Emergency Fund',
    type: 'emergency_fund',
    category: 'germany',
    units: 1,
    purchasePrice: 15000.00,
    currentPrice: 15000.00,
    currentValue: 15000.00,
    investmentAmount: 15000.00,
    currency: 'EUR',
    notes: '6 months expenses',
    platform: 'N26',
    autoUpdate: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    userId: 'demo-user-123',
  },
  {
    id: 'demo-asset-4',
    name: 'Bitcoin',
    type: 'crypto',
    category: 'other',
    units: 0.5,
    purchasePrice: 40000.00,
    currentPrice: 65000.00,
    currentValue: 32500.00,
    investmentAmount: 20000.00,
    currency: 'USD',
    notes: 'Crypto investment',
    platform: 'Coinbase',
    autoUpdate: true,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
    userId: 'demo-user-123',
  },
  {
    id: 'demo-asset-5',
    name: 'Mumbai Apartment',
    type: 'real_estate',
    category: 'india',
    units: 1,
    purchasePrice: 5000000.00,
    currentPrice: 6500000.00,
    currentValue: 6500000.00,
    investmentAmount: 5000000.00,
    currency: 'INR',
    notes: 'Investment property',
    autoUpdate: false,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date(),
    userId: 'demo-user-123',
  },
];

const demoLiabilities: Liability[] = [
  {
    id: 'demo-liab-1',
    name: 'Home Loan',
    type: 'mortgage',
    outstandingAmount: 250000.00,
    interestRate: 6.5,
    emi: 1800.00,
    currency: 'EUR',
    notes: '20 year tenure',
    lender: 'Deutsche Bank',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date(),
    userId: 'demo-user-123',
  },
  {
    id: 'demo-liab-2',
    name: 'Education Loan',
    type: 'education_loan',
    outstandingAmount: 500000.00,
    interestRate: 8.5,
    emi: 12000.00,
    currency: 'INR',
    notes: 'MS Education',
    lender: 'SBI',
    createdAt: new Date('2022-08-01'),
    updatedAt: new Date(),
    userId: 'demo-user-123',
  },
  {
    id: 'demo-liab-3',
    name: 'Credit Card',
    type: 'credit_card',
    outstandingAmount: 2500.00,
    interestRate: 18.0,
    currency: 'USD',
    notes: 'Pay off monthly',
    lender: 'Chase',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    userId: 'demo-user-123',
  },
];

// Create store
export const useGlobeWorthStore = create<GlobeWorthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      userProfile: null,
      isAuthenticated: false,
      isLoading: true,
      assets: [],
      liabilities: [],
      snapshots: [],
      settings: defaultSettings,
      exchangeRates: {} as Record<Currency, number>,
      ratesLastUpdated: null,
      dashboardStats: null,

      // Auth Actions
      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          settings: {
            ...get().settings,
            userId: user?.uid || '',
          }
        });
        if (user) {
          get().fetchRates();
          get().loadAssets();
          get().loadLiabilities();
          get().loadSettings();
          get().loadSnapshots();
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),

      // Exchange Rate Actions
      fetchRates: async () => {
        try {
          const rates = await fetchExchangeRates('USD');
          set({ 
            exchangeRates: rates.rates,
            ratesLastUpdated: rates.timestamp,
          });
        } catch (error) {
          console.error('Failed to fetch exchange rates:', error);
        }
      },

      refreshRates: async () => {
        try {
          const rates = await fetchExchangeRates('USD');
          set({ 
            exchangeRates: rates.rates,
            ratesLastUpdated: rates.timestamp,
          });
          get().calculateDashboardStats();
        } catch (error) {
          console.error('Failed to refresh exchange rates:', error);
        }
      },

      convertAmount: (amount, from, to) => {
        const { exchangeRates } = get();
        if (Object.keys(exchangeRates).length === 0) return amount;
        return convertCurrency(amount, from, to, exchangeRates);
      },

      // Asset Actions
      addAsset: async (assetData) => {
        const { user } = get();
        if (!user) throw new Error('User not authenticated');

        const newAsset: Asset = {
          id: demoMode ? `demo-asset-${Date.now()}` : '',
          ...assetData,
          currentValue: assetData.units * assetData.currentPrice,
          investmentAmount: assetData.units * assetData.purchasePrice,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (demoMode) {
          const assets = [...get().assets, newAsset];
          setDemoAssets(assets);
          set({ assets });
        } else {
          const assetRef = doc(collection(db, 'users', user.uid, 'assets'));
          newAsset.id = assetRef.id;
          await setDoc(assetRef, {
            ...newAsset,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          set((state) => ({
            assets: [...state.assets, newAsset],
          }));
        }

        get().calculateDashboardStats();
      },

      updateAsset: async (id, assetData) => {
        const { user } = get();
        if (!user) throw new Error('User not authenticated');

        const updateData: Partial<Asset> = {
          ...assetData,
          updatedAt: new Date(),
        };

        if (assetData.units !== undefined || assetData.currentPrice !== undefined) {
          const asset = get().assets.find(a => a.id === id);
          if (asset) {
            const units = assetData.units ?? asset.units;
            const currentPrice = assetData.currentPrice ?? asset.currentPrice;
            updateData.currentValue = units * currentPrice;
          }
        }

        if (demoMode) {
          const assets = get().assets.map((a) =>
            a.id === id ? { ...a, ...updateData } : a
          );
          setDemoAssets(assets);
          set({ assets });
        } else {
          const assetRef = doc(db, 'users', user.uid, 'assets', id);
          await updateDoc(assetRef, {
            ...updateData,
            updatedAt: Timestamp.now(),
          });
          set((state) => ({
            assets: state.assets.map((a) =>
              a.id === id ? { ...a, ...updateData } : a
            ),
          }));
        }

        get().calculateDashboardStats();
      },

      deleteAsset: async (id) => {
        const { user } = get();
        if (!user) throw new Error('User not authenticated');

        if (demoMode) {
          const assets = get().assets.filter((a) => a.id !== id);
          setDemoAssets(assets);
          set({ assets });
        } else {
          await deleteDoc(doc(db, 'users', user.uid, 'assets', id));
          set((state) => ({
            assets: state.assets.filter((a) => a.id !== id),
          }));
        }

        get().calculateDashboardStats();
      },

      loadAssets: async () => {
        const { user } = get();
        if (!user) return;

        if (demoMode) {
          // Initialize demo data if empty
          let assets = getDemoAssets();
          if (assets.length === 0) {
            assets = demoAssets;
            setDemoAssets(assets);
          }
          set({ assets });
        } else {
          const assetsQuery = query(
            getUserAssetsRef(user.uid),
            orderBy('createdAt', 'desc')
          );

          const snapshot = await getDocs(assetsQuery);
          const assets: Asset[] = snapshot.docs.map((doc) => {
            const data = doc.data() as Asset;
            return {
              ...data,
              id: doc.id,
              createdAt: (data.createdAt as any)?.toDate?.() || new Date(),
              updatedAt: (data.updatedAt as any)?.toDate?.() || new Date(),
            };
          });

          set({ assets });
        }

        get().calculateDashboardStats();
      },

      // Liability Actions
      addLiability: async (liabilityData) => {
        const { user } = get();
        if (!user) throw new Error('User not authenticated');

        const newLiability: Liability = {
          id: demoMode ? `demo-liab-${Date.now()}` : '',
          ...liabilityData,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (demoMode) {
          const liabilities = [...get().liabilities, newLiability];
          setDemoLiabilities(liabilities);
          set({ liabilities });
        } else {
          const liabilityRef = doc(collection(db, 'users', user.uid, 'liabilities'));
          newLiability.id = liabilityRef.id;
          await setDoc(liabilityRef, {
            ...newLiability,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          set((state) => ({
            liabilities: [...state.liabilities, newLiability],
          }));
        }

        get().calculateDashboardStats();
      },

      updateLiability: async (id, liabilityData) => {
        const { user } = get();
        if (!user) throw new Error('User not authenticated');

        if (demoMode) {
          const liabilities = get().liabilities.map((l) =>
            l.id === id ? { ...l, ...liabilityData, updatedAt: new Date() } : l
          );
          setDemoLiabilities(liabilities);
          set({ liabilities });
        } else {
          const liabilityRef = doc(db, 'users', user.uid, 'liabilities', id);
          await updateDoc(liabilityRef, {
            ...liabilityData,
            updatedAt: Timestamp.now(),
          });
          set((state) => ({
            liabilities: state.liabilities.map((l) =>
              l.id === id ? { ...l, ...liabilityData, updatedAt: new Date() } : l
            ),
          }));
        }

        get().calculateDashboardStats();
      },

      deleteLiability: async (id) => {
        const { user } = get();
        if (!user) throw new Error('User not authenticated');

        if (demoMode) {
          const liabilities = get().liabilities.filter((l) => l.id !== id);
          setDemoLiabilities(liabilities);
          set({ liabilities });
        } else {
          await deleteDoc(doc(db, 'users', user.uid, 'liabilities', id));
          set((state) => ({
            liabilities: state.liabilities.filter((l) => l.id !== id),
          }));
        }

        get().calculateDashboardStats();
      },

      loadLiabilities: async () => {
        const { user } = get();
        if (!user) return;

        if (demoMode) {
          // Initialize demo data if empty
          let liabilities = getDemoLiabilities();
          if (liabilities.length === 0) {
            liabilities = demoLiabilities;
            setDemoLiabilities(liabilities);
          }
          set({ liabilities });
        } else {
          const liabilitiesQuery = query(
            getUserLiabilitiesRef(user.uid),
            orderBy('createdAt', 'desc')
          );

          const snapshot = await getDocs(liabilitiesQuery);
          const liabilities: Liability[] = snapshot.docs.map((doc) => {
            const data = doc.data() as Liability;
            return {
              ...data,
              id: doc.id,
              createdAt: (data.createdAt as any)?.toDate?.() || new Date(),
              updatedAt: (data.updatedAt as any)?.toDate?.() || new Date(),
            };
          });

          set({ liabilities });
        }

        get().calculateDashboardStats();
      },

      // Settings Actions
      updateSettings: async (newSettings) => {
        const { user, settings } = get();
        if (!user) throw new Error('User not authenticated');

        const updatedSettings = {
          ...settings,
          ...newSettings,
          updatedAt: new Date(),
        };

        if (demoMode) {
          setDemoSettings(updatedSettings);
          set({ settings: updatedSettings });
        } else {
          const settingsRef = getUserSettingsRef(user.uid);
          await setDoc(settingsRef, {
            ...updatedSettings,
            updatedAt: Timestamp.now(),
          });
          set({ settings: updatedSettings });
        }

        get().calculateDashboardStats();
      },

      loadSettings: async () => {
        const { user } = get();
        if (!user) return;

        if (demoMode) {
          const settings = getDemoSettings();
          set({
            settings: {
              ...defaultSettings,
              ...settings,
              userId: user.uid,
            },
          });
        } else {
          const settingsRef = getUserSettingsRef(user.uid);
          const snapshot = await getDoc(settingsRef);

          if (snapshot.exists()) {
            const data = snapshot.data() as UserSettings;
            set({
              settings: {
                ...defaultSettings,
                ...data,
                userId: user.uid,
                createdAt: (data.createdAt as any)?.toDate?.() || new Date(),
                updatedAt: (data.updatedAt as any)?.toDate?.() || new Date(),
              },
            });
          } else {
            const newSettings = {
              ...defaultSettings,
              userId: user.uid,
            };
            await setDoc(settingsRef, {
              ...newSettings,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            });
            set({ settings: newSettings });
          }
        }
      },

      // Snapshot Actions
      takeSnapshot: async () => {
        const { user, assets, liabilities, settings, exchangeRates } = get();
        if (!user) throw new Error('User not authenticated');

        const displayCurrency = settings.displayCurrency;
        
        const totalAssets = assets.reduce((sum, asset) => {
          return sum + convertCurrency(asset.currentValue, asset.currency, displayCurrency, exchangeRates);
        }, 0);

        const totalLiabilities = liabilities.reduce((sum, liability) => {
          return sum + convertCurrency(liability.outstandingAmount, liability.currency, displayCurrency, exchangeRates);
        }, 0);

        const netWorth = totalAssets - totalLiabilities;
        const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

        const assetBreakdown: Record<string, number> = {};
        assets.forEach((asset) => {
          const value = convertCurrency(asset.currentValue, asset.currency, displayCurrency, exchangeRates);
          assetBreakdown[asset.type] = (assetBreakdown[asset.type] || 0) + value;
        });

        const newSnapshot: NetWorthSnapshot = {
          id: demoMode ? `demo-snap-${Date.now()}` : '',
          date: new Date(),
          netWorth,
          totalAssets,
          totalLiabilities,
          debtRatio,
          displayCurrency,
          exchangeRates: { ...exchangeRates },
          assetBreakdown,
          userId: user.uid,
        };

        if (demoMode) {
          const snapshots = [newSnapshot, ...get().snapshots];
          setDemoSnapshots(snapshots);
          set({ snapshots });
        } else {
          const snapshotRef = doc(collection(db, 'users', user.uid, 'snapshots'));
          newSnapshot.id = snapshotRef.id;
          await setDoc(snapshotRef, {
            ...newSnapshot,
            date: Timestamp.now(),
          });
          set((state) => ({
            snapshots: [newSnapshot, ...state.snapshots].sort((a, b) => 
              b.date.getTime() - a.date.getTime()
            ),
          }));
        }
      },

      loadSnapshots: async () => {
        const { user } = get();
        if (!user) return;

        if (demoMode) {
          const snapshots = getDemoSnapshots();
          set({ snapshots });
        } else {
          const snapshotsQuery = query(
            getUserSnapshotsRef(user.uid),
            orderBy('date', 'desc')
          );

          const snapshot = await getDocs(snapshotsQuery);
          const snapshots: NetWorthSnapshot[] = snapshot.docs.map((doc) => {
            const data = doc.data() as NetWorthSnapshot;
            return {
              ...data,
              id: doc.id,
              date: (data.date as any)?.toDate?.() || new Date(),
            };
          });

          set({ snapshots });
        }
      },

      // Dashboard Stats Calculation
      calculateDashboardStats: () => {
        const { assets, liabilities, settings, exchangeRates, snapshots } = get();
        const displayCurrency = settings.displayCurrency;

        if (Object.keys(exchangeRates).length === 0) return;

        const totalAssets = assets.reduce((sum, asset) => {
          return sum + convertCurrency(asset.currentValue, asset.currency, displayCurrency, exchangeRates);
        }, 0);

        const totalLiabilities = liabilities.reduce((sum, liability) => {
          return sum + convertCurrency(liability.outstandingAmount, liability.currency, displayCurrency, exchangeRates);
        }, 0);

        const netWorth = totalAssets - totalLiabilities;
        const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

        let monthlyChange = 0;
        let monthlyChangePercent = 0;
        
        if (snapshots.length >= 2) {
          const current = snapshots[0];
          const lastMonth = snapshots.find(s => {
            const daysDiff = (current.date.getTime() - s.date.getTime()) / (1000 * 60 * 60 * 24);
            return daysDiff >= 28 && daysDiff <= 35;
          });
          
          if (lastMonth) {
            monthlyChange = netWorth - lastMonth.netWorth;
            monthlyChangePercent = lastMonth.netWorth !== 0 
              ? (monthlyChange / lastMonth.netWorth) * 100 
              : 0;
          }
        }

        const topHoldings = [...assets]
          .sort((a, b) => {
            const aValue = convertCurrency(a.currentValue, a.currency, displayCurrency, exchangeRates);
            const bValue = convertCurrency(b.currentValue, b.currency, displayCurrency, exchangeRates);
            return bValue - aValue;
          })
          .slice(0, 5);

        const assetAllocation: Record<string, number> = {};
        assets.forEach((asset) => {
          const value = convertCurrency(asset.currentValue, asset.currency, displayCurrency, exchangeRates);
          assetAllocation[asset.type] = (assetAllocation[asset.type] || 0) + value;
        });

        const currencyExposure: Record<Currency, number> = {} as Record<Currency, number>;
        assets.forEach((asset) => {
          const value = convertCurrency(asset.currentValue, asset.currency, displayCurrency, exchangeRates);
          currencyExposure[asset.currency] = (currencyExposure[asset.currency] || 0) + value;
        });

        const countryExposure: Record<string, number> = {};
        assets.forEach((asset) => {
          const value = convertCurrency(asset.currentValue, asset.currency, displayCurrency, exchangeRates);
          countryExposure[asset.category] = (countryExposure[asset.category] || 0) + value;
        });

        set({
          dashboardStats: {
            netWorth,
            totalAssets,
            totalLiabilities,
            debtRatio,
            monthlyChange,
            monthlyChangePercent,
            topHoldings,
            assetAllocation,
            currencyExposure,
            countryExposure,
          },
        });
      },

      // Data Management
      clearAllData: () => {
        if (demoMode) {
          setDemoAssets([]);
          setDemoLiabilities([]);
          setDemoSnapshots([]);
        }
        set({
          assets: [],
          liabilities: [],
          snapshots: [],
          dashboardStats: null,
        });
      },

      exportData: () => {
        const { assets, liabilities, settings, snapshots } = get();
        const exportData = {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          assets,
          liabilities,
          settings,
          snapshots,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importData: async (jsonData) => {
        const { user } = get();
        if (!user) throw new Error('User not authenticated');

        const data = JSON.parse(jsonData);
        
        if (demoMode) {
          if (data.assets) setDemoAssets(data.assets);
          if (data.liabilities) setDemoLiabilities(data.liabilities);
          if (data.settings) setDemoSettings(data.settings);
          if (data.snapshots) setDemoSnapshots(data.snapshots);
          
          set({
            assets: data.assets || [],
            liabilities: data.liabilities || [],
            settings: { ...defaultSettings, ...data.settings, userId: user.uid },
            snapshots: data.snapshots || [],
          });
        } else {
          // Import assets
          if (data.assets) {
            for (const asset of data.assets) {
              const assetRef = doc(collection(db, 'users', user.uid, 'assets'));
              await setDoc(assetRef, {
                ...asset,
                id: assetRef.id,
                userId: user.uid,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              });
            }
          }

          if (data.liabilities) {
            for (const liability of data.liabilities) {
              const liabilityRef = doc(collection(db, 'users', user.uid, 'liabilities'));
              await setDoc(liabilityRef, {
                ...liability,
                id: liabilityRef.id,
                userId: user.uid,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              });
            }
          }

          if (data.settings) {
            const settingsRef = getUserSettingsRef(user.uid);
            await setDoc(settingsRef, {
              ...data.settings,
              userId: user.uid,
              updatedAt: Timestamp.now(),
            });
          }

          await get().loadAssets();
          await get().loadLiabilities();
          await get().loadSettings();
          await get().loadSnapshots();
        }
      },
    }),
    {
      name: 'globeworth-storage',
      partialize: (state) => ({
        settings: state.settings,
        exchangeRates: state.exchangeRates,
        ratesLastUpdated: state.ratesLastUpdated,
      }),
    }
  )
);

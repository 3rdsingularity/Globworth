// GlobeWorth - Dashboard Page
import { useEffect } from 'react';
import { useGlobeWorthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  PieChart, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Globe,
  Building2,
  Landmark,
} from 'lucide-react';
import { formatCurrency } from '@/lib/exchangeRate';
import { toast } from 'sonner';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export default function Dashboard() {
  const { 
    dashboardStats, 
    settings, 
    exchangeRates, 
    ratesLastUpdated, 
    refreshRates,
    assets,
    takeSnapshot,
  } = useGlobeWorthStore();

  useEffect(() => {
    // Auto-refresh rates on mount
    refreshRates();
  }, []);

  const handleRefreshRates = async () => {
    await refreshRates();
    toast.success('Exchange rates updated');
  };

  const handleTakeSnapshot = async () => {
    await takeSnapshot();
    toast.success('Snapshot saved successfully');
  };

  if (!dashboardStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayCurrency = settings.displayCurrency;
  const { 
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
  } = dashboardStats;

  // Prepare chart data
  const allocationData = Object.entries(assetAllocation).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: Math.round(value * 100) / 100,
  }));

  const currencyData = Object.entries(currencyExposure).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
  }));

  const countryData = Object.entries(countryExposure).map(([name, value]) => ({
    name: name === 'india' ? 'India' : name === 'germany' ? 'Germany' : 'Other',
    value: Math.round(value * 100) / 100,
  }));

  // Mock historical data for net worth chart (in production, use snapshots)
  const netWorthData = [
    { month: 'Jan', netWorth: netWorth * 0.85, assets: totalAssets * 0.88, liabilities: totalLiabilities * 0.95 },
    { month: 'Feb', netWorth: netWorth * 0.88, assets: totalAssets * 0.90, liabilities: totalLiabilities * 0.96 },
    { month: 'Mar', netWorth: netWorth * 0.92, assets: totalAssets * 0.93, liabilities: totalLiabilities * 0.97 },
    { month: 'Apr', netWorth: netWorth * 0.95, assets: totalAssets * 0.96, liabilities: totalLiabilities * 0.98 },
    { month: 'May', netWorth: netWorth * 0.97, assets: totalAssets * 0.98, liabilities: totalLiabilities * 0.99 },
    { month: 'Jun', netWorth, assets: totalAssets, liabilities: totalLiabilities },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Overview of your global portfolio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTakeSnapshot}
            className="text-slate-600 dark:text-slate-400"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Take Snapshot
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshRates}
            className="text-slate-600 dark:text-slate-400"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Rates
          </Button>
        </div>
      </div>

      {/* Rate Info */}
      {ratesLastUpdated && (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Clock className="w-4 h-4" />
          <span>Rates updated: {ratesLastUpdated.toLocaleString()}</span>
          <Badge variant="secondary" className="text-xs">
            {displayCurrency}
          </Badge>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Net Worth</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(netWorth, displayCurrency, { compact: true })}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {monthlyChange >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-200" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-200" />
                  )}
                  <span className={`text-sm ${monthlyChange >= 0 ? 'text-emerald-100' : 'text-red-200'}`}>
                    {monthlyChange >= 0 ? '+' : ''}{monthlyChangePercent.toFixed(2)}% this month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Assets */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Assets</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(totalAssets, displayCurrency, { compact: true })}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {assets.length} holdings
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Liabilities */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Liabilities</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(totalLiabilities, displayCurrency, { compact: true })}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <CreditCard className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {debtRatio.toFixed(1)}% debt ratio
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debt Ratio */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Debt Ratio</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {debtRatio.toFixed(1)}%
                </p>
                <div className="mt-3">
                  <Progress 
                    value={debtRatio} 
                    className="h-2"
                  />
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center ml-4">
                <PieChart className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Net Worth Over Time */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Net Worth Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorthData}>
                  <defs>
                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value, displayCurrency, { compact: true, showSymbol: false })}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, displayCurrency)}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="netWorth" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorNetWorth)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-violet-500" />
              Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {allocationData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, displayCurrency)}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency Exposure */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-500" />
              Currency Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={currencyData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {currencyData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, displayCurrency)}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Country Exposure */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-500" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={countryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {countryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, displayCurrency)}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Holdings */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Top Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Asset</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Type</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Value</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">% of Portfolio</th>
                </tr>
              </thead>
              <tbody>
                {topHoldings.map((holding) => {
                  const convertedValue = (() => {
                    const rate = exchangeRates[holding.currency] || 1;
                    const baseRate = exchangeRates[displayCurrency] || 1;
                    return (holding.currentValue / rate) * baseRate;
                  })();
                  const percentage = totalAssets > 0 ? (convertedValue / totalAssets) * 100 : 0;
                  
                  return (
                    <tr key={holding.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{holding.name}</p>
                          {holding.isin && (
                            <p className="text-xs text-slate-500">{holding.isin}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="capitalize">
                          {holding.type.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-white">
                        {formatCurrency(convertedValue, displayCurrency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {percentage.toFixed(1)}%
                          </span>
                          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

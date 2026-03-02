// GlobeWorth - Insights Page
import { useGlobeWorthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  PieChart,
  Globe,
  Landmark,
  Target,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Percent,
} from 'lucide-react';
import { formatCurrency } from '@/lib/exchangeRate';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';


const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export default function InsightsPage() {
  const { dashboardStats, settings } = useGlobeWorthStore();
  const displayCurrency = settings.displayCurrency;

  if (!dashboardStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { 
    netWorth, 
    totalAssets, 
    debtRatio, 
    monthlyChangePercent,
    assetAllocation,
    currencyExposure,
    countryExposure,
  } = dashboardStats;

  // Calculate insights
  const insights = [];

  // Debt ratio insight
  if (debtRatio > 50) {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'High Debt Ratio',
      message: `Your debt ratio is ${debtRatio.toFixed(1)}%. Consider reducing liabilities to improve financial health.`,
    });
  } else if (debtRatio < 20) {
    insights.push({
      type: 'success',
      icon: CheckCircle,
      title: 'Healthy Debt Ratio',
      message: `Your debt ratio of ${debtRatio.toFixed(1)}% is excellent. You're in a strong financial position.`,
    });
  }

  // Currency diversification
  const currencyCount = Object.keys(currencyExposure).length;
  if (currencyCount === 1) {
    const singleCurrency = Object.keys(currencyExposure)[0];
    insights.push({
      type: 'warning',
      icon: Globe,
      title: 'Currency Concentration Risk',
      message: `100% of your assets are in ${singleCurrency}. Consider diversifying across currencies to reduce FX risk.`,
    });
  } else if (currencyCount >= 3) {
    insights.push({
      type: 'success',
      icon: Globe,
      title: 'Good Currency Diversification',
      message: `Your portfolio is spread across ${currencyCount} currencies, providing good FX risk protection.`,
    });
  }

  // Geographic diversification
  const indiaExposure = countryExposure.india || 0;
  const germanyExposure = countryExposure.germany || 0;
  const totalCountryExposure = indiaExposure + germanyExposure + (countryExposure.other || 0);
  
  if (totalCountryExposure > 0) {
    const indiaPercent = (indiaExposure / totalCountryExposure) * 100;
    const germanyPercent = (germanyExposure / totalCountryExposure) * 100;
    
    if (indiaPercent > 70) {
      insights.push({
        type: 'info',
        icon: Landmark,
        title: 'India-Heavy Portfolio',
        message: `${indiaPercent.toFixed(0)}% of your assets are in India. Consider increasing exposure to other markets.`,
      });
    }
    if (germanyPercent > 70) {
      insights.push({
        type: 'info',
        icon: Landmark,
        title: 'Germany-Heavy Portfolio',
        message: `${germanyPercent.toFixed(0)}% of your assets are in Germany. Consider diversifying geographically.`,
      });
    }
  }

  // Asset allocation insights
  const stockAllocation = assetAllocation.stock || 0;
  const mfAllocation = assetAllocation.mutual_fund || 0;
  const cashAllocation = assetAllocation.cash || 0;
  const totalAllocation = Object.values(assetAllocation).reduce((a, b) => a + b, 0);

  if (totalAllocation > 0) {
    const equityPercent = ((stockAllocation + mfAllocation) / totalAllocation) * 100;
    const cashPercent = (cashAllocation / totalAllocation) * 100;

    if (equityPercent > 80) {
      insights.push({
        type: 'warning',
        icon: Target,
        title: 'High Equity Exposure',
        message: `${equityPercent.toFixed(0)}% in equities is aggressive. Consider adding bonds or fixed income for stability.`,
      });
    }
    if (cashPercent > 30) {
      insights.push({
        type: 'info',
        icon: Wallet,
        title: 'High Cash Position',
        message: `You have ${cashPercent.toFixed(0)}% in cash. Consider investing idle cash for better returns.`,
      });
    }
  }

  // Monthly performance
  if (monthlyChangePercent > 5) {
    insights.push({
      type: 'success',
      icon: TrendingUp,
      title: 'Strong Monthly Performance',
      message: `Your net worth grew by ${monthlyChangePercent.toFixed(2)}% this month. Great job!`,
    });
  } else if (monthlyChangePercent < -5) {
    insights.push({
      type: 'warning',
      icon: TrendingDown,
      title: 'Monthly Decline',
      message: `Your net worth declined by ${Math.abs(monthlyChangePercent).toFixed(2)}% this month. Review your portfolio.`,
    });
  }

  // Prepare chart data
  const allocationData = Object.entries(assetAllocation)
    .map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: Math.round(value * 100) / 100,
    }))
    .sort((a, b) => b.value - a.value);

  const currencyData = Object.entries(currencyExposure)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      percentage: totalAssets > 0 ? (value / totalAssets) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Risk analysis data for radar chart
  const riskData = [
    { subject: 'Diversification', A: Math.min(currencyCount * 25, 100), fullMark: 100 },
    { subject: 'Liquidity', A: Math.min(((assetAllocation.cash || 0) / (totalAssets || 1)) * 500, 100), fullMark: 100 },
    { subject: 'Debt Health', A: Math.max(100 - debtRatio * 2, 0), fullMark: 100 },
    { subject: 'Equity Balance', A: 70, fullMark: 100 },
    { subject: 'Geographic Spread', A: Math.min(Object.keys(countryExposure).length * 33, 100), fullMark: 100 },
    { subject: 'Growth Trend', A: Math.max(50 + monthlyChangePercent * 5, 0), fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Insights</h1>
        <p className="text-slate-600 dark:text-slate-400">
          AI-powered analysis of your portfolio
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Net Worth</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(netWorth, displayCurrency, { compact: true })}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Debt Ratio</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {debtRatio.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-cyan-500" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Currencies</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {currencyCount}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-4 h-4 text-violet-500" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Asset Types</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {Object.keys(assetAllocation).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Portfolio Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                Add more assets to get personalized insights about your portfolio.
              </p>
            ) : (
              insights.map((insight, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-lg ${
                    insight.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                      : insight.type === 'warning'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    insight.type === 'success'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30'
                      : insight.type === 'warning'
                      ? 'bg-amber-100 dark:bg-amber-900/30'
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    <insight.icon className={`w-5 h-5 ${
                      insight.type === 'success'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : insight.type === 'warning'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${
                      insight.type === 'success'
                        ? 'text-emerald-900 dark:text-emerald-100'
                        : insight.type === 'warning'
                        ? 'text-amber-900 dark:text-amber-100'
                        : 'text-blue-900 dark:text-blue-100'
                    }`}>
                      {insight.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      insight.type === 'success'
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : insight.type === 'warning'
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-blue-700 dark:text-blue-300'
                    }`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation Bar Chart */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Asset Allocation Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allocationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="#64748b" 
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value, displayCurrency, { compact: true, showSymbol: false })}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, displayCurrency)}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {allocationData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Analysis Radar Chart */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Portfolio Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar
                    name="Portfolio"
                    dataKey="A"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currency Exposure Table */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-500" />
            Currency Exposure Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Currency</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Value</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">% of Portfolio</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {currencyData.map((curr) => (
                  <tr key={curr.name} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{curr.name}</Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-white">
                      {formatCurrency(curr.value, displayCurrency)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {curr.percentage.toFixed(1)}%
                        </span>
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500 rounded-full"
                            style={{ width: `${Math.min(curr.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {curr.percentage > 70 ? (
                        <Badge variant="destructive" className="text-xs">High Concentration</Badge>
                      ) : curr.percentage > 40 ? (
                        <Badge variant="default" className="text-xs bg-amber-500">Moderate</Badge>
                      ) : (
                        <Badge variant="default" className="text-xs bg-emerald-500">Balanced</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {debtRatio > 40 && (
              <div className="flex items-start gap-3">
                <ArrowDownRight className="w-5 h-5 mt-0.5" />
                <p>Consider paying down high-interest debt to reduce your debt ratio from {debtRatio.toFixed(1)}% to under 30%.</p>
              </div>
            )}
            {currencyCount < 2 && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 mt-0.5" />
                <p>Diversify your portfolio across multiple currencies to reduce foreign exchange risk.</p>
              </div>
            )}
            {totalAssets > 0 && (assetAllocation.cash || 0) / totalAssets > 0.2 && (
              <div className="flex items-start gap-3">
                <ArrowUpRight className="w-5 h-5 mt-0.5" />
                <p>You have significant cash holdings. Consider investing in index funds or bonds for better returns.</p>
              </div>
            )}
            {monthlyChangePercent < 0 && (
              <div className="flex items-start gap-3">
                <TrendingDown className="w-5 h-5 mt-0.5" />
                <p>Your portfolio declined this month. Review your asset allocation and consider rebalancing.</p>
              </div>
            )}
            {insights.length === 0 && (
              <p>Your portfolio looks healthy! Keep monitoring and adding assets for more personalized recommendations.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

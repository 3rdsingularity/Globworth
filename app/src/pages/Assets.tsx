// GlobeWorth - Assets Page
import { useState } from 'react';
import { useGlobeWorthStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Wallet,
  TrendingUp,
  Building2,
  Landmark,
  Coins,
  Home,
  Gem,
  PiggyBank,
  Briefcase,
  MoreHorizontal,
  Edit2,
  Trash2,
  Filter,
  Globe,
} from 'lucide-react';
import { formatCurrency } from '@/lib/exchangeRate';
import type { Asset, AssetFormData, AssetType, AssetCategory, Currency } from '@/types';
import { ASSET_TYPES, CURRENCIES } from '@/types';

const assetTypeIcons: Record<AssetType, React.ElementType> = {
  mutual_fund: TrendingUp,
  stock: Briefcase,
  etf: TrendingUp,
  cash: Wallet,
  crypto: Coins,
  real_estate: Home,
  gold: Gem,
  fixed_deposit: PiggyBank,
  ppf: Landmark,
  epf: Landmark,
  bank_account: Building2,
  emergency_fund: PiggyBank,
  other: MoreHorizontal,
};

const defaultFormData: AssetFormData = {
  name: '',
  type: 'stock',
  category: 'other',
  units: 0,
  purchasePrice: 0,
  currentPrice: 0,
  currency: 'USD',
  notes: '',
  isin: '',
  platform: '',
  autoUpdate: false,
};

export default function AssetsPage() {
  const { assets, addAsset, updateAsset, deleteAsset, settings, convertAmount } = useGlobeWorthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AssetType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<AssetCategory | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<AssetFormData>(defaultFormData);

  const displayCurrency = settings.displayCurrency;

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.isin?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesCategory = filterCategory === 'all' || asset.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Calculate totals
  const totalValue = assets.reduce((sum, asset) => {
    return sum + convertAmount(asset.currentValue, asset.currency, displayCurrency);
  }, 0);

  const totalInvestment = assets.reduce((sum, asset) => {
    return sum + convertAmount(asset.investmentAmount, asset.currency, displayCurrency);
  }, 0);

  const totalGain = totalValue - totalInvestment;
  const totalGainPercent = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

  const handleAddAsset = async () => {
    try {
      await addAsset(formData);
      toast.success('Asset added successfully');
      setFormData(defaultFormData);
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add asset');
    }
  };

  const handleEditAsset = async () => {
    if (!editingAsset) return;
    try {
      await updateAsset(editingAsset.id, formData);
      toast.success('Asset updated successfully');
      setEditingAsset(null);
      setFormData(defaultFormData);
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update asset');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await deleteAsset(id);
      toast.success('Asset deleted successfully');
    } catch (error) {
      toast.error('Failed to delete asset');
    }
  };

  const openEditDialog = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      category: asset.category,
      units: asset.units,
      purchasePrice: asset.purchasePrice,
      currentPrice: asset.currentPrice,
      currency: asset.currency,
      notes: asset.notes || '',
      isin: asset.isin || '',
      platform: asset.platform || '',
      autoUpdate: asset.autoUpdate,
    });
    setIsEditDialogOpen(true);
  };

  const AssetForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Asset Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Apple Inc."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Asset Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as AssetType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSET_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category/Region *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value as AssetCategory })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="india">India</SelectItem>
              <SelectItem value="germany">Germany</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => setFormData({ ...formData, currency: value as Currency })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr} value={curr}>
                  {curr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="units">Units *</Label>
          <Input
            id="units"
            type="number"
            step="0.001"
            value={formData.units}
            onChange={(e) => setFormData({ ...formData, units: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchasePrice">Purchase Price *</Label>
          <Input
            id="purchasePrice"
            type="number"
            step="0.01"
            value={formData.purchasePrice}
            onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentPrice">Current Price *</Label>
          <Input
            id="currentPrice"
            type="number"
            step="0.01"
            value={formData.currentPrice}
            onChange={(e) => setFormData({ ...formData, currentPrice: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="isin">ISIN (Optional)</Label>
          <Input
            id="isin"
            value={formData.isin}
            onChange={(e) => setFormData({ ...formData, isin: e.target.value })}
            placeholder="e.g., US0378331005"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform">Platform (Optional)</Label>
          <Input
            id="platform"
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            placeholder="e.g., Zerodha, N26"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes..."
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="autoUpdate"
          checked={formData.autoUpdate}
          onCheckedChange={(checked) => setFormData({ ...formData, autoUpdate: checked })}
        />
        <Label htmlFor="autoUpdate" className="cursor-pointer">
          Auto-update prices (if available)
        </Label>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={onSubmit} className="bg-emerald-600 hover:bg-emerald-700">
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assets</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your investments and holdings
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
            </DialogHeader>
            <AssetForm onSubmit={handleAddAsset} submitLabel="Add Asset" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Value</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalValue, displayCurrency)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Invested</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalInvestment, displayCurrency)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Gain/Loss</p>
            <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain, displayCurrency)} ({totalGainPercent.toFixed(2)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={(value) => setFilterType(value as AssetType | 'all')}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ASSET_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as AssetCategory | 'all')}>
          <SelectTrigger className="w-[180px]">
            <Globe className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="india">India</SelectItem>
            <SelectItem value="germany">Germany</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assets Table */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Asset</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Type</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Units</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Price</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Value</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Gain/Loss</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No assets found. Add your first asset to get started.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => {
                    const Icon = assetTypeIcons[asset.type];
                    const convertedValue = convertAmount(asset.currentValue, asset.currency, displayCurrency);
                    const convertedInvestment = convertAmount(asset.investmentAmount, asset.currency, displayCurrency);
                    const gain = convertedValue - convertedInvestment;
                    const gainPercent = convertedInvestment > 0 ? (gain / convertedInvestment) * 100 : 0;

                    return (
                      <tr key={asset.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                              <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{asset.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {asset.currency}
                                </Badge>
                                {asset.platform && (
                                  <span className="text-xs text-slate-500">{asset.platform}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="capitalize">
                            {asset.type.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-900 dark:text-white">
                          {asset.units.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                          {formatCurrency(asset.currentPrice, asset.currency)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {formatCurrency(convertedValue, displayCurrency)}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={gain >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                            {gain >= 0 ? '+' : ''}{formatCurrency(gain, displayCurrency)}
                            <span className="text-xs ml-1">({gainPercent.toFixed(1)}%)</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(asset)}
                              className="text-slate-500 hover:text-emerald-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="text-slate-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
          </DialogHeader>
          <AssetForm onSubmit={handleEditAsset} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

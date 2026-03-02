// GlobeWorth - Liabilities Page
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
import { toast } from 'sonner';
import {
  Plus,
  Search,
  CreditCard,
  GraduationCap,
  User,
  Home,
  Car,
  MoreHorizontal,
  Edit2,
  Trash2,
  Filter,
  TrendingDown,
  Percent,
  Calendar,
} from 'lucide-react';
import { formatCurrency } from '@/lib/exchangeRate';
import type { Liability, LiabilityFormData, LiabilityType, Currency } from '@/types';
import { LIABILITY_TYPES, CURRENCIES } from '@/types';

const liabilityTypeIcons: Record<LiabilityType, React.ElementType> = {
  education_loan: GraduationCap,
  personal_loan: User,
  credit_card: CreditCard,
  mortgage: Home,
  car_loan: Car,
  other: MoreHorizontal,
};

const defaultFormData: LiabilityFormData = {
  name: '',
  type: 'personal_loan',
  outstandingAmount: 0,
  interestRate: 0,
  emi: undefined,
  currency: 'USD',
  notes: '',
  lender: '',
};

export default function LiabilitiesPage() {
  const { liabilities, addLiability, updateLiability, deleteLiability, settings, convertAmount } = useGlobeWorthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<LiabilityType | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [formData, setFormData] = useState<LiabilityFormData>(defaultFormData);

  const displayCurrency = settings.displayCurrency;

  // Filter liabilities
  const filteredLiabilities = liabilities.filter((liability) => {
    const matchesSearch = liability.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         liability.lender?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || liability.type === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate totals
  const totalLiabilities = liabilities.reduce((sum, liability) => {
    return sum + convertAmount(liability.outstandingAmount, liability.currency, displayCurrency);
  }, 0);

  const totalEMI = liabilities.reduce((sum, liability) => {
    if (liability.emi) {
      return sum + convertAmount(liability.emi, liability.currency, displayCurrency);
    }
    return sum;
  }, 0);

  const avgInterestRate = liabilities.length > 0
    ? liabilities.reduce((sum, l) => sum + l.interestRate, 0) / liabilities.length
    : 0;

  const handleAddLiability = async () => {
    try {
      await addLiability(formData);
      toast.success('Liability added successfully');
      setFormData(defaultFormData);
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add liability');
    }
  };

  const handleEditLiability = async () => {
    if (!editingLiability) return;
    try {
      await updateLiability(editingLiability.id, formData);
      toast.success('Liability updated successfully');
      setEditingLiability(null);
      setFormData(defaultFormData);
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update liability');
    }
  };

  const handleDeleteLiability = async (id: string) => {
    if (!confirm('Are you sure you want to delete this liability?')) return;
    try {
      await deleteLiability(id);
      toast.success('Liability deleted successfully');
    } catch (error) {
      toast.error('Failed to delete liability');
    }
  };

  const openEditDialog = (liability: Liability) => {
    setEditingLiability(liability);
    setFormData({
      name: liability.name,
      type: liability.type,
      outstandingAmount: liability.outstandingAmount,
      interestRate: liability.interestRate,
      emi: liability.emi,
      currency: liability.currency,
      notes: liability.notes || '',
      lender: liability.lender || '',
    });
    setIsEditDialogOpen(true);
  };

  const LiabilityForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Liability Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Home Loan"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Liability Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as LiabilityType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIABILITY_TYPES.map((type) => (
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
        <div className="space-y-2">
          <Label htmlFor="lender">Lender (Optional)</Label>
          <Input
            id="lender"
            value={formData.lender}
            onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
            placeholder="e.g., HDFC Bank"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="outstandingAmount">Outstanding Amount *</Label>
          <Input
            id="outstandingAmount"
            type="number"
            step="0.01"
            value={formData.outstandingAmount}
            onChange={(e) => setFormData({ ...formData, outstandingAmount: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interestRate">Interest Rate (%)</Label>
          <Input
            id="interestRate"
            type="number"
            step="0.01"
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emi">Monthly EMI (Optional)</Label>
          <Input
            id="emi"
            type="number"
            step="0.01"
            value={formData.emi || ''}
            onChange={(e) => setFormData({ ...formData, emi: parseFloat(e.target.value) || undefined })}
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Liabilities</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your loans and debts
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Liability
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Liability</DialogTitle>
            </DialogHeader>
            <LiabilityForm onSubmit={handleAddLiability} submitLabel="Add Liability" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Liabilities</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalLiabilities, displayCurrency)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Monthly EMI</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalEMI, displayCurrency)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-violet-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Avg. Interest Rate</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {avgInterestRate.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search liabilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={(value) => setFilterType(value as LiabilityType | 'all')}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {LIABILITY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Liabilities Table */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Liability</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Type</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Outstanding</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Interest Rate</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">EMI</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLiabilities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No liabilities found. Add your first liability to get started.
                    </td>
                  </tr>
                ) : (
                  filteredLiabilities.map((liability) => {
                    const Icon = liabilityTypeIcons[liability.type];
                    const convertedAmount = convertAmount(liability.outstandingAmount, liability.currency, displayCurrency);
                    const convertedEMI = liability.emi 
                      ? convertAmount(liability.emi, liability.currency, displayCurrency)
                      : null;

                    return (
                      <tr key={liability.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                              <Icon className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{liability.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {liability.currency}
                                </Badge>
                                {liability.lender && (
                                  <span className="text-xs text-slate-500">{liability.lender}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="capitalize">
                            {liability.type.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {formatCurrency(convertedAmount, displayCurrency)}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                          {liability.interestRate.toFixed(2)}%
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                          {convertedEMI ? formatCurrency(convertedEMI, displayCurrency) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(liability)}
                              className="text-slate-500 hover:text-emerald-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteLiability(liability.id)}
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
            <DialogTitle>Edit Liability</DialogTitle>
          </DialogHeader>
          <LiabilityForm onSubmit={handleEditLiability} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

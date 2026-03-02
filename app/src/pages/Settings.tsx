// GlobeWorth - Settings Page
import { useState } from 'react';
import { useGlobeWorthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Moon,
  Sun,
  Globe,
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  FileJson,
} from 'lucide-react';
import { CURRENCIES } from '@/types';

export default function SettingsPage() {
  const { 
    settings, 
    updateSettings, 
    exportData, 
    importData, 
    clearAllData,
    ratesLastUpdated,
    refreshRates,
  } = useGlobeWorthStore();
  
  const [isImporting, setIsImporting] = useState(false);
  const [importJson, setImportJson] = useState('');

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `globeworth-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleImport = async () => {
    try {
      await importData(importJson);
      setImportJson('');
      setIsImporting(false);
      toast.success('Data imported successfully');
    } catch (error) {
      toast.error('Failed to import data. Please check the file format.');
    }
  };

  const handleClearData = async () => {
    if (!confirm('WARNING: This will delete all your data. This action cannot be undone. Are you sure?')) {
      return;
    }
    if (!confirm('Please confirm again. All assets, liabilities, and settings will be permanently deleted.')) {
      return;
    }
    try {
      // In a real app, you'd delete from Firebase here
      clearAllData();
      toast.success('All data cleared');
    } catch (error) {
      toast.error('Failed to clear data');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !settings.darkMode;
    updateSettings({ darkMode: newDarkMode });
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your preferences and account settings
        </p>
      </div>

      {/* Display Currency */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500" />
            Display Currency
          </CardTitle>
          <CardDescription>
            Choose your preferred currency for displaying all values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select
              value={settings.displayCurrency}
              onValueChange={(value) => updateSettings({ displayCurrency: value as typeof settings.displayCurrency })}
            >
              <SelectTrigger className="w-[200px]">
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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              All values will be converted to {settings.displayCurrency}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            {settings.darkMode ? <Moon className="w-5 h-5 text-violet-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Toggle between light and dark theme
              </p>
            </div>
            <Switch
              id="darkMode"
              checked={settings.darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Sync */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-500" />
            Data & Synchronization
          </CardTitle>
          <CardDescription>
            Manage your data and exchange rates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Live Price Fetching</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Automatically fetch latest prices for supported assets
              </p>
            </div>
            <Switch
              checked={settings.livePriceFetching}
              onCheckedChange={(checked) => updateSettings({ livePriceFetching: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Exchange Rates</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {ratesLastUpdated 
                  ? `Last updated: ${ratesLastUpdated.toLocaleString()}`
                  : 'Exchange rates not loaded yet'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await refreshRates();
                toast.success('Exchange rates refreshed');
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Monthly Email Summary</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Receive monthly portfolio summary via email (Coming soon)
              </p>
            </div>
            <Switch
              checked={settings.emailSummary}
              onCheckedChange={(checked) => updateSettings({ emailSummary: checked })}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Backup & Restore */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-500" />
            Backup & Restore
          </CardTitle>
          <CardDescription>
            Export or import your portfolio data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex-1"
            >
              <FileJson className="w-4 h-4 mr-2" />
              Export to JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsImporting(!isImporting)}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
          </div>

          {isImporting && (
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <Label htmlFor="importData">Paste your JSON data here:</Label>
              <textarea
                id="importData"
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="w-full h-32 p-3 text-sm border rounded-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Paste JSON data here..."
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImporting(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleImport}
                  disabled={!importJson.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Import
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-red-900 dark:text-red-100 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            These actions cannot be undone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-red-900 dark:text-red-100">Clear All Data</Label>
              <p className="text-sm text-red-700 dark:text-red-300">
                Permanently delete all assets, liabilities, and settings
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleClearData}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            About GlobeWorth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Exchange Rate Source:</strong> exchangerate-api.com</p>
            <p><strong>Data Storage:</strong> Firebase Firestore</p>
            <p className="pt-2">
              GlobeWorth is a global portfolio tracker that helps you manage your assets 
              and liabilities across multiple currencies with real-time exchange rates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

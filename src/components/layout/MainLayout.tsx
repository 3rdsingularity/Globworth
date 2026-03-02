// GlobeWorth - Main Layout with Sidebar
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useGlobeWorthStore } from '@/store';
import { logoutUser } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Globe,
  Moon,
  Sun,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Assets', href: '/assets', icon: Wallet },
  { name: 'Liabilities', href: '/liabilities', icon: CreditCard },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function MainLayout() {
  const { user, settings, updateSettings } = useGlobeWorthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
    document.documentElement.classList.toggle('dark');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`;

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 ${settings.darkMode ? 'dark' : ''}`}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-72 lg:flex lg:flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100 dark:border-slate-700">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              GlobeWorth
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Global Portfolio Tracker</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink key={item.name} to={item.href} className={navLinkClass}>
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              GlobeWorth
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-slate-600 dark:text-slate-400"
            >
              {settings.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-400">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white dark:bg-slate-800 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Logo */}
                  <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      GlobeWorth
                    </span>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 px-4 py-4 space-y-1">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={navLinkClass}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </NavLink>
                    ))}
                  </nav>

                  {/* Mobile User Section */}
                  <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user?.photoURL || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                          {user?.displayName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {user?.displayName || 'User'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full mt-3 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-72 min-h-screen">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

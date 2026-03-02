// GlobeWorth - Main App Component
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, createUserDocument, isDemo, getCurrentUser } from '@/lib/firebase';
import { useGlobeWorthStore } from '@/store';
import { Toaster } from '@/components/ui/sonner';

// Pages
import LoginPage from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import AssetsPage from '@/pages/Assets';
import LiabilitiesPage from '@/pages/Liabilities';
import InsightsPage from '@/pages/Insights';
import SettingsPage from '@/pages/Settings';
import MainLayout from '@/components/layout/MainLayout';

// Auth Guard Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useGlobeWorthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { setUser, setLoading } = useGlobeWorthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (isDemo()) {
        // Demo mode - check localStorage for demo user
        const demoUser = await getCurrentUser();
        if (demoUser) {
          setUser(demoUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      } else {
        // Firebase mode
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            await createUserDocument(user);
            setUser(user);
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      }
    };

    initAuth();
  }, [setUser, setLoading]);

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="liabilities" element={<LiabilitiesPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

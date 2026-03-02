// GlobeWorth - Login Page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, isDemo } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Shield, TrendingUp, Wallet, Sparkles, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const demoMode = isDemo();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      if (demoMode) {
        toast.success('Welcome to Demo Mode! Your data is stored locally.');
      } else {
        toast.success('Welcome to GlobeWorth!');
      }
      navigate('/');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-emerald-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-teal-100/30 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Hero */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              GlobeWorth
            </h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              Track Your Global{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Net Worth
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto lg:mx-0">
              Manage your assets and liabilities across multiple currencies. 
              Get real-time insights into your financial health.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Multi-Currency</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Live Rates</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Secure</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AI Insights</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <Card className="w-full max-w-md mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Globe className="w-9 h-9 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Sign in to access your portfolio
              </CardDescription>
            </div>
            {demoMode && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                <Info className="w-3 h-3 mr-1" />
                Demo Mode
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {demoMode ? (
              <>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    <strong>Demo Mode Active</strong>
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    Click below to explore with sample data. Your changes will be saved locally in your browser.
                  </p>
                </div>
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="font-medium">Try Demo</span>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-12 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm transition-all duration-200 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="font-medium">Continue with Google</span>
                  </>
                )}
              </Button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
                  {demoMode ? 'Local Storage' : 'Secure Login'}
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {demoMode ? (
                <>
                  To use with Firebase, add your config to{' '}
                  <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-xs">.env</code>
                </>
              ) : (
                <>
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                    Privacy Policy
                  </a>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

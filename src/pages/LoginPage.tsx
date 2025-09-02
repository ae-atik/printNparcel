import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User as UserIcon, Printer, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const { login, loginDemo, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // If user becomes authenticated (another tab or demo), redirect safely.
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();              // hard-stop native navigation
    setError('');

    const safeEmail = email.trim();
    const safePassword = password;

    if (!safeEmail || !safePassword) {
      setError('Please enter both email and password');
      return;
    }

    try {
      await login(safeEmail, safePassword); // AuthContext throws on 401
      // navigation is handled by useEffect when user state updates
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password');
    }
  };

  const handleGuest = async (role: 'user' | 'printer-owner' | 'admin' = 'user') => {
    setError('');
    try {
      await loginDemo(role);
      // navigation will follow via useEffect when user state changes
    } catch (err: any) {
      setError('Demo sign-in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold gradient-text">Welcome Back</h2>
          <p className="mt-2 text-theme-text-secondary">Sign in to your account or explore in demo mode</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-6" autoComplete="on">
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="p-3 rounded-component bg-danger/10 border border-danger/20 text-danger text-sm"
              >
                {error}
              </div>
            )}

            <GlassInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
              icon={<Mail size={20} />}
              required
              autoComplete="username"
              disabled={isLoading}
            />

            <div className="relative">
              <GlassInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                icon={<Lock size={20} />}
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted hover:text-theme-text transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              className="w-full"
              loading={isLoading}
              glow
              disabled={isLoading}
            >
              Sign In
            </GlassButton>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-glass-border" />
            <span className="px-3 text-xs text-theme-text-muted">or</span>
            <div className="flex-1 h-px bg-glass-border" />
          </div>

          {/* One-click demo — simplified: explicit type=button to avoid accidental submit in any DOM nesting */}
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wide text-theme-text-muted">
              Explore in demo mode
            </div>

            <div className="grid grid-cols-3 gap-3">
              <GlassButton
                type="button"
                variant="ghost"
                className="w-full border border-zinc-300 dark:border-glass-border hover:bg-glass-bg focus-visible:ring-2 focus-visible:ring-campus-green"
                onClick={() => handleGuest('user')}
                aria-label="Continue as Student (Demo)"
                disabled={isLoading}
              >
                <UserIcon size={16} className="mr-2" />
                Student
              </GlassButton>

              <GlassButton
                type="button"
                variant="ghost"
                className="w-full border border-zinc-300 dark:border-glass-border hover:bg-glass-bg focus-visible:ring-2 focus-visible:ring-campus-green"
                onClick={() => handleGuest('printer-owner')}
                aria-label="Continue as Printer Owner (Demo)"
                disabled={isLoading}
              >
                <Printer size={16} className="mr-2" />
                Owner
              </GlassButton>

              <GlassButton
                type="button"
                variant="ghost"
                className="w-full border border-zinc-300 dark:border-glass-border hover:bg-glass-bg focus-visible:ring-2 focus-visible:ring-campus-green"
                onClick={() => handleGuest('admin')}
                aria-label="Continue as Admin (Demo)"
                disabled={isLoading}
              >
                <Shield size={16} className="mr-2" />
                Admin
              </GlassButton>
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-theme-text-secondary">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-campus-green hover:text-campus-green-hover font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

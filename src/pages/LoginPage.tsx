import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold gradient-text">Welcome Back</h2>
          <p className="mt-2 text-dark-text-secondary">Sign in to your account</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-component bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            <GlassInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={20} />}
              required
            />

            <div className="relative">
              <GlassInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={20} />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted hover:text-dark-text transition-colors"
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
            >
              Sign In
            </GlassButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-text-secondary">
              Don't have an account?{' '}
              <Link to="/signup" className="text-campus-green hover:text-campus-green-hover font-medium">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mt-8 p-4 bg-glass-bg rounded-component border border-glass-border">
            <h3 className="text-sm font-medium text-dark-text mb-3">Demo Accounts:</h3>
            <div className="space-y-2 text-xs text-dark-text-secondary">
              <div>
                <strong>Student:</strong> student@campus.edu / password
              </div>
              <div>
                <strong>Printer Owner:</strong> owner@campus.edu / password
              </div>
              <div>
                <strong>Admin:</strong> admin@campus.edu / password
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
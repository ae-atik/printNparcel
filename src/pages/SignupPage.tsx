import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, MapPin, Eye, EyeOff, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';

export const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    university: '',
    hall: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold gradient-text">Join CampusPrint</h2>
          <p className="mt-2 text-dark-text-secondary">Create your account to get started</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-component bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                icon={<User size={20} />}
                required
              />
              <GlassInput
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                icon={<User size={20} />}
                required
              />
            </div>

            <GlassInput
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              icon={<User size={20} />}
              required
            />

            <GlassInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail size={20} />}
              required
            />

            <GlassInput
              label="University"
              name="university"
              value={formData.university}
              onChange={handleChange}
              icon={<Building size={20} />}
              required
            />

            <GlassInput
              label="Hall/Residence (Optional)"
              name="hall"
              value={formData.hall}
              onChange={handleChange}
              icon={<MapPin size={20} />}
            />

            <div className="relative">
              <GlassInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
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

            <div className="relative">
              <GlassInput
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={<Lock size={20} />}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted hover:text-dark-text transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              className="w-full"
              loading={isLoading}
              glow
            >
              Create Account
            </GlassButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-campus-green hover:text-campus-green-hover font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
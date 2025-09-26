import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Truck, Plus, Users, Clock, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  // Printer form state removed – handled in dedicated registration page now.

  const handleActionClick = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/login', { state: { from: { pathname: path } } });
    }
  };

  const handleAddPrinter = () => {
    if (isAuthenticated) {
      navigate('/printers/add');
    } else {
      navigate('/login', { state: { from: { pathname: '/printers/add' } } });
    }
  };

  // Printer submission handled in registration page

  return (
    <div className="min-h-screen pt-16 bg-theme-bg">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br from-campus-green/10 to-info/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 w-full h-full ${isDark ? 'opacity-100' : 'opacity-50'}`}></div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            <span className="gradient-text">Campus Printing</span>
            <br />
            <span className="text-theme-text">Made Simple</span>
          </h1>
          
          <p className="text-xl text-theme-text-secondary mb-12 max-w-2xl mx-auto animate-slide-up">
            Connect with printers across campus, get documents delivered, and earn money by sharing your printer or offering delivery services.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-slide-up">
            <GlassCard hover className="p-6 cursor-pointer" onClick={handleAddPrinter}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-campus-green to-info rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Add Printer</h3>
                <p className="text-sm text-theme-text-secondary">Register your printer and start earning</p>
              </div>
            </GlassCard>

            <GlassCard hover className="p-6 cursor-pointer" onClick={() => handleActionClick('/printers')}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-info to-campus-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <Printer size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Request Print</h3>
                <p className="text-sm text-theme-text-secondary">Find nearby printers and print documents</p>
              </div>
            </GlassCard>

            <GlassCard hover className="p-6 cursor-pointer" onClick={() => handleActionClick('/delivery')}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-campus-green to-info rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Request Delivery</h3>
                <p className="text-sm text-theme-text-secondary">Get your items delivered across campus</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">About CampusPrint</h2>
            <p className="text-xl text-theme-text-secondary max-w-3xl mx-auto">
              We're revolutionizing campus services by connecting students, printer owners, and delivery providers in one seamless platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassCard className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-campus-green to-info rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Community Driven</h3>
              <p className="text-theme-text-secondary">
                Built by students, for students. Our platform connects the campus community and creates opportunities for everyone.
              </p>
            </GlassCard>

            <GlassCard className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-info to-campus-green rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Fast & Reliable</h3>
              <p className="text-theme-text-secondary">
                Get your documents printed and delivered quickly with our network of trusted campus partners.
              </p>
            </GlassCard>

            <GlassCard className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-campus-green to-info rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure & Trusted</h3>
              <p className="text-theme-text-secondary">
                Your documents and payments are protected with enterprise-grade security and verified users.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <GlassButton
              variant="primary"
              size="lg"
              glow
              onClick={() => isAuthenticated ? navigate('/dashboard') : handleActionClick('/signup')}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Join CampusPrint Today'}
            </GlassButton>
          </div>
        </div>
      </section>

      {/* Registration moved to dedicated route */}
    </div>
  );
};
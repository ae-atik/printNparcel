import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Sparkles, Clock } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';

export const ComingSoonPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Animated Icon */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-r from-campus-green to-info rounded-full flex items-center justify-center animate-pulse">
            <CreditCard size={48} className="text-white" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles size={24} className="text-yellow-400 animate-bounce" />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">
            Coming Soon
          </h1>
          <p className="text-xl text-theme-text-secondary max-w-lg mx-auto">
            We're working hard to bring you a seamless credit top-up experience. 
            Stay tuned for exciting payment options!
          </p>
        </div>

        {/* Features Preview */}
        <GlassCard className="p-8 text-left">
          <h3 className="text-xl font-semibold text-theme-text mb-6 text-center">
            What's Coming
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-campus-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard size={16} className="text-campus-green" />
              </div>
              <div>
                <h4 className="font-medium text-theme-text">Multiple Payment Methods</h4>
                <p className="text-sm text-theme-text-secondary">Credit cards, PayPal, and campus cards</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-info/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-info" />
              </div>
              <div>
                <h4 className="font-medium text-theme-text">Instant Top-ups</h4>
                <p className="text-sm text-theme-text-secondary">Credits added to your account immediately</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock size={16} className="text-success" />
              </div>
              <div>
                <h4 className="font-medium text-theme-text">Auto-Reload</h4>
                <p className="text-sm text-theme-text-secondary">Set up automatic credit refills</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard size={16} className="text-warning" />
              </div>
              <div>
                <h4 className="font-medium text-theme-text">Bulk Discounts</h4>
                <p className="text-sm text-theme-text-secondary">Save more when you add larger amounts</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Call to Action */}
        <div className="space-y-4">
          <p className="text-theme-text-secondary">
            Want to be notified when this feature launches?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GlassButton
              variant="secondary"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center"
            >
              <ArrowLeft size={16} className="mr-2" />
              Go Back
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={() => navigate('/dashboard')}
              glow
            >
              Return to Dashboard
            </GlassButton>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="pt-8">
          <div className="flex items-center justify-center space-x-2 text-theme-text-secondary">
            <Clock size={16} />
            <span className="text-sm">Expected launch: Q2 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Truck, Plus, Star, Users, Clock, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Modal } from '../components/ui/Modal';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import reviewsData from '../data/reviews.json';

export const HomePage: React.FC = () => {
  const { isAuthenticated, addRole } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [printerFormData, setPrinterFormData] = useState({
    name: '',
    type: 'both',
    pricePerPageBW: '',
    pricePerPageColor: '',
    brand: '',
    model: '',
    paperSizes: 'A4,Letter',
    features: '',
    hall: '',
    room: '',
  });

  const handleActionClick = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/login', { state: { from: { pathname: path } } });
    }
  };

  const handleAddPrinter = () => {
    if (isAuthenticated) {
      setShowPrinterModal(true);
    } else {
      navigate('/login', { state: { from: { pathname: '/dashboard' } } });
    }
  };

  const handlePrinterSubmit = () => {
    // In real app, this would submit to API
    addRole('printer-owner');
    setShowPrinterModal(false);
    alert('Printer application submitted! Admin will review and approve your printer.');
    setPrinterFormData({
      name: '',
      type: 'both',
      pricePerPageBW: '',
      pricePerPageColor: '',
      brand: '',
      model: '',
      paperSizes: 'A4,Letter',
      features: '',
      hall: '',
      room: '',
    });
  };

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

      {/* User Reviews Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">What Students Say</h2>
            <p className="text-xl text-theme-text-secondary">
              Join thousands of satisfied students who trust CampusPrint for their printing and delivery needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviewsData.reviews.map((review) => (
              <GlassCard key={review.id} className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">{review.name}</h4>
                    <div className="flex items-center">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={16} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-theme-text-secondary italic">"{review.comment}"</p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-campus-green-light text-campus-green">
                    {review.serviceType}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="text-center mt-12">
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

      {/* Printer Application Modal */}
      <Modal
        isOpen={showPrinterModal}
        onClose={() => setShowPrinterModal(false)}
        title="Register Your Printer"
        size="lg"
      >
        <div className="space-y-4">
          <GlassInput
            label="Printer Name"
            value={printerFormData.name}
            onChange={(e) => setPrinterFormData(prev => ({ ...prev, name: e.target.value }))}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text mb-2">Printer Type</label>
              <select
                value={printerFormData.type}
                onChange={(e) => setPrinterFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-component text-theme-text focus:outline-none focus:border-campus-green"
              >
                <option value="color">Color Only</option>
                <option value="bw">Black & White Only</option>
                <option value="both">Both Color & B&W</option>
              </select>
            </div>
            <GlassInput
              label="B&W Price per Page ($)"
              type="number"
              step="0.01"
              value={printerFormData.pricePerPageBW}
              onChange={(e) => setPrinterFormData(prev => ({ ...prev, pricePerPageBW: e.target.value }))}
            />
          </div>

          {printerFormData.type !== 'bw' && (
            <GlassInput
              label="Color Price per Page ($)"
              type="number"
              step="0.01"
              value={printerFormData.pricePerPageColor}
              onChange={(e) => setPrinterFormData(prev => ({ ...prev, pricePerPageColor: e.target.value }))}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <GlassInput
              label="Brand"
              value={printerFormData.brand}
              onChange={(e) => setPrinterFormData(prev => ({ ...prev, brand: e.target.value }))}
            />
            <GlassInput
              label="Model"
              value={printerFormData.model}
              onChange={(e) => setPrinterFormData(prev => ({ ...prev, model: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <GlassInput
              label="Hall"
              value={printerFormData.hall}
              onChange={(e) => setPrinterFormData(prev => ({ ...prev, hall: e.target.value }))}
            />
            <GlassInput
              label="Room (Optional)"
              value={printerFormData.room}
              onChange={(e) => setPrinterFormData(prev => ({ ...prev, room: e.target.value }))}
            />
          </div>

          <GlassInput
            label="Paper Sizes (comma separated)"
            value={printerFormData.paperSizes}
            onChange={(e) => setPrinterFormData(prev => ({ ...prev, paperSizes: e.target.value }))}
            helperText="e.g., A4, Letter, Legal"
          />

          <GlassInput
            label="Features (comma separated)"
            value={printerFormData.features}
            onChange={(e) => setPrinterFormData(prev => ({ ...prev, features: e.target.value }))}
            helperText="e.g., Duplex, Stapling, Hole Punch"
          />

          <div className="flex gap-4 pt-4">
            <GlassButton
              variant="secondary"
              onClick={() => setShowPrinterModal(false)}
              className="flex-1"
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={handlePrinterSubmit}
              className="flex-1"
            >
              Submit Application
            </GlassButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
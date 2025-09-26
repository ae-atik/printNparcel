// frontend/src/pages/PrinterRegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPrinter } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';

export const PrinterRegisterPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    printerLocation: '',
    rateMono: '1',
    rateColor: '1',
    paperSize: 'A4',
    colorSupport: false,
    duplexSupport: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'rateMono' || name === 'rateColor') {
      // Ensure rates don't go below 0
      const numValue = Math.max(0, Number(value) || 0);
      setFormData(prev => ({ ...prev, [name]: numValue.toString() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      addToast({ type: 'error', title: 'Not logged in', message: 'Please log in first.' });
      return;
    }

    // Validate required fields
    if (!formData.printerLocation.trim()) {
      addToast({ type: 'error', title: 'Missing Information', message: 'Printer location is required.' });
      return;
    }

    const monoRate = Number(formData.rateMono);
    const colorRate = Number(formData.rateColor);

    if (monoRate < 0 || colorRate < 0) {
      addToast({ type: 'error', title: 'Invalid Rates', message: 'Rates cannot be negative.' });
      return;
    }

    // Map form data to match backend API format
    const payload = {
      name: formData.printerLocation.trim(),  // Backend expects 'name' field for printer location
      pricePerPageBW: monoRate,              // Backend expects 'pricePerPageBW' for mono rate
      pricePerPageColor: colorRate,          // Backend expects 'pricePerPageColor' for color rate
      paperSize: formData.paperSize,
      colorSupport: formData.colorSupport,
      duplexSupport: formData.duplexSupport
    };

    const res = await createPrinter(payload, localStorage.getItem("auth_token") || undefined);
    if (!res.ok) {
      addToast({
        type: 'error',
        title: 'Registration failed',
        message: res.error?.message || 'Please try again.'
      });
      return;
    }

    addToast({ 
      type: 'success', 
      title: 'Printer Registered', 
      message: 'Your printer is pending admin approval.' 
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold gradient-text mb-6 text-center">Register Your Printer</h1>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <GlassInput
              label="Printer Location"
              name="printerLocation"
              value={formData.printerLocation}
              onChange={handleChange}
              placeholder="e.g., Ground Floor Hall A, Room 101"
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="Mono Rate (৳ per page)"
                name="rateMono"
                type="number"
                min="0"
                step="1"
                value={formData.rateMono}
                onChange={handleChange}
                placeholder="e.g., 2"
                required
              />
              <GlassInput
                label="Color Rate (৳ per page)"
                name="rateColor"
                type="number"
                min="0"
                step="1"
                value={formData.rateColor}
                onChange={handleChange}
                placeholder="e.g., 5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text mb-2">Paper Size</label>
              <select
                name="paperSize"
                value={formData.paperSize}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-component text-theme-text focus:outline-none focus:border-campus-green"
              >
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-theme-text">Printer Features</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="colorSupport"
                    name="colorSupport"
                    checked={formData.colorSupport}
                    onChange={handleChange}
                    className="w-4 h-4 text-campus-green bg-glass-bg border-glass-border rounded focus:ring-campus-green focus:ring-2"
                  />
                  <label htmlFor="colorSupport" className="text-sm font-medium text-theme-text">
                    Color Support
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="duplexSupport"
                    name="duplexSupport"
                    checked={formData.duplexSupport}
                    onChange={handleChange}
                    className="w-4 h-4 text-campus-green bg-glass-bg border-glass-border rounded focus:ring-campus-green focus:ring-2"
                  />
                  <label htmlFor="duplexSupport" className="text-sm font-medium text-theme-text">
                    Duplex Support (Double-sided)
                  </label>
                </div>
              </div>
            </div>

            <GlassButton variant="primary" type="submit" className="w-full" glow>
              Register Printer
            </GlassButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

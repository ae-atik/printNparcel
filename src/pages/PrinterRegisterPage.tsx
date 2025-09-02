import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';

export const PrinterRegisterPage: React.FC = () => {
  const { addRole } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, send payload to API
    addRole('printer-owner');
    alert('Printer application submitted! Admin will review and approve your printer.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold gradient-text mb-6 text-center">Register Your Printer</h1>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <GlassInput
              label="Printer Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">Printer Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-component text-theme-text focus:outline-none focus:border-campus-green"
                >
                  <option value="color">Color Only</option>
                  <option value="bw">Black & White Only</option>
                  <option value="both">Both Color & B&W</option>
                </select>
              </div>
              <GlassInput
                label="B&W Price per Page (৳)"
                name="pricePerPageBW"
                type="number"
                step="0.01"
                value={formData.pricePerPageBW}
                onChange={handleChange}
                required
              />
            </div>

            {formData.type !== 'bw' && (
              <GlassInput
                label="Color Price per Page (৳)"
                name="pricePerPageColor"
                type="number"
                step="0.01"
                value={formData.pricePerPageColor}
                onChange={handleChange}
                required={formData.type !== 'bw'}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
              />
              <GlassInput
                label="Model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="Hall"
                name="hall"
                value={formData.hall}
                onChange={handleChange}
                required
              />
              <GlassInput
                label="Room (Optional)"
                name="room"
                value={formData.room}
                onChange={handleChange}
              />
            </div>

            <GlassInput
              label="Paper Sizes (comma separated)"
              name="paperSizes"
              value={formData.paperSizes}
              onChange={handleChange}
            />

            <GlassInput
              label="Features (comma separated)"
              name="features"
              value={formData.features}
              onChange={handleChange}
            />

            <GlassButton variant="primary" type="submit" className="w-full" glow>
              Submit Application
            </GlassButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

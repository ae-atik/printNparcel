import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { 
  DollarSign, 
  FileText, 
  Printer, 
  Truck, 
  Plus, 
  Settings,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  Star
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, currentRole, addRole } = useAuth();
  const [showPrinterApplication, setShowPrinterApplication] = useState(false);
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

  const navigate = useNavigate();

  const handlePrinterApplication = () => {
    // In real app, this would submit to API
    addRole('printer-owner');
    setShowPrinterApplication(false);
    alert('Printer application submitted! Admin will review and approve your printer.');
  };

  const getDashboardStats = () => {
    switch (currentRole) {
      case 'user':
        return [
          { label: 'Print Credits', value: `$${user?.credits.toFixed(2)}`, icon: DollarSign, color: 'text-success' },
          { label: 'Documents Printed', value: '24', icon: FileText, color: 'text-info' },
          { label: 'Active Orders', value: '2', icon: Clock, color: 'text-warning' },
        ];
      case 'printer-owner':
        return [
          { label: 'Monthly Revenue', value: '$342.50', icon: DollarSign, color: 'text-success' },
          { label: 'Print Jobs', value: '89', icon: FileText, color: 'text-info' },
          { label: 'Active Printers', value: '3', icon: Printer, color: 'text-campus-green' },
        ];
      case 'admin':
        return [
          { label: 'Total Users', value: '1,234', icon: Users, color: 'text-info' },
          { label: 'Active Printers', value: '45', icon: Printer, color: 'text-success' },
          { label: 'Monthly Revenue', value: '$12,450', icon: DollarSign, color: 'text-success' },
        ];
      default:
        return [];
    }
  };

  const getRecentActivity = () => {
    switch (currentRole) {
      case 'user':
        return [
          { id: 1, action: 'Printed lecture notes', time: '2 hours ago', status: 'completed' },
          { id: 2, action: 'Uploaded research paper', time: '1 day ago', status: 'pending' },
          { id: 3, action: 'Added $20 credits', time: '3 days ago', status: 'completed' },
        ];
      case 'printer-owner':
        return [
          { id: 1, action: 'Job completed - Biology notes', time: '30 minutes ago', status: 'completed' },
          { id: 2, action: 'New print request', time: '1 hour ago', status: 'pending' },
          { id: 3, action: 'Printer maintenance completed', time: '2 hours ago', status: 'completed' },
        ];
      case 'admin':
        return [
          { id: 1, action: 'New printer registered', time: '1 hour ago', status: 'pending' },
          { id: 2, action: 'User report resolved', time: '2 hours ago', status: 'completed' },
          { id: 3, action: 'System maintenance completed', time: '1 day ago', status: 'completed' },
        ];
      default:
        return [];
    }
  };

  const stats = getDashboardStats();
  const recentActivity = getRecentActivity();

  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            {currentRole === 'user' ? 'User Dashboard' : 
             currentRole === 'printer-owner' ? 'Printer Owner Dashboard' : 
             'Admin Dashboard'}
          </h1>
          <p className="text-dark-text-secondary">Welcome back, {user?.firstName}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-text-secondary">{stat.label}</p>
                    <p className="text-2xl font-bold text-dark-text">{stat.value}</p>
                  </div>
                  <Icon size={24} className={stat.color} />
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Role-specific content */}
        {currentRole === 'user' && !user?.roles.includes('printer-owner') && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Become a Printer Owner</h3>
                <p className="text-dark-text-secondary">
                  Register your printer and start earning money from print jobs
                </p>
              </div>
              <GlassButton
                variant="primary"
                onClick={() => setShowPrinterApplication(true)}
              >
                Apply Now
              </GlassButton>
            </div>
          </GlassCard>
        )}

        {/* Recent Activity */}
        <GlassCard>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-dark-text mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-glass-border last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-dark-text">{activity.action}</p>
                    <p className="text-xs text-dark-text-secondary">{activity.time}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activity.status === 'completed' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-dark-text mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentRole === 'user' && (
                <>
                  <GlassButton variant="secondary" className="p-4 h-auto flex-col" onClick={() => navigate('/printers')}>
                    <Printer size={24} className="mb-2" />
                    <span className="font-medium">Request Print</span>
                    <span className="text-xs text-dark-text-secondary">Find printers and print documents</span>
                  </GlassButton>
                  <GlassButton variant="secondary" className="p-4 h-auto flex-col" onClick={() => navigate('/delivery')}>
                    <Truck size={24} className="mb-2" />
                    <span className="font-medium">Request Delivery</span>
                    <span className="text-xs text-dark-text-secondary">Get items delivered on campus</span>
                  </GlassButton>
                  <GlassButton variant="secondary" className="p-4 h-auto flex-col">
                    <DollarSign size={24} className="mb-2" />
                    <span className="font-medium">Add Credits</span>
                    <span className="text-xs text-dark-text-secondary">Top up your account</span>
                  </GlassButton>
                </>
              )}
              {currentRole === 'printer-owner' && (
                <>
                  <GlassButton variant="secondary" className="p-4 h-auto flex-col">
                    <Plus size={24} className="mb-2" />
                    <span className="font-medium">Add Printer</span>
                    <span className="text-xs text-dark-text-secondary">Register new printer</span>
                  </GlassButton>
                  <GlassButton variant="secondary" className="p-4 h-auto flex-col">
                    <Settings size={24} className="mb-2" />
                    <span className="font-medium">Manage Printers</span>
                    <span className="text-xs text-dark-text-secondary">Update printer settings</span>
                  </GlassButton>
                </>
              )}
              {currentRole === 'admin' && (
                <>
                  <GlassButton variant="secondary" className="p-4 h-auto flex-col">
                    <Users size={24} className="mb-2" />
                    <span className="font-medium">User Management</span>
                    <span className="text-xs text-dark-text-secondary">Manage users</span>
                  </GlassButton>
                  <GlassButton variant="secondary" className="p-4 h-auto flex-col">
                    <BarChart3 size={24} className="mb-2" />
                    <span className="font-medium">Analytics</span>
                    <span className="text-xs text-dark-text-secondary">View platform stats</span>
                  </GlassButton>
                </>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Printer Application Modal */}
        {showPrinterApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Apply as Printer Owner</h3>
                <div className="space-y-4">
                  <GlassInput
                    label="Printer Name"
                    value={printerFormData.name}
                    onChange={(e) => setPrinterFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-text mb-2">Printer Type</label>
                      <select
                        value={printerFormData.type}
                        onChange={(e) => setPrinterFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-4 py-3 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-component text-dark-text focus:outline-none focus:border-campus-green"
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
                      onClick={() => setShowPrinterApplication(false)}
                      className="flex-1"
                    >
                      Cancel
                    </GlassButton>
                    <GlassButton
                      variant="primary"
                      onClick={handlePrinterApplication}
                      className="flex-1"
                    >
                      Submit Application
                    </GlassButton>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};
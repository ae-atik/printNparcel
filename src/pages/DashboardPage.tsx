import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { Modal } from '../components/ui/Modal';
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
  Star,
  Edit,
  Trash2,
} from 'lucide-react';
import activitiesData from '../data/activities.json';
import printersData from '../data/printers.json';

export const DashboardPage: React.FC = () => {
  const { user, currentRole, addRole } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showPrinterApplication, setShowPrinterApplication] = useState(false);
  const [showMyPrinters, setShowMyPrinters] = useState(false);
  const [showEditPrinter, setShowEditPrinter] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<any>(null);
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

  const myPrinters = printersData.printers.filter(printer => printer.ownerId === user?.id);

  const handlePrinterApplication = () => {
    // In real app, this would submit to API
    addRole('printer-owner');
    setShowPrinterApplication(false);
    addToast({
      type: 'success',
      title: 'Printer Application Submitted',
      message: 'Admin will review and approve your printer.'
    });
  };

  const handleEditPrinter = (printer: any) => {
    setSelectedPrinter(printer);
    setPrinterFormData({
      name: printer.name,
      type: printer.type,
      pricePerPageBW: printer.pricePerPageBW.toString(),
      pricePerPageColor: printer.pricePerPageColor.toString(),
      brand: printer.specifications.brand,
      model: printer.specifications.model,
      paperSizes: printer.specifications.paperSizes.join(','),
      features: printer.specifications.features.join(','),
      hall: printer.location.hall,
      room: printer.location.room || '',
    });
    setShowEditPrinter(true);
  };

  const handleUpdatePrinter = () => {
    // In real app, this would update via API
    setShowEditPrinter(false);
    setSelectedPrinter(null);
    addToast({
      type: 'success',
      title: 'Printer Updated',
      message: 'Your printer details have been updated successfully.'
    });
  };

  const handleRemovePrinter = (printerId: string, printerName: string) => {
    if (window.confirm(`Are you sure you want to remove "${printerName}"? This action cannot be undone.`)) {
      // In real app, this would delete via API
      addToast({
        type: 'success',
        title: 'Printer Removed',
        message: `"${printerName}" has been removed successfully.`
      });
    }
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
    return activitiesData.activities[currentRole] || [];
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
          <p className="text-theme-text-secondary">Welcome back, {user?.firstName}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-text-secondary">{stat.label}</p>
                    <p className="text-2xl font-bold text-theme-text">{stat.value}</p>
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
                <p className="text-theme-text-secondary">
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
            <h2 className="text-lg font-semibold text-theme-text mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-glass-border last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-theme-text">{activity.action}</p>
                    <p className="text-xs text-theme-text-secondary">{activity.time}</p>
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
            <h2 className="text-lg font-semibold text-theme-text mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentRole === 'user' && (
                <>
                  <GlassButton 
                    variant="secondary" 
                    className="p-4 h-auto flex-col"
                    onClick={() => navigate('/printers')}
                  >
                    <FileText size={24} className="mb-2" />
                    <span className="font-medium">Request Print</span>
                    <span className="text-xs text-theme-text-secondary">Upload files to print</span>
                  </GlassButton>
                  <GlassButton 
                    variant="secondary" 
                    className="p-4 h-auto flex-col"
                    onClick={() => navigate('/coming-soon')}
                  >
                    <DollarSign size={24} className="mb-2" />
                    <span className="font-medium">Add Credits</span>
                    <span className="text-xs text-theme-text-secondary">Top up your account</span>
                  </GlassButton>
                  <GlassButton 
                    variant="secondary" 
                    className="p-4 h-auto flex-col"
                    onClick={() => navigate('/delivery')}
                  >
                    <Truck size={24} className="mb-2" />
                    <span className="font-medium">Request Delivery</span>
                    <span className="text-xs text-theme-text-secondary">Get items delivered</span>
                  </GlassButton>
                </>
              )}
              {currentRole === 'printer-owner' && (
                <>
                  <GlassButton
                    variant="secondary"
                    className="p-4 h-auto flex-col"
                    onClick={() => navigate('/printers/add')}
                  >
                    <Plus size={24} className="mb-2" />
                    <span className="font-medium">Add Printer</span>
                    <span className="text-xs text-theme-text-secondary">Register new printer</span>
                  </GlassButton>
                  <GlassButton 
                    variant="secondary" 
                    className="p-4 h-auto flex-col"
                    onClick={() => setShowMyPrinters(true)}
                  >
                    <Settings size={24} className="mb-2" />
                    <span className="font-medium">Manage Printers</span>
                    <span className="text-xs text-theme-text-secondary">Update printer settings</span>
                  </GlassButton>
                </>
              )}
              {currentRole === 'admin' && (
                <>
                  <GlassButton 
                    variant="secondary" 
                    className="p-4 h-auto flex-col"
                    onClick={() => navigate('/admin')}
                  >
                    <Users size={24} className="mb-2" />
                    <span className="font-medium">User Management</span>
                    <span className="text-xs text-theme-text-secondary">Manage users</span>
                  </GlassButton>
                  <GlassButton 
                    variant="secondary" 
                    className="p-4 h-auto flex-col"
                    onClick={() => navigate('/admin')}
                  >
                    <Printer size={24} className="mb-2" />
                    <span className="font-medium">Printer Management</span>
                    <span className="text-xs text-theme-text-secondary">Manage printers</span>
                  </GlassButton>
                  <GlassButton 
                    variant="secondary" 
                    className="p-4 h-auto flex-col"
                    onClick={() => navigate('/admin')}
                  >
                    <BarChart3 size={24} className="mb-2" />
                    <span className="font-medium">Analytics</span>
                    <span className="text-xs text-theme-text-secondary">View platform stats</span>
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

        {/* My Printers Modal */}
        {showMyPrinters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-6">My Printers</h3>
                
                {myPrinters.length === 0 ? (
                  <div className="text-center py-8">
                    <Printer size={48} className="mx-auto text-theme-text-muted mb-4" />
                    <p className="text-theme-text-secondary">No printers registered yet</p>
                    <GlassButton
                      variant="primary"
                      className="mt-4"
                      onClick={() => {
                        setShowMyPrinters(false);
                        setShowPrinterApplication(true);
                      }}
                    >
                      Add Your First Printer
                    </GlassButton>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myPrinters.map((printer) => (
                      <div key={printer.id} className="p-4 bg-glass-bg rounded-component border border-glass-border">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-theme-text">{printer.name}</h4>
                            <p className="text-sm text-theme-text-secondary">
                              {printer.specifications.brand} {printer.specifications.model}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            printer.status === 'online' 
                              ? 'bg-success/10 text-success' 
                              : printer.status === 'busy'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-danger/10 text-danger'
                          }`}>
                            {printer.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-theme-text-secondary mb-4">
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-2" />
                            <span>{printer.location.hall} {printer.location.room}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign size={14} className="mr-2" />
                            <span>B&W: ${printer.pricePerPageBW} | Color: ${printer.pricePerPageColor}</span>
                          </div>
                          <div className="flex items-center">
                            <Star size={14} className="mr-2" />
                            <span>Rating: {printer.rating} ({printer.totalJobs} jobs)</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <GlassButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditPrinter(printer)}
                            className="flex-1"
                          >
                            <Edit size={16} className="mr-1" />
                            Edit
                          </GlassButton>
                          <GlassButton
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemovePrinter(printer.id, printer.name)}
                            className="flex-1"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Remove
                          </GlassButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-3 pt-6 border-t border-glass-border">
                  <GlassButton
                    variant="secondary"
                    onClick={() => setShowMyPrinters(false)}
                    className="flex-1"
                  >
                    Close
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    onClick={() => {
                      setShowMyPrinters(false);
                      setShowPrinterApplication(true);
                    }}
                    className="flex-1"
                  >
                    <Plus size={16} className="mr-2" />
                    Add New Printer
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Edit Printer Modal */}
        {showEditPrinter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Edit Printer: {selectedPrinter?.name}</h3>
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
                      onClick={() => {
                        setShowEditPrinter(false);
                        setSelectedPrinter(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </GlassButton>
                    <GlassButton
                      variant="primary"
                      onClick={handleUpdatePrinter}
                      className="flex-1"
                    >
                      Update Printer
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
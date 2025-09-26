import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { ActivityItem } from '../components/ui/ActivityItem';
import { 
  Coins, 
  FileText, 
  Printer, 
  Truck, 
  Plus, 
  Settings,
  BarChart3,
  Users,
  Clock,
  MapPin,
  Star,
  Edit,
  MessageCircle,
} from 'lucide-react';
import { listOwnerPrinters, getMyActivities, getPrinterOwnerActivities } from '../lib/api';
import { Printer as PrinterType } from '../types';
import activitiesData from '../data/activities.json';
import printersData from '../data/printers.json';


export const DashboardPage: React.FC = () => {
  const { user, currentRole, isDemo } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showMyPrinters, setShowMyPrinters] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [displayedActivities, setDisplayedActivities] = useState<any[]>([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const ACTIVITIES_PER_PAGE = 5;

  // Load my printers from backend, including pending; hide declined/rejected
  const [myPrinters, setMyPrinters] = useState<PrinterType[]>([]);

  const loadMyPrinters = async () => {
    if (!user?.id) return;
    let canceled = false;
    try {
      if (isDemo) {
        // Use frontend demo data - filter printers owned by demo user
        if (!canceled) {
          const demoUserPrinters = printersData.printers.filter(p => 
            p.ownerId === user.id || p.ownerId === "user-2" // "user-2" is a demo printer owner in the JSON
          );
          setMyPrinters(demoUserPrinters as PrinterType[]);
        }
        return;
      }

      // Use real backend data
      const token = localStorage.getItem("auth_token");
      const res = await listOwnerPrinters(user.id, token || undefined);
      if (canceled) return;
      if (res.ok && Array.isArray(res.data)) {
        // Filter out declined printers from owner's dashboard
        const filteredPrinters = (res.data as PrinterType[]).filter(p => p.status !== 'declined');
        setMyPrinters(filteredPrinters);
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to load printers', message: 'Please try again later.' });
    }
    return () => {
      canceled = true;
    };
  };

  const loadActivities = async () => {
    if (!user?.id || isDemo) {
      // Use static data for demo mode
      const activityRole = currentRole === 'printer_owner' ? 'printer-owner' : currentRole;
      const staticActivities = activitiesData.activities[activityRole as keyof typeof activitiesData.activities] || [];
      setActivities(staticActivities);
      setDisplayedActivities(staticActivities.slice(0, ACTIVITIES_PER_PAGE));
      return;
    }
    
    setLoadingActivities(true);
    try {
      const token = localStorage.getItem("auth_token");
      let res;
      
      if (currentRole === 'printer_owner') {
        res = await getPrinterOwnerActivities(10, token || undefined);
      } else {
        res = await getMyActivities(10, token || undefined);
      }
      
      if (res.ok) {
        setActivities(res.data as any[]);
        setDisplayedActivities((res.data as any[]).slice(0, ACTIVITIES_PER_PAGE));
      } else {
        console.error('Failed to load activities:', res.error);
        // Fallback to static data
        const activityRole = currentRole === 'printer_owner' ? 'printer-owner' : currentRole;
        const staticActivities = activitiesData.activities[activityRole as keyof typeof activitiesData.activities] || [];
        setActivities(staticActivities);
        setDisplayedActivities(staticActivities.slice(0, ACTIVITIES_PER_PAGE));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      // Fallback to static data
      const activityRole = currentRole === 'printer_owner' ? 'printer-owner' : currentRole;
      const staticActivities = activitiesData.activities[activityRole as keyof typeof activitiesData.activities] || [];
      setActivities(staticActivities);
    }
    setLoadingActivities(false);
  };

  useEffect(() => {
    loadMyPrinters();
    loadActivities();
  }, [user?.id, isDemo, currentRole]);

  // When the current user profile updates elsewhere (e.g., avatar), keep our cards fresh
  useEffect(() => {
    function onUserUpdated() {
      // no-op for now, but keeps pattern consistent with AdminPage
    }
    window.addEventListener('auth:user-updated', onUserUpdated as EventListener);
    return () => window.removeEventListener('auth:user-updated', onUserUpdated as EventListener);
  }, []);

  const handleEditPrinter = (printer: PrinterType) => {
    // Navigate to unified printer form with edit mode
    navigate('/printers/add', { state: { editPrinter: printer } });
  };

  const contactAdminForRemoval = (printer: PrinterType) => {
    // Open WhatsApp with pre-filled message for admin
    const message = encodeURIComponent(`Hello Admin, I would like to request removal of my printer: ${printer.name} (ID: ${printer.id}) located at ${printer.location.hall} ${printer.location.room}. Please help me remove this printer from the system.`);
    window.open(`https://wa.me/1234567890?text=${message}`, '_blank');
  };

  const getDashboardStats = () => {
    switch (currentRole) {
      case 'user':
        return [
          { label: 'Print Credits', value: `৳${user?.credits.toFixed(2)}`, icon: Coins, color: 'text-success' },
          { label: 'Documents Printed', value: '24', icon: FileText, color: 'text-info' },
          { label: 'Active Orders', value: '2', icon: Clock, color: 'text-warning' },
        ];
      case 'printer_owner':
        return [
          { label: 'Monthly Revenue', value: '৳342.50', icon: Coins, color: 'text-success' },
          { label: 'Print Jobs', value: '89', icon: FileText, color: 'text-info' },
          { label: 'Active Printers', value: '3', icon: Printer, color: 'text-campus-green' },
        ];
      case 'admin':
        return [
          { label: 'Total Users', value: '1,234', icon: Users, color: 'text-info' },
          { label: 'Active Printers', value: '45', icon: Printer, color: 'text-success' },
          { label: 'Monthly Revenue', value: '৳12,450', icon: Coins, color: 'text-success' },
        ];
      default:
        return [];
    }
  };

  const refreshActivities = () => {
    loadActivities();
  };

  // Listen for activity updates
  useEffect(() => {
    const handleActivityUpdate = () => {
      refreshActivities();
    };
    
    window.addEventListener('activity:refresh', handleActivityUpdate);
    window.addEventListener('print-request:created', handleActivityUpdate);
    window.addEventListener('print-request:status-updated', handleActivityUpdate);
    
    return () => {
      window.removeEventListener('activity:refresh', handleActivityUpdate);
      window.removeEventListener('print-request:created', handleActivityUpdate);
      window.removeEventListener('print-request:status-updated', handleActivityUpdate);
    };
  }, []);

  const getRecentActivity = () => {
    return displayedActivities;
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    
    // If we have more activities cached, just show more of them
    if (displayedActivities.length < activities.length) {
      const nextBatch = activities.slice(displayedActivities.length, displayedActivities.length + ACTIVITIES_PER_PAGE);
      setDisplayedActivities(prev => [...prev, ...nextBatch]);
    } else if (!isDemo) {
      // Load more from API
      try {
        const token = localStorage.getItem("auth_token");
        let res;
        
        if (currentRole === 'printer_owner') {
          res = await getPrinterOwnerActivities(activities.length + ACTIVITIES_PER_PAGE, token || undefined);
        } else {
          res = await getMyActivities(activities.length + ACTIVITIES_PER_PAGE, token || undefined);
        }
        
        if (res.ok) {
          const newActivities = res.data as any[];
          setActivities(newActivities);
          setDisplayedActivities(newActivities.slice(0, displayedActivities.length + ACTIVITIES_PER_PAGE));
        }
      } catch (error) {
        console.error('Failed to load more activities:', error);
      }
    }
    
    setLoadingMore(false);
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
             currentRole === 'printer_owner' ? 'Printer Owner Dashboard' : 
             'Admin Dashboard'}
          </h1>
          <p className="text-theme-text-secondary">Welcome, {user?.firstName} {user?.lastName}!</p>
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
        {currentRole === 'user' && !user?.roles.includes('printer_owner') && (
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
                onClick={() => navigate('/printers/add')}
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
            <div className="space-y-0">
              {loadingActivities ? (
                <div className="flex items-center justify-center py-8">
                  <Clock className="animate-spin mr-2" size={16} />
                  <span className="text-theme-text-secondary">Loading activities...</span>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8 text-theme-text-secondary">
                  No recent activities
                </div>
              ) : (
                <>
                  {recentActivity.map((activity: any) => (
                    <ActivityItem 
                      key={activity.id} 
                      activity={{
                        ...activity,
                        description: activity.description || activity.action,
                      }} 
                    />
                  ))}
                  {(displayedActivities.length < activities.length || (!isDemo && activities.length >= ACTIVITIES_PER_PAGE)) && (
                    <div className="pt-4 border-t border-white/10">
                      <GlassButton
                        variant="secondary"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="w-full"
                      >
                        {loadingMore ? (
                          <div className="flex items-center justify-center">
                            <Clock className="animate-spin mr-2" size={16} />
                            Loading...
                          </div>
                        ) : (
                          `See More (${activities.length - displayedActivities.length}+ more)`
                        )}
                      </GlassButton>
                    </div>
                  )}
                </>
              )}
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
                    <Coins size={24} className="mb-2" />
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
              {currentRole === 'printer_owner' && (
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
                  <GlassButton 
                    variant="secondary" 
                    className="p-4 h-auto flex-col"
                    onClick={() => navigate('/printer-dashboard')}
                  >
                    <FileText size={24} className="mb-2" />
                    <span className="font-medium">Print Requests</span>
                    <span className="text-xs text-theme-text-secondary">Manage print jobs</span>
                  </GlassButton>
                </>
              )}
              {currentRole === 'admin' && (
                <>
                  <GlassButton 
                    variant="secondary" 
                    className="p-4 h-auto flex-col"
                    onClick={() => navigate('/admin#users')}
                  >
                    <Users size={24} className="mb-2" />
                    <span className="font-medium">User Management</span>
                    <span className="text-xs text-theme-text-secondary">Manage users</span>
                  </GlassButton>
                  <GlassButton 
                    variant="secondary" 
                    className="p-4 h-auto flex-col"
                    onClick={() => navigate('/admin#printers')}
                  >
                    <Printer size={24} className="mb-2" />
                    <span className="font-medium">Printer Management</span>
                    <span className="text-xs text-theme-text-secondary">Manage printers</span>
                  </GlassButton>
                  <GlassButton 
                    variant="secondary" 
                    className="p-4 h-auto flex-col"
                    onClick={() => navigate('/admin#analytics')}
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
                      onClick={() => navigate('/printers/add')}
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
                              : printer.status === 'pending'
                              ? 'bg-warning/10 text-warning'
                              : printer.status === 'declined'
                              ? 'bg-danger/20 text-danger'
                              : 'bg-neutral-500/20 text-neutral-400'
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
                            <Coins size={14} className="mr-2" />
                            <span>B&W: ৳{printer.pricePerPageBW.toFixed(2)} | Color: ৳{printer.pricePerPageColor.toFixed(2)}</span>
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
                            variant="secondary"
                            size="sm"
                            onClick={() => contactAdminForRemoval(printer)}
                            className="flex-1"
                          >
                            <MessageCircle size={18} className="mr-1" />
                            Contact Admin
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
                    onClick={() => navigate('/printers/add')}
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

      </div>
    </div>
  );
};

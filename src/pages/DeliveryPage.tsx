import { useState, useEffect } from 'react';
import { 
  Plus, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { listDeliveries, API_BASE } from '../lib/api';
import { Badge } from '../components/ui/Badge';

interface BackendUser {
  userId: number;
  firstName: string;
  lastName?: string;
  profilePictureUrl?: string;
}

interface BackendDeliveryRequest {
  deliveryReqId: number;
  imageUrl?: string;
  itemDescription: string;
  pickupLocation: string;
  dropLocation: string;
  deliveryStatus: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELLED' | 'EXPIRED';
  deliveryTime?: string;
  orderBy: BackendUser;
  orderTo?: BackendUser;
}

type TabType = 'available' | 'active';

export default function DeliveryPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { isDark } = useTheme();
  
  const [activeTab, setActiveTab] = useState<TabType>('available');
  const [availableDeliveries, setAvailableDeliveries] = useState<BackendDeliveryRequest[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<BackendDeliveryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    itemDescription: '',
    pickupLocation: '',
    dropLocation: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (user) {
      fetchDeliveries();
    }
  }, [user]);

  const fetchDeliveries = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
      
      // Fetch available deliveries (pending with no assignee)
      const availableResponse = await listDeliveries('pending', token || undefined);
      
      // Fetch my active deliveries (where I'm involved and has assignee)
      const activeResponse = await listDeliveries('active', token || undefined);
      
      // Process available deliveries
      if (availableResponse.ok) {
        let availableData = availableResponse.data;
        if (availableData && typeof availableData === 'object' && 'data' in availableData) {
          availableData = (availableData as any).data;
        }
        if (Array.isArray(availableData)) {
          setAvailableDeliveries(availableData);
        }
      }
      
      // Process active deliveries
      if (activeResponse.ok) {
        let activeData = activeResponse.data;
        if (activeData && typeof activeData === 'object' && 'data' in activeData) {
          activeData = (activeData as any).data;
        }
        if (Array.isArray(activeData)) {
          setActiveDeliveries(activeData);
        }
      }
      
      if (!availableResponse.ok && !activeResponse.ok) {
        setError('Failed to load deliveries. Please try logging in again.');
      }
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      setError('Failed to load deliveries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDelivery = async () => {
    if (!user) {
      addToast({
        type: 'error',
        title: 'Please log in to create delivery requests'
      });
      return;
    }

    if (!formData.itemDescription.trim() || !formData.pickupLocation.trim() || !formData.dropLocation.trim()) {
      addToast({
        type: 'warning',
        title: 'Please fill in all required fields',
        message: 'Item description, pickup location, and drop location are required.'
      });
      return;
    }

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/deliveries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Delivery request created successfully',
          message: 'Your delivery request is now available for others to accept.'
        });
        setFormData({
          itemDescription: '',
          pickupLocation: '',
          dropLocation: '',
          imageUrl: ''
        });
        setShowCreateForm(false);
        fetchDeliveries();
      } else {
        console.error('Create delivery error:', response.status);
        addToast({
          type: 'error',
          title: 'Failed to create delivery request',
          message: 'Please try again or contact support if the issue persists.'
        });
      }
    } catch (error) {
      console.error('Error creating delivery:', error);
      addToast({
        type: 'error',
        title: 'Failed to create delivery request',
        message: 'Please check your connection and try again.'
      });
    }
  };

  const handleAcceptDelivery = async (deliveryId: number) => {
    if (!user) {
      addToast({
        type: 'error',
        title: 'Please log in to accept deliveries'
      });
      return;
    }

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/deliveries/${deliveryId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Delivery accepted successfully',
          message: 'You are now responsible for this delivery.'
        });
        fetchDeliveries();
        setActiveTab('active'); // Switch to active tab after accepting
      } else {
        // Parse error response to get specific error message
        let errorMessage = 'This delivery may have already been accepted by someone else.';
        try {
          const errorResponse = await response.json();
          if (errorResponse.error) {
            errorMessage = errorResponse.error;
          }
        } catch (_) {
          // Fallback: try to parse as text
          try {
            const errorText = await response.text();
            if (errorText.includes('cannot accept your own')) {
              errorMessage = 'You cannot accept your own delivery request.';
            } else if (errorText.includes('already assigned')) {
              errorMessage = 'This delivery has already been assigned to someone else.';
            }
          } catch (_) {
            // Use default message if all parsing fails
          }
        }
        
        console.error('Accept delivery error:', response.status);
        addToast({
          type: 'error',
          title: 'Failed to accept delivery',
          message: errorMessage
        });
        fetchDeliveries(); // Refresh to show current state
      }
    } catch (error) {
      console.error('Error accepting delivery:', error);
      addToast({
        type: 'error',
        title: 'Failed to accept delivery',
        message: 'Please check your connection and try again.'
      });
    }
  };

  const handleUpdateStatus = async (deliveryId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Status updated successfully'
        });
        fetchDeliveries();
      } else {
        console.error('Update status error:', response.status);
        addToast({
          type: 'error',
          title: 'Failed to update status',
          message: 'Please try again.'
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      addToast({
        type: 'error',
        title: 'Failed to update status',
        message: 'Please check your connection and try again.'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'IN_PROGRESS':
        return <Truck className="w-4 h-4 text-blue-500" />;
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'EXPIRED':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'DELIVERED':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'EXPIRED':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const canAcceptDelivery = (delivery: BackendDeliveryRequest) => {
    return delivery.deliveryStatus === 'PENDING' && 
           delivery.orderBy?.userId !== parseInt(user?.id || '0') && 
           !delivery.orderTo;
  };

  const canUpdateStatus = (delivery: BackendDeliveryRequest) => {
    const userId = parseInt(user?.id || '0');
    // Only customer (orderBy) or delivery partner (orderTo) can update status, and delivery must not be finished
    return (delivery.orderBy?.userId === userId || delivery.orderTo?.userId === userId) && 
           delivery.deliveryStatus !== 'DELIVERED' && 
           delivery.deliveryStatus !== 'CANCELLED';
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen p-4 flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50'
      }`}>
        <GlassCard className="p-8 text-center">
          <Truck className={`w-8 h-8 mx-auto mb-4 animate-bounce ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <p className={isDark ? 'text-white' : 'text-gray-900'}>Loading deliveries...</p>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen p-4 flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50'
      }`}>
        <GlassCard className="p-8 text-center max-w-md">
          <AlertCircle className={`w-8 h-8 mx-auto mb-4 ${
            isDark ? 'text-red-400' : 'text-red-600'
          }`} />
          <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Failed to load deliveries</p>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{error}</p>
          <GlassButton onClick={fetchDeliveries}>
            Try Again
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  const currentDeliveries = activeTab === 'available' ? availableDeliveries : activeDeliveries;

  return (
    <div className="min-h-screen pt-24 pb-8"> {/* Increased pt-24 to ensure proper clearance from fixed header */}
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Delivery Requests</h1>
          <GlassButton
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Request
          </GlassButton>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <GlassCard className="mb-8 p-6">
            <h2 className={`text-xl font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Create Delivery Request</h2>
            <p className={`text-sm mb-6 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Fill in the details for your delivery request. Make sure to provide accurate pickup and drop locations.
            </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Item Description <span className="text-red-400">*</span>
              </label>
              <GlassInput
                placeholder="e.g., Documents, Package, Food order..."
                value={formData.itemDescription}
                onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
              />
              <p className={`text-xs mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Brief description of what needs to be delivered</p>
            </div>

            <div>
              <label className={`block text-sm mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Product URL (Optional)
              </label>
              <GlassInput
                placeholder="https://example.com/product-image.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
              <p className={`text-xs mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>URL of an image showing the product</p>
            </div>

            <div>
              <label className={`block text-sm mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Pickup Location <span className="text-red-400">*</span>
              </label>
              <GlassInput
                placeholder="e.g., 123 Main St, City or Landmark name"
                value={formData.pickupLocation}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              />
              <p className={`text-xs mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Where the item should be picked up from</p>
            </div>

            <div>
              <label className={`block text-sm mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Drop Location <span className="text-red-400">*</span>
              </label>
              <GlassInput
                placeholder="e.g., 456 Oak Ave, City or Recipient address"
                value={formData.dropLocation}
                onChange={(e) => setFormData({ ...formData, dropLocation: e.target.value })}
              />
              <p className={`text-xs mt-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Where the item should be delivered to</p>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <GlassButton onClick={handleCreateDelivery} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Request
            </GlassButton>
            <GlassButton 
              variant="secondary" 
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </GlassButton>
          </div>
        </GlassCard>
      )}

        {/* Tabs */}
        <GlassCard className="mb-6">
          <div className={`flex border-b ${
            isDark ? 'border-white/20' : 'border-gray-300/20'
          }`}>
            <button
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'available'
                  ? `${isDark ? 'text-white' : 'text-gray-900'} border-b-2 border-blue-400`
                  : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
              }`}
              onClick={() => setActiveTab('available')}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Available ({availableDeliveries.length})
              </div>
            </button>
            <button
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'active'
                  ? `${isDark ? 'text-white' : 'text-gray-900'} border-b-2 border-blue-400`
                  : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
              }`}
              onClick={() => setActiveTab('active')}
            >
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                My Deliveries ({activeDeliveries.length})
              </div>
            </button>
          </div>
        </GlassCard>

      {/* Delivery List */}
      <GlassCard>
        {currentDeliveries.length === 0 ? (
          <div className="p-12 text-center">
            {activeTab === 'available' ? (
              <>
                <Package className={`w-12 h-12 mx-auto mb-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>No available deliveries</h3>
                <p className={`mb-6 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Be the first to create a delivery request in your area.
                </p>
                <GlassButton
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Request
                </GlassButton>
              </>
            ) : (
              <>
                <Truck className={`w-12 h-12 mx-auto mb-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>No active deliveries</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  You don't have any active deliveries at the moment.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`text-left border-b font-medium ${
                  isDark 
                    ? 'border-white/20 text-gray-400' 
                    : 'border-gray-300/20 text-gray-600'
                }`}>
                  <th className={`pb-3 pr-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Item</th>
                  <th className={`pb-3 pr-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                  <th className={`pb-3 pr-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Pickup</th>
                  <th className={`pb-3 pr-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Drop-off</th>
                  {activeTab === 'active' && <th className={`pb-3 pr-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Role</th>}
                  <th className={`pb-3 pr-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentDeliveries.map((delivery) => (
                  <tr key={delivery.deliveryReqId} className={`border-b hover:bg-opacity-5 ${
                    isDark 
                      ? 'border-white/10 hover:bg-white' 
                      : 'border-gray-200/50 hover:bg-gray-500'
                  }`}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center space-x-3">
                        {delivery.imageUrl && (
                          <img
                            src={delivery.imageUrl}
                            alt="Product"
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <div className={`font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {delivery.itemDescription}
                          </div>
                          <div className={`text-xs ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            ID: {delivery.deliveryReqId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(delivery.deliveryStatus)}
                        <Badge className={getStatusColor(delivery.deliveryStatus)}>
                          {delivery.deliveryStatus.charAt(0).toUpperCase() + 
                           delivery.deliveryStatus.slice(1).toLowerCase().replace('_', ' ')}
                        </Badge>
                      </div>
                    </td>
                    <td className={`py-3 pr-4 text-sm max-w-xs truncate ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {delivery.pickupLocation}
                    </td>
                    <td className={`py-3 pr-4 text-sm max-w-xs truncate ${
                      isDark ? 'text-gray-300' : 'text-gray-700'  
                    }`}>
                      {delivery.dropLocation}
                    </td>
                    {activeTab === 'active' && (
                      <td className="py-3 pr-4">
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {delivery.orderBy?.userId === parseInt(user?.id || '0') ? 'Customer' : 'Delivery Partner'}
                        </Badge>
                      </td>
                    )}
                    <td className="py-3 pr-4">
                      {activeTab === 'available' && canAcceptDelivery(delivery) && (
                        <GlassButton
                          size="sm"
                          onClick={() => handleAcceptDelivery(delivery.deliveryReqId)}
                          className="flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3" />
                          Accept
                        </GlassButton>
                      )}
                      {activeTab === 'active' && canUpdateStatus(delivery) && (
                        <div className="flex gap-1 flex-wrap">
                          {delivery.deliveryStatus === 'PENDING' && (
                            <>
                              <GlassButton
                                size="sm"
                                onClick={() => handleUpdateStatus(delivery.deliveryReqId, 'IN_PROGRESS')}
                                className="bg-blue-500/20 hover:bg-blue-500/30"
                              >
                                Start
                              </GlassButton>
                              <GlassButton
                                size="sm"
                                onClick={() => handleUpdateStatus(delivery.deliveryReqId, 'CANCELLED')}
                                className="bg-red-500/20 hover:bg-red-500/30"
                              >
                                Cancel
                              </GlassButton>
                            </>
                          )}
                          {delivery.deliveryStatus === 'IN_PROGRESS' && (
                            <>
                              <GlassButton
                                size="sm"
                                onClick={() => handleUpdateStatus(delivery.deliveryReqId, 'DELIVERED')}
                                className="bg-green-500/20 hover:bg-green-500/30"
                              >
                                Complete
                              </GlassButton>
                              <GlassButton
                                size="sm"
                                onClick={() => handleUpdateStatus(delivery.deliveryReqId, 'CANCELLED')}
                                className="bg-red-500/20 hover:bg-red-500/30"
                              >
                                Cancel
                              </GlassButton>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <FloatingActionButton
        onClick={() => setShowCreateForm(true)}
        icon={<Plus className="w-5 h-5" />}
      />
      </div>
    </div>
  );
}
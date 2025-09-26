import React, { useEffect, useState } from 'react';
import { Printer, FileText, Clock, CheckCircle, XCircle, User, Calendar } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { useToast } from '../context/ToastContext';
import { getPrinterOrders, updatePrintOrderStatus } from '../lib/api';

interface PrintRequest {
  id: string;
  userId: string;
  printerId: string;
  fileName: string;
  pages: number;
  color: boolean;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
  cost: number;
  userName?: string;
  userEmail?: string;
}

export const PrinterOwnerDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [printRequests, setPrintRequests] = useState<PrintRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    loadPrintRequests();
  }, []);

  const loadPrintRequests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await getPrinterOrders(token || undefined);
      
      if (res.ok) {
        setPrintRequests(res.data);
      } else {
        addToast({
          type: 'error',
          title: 'Failed to Load',
          message: 'Could not load print requests'
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load print requests'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await updatePrintOrderStatus(requestId, newStatus, token || undefined);
      
      if (res.ok) {
        // Update local state
        setPrintRequests(prev => 
          prev.map(req => 
            req.id === requestId ? { ...req, status: newStatus as any } : req
          )
        );
        
        // Dispatch event to refresh activities
        window.dispatchEvent(new CustomEvent('print-request:status-updated'));
        
        addToast({
          type: 'success',
          title: 'Status Updated',
          message: `Print request ${newStatus}`
        });
      } else {
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: res.error.message || 'Could not update status'
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update status'
      });
    }
  };

  const filteredRequests = printRequests.filter(request => 
    filter === 'all' || request.status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-yellow-500" />;
      case 'accepted': return <CheckCircle size={16} className="text-blue-500" />;
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelled': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'accepted': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-campus-green mx-auto"></div>
            <p className="mt-4 text-theme-text-secondary">Loading print requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center space-x-3">
          <Printer size={32} className="text-campus-green" />
          <div>
            <h1 className="text-3xl font-bold gradient-text">Printer Dashboard</h1>
            <p className="text-theme-text-secondary">Manage your print requests</p>
          </div>
        </div>

        {/* Status Filter */}
        <GlassCard className="p-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'accepted', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-campus-green text-white'
                    : 'bg-glass-bg text-theme-text-secondary hover:bg-glass-border'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'all' ? ` (${printRequests.length})` : 
                 ` (${printRequests.filter(r => r.status === status).length})`}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Print Requests */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <FileText size={48} className="mx-auto mb-4 text-theme-text-secondary" />
              <h3 className="text-lg font-semibold mb-2">No Print Requests</h3>
              <p className="text-theme-text-secondary">
                {filter === 'all' 
                  ? 'No print requests have been submitted yet.'
                  : `No ${filter} print requests found.`
                }
              </p>
            </GlassCard>
          ) : (
            filteredRequests.map((request) => (
              <GlassCard key={request.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-campus-green/20 rounded-lg">
                      <FileText size={20} className="text-campus-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-theme-text">{request.fileName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-theme-text-secondary">
                        <span className="flex items-center space-x-1">
                          <User size={14} />
                          <span>{request.userName || 'User'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center space-x-2 px-2 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className="text-sm font-medium capitalize">{request.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-theme-text-secondary">Pages:</span>
                    <p className="font-medium">{request.pages}</p>
                  </div>
                  <div>
                    <span className="text-theme-text-secondary">Type:</span>
                    <p className="font-medium">{request.color ? 'Color' : 'B&W'}</p>
                  </div>
                  <div>
                    <span className="text-theme-text-secondary">Cost:</span>
                    <p className="font-medium">৳{(request.cost || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-theme-text-secondary">ID:</span>
                    <p className="font-medium text-xs">#{request.id}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                {request.status === 'pending' && (
                  <div className="flex space-x-2">
                    <GlassButton
                      onClick={() => handleStatusUpdate(request.id, 'accepted')}
                      size="sm"
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                    >
                      Accept
                    </GlassButton>
                    <GlassButton
                      onClick={() => handleStatusUpdate(request.id, 'cancelled')}
                      size="sm"
                      variant="danger"
                    >
                      Decline
                    </GlassButton>
                  </div>
                )}

                {request.status === 'accepted' && (
                  <div className="flex space-x-2">
                    <GlassButton
                      onClick={() => handleStatusUpdate(request.id, 'completed')}
                      size="sm"
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                    >
                      Mark Complete
                    </GlassButton>
                    <GlassButton
                      onClick={() => handleStatusUpdate(request.id, 'cancelled')}
                      size="sm"
                      variant="ghost"
                    >
                      Cancel
                    </GlassButton>
                  </div>
                )}
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
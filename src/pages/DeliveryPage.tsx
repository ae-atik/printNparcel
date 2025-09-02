import React, { useState } from 'react';
import { Plus, MapPin, Coins, Package, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { DeliveryRequest } from '../types';
import deliveriesData from '../data/deliveries.json';

export const DeliveryPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    items: [{ name: '', quantity: 1, description: '' }],
    pickupHall: '',
    pickupRoom: '',
    deliveryHall: '',
    deliveryRoom: '',
    payment: '',
    urgency: 'medium',
    requestedTime: '',
  });

  const deliveryRequests: DeliveryRequest[] = deliveriesData.deliveries;

  const filteredDeliveries = deliveryRequests.filter(delivery => {
    if (filter === 'all') return true;
    return delivery.status === filter;
  });

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, description: '' }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = () => {
    // In real app, this would submit to API
    alert('Delivery request created successfully!');
    setShowCreateModal(false);
    setFormData({
      items: [{ name: '', quantity: 1, description: '' }],
      pickupHall: '',
      pickupRoom: '',
      deliveryHall: '',
      deliveryRoom: '',
      payment: '',
      urgency: 'medium',
      requestedTime: '',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Delivery Requests</h1>
          <p className="text-theme-text-secondary">Accept delivery requests and earn money</p>
        </div>

        {/* Filter Tabs */}
        <GlassCard className="p-2">
          <div className="flex space-x-1">
            {['all', 'pending', 'accepted', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-component text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-campus-green text-white'
                    : 'text-theme-text-secondary hover:text-theme-text hover:bg-glass-hover'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Delivery Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDeliveries.map((delivery) => (
            <GlassCard key={delivery.id} className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={delivery.userProfilePicture}
                  alt={delivery.userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-theme-text">{delivery.userName}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      delivery.status === 'completed' ? 'bg-success/10 text-success' :
                      delivery.status === 'accepted' ? 'bg-info/10 text-info' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {delivery.status}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      delivery.urgency === 'high' ? 'bg-danger/10 text-danger' :
                      delivery.urgency === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-glass-bg text-theme-text-secondary'
                    }`}>
                      {delivery.urgency} priority
                    </span>
                  </div>
                  <p className="text-sm text-theme-text-secondary">
                    <Clock size={14} className="inline mr-1" />
                    {formatTimeAgo(delivery.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-start text-sm text-theme-text-secondary">
                  <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p><strong>Pickup:</strong> {delivery.pickupLocation.hall} {delivery.pickupLocation.room}</p>
                    <p><strong>Delivery:</strong> {delivery.deliveryLocation.hall} {delivery.deliveryLocation.room}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-theme-text">Items to deliver:</p>
                  {delivery.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm text-theme-text-secondary">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <Package size={14} className="flex-shrink-0" />
                      )}
                      <div>
                        <span>{item.quantity}x {item.name}</span>
                        {item.description && (
                          <span className="ml-2 text-theme-text-muted">({item.description})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-lg font-bold text-campus-green">
                  <Coins size={20} />
                  <span>{delivery.payment.toFixed(2)}</span>
                </div>
                
                <div className="flex gap-2">
                  {delivery.status === 'pending' && (
                    <>
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        onClick={() => alert('Delivery request rejected')}
                      >
                        <XCircle size={16} className="mr-1" />
                        Reject
                      </GlassButton>
                      <GlassButton
                        variant="primary"
                        size="sm"
                        onClick={() => alert('Delivery request accepted!')}
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Accept
                      </GlassButton>
                    </>
                  )}
                  {delivery.status === 'accepted' && (
                    <GlassButton
                      variant="success"
                      size="sm"
                      onClick={() => alert('Delivery marked as completed!')}
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Mark Complete
                    </GlassButton>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {filteredDeliveries.length === 0 && (
          <GlassCard className="p-12 text-center">
            <Package size={48} className="mx-auto text-theme-text-muted mb-4" />
            <h3 className="text-lg font-medium text-theme-text mb-2">No delivery requests found</h3>
            <p className="text-theme-text-secondary">
              {filter === 'all' 
                ? 'No delivery requests available at the moment'
                : `No ${filter} deliveries found`
              }
            </p>
          </GlassCard>
        )}

        {/* Floating Action Button */}
        <FloatingActionButton
          icon={<Plus size={24} />}
          onClick={() => setShowCreateModal(true)}
        />

        {/* Create Delivery Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-6">Create Delivery Request</h3>
                
                <div className="space-y-6">
                  {/* Items */}
                  <div>
                    <h4 className="font-medium text-theme-text mb-3">Items to Deliver</h4>
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 mb-3">
                        <div className="col-span-5">
                          <GlassInput
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <GlassInput
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                            min="1"
                          />
                        </div>
                        <div className="col-span-4">
                          <GlassInput
                            placeholder="Description (optional)"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                          />
                        </div>
                        <div className="col-span-1">
                          {formData.items.length > 1 && (
                            <GlassButton
                              variant="danger"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              ×
                            </GlassButton>
                          )}
                        </div>
                      </div>
                    ))}
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      onClick={addItem}
                    >
                      <Plus size={16} className="mr-1" />
                      Add Item
                    </GlassButton>
                  </div>

                  {/* Locations */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-theme-text mb-3">Pickup Location</h4>
                      <div className="space-y-3">
                        <GlassInput
                          label="Hall"
                          value={formData.pickupHall}
                          onChange={(e) => setFormData(prev => ({ ...prev, pickupHall: e.target.value }))}
                        />
                        <GlassInput
                          label="Room"
                          value={formData.pickupRoom}
                          onChange={(e) => setFormData(prev => ({ ...prev, pickupRoom: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-theme-text mb-3">Delivery Location</h4>
                      <div className="space-y-3">
                        <GlassInput
                          label="Hall"
                          value={formData.deliveryHall}
                          onChange={(e) => setFormData(prev => ({ ...prev, deliveryHall: e.target.value }))}
                        />
                        <GlassInput
                          label="Room"
                          value={formData.deliveryRoom}
                          onChange={(e) => setFormData(prev => ({ ...prev, deliveryRoom: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment and Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <GlassInput
                      label="Payment Amount (৳)"
                      type="number"
                      step="0.01"
                      value={formData.payment}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment: e.target.value }))}
                    />
                    <div>
                      <label className="block text-sm font-medium text-theme-text mb-2">Priority</label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                        className="w-full px-4 py-3 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-component text-theme-text focus:outline-none focus:border-campus-green"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <GlassInput
                    label="Requested Delivery Time (Optional)"
                    type="datetime-local"
                    value={formData.requestedTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, requestedTime: e.target.value }))}
                  />

                  <div className="flex gap-4 pt-4">
                    <GlassButton
                      variant="secondary"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </GlassButton>
                    <GlassButton
                      variant="primary"
                      onClick={handleSubmit}
                      className="flex-1"
                    >
                      Create Request
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
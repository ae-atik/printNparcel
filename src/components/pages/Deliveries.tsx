import React, { useState } from 'react';
import { MapPin, Clock, DollarSign, Package, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../../context/ToastContext';
import { useUser } from '../../context/UserContext';

interface DeliveryRequest {
  id: string;
  studentName: string;
  location: string;
  distance: string;
  payment: number;
  items: string[];
  timeRequested: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed';
  urgency: 'low' | 'medium' | 'high';
}

export const Deliveries: React.FC = () => {
  const { user } = useUser();
  const { addToast } = useToast();
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');

  const deliveryRequests: DeliveryRequest[] = [
    {
      id: '1',
      studentName: 'Sarah Johnson',
      location: 'Residence Hall B, Room 204',
      distance: '0.3 miles',
      payment: 8.50,
      items: ['Lecture Notes (15 pages)', 'Assignment Sheet (2 pages)'],
      timeRequested: '2 hours ago',
      status: 'pending',
      urgency: 'medium',
    },
    {
      id: '2',
      studentName: 'Mike Chen',
      location: 'Library Study Room 12',
      distance: '0.1 miles',
      payment: 12.00,
      items: ['Research Paper (25 pages)', 'Bibliography (5 pages)'],
      timeRequested: '1 hour ago',
      status: 'pending',
      urgency: 'high',
    },
    {
      id: '3',
      studentName: 'Emma Davis',
      location: 'Student Union Café',
      distance: '0.2 miles',
      payment: 6.75,
      items: ['Class Handouts (8 pages)'],
      timeRequested: '30 minutes ago',
      status: 'accepted',
      urgency: 'low',
    },
    {
      id: '4',
      studentName: 'James Wilson',
      location: 'Engineering Building',
      distance: '0.5 miles',
      payment: 15.25,
      items: ['Lab Report (12 pages)', 'Diagrams (6 pages)'],
      timeRequested: '4 hours ago',
      status: 'completed',
      urgency: 'medium',
    },
  ];

  const filteredDeliveries = deliveryRequests.filter(delivery => {
    if (filter === 'all') return true;
    return delivery.status === filter;
  });

  const handleAcceptDelivery = (deliveryId: string) => {
    addToast({
      type: 'success',
      title: 'Delivery Accepted',
      message: 'You have accepted this delivery request',
    });
  };

  const handleRejectDelivery = (deliveryId: string) => {
    addToast({
      type: 'info',
      title: 'Delivery Rejected',
      message: 'You have rejected this delivery request',
    });
  };

  const handleCompleteDelivery = (deliveryId: string) => {
    addToast({
      type: 'success',
      title: 'Delivery Completed',
      message: 'Delivery has been marked as completed',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal mb-2">
          {user?.role === 'student' ? 'My Delivery Requests' : 'Available Deliveries'}
        </h1>
        <p className="text-gray-600">
          {user?.role === 'student' 
            ? 'Track your delivery requests and their status'
            : 'Accept delivery requests and earn money'
          }
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-component">
        {['all', 'pending', 'accepted', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-white text-campus-green shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Delivery Requests */}
      <div className="space-y-4">
        {filteredDeliveries.map((delivery) => (
          <Card key={delivery.id} className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-semibold text-charcoal">{delivery.studentName}</h3>
                  <Badge
                    variant={
                      delivery.status === 'completed' ? 'success' :
                      delivery.status === 'accepted' ? 'info' :
                      delivery.status === 'pending' ? 'warning' : 'default'
                    }
                  >
                    {delivery.status}
                  </Badge>
                  <Badge
                    variant={
                      delivery.urgency === 'high' ? 'danger' :
                      delivery.urgency === 'medium' ? 'warning' : 'default'
                    }
                    size="sm"
                  >
                    {delivery.urgency} priority
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    <span>{delivery.location}</span>
                    <span className="mx-2">•</span>
                    <span>{delivery.distance}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={16} className="mr-2" />
                    <span>{delivery.timeRequested}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Items to deliver:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {delivery.items.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <Package size={14} className="mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center text-lg font-bold text-campus-green">
                  <DollarSign size={20} />
                  <span>{delivery.payment.toFixed(2)}</span>
                </div>
                
                <div className="flex gap-2">
                  {delivery.status === 'pending' && user?.role !== 'student' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRejectDelivery(delivery.id)}
                      >
                        <XCircle size={16} className="mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptDelivery(delivery.id)}
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Accept
                      </Button>
                    </>
                  )}
                  {delivery.status === 'accepted' && user?.role !== 'student' && (
                    <Button
                      size="sm"
                      onClick={() => handleCompleteDelivery(delivery.id)}
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Mark Complete
                    </Button>
                  )}
                  {delivery.status === 'completed' && (
                    <Badge variant="success" size="sm">
                      <CheckCircle size={14} className="mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredDeliveries.length === 0 && (
        <Card className="p-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No delivery requests available at the moment'
              : `No ${filter} deliveries found`
            }
          </p>
        </Card>
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { Users, Printer, BarChart3, CheckCircle, XCircle, Eye, Settings } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { User, Printer as PrinterType } from '../types';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'printers' | 'analytics'>('users');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterType | null>(null);

  const mockUsers: User[] = [
    {
      id: 'user-1',
      email: 'student@campus.edu',
      username: 'student123',
      firstName: 'Jane',
      lastName: 'Student',
      profilePicture: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
      credits: 45.50,
      roles: ['user'],
      university: 'Campus University',
      hall: 'Residence Hall A',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user-2',
      email: 'owner@campus.edu',
      username: 'printerowner',
      firstName: 'John',
      lastName: 'Owner',
      profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
      credits: 250.75,
      roles: ['printer-owner', 'user'],
      university: 'Campus University',
      hall: 'Engineering Hall',
      createdAt: new Date().toISOString(),
    },
  ];

  const mockPrinters: PrinterType[] = [
    {
      id: 'printer-1',
      name: 'QuickPrint Pro',
      ownerId: 'user-2',
      ownerName: 'John Owner',
      type: 'both',
      pricePerPageBW: 0.10,
      pricePerPageColor: 0.25,
      location: {
        university: 'Campus University',
        hall: 'Library',
        room: '2nd Floor',
      },
      specifications: {
        brand: 'HP',
        model: 'LaserJet Pro',
        paperSizes: ['A4', 'Letter', 'Legal'],
        features: ['Duplex', 'Stapling'],
      },
      status: 'online',
      isApproved: true,
      rating: 4.8,
      totalJobs: 1250,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'printer-2',
      name: 'Pending Approval Printer',
      ownerId: 'user-2',
      ownerName: 'John Owner',
      type: 'color',
      pricePerPageBW: 0.12,
      pricePerPageColor: 0.30,
      location: {
        university: 'Campus University',
        hall: 'Engineering Building',
        room: 'Room 205',
      },
      specifications: {
        brand: 'Canon',
        model: 'PIXMA Pro',
        paperSizes: ['A4', 'Letter'],
        features: ['Color', 'High Resolution'],
      },
      status: 'offline',
      isApproved: false,
      rating: 0,
      totalJobs: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  const handleApprovePrinter = (printerId: string) => {
    alert(`Printer ${printerId} approved successfully!`);
  };

  const handleRejectPrinter = (printerId: string) => {
    alert(`Printer ${printerId} rejected.`);
  };

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockUsers.map((user) => (
          <GlassCard key={user.id} className="p-6">
            <div className="flex items-start gap-4">
              <img
                src={user.profilePicture}
                alt={user.username}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-dark-text">{user.firstName} {user.lastName}</h3>
                  <div className="flex gap-1">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-campus-green-light text-campus-green"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-dark-text-secondary mb-1">@{user.username}</p>
                <p className="text-sm text-dark-text-secondary mb-1">{user.email}</p>
                <p className="text-sm text-dark-text-secondary mb-3">{user.university} - {user.hall}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-campus-green">
                    Credits: ${user.credits.toFixed(2)}
                  </span>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Eye size={16} className="mr-1" />
                    View Details
                  </GlassButton>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  const renderPrintersTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockPrinters.map((printer) => (
          <GlassCard key={printer.id} className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-campus-green/20 to-info/20 rounded-lg flex items-center justify-center">
                <Printer size={24} className="text-campus-green" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-dark-text">{printer.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    printer.isApproved 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {printer.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-dark-text-secondary mb-1">
                  {printer.specifications.brand} {printer.specifications.model}
                </p>
                <p className="text-sm text-dark-text-secondary mb-1">
                  Owner: {printer.ownerName}
                </p>
                <p className="text-sm text-dark-text-secondary mb-3">
                  {printer.location.hall} - {printer.location.room}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-dark-text-secondary">
                <span className="font-medium">B&W: ${printer.pricePerPageBW}</span>
                {printer.pricePerPageColor > 0 && (
                  <span className="ml-3 font-medium">Color: ${printer.pricePerPageColor}</span>
                )}
              </div>
              <div className="flex gap-2">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedPrinter(printer)}
                >
                  <Eye size={16} className="mr-1" />
                  View
                </GlassButton>
                {!printer.isApproved && (
                  <>
                    <GlassButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleRejectPrinter(printer.id)}
                    >
                      <XCircle size={16} className="mr-1" />
                      Reject
                    </GlassButton>
                    <GlassButton
                      variant="success"
                      size="sm"
                      onClick={() => handleApprovePrinter(printer.id)}
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Approve
                    </GlassButton>
                  </>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 text-center">
          <Users size={32} className="mx-auto text-info mb-4" />
          <h3 className="text-2xl font-bold text-dark-text">1,234</h3>
          <p className="text-dark-text-secondary">Total Users</p>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <Printer size={32} className="mx-auto text-success mb-4" />
          <h3 className="text-2xl font-bold text-dark-text">45</h3>
          <p className="text-dark-text-secondary">Active Printers</p>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <BarChart3 size={32} className="mx-auto text-campus-green mb-4" />
          <h3 className="text-2xl font-bold text-dark-text">$12,450</h3>
          <p className="text-dark-text-secondary">Monthly Revenue</p>
        </GlassCard>
      </div>
      
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'New user registered', time: '5 minutes ago', type: 'user' },
            { action: 'Printer approved', time: '1 hour ago', type: 'printer' },
            { action: 'Print job completed', time: '2 hours ago', type: 'job' },
            { action: 'Delivery request fulfilled', time: '3 hours ago', type: 'delivery' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-glass-border last:border-b-0">
              <span className="text-sm text-dark-text">{activity.action}</span>
              <span className="text-xs text-dark-text-secondary">{activity.time}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );

  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Admin Dashboard</h1>
          <p className="text-dark-text-secondary">Manage users, printers, and platform analytics</p>
        </div>

        {/* Navigation Tabs */}
        <GlassCard className="p-2">
          <div className="flex space-x-1">
            {[
              { id: 'users', label: 'Users', icon: Users },
              { id: 'printers', label: 'Printers', icon: Printer },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-2 rounded-component text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-campus-green text-white'
                      : 'text-dark-text-secondary hover:text-dark-text hover:bg-glass-hover'
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Tab Content */}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'printers' && renderPrintersTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlassCard className="w-full max-w-lg">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">User Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedUser.profilePicture}
                      alt={selectedUser.username}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-dark-text">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h4>
                      <p className="text-dark-text-secondary">@{selectedUser.username}</p>
                      <p className="text-dark-text-secondary">{selectedUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-dark-text-secondary">University</p>
                      <p className="text-dark-text font-medium">{selectedUser.university}</p>
                    </div>
                    <div>
                      <p className="text-dark-text-secondary">Hall</p>
                      <p className="text-dark-text font-medium">{selectedUser.hall}</p>
                    </div>
                    <div>
                      <p className="text-dark-text-secondary">Credits</p>
                      <p className="text-dark-text font-medium">${selectedUser.credits.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-dark-text-secondary">Roles</p>
                      <div className="flex gap-1 mt-1">
                        {selectedUser.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-campus-green-light text-campus-green"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <GlassButton
                      variant="secondary"
                      onClick={() => setSelectedUser(null)}
                      className="flex-1"
                    >
                      Close
                    </GlassButton>
                    <GlassButton
                      variant="primary"
                      className="flex-1"
                    >
                      <Settings size={16} className="mr-1" />
                      Manage User
                    </GlassButton>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Printer Detail Modal */}
        {selectedPrinter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlassCard className="w-full max-w-lg">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Printer Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-campus-green/20 to-info/20 rounded-lg flex items-center justify-center">
                      <Printer size={24} className="text-campus-green" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-text">{selectedPrinter.name}</h4>
                      <p className="text-dark-text-secondary">
                        {selectedPrinter.specifications.brand} {selectedPrinter.specifications.model}
                      </p>
                      <p className="text-dark-text-secondary">Owner: {selectedPrinter.ownerName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-dark-text-secondary">Location</p>
                      <p className="text-dark-text font-medium">
                        {selectedPrinter.location.hall} - {selectedPrinter.location.room}
                      </p>
                    </div>
                    <div>
                      <p className="text-dark-text-secondary">Type</p>
                      <p className="text-dark-text font-medium">{selectedPrinter.type}</p>
                    </div>
                    <div>
                      <p className="text-dark-text-secondary">B&W Price</p>
                      <p className="text-dark-text font-medium">${selectedPrinter.pricePerPageBW}/page</p>
                    </div>
                    <div>
                      <p className="text-dark-text-secondary">Color Price</p>
                      <p className="text-dark-text font-medium">
                        {selectedPrinter.pricePerPageColor > 0 
                          ? `$${selectedPrinter.pricePerPageColor}/page`
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-dark-text-secondary text-sm">Features</p>
                    <p className="text-dark-text font-medium">
                      {selectedPrinter.specifications.features.join(', ')}
                    </p>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <GlassButton
                      variant="secondary"
                      onClick={() => setSelectedPrinter(null)}
                      className="flex-1"
                    >
                      Close
                    </GlassButton>
                    {!selectedPrinter.isApproved && (
                      <GlassButton
                        variant="success"
                        onClick={() => {
                          handleApprovePrinter(selectedPrinter.id);
                          setSelectedPrinter(null);
                        }}
                        className="flex-1"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Approve
                      </GlassButton>
                    )}
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
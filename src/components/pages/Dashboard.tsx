import React from 'react';
import { BarChart3, DollarSign, FileText, Printer } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const Dashboard: React.FC = () => {
  const { user } = useUser();

  const getDashboardData = () => {
    switch (user?.role) {
      case 'student':
        return {
          title: 'Student Dashboard',
          stats: [
            { label: 'Print Credits', value: `$${user.credits.toFixed(2)}`, icon: DollarSign, color: 'text-green-600' },
            { label: 'Documents Printed', value: '24', icon: FileText, color: 'text-blue-600' },
            { label: 'Active Orders', value: '2', icon: Printer, color: 'text-orange-600' },
          ],
          recentActivity: [
            { id: 1, action: 'Printed lecture notes', time: '2 hours ago', status: 'completed' },
            { id: 2, action: 'Uploaded research paper', time: '1 day ago', status: 'pending' },
            { id: 3, action: 'Added $20 credits', time: '3 days ago', status: 'completed' },
          ],
        };
      case 'printer-owner':
        return {
          title: 'Printer Owner Dashboard',
          stats: [
            { label: 'Monthly Revenue', value: '$342.50', icon: DollarSign, color: 'text-green-600' },
            { label: 'Print Jobs', value: '89', icon: FileText, color: 'text-blue-600' },
            { label: 'Active Printers', value: '3', icon: Printer, color: 'text-orange-600' },
          ],
          recentActivity: [
            { id: 1, action: 'Job completed - Biology notes', time: '30 minutes ago', status: 'completed' },
            { id: 2, action: 'New print request', time: '1 hour ago', status: 'pending' },
            { id: 3, action: 'Printer maintenance completed', time: '2 hours ago', status: 'completed' },
          ],
        };
      case 'admin':
        return {
          title: 'Admin Dashboard',
          stats: [
            { label: 'Total Users', value: '1,234', icon: BarChart3, color: 'text-blue-600' },
            { label: 'Active Printers', value: '45', icon: Printer, color: 'text-green-600' },
            { label: 'Monthly Revenue', value: '$12,450', icon: DollarSign, color: 'text-green-600' },
          ],
          recentActivity: [
            { id: 1, action: 'New printer registered', time: '1 hour ago', status: 'pending' },
            { id: 2, action: 'User report resolved', time: '2 hours ago', status: 'completed' },
            { id: 3, action: 'System maintenance completed', time: '1 day ago', status: 'completed' },
          ],
        };
      default:
        return {
          title: 'Dashboard',
          stats: [],
          recentActivity: [],
        };
    }
  };

  const dashboardData = getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal mb-2">{dashboardData.title}</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardData.stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
                </div>
                <Icon size={24} className={stat.color} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-charcoal mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <Badge variant={activity.status === 'completed' ? 'success' : 'warning'}>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-charcoal mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user?.role === 'student' && (
              <>
                <button className="p-4 text-left border border-gray-200 rounded-component hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-gray-900">Upload Document</h3>
                  <p className="text-sm text-gray-600">Upload files to print</p>
                </button>
                <button className="p-4 text-left border border-gray-200 rounded-component hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-gray-900">Add Credits</h3>
                  <p className="text-sm text-gray-600">Top up your account</p>
                </button>
              </>
            )}
            {user?.role === 'printer-owner' && (
              <>
                <button className="p-4 text-left border border-gray-200 rounded-component hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-gray-900">Add Printer</h3>
                  <p className="text-sm text-gray-600">Register new printer</p>
                </button>
                <button className="p-4 text-left border border-gray-200 rounded-component hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-gray-900">View Queue</h3>
                  <p className="text-sm text-gray-600">Check pending jobs</p>
                </button>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <button className="p-4 text-left border border-gray-200 rounded-component hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-600">Manage users</p>
                </button>
                <button className="p-4 text-left border border-gray-200 rounded-component hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-gray-900">System Settings</h3>
                  <p className="text-sm text-gray-600">Configure platform</p>
                </button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
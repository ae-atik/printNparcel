import React from 'react';
import { 
  Home, 
  Printer, 
  Truck, 
  Settings, 
  Users, 
  BarChart3, 
  CheckSquare,
  User,
  X
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentPage,
  onPageChange,
}) => {
  const { user } = useUser();

  const getNavigationItems = () => {
    const common = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'printers', label: 'Printers', icon: Printer },
    ];

    switch (user?.role) {
      case 'student':
        return [
          ...common,
          { id: 'deliveries', label: 'Deliveries', icon: Truck },
          { id: 'profile', label: 'Profile', icon: User },
        ];
      case 'printer-owner':
        return [
          ...common,
          { id: 'my-printers', label: 'My Printers', icon: Settings },
          { id: 'job-queue', label: 'Job Queue', icon: CheckSquare },
          { id: 'deliveries', label: 'Deliveries', icon: Truck },
        ];
      case 'admin':
        return [
          ...common,
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'printer-verification', label: 'Printer Verification', icon: CheckSquare },
          { id: 'transactions', label: 'Transactions', icon: BarChart3 },
        ];
      default:
        return common;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-charcoal">Navigation</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="mt-4">
          <ul className="space-y-1 px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onPageChange(item.id);
                      onClose();
                    }}
                    className={cn(
                      'w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      currentPage === item.id
                        ? 'bg-campus-green-light text-campus-green'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};
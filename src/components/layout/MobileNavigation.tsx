import React from 'react';
import { Home, Printer, Truck, User } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { cn } from '../../utils/cn';

interface MobileNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentPage,
  onPageChange,
}) => {
  const { user } = useUser();

  const getNavigationItems = () => {
    const common = [
      { id: 'dashboard', label: 'Home', icon: Home },
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
          { id: 'my-printers', label: 'My Printers', icon: Printer },
          { id: 'job-queue', label: 'Jobs', icon: Truck },
        ];
      case 'admin':
        return [
          ...common,
          { id: 'users', label: 'Users', icon: User },
          { id: 'analytics', label: 'Analytics', icon: Home },
        ];
      default:
        return common;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors min-h-[60px]',
                currentPage === item.id
                  ? 'text-campus-green bg-campus-green-light'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon size={20} className="mb-1" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
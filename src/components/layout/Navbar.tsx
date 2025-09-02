import React, { useState } from 'react';
import { Menu, X, User, CreditCard, Bell } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user, logout } = useUser();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleRoleChange = (role: 'student' | 'printer-owner' | 'admin') => {
    // In demo mode, allow role switching
    if (user) {
      user.role = role;
      setIsProfileMenuOpen(false);
      window.location.reload(); // Simple way to refresh the UI
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="mr-3 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
              >
                <Menu size={20} />
              </button>
            )}
            <h1 className="text-xl font-bold text-charcoal">CampusPrint</h1>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <CreditCard size={16} className="text-gray-600" />
                  <span className="font-medium">৳{user.credits.toFixed(2)}</span>
                </div>
                
                <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                  <Bell size={20} />
                  <Badge variant="danger" size="sm" className="absolute -top-1 -right-1 min-w-0 px-1">
                    3
                  </Badge>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 bg-campus-green rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-component shadow-lg border border-gray-200 py-1">
                      <div className="px-3 py-2 text-sm text-gray-500 border-b border-gray-200">
                        Current Role: <span className="font-medium text-gray-900">{user.role}</span>
                      </div>
                      <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-200">
                        Demo Mode - Switch Roles:
                      </div>
                      <button
                        onClick={() => handleRoleChange('student')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Student
                      </button>
                      <button
                        onClick={() => handleRoleChange('printer-owner')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Printer Owner
                      </button>
                      <button
                        onClick={() => handleRoleChange('admin')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin
                      </button>
                      <div className="border-t border-gray-200">
                        <button
                          onClick={logout}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
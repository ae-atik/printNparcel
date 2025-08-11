import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, CreditCard, LogOut, Settings, UserPlus, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { GlassButton } from '../ui/GlassButton';
import { GlassCard } from '../ui/GlassCard';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ProfileEditor } from '../ui/ProfileEditor';
import { cn } from '../../utils/cn';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout, currentRole, switchRole } = useAuth();
  const { isDark } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const navigate = useNavigate();

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
    setIsProfileMenuOpen(false);
    
    // Navigate to appropriate dashboard
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'printer-owner':
        navigate('/dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-glass-bg backdrop-blur-glass border-b border-glass-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-campus-green to-info rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CP</span>
            </div>
            <span className="text-xl font-bold gradient-text">CampusPrint</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <>
                {/* Credit Balance */}
                <div className="flex items-center space-x-2 px-3 py-1 bg-glass-bg rounded-component border border-glass-border">
                  <CreditCard size={16} className="text-campus-green" />
                  <span className="text-sm font-medium">${user?.credits.toFixed(2)}</span>
                </div>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-component hover:bg-glass-hover transition-colors"
                  >
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-campus-green rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium">{user?.username}</span>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 py-2 z-50 bg-glass-bg/90 backdrop-blur-xl border border-glass-border rounded-glass shadow-glass-hover">
                      <div className="px-4 py-3 border-b border-glass-border">
                        <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-theme-text-secondary">{user?.email}</p>
                        <p className="text-xs text-campus-green mt-1">Current: {currentRole}</p>
                      </div>
                      
                      {user?.roles && user.roles.length > 1 && (
                        <div className="px-4 py-2 border-b border-glass-border">
                          <p className="text-xs text-theme-text-secondary mb-2">Switch Role:</p>
                          {user.roles.map((role) => (
                            <button
                              key={role}
                              onClick={() => handleRoleSwitch(role)}
                              className={cn(
                                'block w-full text-left px-2 py-1 text-sm rounded hover:bg-glass-hover transition-colors',
                                currentRole === role && 'text-campus-green'
                              )}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowProfileEditor(true);
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-glass-hover transition-colors"
                        >
                          <Edit size={16} className="mr-2" />
                          Edit Profile
                        </button>
                        <Link
                          to="/dashboard"
                          className="flex items-center px-4 py-2 text-sm hover:bg-glass-hover transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings size={16} className="mr-2" />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-glass-hover transition-colors text-danger"
                        >
                          <LogOut size={16} className="mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <GlassButton
                  variant="ghost"
                  onClick={() => navigate('/login')}
                >
                  Login
                </GlassButton>
                <GlassButton
                  variant="primary"
                  onClick={() => navigate('/signup')}
                >
                  <UserPlus size={16} className="mr-2" />
                  Sign Up
                </GlassButton>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-component hover:bg-glass-hover transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-glass-border">
            <div className="flex justify-between items-center px-2 py-2 mb-3">
              <span className="text-sm font-medium text-theme-text">Theme</span>
              <ThemeToggle />
            </div>
            
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 px-2 py-2">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-campus-green rounded-full flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{user?.username}</p>
                    <p className="text-sm text-theme-text-secondary">${user?.credits.toFixed(2)}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="block px-2 py-2 text-sm hover:bg-glass-hover rounded-component transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-2 py-2 text-sm hover:bg-glass-hover rounded-component transition-colors text-danger"
                >
                  Sign Out
                </button>
                <button
                  onClick={() => {
                    setShowProfileEditor(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-2 py-2 text-sm hover:bg-glass-hover rounded-component transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <GlassButton
                  variant="ghost"
                  className="w-full justify-center"
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Login
                </GlassButton>
                <GlassButton
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => {
                    navigate('/signup');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <UserPlus size={16} className="mr-2" />
                  Sign Up
                </GlassButton>
              </div>
            )}
          </div>
        )}
      </div>

      <ProfileEditor
        isOpen={showProfileEditor}
        onClose={() => setShowProfileEditor(false)}
      />
    </header>
  );
};
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  currentRole: UserRole;
  isLoading: boolean;
}

interface SignupData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  university: string;
  hall?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('currentRole');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setCurrentRole((storedRole as UserRole) || userData.roles[0] || 'user');
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Mock authentication - in real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data based on email
    let mockUser: User;
    
    if (email === 'admin@campus.edu') {
      mockUser = {
        id: 'admin-1',
        email,
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
        credits: 1000,
        roles: ['admin', 'printer-owner', 'user'],
        university: 'Campus University',
        hall: 'Admin Building',
        createdAt: new Date().toISOString(),
      };
    } else if (email === 'owner@campus.edu') {
      mockUser = {
        id: 'owner-1',
        email,
        username: 'printerowner',
        firstName: 'John',
        lastName: 'Owner',
        profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
        credits: 250.75,
        roles: ['printer-owner', 'user'],
        university: 'Campus University',
        hall: 'Engineering Hall',
        createdAt: new Date().toISOString(),
      };
    } else {
      mockUser = {
        id: 'user-1',
        email,
        username: 'student',
        firstName: 'Javier',
        lastName: 'Student',
        profilePicture: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
        credits: 45.50,
        roles: ['user'],
        university: 'Campus University',
        hall: 'Residence Hall A',
        createdAt: new Date().toISOString(),
      };
    }
    
    setUser(mockUser);
    setCurrentRole(mockUser.roles[0]);
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('currentRole', mockUser.roles[0]);
    
    setIsLoading(false);
  };

  const signup = async (userData: SignupData) => {
    setIsLoading(true);
    
    // Mock signup - in real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profilePicture: `https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100`,
      credits: 10.00, // Welcome bonus
      roles: ['user'],
      university: userData.university,
      hall: userData.hall,
      createdAt: new Date().toISOString(),
    };
    
    setUser(newUser);
    setCurrentRole('user');
    
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('currentRole', 'user');
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setCurrentRole('user');
    localStorage.removeItem('user');
    localStorage.removeItem('currentRole');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const addRole = (role: UserRole) => {
    if (user && !user.roles.includes(role)) {
      const updatedUser = { ...user, roles: [...user.roles, role] };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const switchRole = (role: UserRole) => {
    if (user && user.roles.includes(role)) {
      setCurrentRole(role);
      localStorage.setItem('currentRole', role);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      updateUser,
      addRole,
      switchRole,
      currentRole,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
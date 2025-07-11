import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'student' | 'printer-owner' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  credits: number;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'John Doe',
    email: 'john@university.edu',
    role: 'student',
    credits: 25.50,
    avatar: undefined,
  });

  const login = async (email: string, password: string) => {
    // Mock login - in real app, this would make an API call
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email,
      role: 'student',
      credits: 25.50,
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, switchRole }}>
      {children}
    </UserContext.Provider>
  );
};
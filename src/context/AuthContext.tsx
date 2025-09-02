import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { login as apiLogin, register as apiRegister } from '../lib/api';

interface SignupData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  university: string;
  hall?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  /** Normal login (real users). Later we’ll wire this to backend. */
  login: (email: string, password: string) => Promise<void>;
  /** Demo login (guest) that uses mock data only. */
  loginDemo: (role?: UserRole) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  currentRole: UserRole;
  /** True if the current session is demo/guest (mock data only). */
  isDemo: boolean;
  isLoading: boolean;
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
  const [isDemo, setIsDemo] = useState<boolean>(false);

  useEffect(() => {
    // Restore session
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('currentRole');
    const storedIsDemo = localStorage.getItem('isDemo');

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setCurrentRole((storedRole as UserRole) || userData.roles[0] || 'user');
    }
    setIsDemo(storedIsDemo === '1');
    setIsLoading(false);
  }, []);

  /**
   * Normal login — now calls the backend and blocks invalid credentials.
   * Demo/guest should use loginDemo() below.
   */
  const login = async (email: string, password: string) => {
  setIsLoading(true);
  try {
    const res = await apiLogin({ email, password });
    if (!res.ok || !res.data) {
      // Make LoginPage show the red error box
      throw new Error(res.error?.message || 'Invalid email or password');
    }

    // Persist real user + token
    const { user: realUser, token } = res.data;
    setUser(realUser as User);
    setCurrentRole((realUser.roles?.[0] as UserRole) || 'user');
    setIsDemo(false);

    localStorage.setItem('user', JSON.stringify(realUser));
    localStorage.setItem('currentRole', ((realUser.roles?.[0] as UserRole) || 'user'));
    localStorage.setItem('isDemo', '0');
    localStorage.setItem('auth_token', token);
  } catch (err: any) {
    // Important: rethrow so LoginPage catch runs and shows the error
    throw err;
  } finally {
    setIsLoading(false);
  }
  };


  /**
   * Demo/guest login — forces demo mode and injects a guest user.
   * This is what “Continue as Guest (Demo)” will call.
   */
  const loginDemo = async (role: UserRole = 'user') => {
    setIsLoading(true);

    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 300));

    const guest: User = {
      id: 'guest',
      email: 'guest@demo.local',
      username: 'guest',
      firstName: 'Guest',
      lastName: 'User',
      profilePicture:
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      credits: 99.99,
      roles: role === 'admin' ? ['admin', 'printer-owner', 'user'] : role === 'printer-owner' ? ['printer-owner', 'user'] : ['user'],
      university: 'Campus University',
      hall: 'Demo Hall',
      createdAt: new Date().toISOString(),
    };

    setUser(guest);
    setCurrentRole(guest.roles[0]);
    setIsDemo(true);

    localStorage.setItem('user', JSON.stringify(guest));
    localStorage.setItem('currentRole', guest.roles[0]);
    localStorage.setItem('isDemo', '1');

    setIsLoading(false);
  };

  const signup = async (userData: SignupData) => {
  setIsLoading(true);
  try {
    const res = await apiRegister({
      email: userData.email,
      password: userData.password,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
    });
    if (!res.ok || !res.data) {
      throw new Error(res.error?.message || 'Failed to create account');
    }

    const { user: realUser, token } = res.data;
    setUser(realUser as User);
    setCurrentRole('user');     // backend defaults to user role
    setIsDemo(false);

    localStorage.setItem('user', JSON.stringify(realUser));
    localStorage.setItem('currentRole', 'user');
    localStorage.setItem('isDemo', '0');
    localStorage.setItem('auth_token', token);
  } catch (err) {
    throw err;
  } finally {
    setIsLoading(false);
  }
};


const logout = () => {
  setUser(null);
  setCurrentRole(null);
  setIsDemo(false);
  localStorage.removeItem('user');
  localStorage.removeItem('currentRole');
  localStorage.removeItem('isDemo');
  localStorage.removeItem('auth_token'); // new
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
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginDemo,
        signup,
        logout,
        updateUser,
        addRole,
        switchRole,
        currentRole,
        isDemo,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

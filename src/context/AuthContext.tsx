//src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, UserRole } from "../types";
import {
  login as apiLogin,
  register as apiRegister,
  updateProfile as apiUpdateProfile,
  uploadProfilePicture as apiUploadProfilePicture,
} from "../lib/api";
import { BASE_URL } from "../lib/api";

interface SignupData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
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
  /** Update profile via API (firstName, lastName, phoneNumber) */
  updateProfile: (updates: { firstName?: string; lastName?: string; phoneNumber?: string }) => Promise<void>;
  addRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  currentRole: UserRole;
  /** True if the current session is demo/guest (mock data only). */
  isDemo: boolean;
  isLoading: boolean;
  /** Upload and persist the user's profile picture */
  uploadProfilePicture: (file: File) => Promise<void>;
}

const roleHierarchy: UserRole[] = ["admin", "printer_owner", "user"];

function getHighestRole(roles: UserRole[]): UserRole {
  for (const role of roleHierarchy) {
    if (roles.includes(role)) {
      return role;
    }
  }
  return "user";
}

function fixUserPicture<T extends { profilePicture?: string | null }>(u: T): T {
  const pic = u?.profilePicture;
  if (!pic) return u;
  if (/^(https?:)?\/\//i.test(pic) || pic.startsWith("data:")) return u;
  // backend returns "/files/..." – make it absolute for the browser
  return {
    ...u,
    profilePicture: `${BASE_URL}${pic.startsWith("/") ? "" : "/"}${pic}`,
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>("user");
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);

  useEffect(() => {
    // Restore session
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("currentRole");
    const storedIsDemo = localStorage.getItem("isDemo");

    // read guest mode default from env if nothing stored
    const envGuest = (import.meta.env.VITE_GUEST_MODE ?? "")
      .toString()
      .trim()
      .toLowerCase();
    const envGuestOn =
      envGuest === "1" || envGuest === "true" || envGuest === "yes";

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      // Normalize any legacy role strings like "printer-owner" -> "printer_owner"
      const normalizedRoles = Array.isArray(parsed.roles)
        ? parsed.roles.map((r: string) =>
            r === "printer-owner" ? "printer_owner" : r
          )
        : ["user"];

      const userData = fixUserPicture({ ...parsed, roles: normalizedRoles });
      setUser(userData);

      // pick the highest role after normalization
      const highestRole = getHighestRole(userData.roles || []);
      setCurrentRole((storedRole as UserRole) || highestRole);
    }

    // prefer stored flag; otherwise default from env
    if (storedIsDemo !== null) {
      setIsDemo(storedIsDemo === "1");
    } else {
      setIsDemo(envGuestOn);
    }
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
        const errorMessage = !res.ok ? res.error.message : "Invalid email or password";
        throw new Error(errorMessage);
      }

      // Persist real user + token
      const { user: realUser, token } = res.data;
      const fixed = fixUserPicture(realUser as User);
      setUser(fixed);
      const highestRole = getHighestRole(fixed.roles || []);
      setCurrentRole(highestRole);
      setIsDemo(false);

      localStorage.setItem("user", JSON.stringify(fixed));
      localStorage.setItem("currentRole", highestRole);
      localStorage.setItem("isDemo", "0");
      localStorage.setItem("auth_token", token);
    } catch (err: any) {
      // Important: rethrow so LoginPage catch runs and shows the error
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Demo/guest login — forces demo mode and injects a guest user.
   * This is what "Continue as Guest (Demo)" will call.
   */
  const loginDemo = async (role: UserRole = "user") => {
    setIsLoading(true);

    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    const guest: User = {
      id: role === "printer_owner" ? "user-2" : "guest", // Use user-2 for printer owner to match demo data
      email: "guest@demo.local",
      username: role === "printer_owner" ? "Demo Printer Owner" : "guest",
      firstName: "Guest",
      lastName: role === "printer_owner" ? "Printer Owner" : "User", 
      profilePicture:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
      credits: 99.99,
      roles:
        role === "admin"
          ? ["admin", "printer_owner", "user"]
          : role === "printer_owner"
          ? ["printer_owner", "user"]
          : ["user"],
      university: "Campus University",
      hall: "Demo Hall",
      createdAt: new Date().toISOString(),
    };

    setUser(guest);
    const highestRole = getHighestRole(guest.roles);
    setCurrentRole(highestRole);
    setIsDemo(true);

    localStorage.setItem("user", JSON.stringify(guest));
    localStorage.setItem("currentRole", highestRole);
    localStorage.setItem("isDemo", "1");

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
        phoneNumber: userData.phoneNumber, // NEW
        university: userData.university, // NEW
        hall: userData.hall, // NEW (optional)
      });

      if (!res.ok || !res.data) {
        const errorMessage = !res.ok ? res.error.message : "Failed to create account";
        throw new Error(errorMessage);
      }

      const { user: realUser, token } = res.data;
      const fixed = fixUserPicture(realUser as User);
      setUser(fixed);
      setCurrentRole("user");
      setIsDemo(false);

      localStorage.setItem("user", JSON.stringify(fixed));
      localStorage.setItem("currentRole", "user");
      localStorage.setItem("isDemo", "0");
      localStorage.setItem("auth_token", token);
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    if (!user) throw new Error("Not logged in");
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("auth_token");
      const res = await apiUploadProfilePicture(file, token || undefined);
      if (!res.ok || !res.data) {
        const errorMessage = !res.ok ? res.error.message : "Upload failed";
        throw new Error(errorMessage);
      }

      // Backend returns { message, url, user }. Prefer the returned user if present.
      const returnedUser = (res.data as any).user as User | undefined;
      const returnedUrl = (res.data as any).url as string | undefined;

      // Add a cache-busting query so the <img> re-fetches immediately.
      const bust = (u?: string | null) =>
        !u ? u : `${u}${u.includes("?") ? "&" : "?"}v=${Date.now()}`;

      // Build the next user object and make the profilePicture absolute (fixUserPicture)
      const nextUser: User = fixUserPicture(
        returnedUser
          ? {
              ...returnedUser,
              profilePicture: bust(returnedUser.profilePicture) as any,
            }
          : {
              ...user,
              profilePicture: bust(returnedUrl || user.profilePicture) as any,
            }
      );

      setUser(nextUser);
      localStorage.setItem("user", JSON.stringify(nextUser));

      // Let other screens (e.g., Admin) update their local lists immediately
      window.dispatchEvent(
        new CustomEvent("auth:user-updated", { detail: nextUser })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: { firstName?: string; lastName?: string; phoneNumber?: string }) => {
    if (!user) throw new Error("Not logged in");
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("auth_token");
      const res = await apiUpdateProfile(updates, token || undefined);
      if (!res.ok || !res.data) {
        const errorMessage = !res.ok ? res.error.message : "Profile update failed";
        throw new Error(errorMessage);
      }

      // Backend returns updated user data
      const updatedUser = fixUserPicture(res.data as User);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Let other screens update their local lists immediately
      window.dispatchEvent(
        new CustomEvent("auth:user-updated", { detail: updatedUser })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentRole("user"); // keep type-safe default
    setIsDemo(false);
    localStorage.removeItem("user");
    localStorage.removeItem("currentRole");
    localStorage.removeItem("isDemo");
    localStorage.removeItem("auth_token");
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const addRole = (role: UserRole) => {
    if (user && !user.roles.includes(role)) {
      const updatedUser = { ...user, roles: [...user.roles, role] };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const switchRole = (role: UserRole) => {
    if (user && user.roles.includes(role)) {
      setCurrentRole(role);
      localStorage.setItem("currentRole", role);
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
        updateProfile,
        addRole,
        switchRole,
        currentRole,
        isDemo,
        isLoading,
        uploadProfilePicture, // NEW
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

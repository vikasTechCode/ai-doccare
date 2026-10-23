import { createContext, useContext, useEffect, useState } from "react";
import { authService, AuthUser } from "@/lib/auth";


interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<AuthUser>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService.initialize();
    setUser(authService.getCurrentUser());
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
  const user = await authService.login(username, password);
  setUser(user);
  return user;
};

  const register = async (userData: any) => {
    const user = await authService.register(userData);
    setUser(user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

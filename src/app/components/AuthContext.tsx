import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface User {
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "lifenix_users";
const CURRENT_USER_KEY = "lifenix_current_user";

interface StoredUser {
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

function getStoredUsers(): StoredUser[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getCurrentUser();
    if (stored) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));

    const users = getStoredUsers();
    const found = users.find((u) => u.email === email.toLowerCase().trim());

    if (!found) {
      return { success: false, error: "该邮箱尚未注册" };
    }
    if (found.password !== password) {
      return { success: false, error: "密码错误，请重试" };
    }

    const currentUser: User = {
      email: found.email,
      name: found.name,
      createdAt: found.createdAt,
    };
    setUser(currentUser);
    saveCurrentUser(currentUser);
    return { success: true };
  };

  const register = async (email: string, password: string, name: string) => {
    await new Promise((r) => setTimeout(r, 600));

    const users = getStoredUsers();
    const normalizedEmail = email.toLowerCase().trim();

    if (users.find((u) => u.email === normalizedEmail)) {
      return { success: false, error: "该邮箱已被注册" };
    }

    const newUser: StoredUser = {
      email: normalizedEmail,
      password,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    saveStoredUsers([...users, newUser]);

    const currentUser: User = {
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    };
    setUser(currentUser);
    saveCurrentUser(currentUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    saveCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

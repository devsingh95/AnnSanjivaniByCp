import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (v: boolean) => void;
}

// Safely parse stored user
function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

const storedToken = localStorage.getItem('token');
const storedUser = loadStoredUser();

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken && !!storedUser,
  loading: !!storedToken && !storedUser, // needs /me call
  login: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, loading: false });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, loading: false });
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  setLoading: (v) => set({ loading: v }),
}));

interface AppState {
  activeTab: string;
  sidebarOpen: boolean;
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  sidebarOpen: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

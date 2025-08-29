/**
 * Robust Application Store
 * Centralized state management with persistence and synchronization
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Permission, UserRole, Role } from '@/types/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface NavigationState {
    currentPath: string;
    previousPath: string;
    breadcrumbs: { label: string; path: string }[];
}

interface NotificationItem {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    persistent?: boolean;
}

interface NotificationState {
    notifications: NotificationItem[];
    unreadCount: number;
}

interface ConnectionState {
    isOnline: boolean;
    isServerReachable: boolean;
    lastSyncTime: Date | null;
    syncInProgress: boolean;
    offlineActions: any[];
}

// Combined store state
interface AppState {
    auth: AuthState;
    navigation: NavigationState;
    notifications: NotificationState;
    connection: ConnectionState;
    ui: {
        sidebarOpen: boolean;
        theme: 'light' | 'dark' | 'system';
        loading: Record<string, boolean>;
    };
}

// Store actions
interface AppActions {
    // Auth actions
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setAuthLoading: (loading: boolean) => void;
    setAuthError: (error: string | null) => void;
    login: (email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    hasPermission: (module: string, action?: string) => boolean;
    hasRole: (role: UserRole | UserRole[]) => boolean;
    isAdmin: () => boolean;

    // Navigation actions
    setCurrentPath: (path: string) => void;
    setPreviousPath: (path: string) => void;
    setBreadcrumbs: (breadcrumbs: { label: string; path: string }[]) => void;
    navigateTo: (path: string) => void;

    // Notification actions
    addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;

    // Connection actions
    setOnlineStatus: (isOnline: boolean) => void;
    setServerReachable: (reachable: boolean) => void;
    setLastSyncTime: (time: Date) => void;
    setSyncInProgress: (inProgress: boolean) => void;
    addOfflineAction: (action: any) => void;
    clearOfflineActions: () => void;

    // UI actions
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    setLoading: (key: string, loading: boolean) => void;

    // Utility actions
    reset: () => void;
    hydrate: () => void;
}

// Initial state
const initialState: AppState = {
    auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    },
    navigation: {
        currentPath: '/',
        previousPath: '/',
        breadcrumbs: [],
    },
    notifications: {
        notifications: [],
        unreadCount: 0,
    },
    connection: {
        isOnline: navigator.onLine,
        isServerReachable: false,
        lastSyncTime: null,
        syncInProgress: false,
        offlineActions: [],
    },
    ui: {
        sidebarOpen: false,
        theme: 'system',
        loading: {},
    },
};

// Create the store with persistence
export const useAppStore = create<AppState & AppActions>()(
    persist(
        (set, get) => ({
            ...initialState,

            // Auth actions
            setUser: (user) =>
                set((state) => ({
                    ...state,
                    auth: {
                        ...state.auth,
                        user,
                        isAuthenticated: !!user,
                    }
                })),

            setToken: (token) =>
                set((state) => ({
                    ...state,
                    auth: {
                        ...state.auth,
                        token,
                    }
                })),

            setAuthLoading: (loading) =>
                set((state) => ({
                    ...state,
                    auth: {
                        ...state.auth,
                        isLoading: loading,
                    }
                })),

            setAuthError: (error) =>
                set((state) => ({
                    ...state,
                    auth: {
                        ...state.auth,
                        error,
                    }
                })),

            login: async (email, password) => {
                const { setAuthLoading, setAuthError, setUser, setToken } = get();

                setAuthLoading(true);
                setAuthError(null);

                try {
                    // Import HttpService dynamically to avoid circular imports
                    const { httpService } = await import('@/services/HttpService');

                    if (!navigator.onLine) {
                        throw new Error('Internet connection is required for authentication');
                    }

                    const response = await httpService.authenticate(email, password);

                    // Handle role conversion from string to Role object
                    let userRole: Role | undefined;
                    let roleId: string | undefined;

                    if (typeof response.user.role === 'string') {
                        roleId = response.user.role;
                        userRole = {
                            id: response.user.role,
                            name: response.user.role,
                            displayName: response.user.role,
                            accessLevel: 1,
                            isActive: true,
                            isSystemRole: false,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                    } else if (response.user.role && typeof response.user.role === 'object') {
                        userRole = response.user.role as Role;
                        roleId = userRole.id;
                    }

                    const user: User = {
                        id: response.user.id,
                        email: response.user.email,
                        name: response.user.name,
                        role: userRole,
                        roleId: roleId,
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        permissions: response.user.permissions || [],
                    };

                    setUser(user);
                    setToken(response.token.token);

                    return user;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
                    setAuthError(errorMessage);
                    throw new Error(errorMessage);
                } finally {
                    setAuthLoading(false);
                }
            },

            logout: async () => {
                const { setUser, setToken, setAuthLoading } = get();

                setAuthLoading(true);

                try {
                    if (navigator.onLine) {
                        const { httpService } = await import('@/services/HttpService');
                        await httpService.logout();
                    }
                } catch (error) {
                    console.warn('Logout request failed:', error);
                } finally {
                    setUser(null);
                    setToken(null);
                    setAuthLoading(false);
                }
            },

            hasPermission: (module, action = 'read') => {
                const { auth } = get();
                if (!auth.user) return false;

                return auth.user.permissions.some(p => {
                    if (p.module === '*') return true;
                    return p.module === module && p.actions?.includes(action as any);
                });
            },

            hasRole: (role) => {
                const { auth } = get();
                if (!auth.user || !auth.user.role) return false;

                const roles = Array.isArray(role) ? role : [role];
                const userRole = typeof auth.user.role === 'object'
                    ? auth.user.role.name as UserRole
                    : auth.user.role as UserRole;

                return roles.includes(userRole);
            },

            isAdmin: () => {
                const { hasRole } = get();
                return hasRole('super_admin');
            },

            // Navigation actions
            setCurrentPath: (path) =>
                set((state) => ({
                    ...state,
                    navigation: {
                        ...state.navigation,
                        previousPath: state.navigation.currentPath,
                        currentPath: path,
                    }
                })),

            setPreviousPath: (path) =>
                set((state) => ({
                    ...state,
                    navigation: {
                        ...state.navigation,
                        previousPath: path,
                    }
                })),

            setBreadcrumbs: (breadcrumbs) =>
                set((state) => ({
                    ...state,
                    navigation: {
                        ...state.navigation,
                        breadcrumbs,
                    }
                })),

            navigateTo: (path) => {
                const { setCurrentPath } = get();
                setCurrentPath(path);
            },

            // Notification actions
            addNotification: (notification) =>
                set((state) => {
                    const newNotification: NotificationItem = {
                        ...notification,
                        id: crypto.randomUUID(),
                        timestamp: new Date().toISOString(),
                        read: false,
                    };
                    return {
                        ...state,
                        notifications: {
                            notifications: [newNotification, ...state.notifications.notifications],
                            unreadCount: state.notifications.unreadCount + 1,
                        }
                    };
                }),

            removeNotification: (id) =>
                set((state) => {
                    const notification = state.notifications.notifications.find(n => n.id === id);
                    const wasUnread = notification && !notification.read;
                    return {
                        ...state,
                        notifications: {
                            notifications: state.notifications.notifications.filter(n => n.id !== id),
                            unreadCount: wasUnread ? state.notifications.unreadCount - 1 : state.notifications.unreadCount,
                        }
                    };
                }),

            markAsRead: (id) =>
                set((state) => {
                    const notifications = state.notifications.notifications.map(n =>
                        n.id === id ? { ...n, read: true } : n
                    );
                    const notification = state.notifications.notifications.find(n => n.id === id);
                    const wasUnread = notification && !notification.read;
                    return {
                        ...state,
                        notifications: {
                            notifications,
                            unreadCount: wasUnread ? state.notifications.unreadCount - 1 : state.notifications.unreadCount,
                        }
                    };
                }),

            markAllAsRead: () =>
                set((state) => ({
                    ...state,
                    notifications: {
                        notifications: state.notifications.notifications.map(n => ({ ...n, read: true })),
                        unreadCount: 0,
                    }
                })),

            clearNotifications: () =>
                set((state) => ({
                    ...state,
                    notifications: {
                        notifications: [],
                        unreadCount: 0,
                    }
                })),

            // Connection actions
            setOnlineStatus: (isOnline) =>
                set((state) => ({
                    ...state,
                    connection: {
                        ...state.connection,
                        isOnline,
                    }
                })),

            setServerReachable: (reachable) =>
                set((state) => ({
                    ...state,
                    connection: {
                        ...state.connection,
                        isServerReachable: reachable,
                    }
                })),

            setLastSyncTime: (time) =>
                set((state) => ({
                    ...state,
                    connection: {
                        ...state.connection,
                        lastSyncTime: time,
                    }
                })),

            setSyncInProgress: (inProgress) =>
                set((state) => ({
                    ...state,
                    connection: {
                        ...state.connection,
                        syncInProgress: inProgress,
                    }
                })),

            addOfflineAction: (action) =>
                set((state) => ({
                    ...state,
                    connection: {
                        ...state.connection,
                        offlineActions: [...state.connection.offlineActions, action],
                    }
                })),

            clearOfflineActions: () =>
                set((state) => ({
                    ...state,
                    connection: {
                        ...state.connection,
                        offlineActions: [],
                    }
                })),

            // UI actions
            toggleSidebar: () =>
                set((state) => ({
                    ...state,
                    ui: {
                        ...state.ui,
                        sidebarOpen: !state.ui.sidebarOpen,
                    }
                })),

            setSidebarOpen: (open) =>
                set((state) => ({
                    ...state,
                    ui: {
                        ...state.ui,
                        sidebarOpen: open,
                    }
                })),

            setTheme: (theme) =>
                set((state) => ({
                    ...state,
                    ui: {
                        ...state.ui,
                        theme,
                    }
                })),

            setLoading: (key, loading) =>
                set((state) => {
                    const newLoading = { ...state.ui.loading };
                    if (loading) {
                        newLoading[key] = true;
                    } else {
                        delete newLoading[key];
                    }
                    return {
                        ...state,
                        ui: {
                            ...state.ui,
                            loading: newLoading,
                        }
                    };
                }),

            // Utility actions
            reset: () => set({ ...initialState }),

            hydrate: () => {
                const { auth } = get();
                if (auth.token && auth.user) {
                    import('@/services/HttpService').then(({ httpService }) => {
                        httpService.setToken(auth.token!);
                    });
                }
            },
        }),
        {
            name: 'hospital-store',
            partialize: (state) => ({
                auth: {
                    user: state.auth.user,
                    token: state.auth.token,
                    isAuthenticated: state.auth.isAuthenticated,
                },
                ui: {
                    theme: state.ui.theme,
                    sidebarOpen: state.ui.sidebarOpen,
                },
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.hydrate();
                }
            },
        }
    )
);

// Setup online/offline listeners
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        useAppStore.getState().setOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
        useAppStore.getState().setOnlineStatus(false);
    });
}

// Export selectors for better performance
export const useAuth = () => useAppStore(state => ({
    user: state.auth.user,
    token: state.auth.token,
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.auth.isLoading,
    error: state.auth.error,
    login: state.login,
    logout: state.logout,
    hasPermission: state.hasPermission,
    hasRole: state.hasRole,
    isAdmin: state.isAdmin,
    clearError: () => state.setAuthError(null),
}));

export const useNavigation = () => {
    const store = useAppStore(state => ({
        currentPath: state.navigation.currentPath,
        previousPath: state.navigation.previousPath,
        breadcrumbs: state.navigation.breadcrumbs,
        setCurrentPath: state.setCurrentPath,
        setBreadcrumbs: state.setBreadcrumbs,
        navigateTo: state.navigateTo,
    }));

    // Get current active tab from URL - use React Router hooks safely
    const activeTab = typeof window !== 'undefined' ?
        window.location.pathname.slice(1) || 'landing' : 'landing';

    // Navigate to specific tab
    const setActiveTab = (tab: string) => {
        if (typeof window !== 'undefined') {
            const navigate = require('react-router-dom').useNavigate();
            navigate(`/${tab}`);
            store.setCurrentPath(`/${tab}`);
        }
    };

    // Force update to dashboard when user logs in
    const navigateToDashboard = () => {
        console.log('Forcing navigation to dashboard');
        if (typeof window !== 'undefined') {
            window.location.href = '/dashboard';
        }
    };

    return {
        activeTab,
        setActiveTab,
        navigateToDashboard,
        ...store,
    };
};

export const useNotifications = () => {
    const store = useAppStore(state => ({
        notifications: state.notifications.notifications,
        unreadCount: state.notifications.unreadCount,
        addNotification: state.addNotification,
        removeNotification: state.removeNotification,
        markAsRead: state.markAsRead,
        markAllAsRead: state.markAllAsRead,
        clearNotifications: state.clearNotifications,
    }));

    // Enhanced notification methods
    const addNotification = (notification: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => {
        // Show toast
        import('sonner').then(({ toast }) => {
            toast[notification.type](notification.message);
        });

        // Add to store
        store.addNotification({
            type: notification.type,
            title: notification.type.charAt(0).toUpperCase() + notification.type.slice(1),
            message: notification.message,
            read: false,
        });
    };

    return {
        ...store,
        addNotification,
    };
};

export const useConnection = () => useAppStore(state => ({
    isOnline: state.connection.isOnline,
    isServerReachable: state.connection.isServerReachable,
    lastSyncTime: state.connection.lastSyncTime,
    syncInProgress: state.connection.syncInProgress,
    offlineActions: state.connection.offlineActions,
    setServerReachable: state.setServerReachable,
    setLastSyncTime: state.setLastSyncTime,
    setSyncInProgress: state.setSyncInProgress,
    addOfflineAction: state.addOfflineAction,
    clearOfflineActions: state.clearOfflineActions,
}));

export const useUI = () => useAppStore(state => ({
    sidebarOpen: state.ui.sidebarOpen,
    theme: state.ui.theme,
    loading: state.ui.loading,
    toggleSidebar: state.toggleSidebar,
    setSidebarOpen: state.setSidebarOpen,
    setTheme: state.setTheme,
    setLoading: state.setLoading,
}));

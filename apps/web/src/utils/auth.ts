"use client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string; // The Operational Post / Designation (e.g., Fleet Lead, NHAI Dispatcher)
  avatarInitials: string;
  department: string;
  provider: 'credentials' | 'google' | 'github' | 'smartcar' | 'demo';
  token?: string;
  avatarUrl?: string;
  isDemo?: boolean;
}

export const DEMO_USERS: Record<string, UserProfile> = {
  fleet_lead: {
    id: 'demo_usr_001',
    name: 'Hardik Agrawal',
    email: 'hardik.demo@roadsense.ai',
    role: 'Fleet Operations Lead',
    avatarInitials: 'HA',
    department: 'Enterprise Fleet Intelligence',
    provider: 'demo',
    isDemo: true
  },
  gov_dispatcher: {
    id: 'demo_usr_002',
    name: 'Dr. Priya Menon',
    email: 'priya.demo@morth.gov.in',
    role: 'NHAI Incident Dispatcher',
    avatarInitials: 'PM',
    department: 'MoRTH Highway Safety Control',
    provider: 'demo',
    isDemo: true
  },
  iot_engineer: {
    id: 'demo_usr_003',
    name: 'Vikram Singh',
    email: 'vikram.demo@smartcar.oem',
    role: 'IoT Telematics Specialist',
    avatarInitials: 'VS',
    department: 'CAN-bus & OBD-II Diagnostics',
    provider: 'demo',
    isDemo: true
  }
};

const AUTH_STORAGE_KEY = 'roadsense_user_session';
const DEMO_STORAGE_KEY = 'roadsense_demo_session';
const LAST_ACTIVE_KEY = 'roadsense_last_active_timestamp';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 24 hours in ms

/**
 * Retrieves the currently active user session.
 * 1. Checks sessionStorage for temporary Demo logins (auto-reset on window close).
 * 2. Checks localStorage for persistent logins (Google, GitHub, Corporate Email) and validates 24h inactivity expiry.
 */
export function getSessionUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Check ephemeral demo session (resets automatically when browser window is closed)
    const demoSaved = sessionStorage.getItem(DEMO_STORAGE_KEY);
    if (demoSaved) {
      return JSON.parse(demoSaved);
    }

    // 2. Check persistent account session (Google, GitHub, Corporate Passcode)
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!saved) return null;

    const user: UserProfile = JSON.parse(saved);

    // 3. Verify 24-hour inactivity window
    const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);
    const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;
    const now = Date.now();

    if (lastActive && now - lastActive > TWENTY_FOUR_HOURS_MS) {
      // Session has expired after 24 hours of inactivity
      console.warn('[RoadSense Auth] Session expired after 24 hours of inactivity.');
      clearSessionUser();
      return null;
    }

    // Update heartbeat activity timestamp
    localStorage.setItem(LAST_ACTIVE_KEY, now.toString());
    return user;
  } catch (e) {
    console.error('Failed to parse session user', e);
    return null;
  }
}

/**
 * Sets user session:
 * - Persistent accounts (Google, GitHub, Credentials) are saved in localStorage + 24h timer.
 * - Demo accounts are saved in sessionStorage (clears automatically when window closes).
 */
export function setSessionUser(user: UserProfile, isDemo: boolean = false): void {
  if (typeof window === 'undefined') return;
  try {
    const isDemoAccount = isDemo || user.provider === 'demo' || user.isDemo === true;

    if (isDemoAccount) {
      // Ephemeral Demo Session (clears on window close)
      sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ ...user, isDemo: true }));
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(LAST_ACTIVE_KEY);
    } else {
      // Persistent 24h Account Session
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
      sessionStorage.removeItem(DEMO_STORAGE_KEY);
    }

    window.dispatchEvent(new Event('roadsense_auth_changed'));
  } catch (e) {
    console.error('Failed to set session user', e);
  }
}

/**
 * Updates the current session user details (e.g. edited Name or Post/Role).
 */
export function updateSessionUser(updates: Partial<UserProfile>): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const current = getSessionUser();
    if (!current) return null;

    const names = (updates.name || current.name || 'User').trim().split(' ');
    const initials = names.length >= 2
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : (names[0] ? names[0].slice(0, 2).toUpperCase() : 'OP');

    const updated: UserProfile = {
      ...current,
      ...updates,
      avatarInitials: initials
    };

    if (current.isDemo) {
      sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updated));
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    }

    window.dispatchEvent(new Event('roadsense_auth_changed'));
    return updated;
  } catch (e) {
    console.error('Failed to update session user', e);
    return null;
  }
}

/**
 * Completely clears all session tokens and active user data.
 */
export function clearSessionUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(LAST_ACTIVE_KEY);
    sessionStorage.removeItem(DEMO_STORAGE_KEY);
    window.dispatchEvent(new Event('roadsense_auth_changed'));
  } catch (e) {
    console.error('Failed to clear session user', e);
  }
}

/**
 * Gets a unique storage key for account-specific data (e.g. Chat history, notifications).
 */
export function getAccountStorageKey(prefix: string): string {
  if (typeof window === 'undefined') return `${prefix}_guest`;
  const user = getSessionUser();
  if (!user) return `${prefix}_guest`;
  if (user.isDemo) return `${prefix}_demo_${user.id}`;
  const safeId = (user.email || user.id).replace(/[^a-zA-Z0-9_]/g, '_');
  return `${prefix}_${safeId}`;
}

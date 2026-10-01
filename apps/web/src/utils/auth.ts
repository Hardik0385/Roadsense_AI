"use client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarInitials: string;
  department: string;
  provider: 'credentials' | 'google' | 'github' | 'smartcar';
  token?: string;
}

export const DEMO_USERS: Record<string, UserProfile> = {
  fleet_lead: {
    id: 'usr_001',
    name: 'Hardik Agrawal',
    email: 'hardik@roadsense.ai',
    role: 'Fleet Operations Lead',
    avatarInitials: 'HA',
    department: 'Enterprise Fleet Intelligence',
    provider: 'credentials'
  },
  gov_dispatcher: {
    id: 'usr_002',
    name: 'Dr. Priya Menon',
    email: 'priya.menon@morth.gov.in',
    role: 'NHAI Incident Dispatcher',
    avatarInitials: 'PM',
    department: 'MoRTH Highway Safety Control',
    provider: 'google'
  },
  iot_engineer: {
    id: 'usr_003',
    name: 'Vikram Singh',
    email: 'vikram.singh@smartcar.oem',
    role: 'IoT Telematics Specialist',
    avatarInitials: 'VS',
    department: 'CAN-bus & OBD-II Diagnostics',
    provider: 'smartcar'
  }
};

const AUTH_STORAGE_KEY = 'roadsense_user_session';

export function getSessionUser(): UserProfile | null {
  if (typeof window === 'undefined') return DEMO_USERS.fleet_lead;
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse session user', e);
  }
  return DEMO_USERS.fleet_lead;
}

export function setSessionUser(user: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('roadsense_auth_changed'));
  } catch (e) {
    console.error('Failed to set session user', e);
  }
}

export function clearSessionUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event('roadsense_auth_changed'));
  } catch (e) {
    console.error('Failed to clear session user', e);
  }
}

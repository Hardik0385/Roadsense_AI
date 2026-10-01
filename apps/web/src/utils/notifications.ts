"use client";

export interface RoadSenseNotification {
  id: string;
  title: string;
  message: string;
  type: 'dispatch' | 'incident' | 'alert' | 'system';
  timestamp: string;
  read: boolean;
  incidentId?: string;
  city?: string;
  unitId?: string;
  roadName?: string;
}

const NOTIFICATIONS_STORAGE_KEY = 'roadsense_live_notifications';

// Default initial notifications so the bell looks active and realistic
const DEFAULT_NOTIFICATIONS: RoadSenseNotification[] = [
  {
    id: 'notif_init_1',
    title: 'Emergency Response Unit Deployed',
    message: 'Rapid Medical Unit R-04 dispatched to NH-48 Corridor (Km 142). ETA 6 mins.',
    type: 'dispatch',
    timestamp: '2 mins ago',
    read: false,
    city: 'Delhi',
    unitId: 'PATROL-UNIT-142',
    roadName: 'NH-48 Corridor'
  },
  {
    id: 'notif_init_2',
    title: 'Highway Patrol En Route',
    message: 'Traffic Triage Patrol P-08 acknowledged multi-vehicle collision near Eastern Freeway.',
    type: 'dispatch',
    timestamp: '8 mins ago',
    read: false,
    city: 'Mumbai',
    unitId: 'PATROL-UNIT-108',
    roadName: 'Eastern Freeway'
  },
  {
    id: 'notif_init_3',
    title: 'High Congestion Alert Cleared',
    message: 'Outer Ring Road (Silk Board junction) lane blockage cleared by regional recovery crane.',
    type: 'incident',
    timestamp: '25 mins ago',
    read: true,
    city: 'Bangalore',
    roadName: 'Outer Ring Road'
  }
];

export function getNotifications(): RoadSenseNotification[] {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATIONS;
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to get notifications', e);
  }
  return DEFAULT_NOTIFICATIONS;
}

export function saveNotifications(notifications: RoadSenseNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('roadsense_notifications_updated'));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

export function addDispatchNotification(params: {
  incidentId: string;
  roadName: string;
  city: string;
  unitId: string;
  type?: string;
}): RoadSenseNotification {
  const newNotif: RoadSenseNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title: `🚨 Emergency Unit Dispatched (${params.unitId})`,
    message: `Unit ${params.unitId} successfully dispatched to ${params.type || 'Incident'} on ${params.roadName}, ${params.city}. Priority sirens enabled.`,
    type: 'dispatch',
    timestamp: 'Just now',
    read: false,
    incidentId: params.incidentId,
    city: params.city,
    unitId: params.unitId,
    roadName: params.roadName
  };

  const current = getNotifications();
  const updated = [newNotif, ...current].slice(0, 30); // Keep latest 30
  saveNotifications(updated);
  return newNotif;
}

export function markAsRead(id: string): void {
  const current = getNotifications();
  const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
  saveNotifications(updated);
}

export function markAllAsRead(): void {
  const current = getNotifications();
  const updated = current.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
}

export function clearAllNotifications(): void {
  saveNotifications([]);
}

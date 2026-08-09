/**
 * Local Notification Engine for Hayat Prayer Times
 * Uses Web Notifications API & Web Audio API chime
 */
import { PrayerTimes, PrayerSettings, PrayerName } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { timeToMinutes } from './prayerEngine';

export const PRAYER_ALBANIAN_NAMES: Record<PrayerName, string> = {
 imsak: 'Imsaku',
 fajr: 'Sabahu',
 sunrise: 'Lindja e Diellit',
 dhuhr: 'Dreka',
 asr: 'Ikindia',
 maghrib: 'Akshami',
 isha: 'Jacia'
};

// Play a gentle notification chime using Web Audio API
export function playNotificationChime() {
 try {
 const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
 if (!AudioCtx) return;
 const ctx = new AudioCtx();
 
 // Simple 2-tone gentle chime
 const now = ctx.currentTime;
 
 // First note (E5 = 659.25Hz)
 const osc1 = ctx.createOscillator();
 const gain1 = ctx.createGain();
 osc1.type = 'sine';
 osc1.frequency.setValueAtTime(659.25, now);
 gain1.gain.setValueAtTime(0.15, now);
 gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
 osc1.connect(gain1);
 gain1.connect(ctx.destination);
 osc1.start(now);
 osc1.stop(now + 0.8);

 // Second note (A5 = 880Hz)
 const osc2 = ctx.createOscillator();
 const gain2 = ctx.createGain();
 osc2.type = 'sine';
 osc2.frequency.setValueAtTime(880, now + 0.25);
 gain2.gain.setValueAtTime(0.2, now + 0.25);
 gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
 osc2.connect(gain2);
 gain2.connect(ctx.destination);
 osc2.start(now + 0.25);
 osc2.stop(now + 1.2);
 } catch (err) {
 console.warn('Could not play chime audio:', err);
 }
}

export function isNotificationSupported(): boolean {
 return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
 if (!isNotificationSupported()) return 'unsupported';
 return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
 if (!isNotificationSupported()) return 'unsupported';
 try {
 const permission = await Notification.requestPermission();
 return permission;
 } catch (err) {
 console.warn('Error requesting notification permission:', err);
 return Notification.permission;
 }
}

export function sendLocalNotification(title: string, body: string, icon: string = '/favicon.ico') {
 if (!isNotificationSupported() || Notification.permission !== 'granted') {
 console.warn('Notification permission not granted or unsupported');
 return;
 }

 playNotificationChime();

 try {
 // Try Service Worker notification if registered
 if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
 navigator.serviceWorker.ready.then(reg => {
 reg.showNotification(title, {
 body,
 icon,
 badge: icon,
 vibrate: [200, 100, 200]
 } as any);
 }).catch(() => {
 new Notification(title, { body, icon });
 });
 } else {
 new Notification(title, { body, icon });
 }
 } catch (err) {
 console.warn('Fallback Notification constructor:', err);
 try {
 new Notification(title, { body, icon });
 } catch (e) {
 console.warn('Could not trigger notification:', e);
 }
 }
}

export function sendTestNotification(): boolean {
 if (!isNotificationSupported() || Notification.permission !== 'granted') {
 return false;
 }
 sendLocalNotification(
 'Hayat – Test i Njoftimit',
 'Njoftimet për kohët e namazit janë aktivizuar me sukses!'
 );
 return true;
}

/**
 * Checks prayerTimes against current time and triggers approaching notifications
 */
export function checkPrayerNotifications(times: PrayerTimes, settings: PrayerSettings, now: Date = new Date()) {
 if (!settings.notificationsEnabled || Notification.permission !== 'granted') {
 return;
 }

 const notifyMinutesBefore = settings.notifyMinutesBefore ?? 15;
 const todayStr = times.date || getLocalDateString(now);
 const currentMins = now.getHours() * 60 + now.getMinutes();

 const prayers: PrayerName[] = ['imsak', 'fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

 prayers.forEach(prayerName => {
 // Check if notification is enabled for this prayer
 const isPrayerEnabled = settings.notifyPrayers?.[prayerName] ?? true;
 if (!isPrayerEnabled) return;

 const prayerTimeString = times[prayerName];
 if (!prayerTimeString) return;

 const prayerMins = timeToMinutes(prayerTimeString);
 const diffMins = prayerMins - currentMins;
 const albName = PRAYER_ALBANIAN_NAMES[prayerName] || prayerName;

 // 1. Approaching alert (e.g., 15 minutes before)
 if (diffMins > 0 && diffMins <= notifyMinutesBefore) {
 const storageKey = `hayat_notif_approaching_${todayStr}_${prayerName}_${notifyMinutesBefore}`;
 if (!localStorage.getItem(storageKey)) {
 localStorage.setItem(storageKey, 'true');
 sendLocalNotification(
 `Koha e Namazit po afrohet 🌙`,
 `Edhe ${diffMins} minuta nga ${albName} (${prayerTimeString}).`
 );
 }
 }

 // 2. Exact Prayer Time alert (0 minutes diff)
 if (diffMins === 0) {
 const storageKey = `hayat_notif_exact_${todayStr}_${prayerName}`;
 if (!localStorage.getItem(storageKey)) {
 localStorage.setItem(storageKey, 'true');
 sendLocalNotification(
 `Koha e Namazit! 🕌`,
 `Ka hyrë koha e ${albName} (${prayerTimeString}).`
 );
 }
 }
 });
}

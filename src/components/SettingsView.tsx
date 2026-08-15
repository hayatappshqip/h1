/**
 * SettingsView Component - Cilësimet, Rregullimet e Namazit & Data Safety v2
 */
import React, { useState, useEffect } from 'react';
import { PrayerSettings, MburojaState, PrayerName, QuranReadingSettings } from '../types';
import { generateBackupV2, restoreBackupV2 } from '../services/db';
import {
  Settings,
  Download,
  Upload,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Moon,
  Sparkles,
  Database,
  Bell,
  BellRing,
  Volume2,
  Vibrate,
  Type,
  BookOpen,
  Palette,
  Layers,
  Check,
  Sun,
  Target
} from 'lucide-react';
import { triggerDhikrFeedback } from '../services/feedbackEngine';
import { useDhikrFontSize } from '../utils/useFontSize';
import {
  QURAN_RECITERS,
  loadQuranReadingSettings,
  saveQuranReadingSettings,
  SETTINGS_CHANGED_EVENT,
} from '../services/quran/quranSettingsService';
import { QuranSettingsContent } from './quran/QuranSettingsContent';
import {
 isNotificationSupported,
 getNotificationPermissionState,
 requestNotificationPermission,
 sendTestNotification,
 PRAYER_ALBANIAN_NAMES
} from '../services/notificationEngine';

// Duhet te perputhet me CACHE_NAME ne service-worker.js
const SW_CACHE_NAME = 'hayat-app-shell-v44';

interface SettingsViewProps {
 prayerSettings: PrayerSettings;
 mburojaState: MburojaState;
 onUpdatePrayerSettings: (newSettings: PrayerSettings) => void;
 onRefreshAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  prayerSettings,
  mburojaState,
  onUpdatePrayerSettings,
  onRefreshAllData
}) => {
  const { fontScale, setScale } = useDhikrFontSize();
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermissionState()
  );
  const [testNotifMsg, setTestNotifMsg] = useState<string | null>(null);
  const [quranSettings, setQuranSettings] = useState<QuranReadingSettings>(() => loadQuranReadingSettings());

  useEffect(() => {
    const handleQuranSettingsChange = (e: Event) => {
      const customEv = e as CustomEvent<QuranReadingSettings>;
      if (customEv.detail) {
        setQuranSettings(customEv.detail);
      }
    };

    window.addEventListener(SETTINGS_CHANGED_EVENT, handleQuranSettingsChange);
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, handleQuranSettingsChange);
  }, []);

  const handleUpdateQuranSettings = (partial: Partial<QuranReadingSettings>) => {
    const updated = saveQuranReadingSettings(partial);
    setQuranSettings(updated);
  };

 useEffect(() => {
 setNotifPermission(getNotificationPermissionState());
 }, []);

 const handleRequestPermission = async () => {
 const res = await requestNotificationPermission();
 setNotifPermission(res);
 if (res === 'granted') {
 onUpdatePrayerSettings({
 ...prayerSettings,
 notificationsEnabled: true
 });
 setTestNotifMsg('Leja u dha! Njoftimet janë aktivizuar.');
 } else if (res === 'denied') {
 setTestNotifMsg('Njoftimet u bllokuan në cilësimet e shfletuesit.');
 }
 };

 const handleTestNotification = () => {
 const success = sendTestNotification();
 if (success) {
 setTestNotifMsg('Njoftimi i provës u dërgua me sukses!');
 } else {
 setTestNotifMsg('Ju lutemi lejoni njoftimet nga shfletuesi së pari.');
 }
 setTimeout(() => setTestNotifMsg(null), 4000);
 };

 // Handle Export JSON v2
 const handleExportBackup = async () => {
 try {
 const backupData = await generateBackupV2(prayerSettings, mburojaState);
 const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `hayat_backup_v2_${new Date().toISOString().split('T')[0]}.json`;
 a.click();
 URL.revokeObjectURL(url);
 setBackupMessage({ type: 'success', text: 'Backup-i u shkarkua me sukses (Versioni 2).' });
 } catch (err: any) {
 setBackupMessage({ type: 'error', text: 'Dështoi krijimi i backup-it: ' + err.message });
 }
 };

 // Handle Import JSON v2
 const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setIsRestoring(true);
 setBackupMessage(null);

 const reader = new FileReader();
 reader.onload = async (event) => {
 try {
 const json = JSON.parse(event.target?.result as string);
 const res = await restoreBackupV2(json);
 setIsRestoring(false);

 if (res.success) {
 setBackupMessage({ type: 'success', text: 'Të dhënat u rikthyen me sukses! Po rifreskohet aplikacioni...' });
 setTimeout(() => {
 onRefreshAllData();
 }, 1500);
 } else {
 setBackupMessage({ type: 'error', text: res.error || 'Dështoi leximi i backup-it.' });
 }
 } catch (err: any) {
 setIsRestoring(false);
 setBackupMessage({ type: 'error', text: 'Skedari JSON është i dëmtuar: ' + err.message });
 }
 };
 reader.readAsText(file);
 };

 return (
 <div className="space-y-6 pb-28 animate-fadeIn">
 {/* Title */}
 <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
 <Settings className="w-5 h-5 text-emerald-400" />
 <h2 className="text-base font-bold font-serif text-slate-100">Cilësimet & Data Safety</h2>
 </div>

 {/* Prayer Calculation Settings */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
 <h3 className="font-bold text-sm text-emerald-300 flex items-center space-x-2">
 <span>Vendndodhja & Llogaritja e Namazit</span>
 </h3>

 <div className="space-y-3">
 <div>
 <label className="text-xs text-slate-400 block mb-1">Qyteti i Përzgjedhur (Preset)</label>
 <select
 value={prayerSettings.locationName}
 onChange={e => {
 if (e.target.value === 'Tiranë, Shqipëri') {
 onUpdatePrayerSettings({
 ...prayerSettings,
 locationName: 'Tiranë, Shqipëri',
 latitude: 41.3275,
 longitude: 19.8187
 });
 } else if (e.target.value === 'Prishtinë, Kosovë') {
 onUpdatePrayerSettings({
 ...prayerSettings,
 locationName: 'Prishtinë, Kosovë',
 latitude: 42.6629,
 longitude: 21.1655
 });
 } else if (e.target.value === 'Shkup, Maqedoni e Veriut') {
 onUpdatePrayerSettings({
 ...prayerSettings,
 locationName: 'Shkup, Maqedoni e Veriut',
 latitude: 41.9981,
 longitude: 21.4254
 });
 }
 }}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
 >
 <option value="Tiranë, Shqipëri">Tiranë, Shqipëri</option>
 <option value="Prishtinë, Kosovë">Prishtinë, Kosovë</option>
 <option value="Shkup, Maqedoni e Veriut">Shkup, Maqedoni e Veriut</option>
 </select>
 </div>

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-xs text-slate-400 block mb-1">Llogaritja e Ikindisë (Asr)</label>
 <select
 value={prayerSettings.asrSchool}
 onChange={e =>
 onUpdatePrayerSettings({
 ...prayerSettings,
 asrSchool: e.target.value as 'standard' | 'hanafi'
 })
 }
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-100"
 >
 <option value="standard">Standard (Shafi'i, Maliki, Hanbali)</option>
 <option value="hanafi">Hanafi</option>
 </select>
 </div>

 <div>
 <label className="text-xs text-slate-400 block mb-1">Metoda e Llogaritjes</label>
 <select
 value={prayerSettings.method}
 onChange={e =>
 onUpdatePrayerSettings({
 ...prayerSettings,
 method: parseInt(e.target.value, 10)
 })
 }
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-100"
 >
 <option value={13}>Diyanet (Turqi/Ballkan)</option>
 <option value={3}>Liga e Botës Islame (MWL)</option>
 <option value={2}>ISNA (Amerikë)</option>
 </select>
 </div>
 </div>
 </div>
 </div>

 {/* Web Notifications Settings Card */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-2">
 <BellRing className="w-4 h-4 text-emerald-400" />
 <h3 className="font-bold text-sm text-emerald-300">Njoftimet e Kohëve të Namazit</h3>
 </div>
 <span
 className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
 notifPermission === 'granted'
 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
 : notifPermission === 'denied'
 ? 'bg-rose-950 text-rose-400 border border-rose-800'
 : 'bg-amber-950 text-amber-400 border border-amber-800'
 }`}
 >
 {notifPermission === 'granted'
 ? 'Leja: E dhënë'
 : notifPermission === 'denied'
 ? 'Leja: E bllokuar'
 : 'Kërkohet leja'}
 </span>
 </div>

 <p className="text-xs text-slate-400">
 Aktivizoni njoftimet vendore të shfletuesit për t'ju paralajmëruar kur koha e çdo namazi po afrohet.
 </p>

 {/* Master Toggle & Permission Request */}
 <div className="space-y-3 pt-1">
 {notifPermission !== 'granted' ? (
 <div className="bg-slate-950 border border-amber-900/40 rounded-xl p-3 flex flex-col space-y-2">
 <p className="text-xs text-amber-300">
 Për të marrë njoftime kur afrohet namazi, ju lutemi jepni lejen e shfletuesit.
 </p>
 <button
 id="btn-request-notif-permission"
 onClick={handleRequestPermission}
 className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1.5 shadow"
 >
 <Bell className="w-3.5 h-3.5" />
 <span>Lejo Njoftimet në Pajisje</span>
 </button>
 </div>
 ) : (
 <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
 <div>
 <p className="text-xs font-semibold text-slate-200">Aktivizo Njoftimet Automatike</p>
 <p className="text-[11px] text-slate-400">Paralajmërim zëri & njoftim para namazit</p>
 </div>
 <input
 type="checkbox"
 checked={!!prayerSettings.notificationsEnabled}
 onChange={e =>
 onUpdatePrayerSettings({
 ...prayerSettings,
 notificationsEnabled: e.target.checked
 })
 }
 className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
 />
 </div>
 )}

 {/* Time threshold selector */}
 {prayerSettings.notificationsEnabled && (
 <>
 <div className="grid grid-cols-2 gap-3 pt-1">
 <div>
 <label className="text-xs text-slate-400 block mb-1">Koha e Paralajmërimit</label>
 <select
 value={prayerSettings.notifyMinutesBefore ?? 15}
 onChange={e =>
 onUpdatePrayerSettings({
 ...prayerSettings,
 notifyMinutesBefore: parseInt(e.target.value, 10)
 })
 }
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-100"
 >
 <option value={5}>5 minuta para</option>
 <option value={10}>10 minuta para</option>
 <option value={15}>15 minuta para</option>
 <option value={30}>30 minuta para</option>
 </select>
 </div>

 <div className="flex items-end">
 <button
 id="btn-test-notification"
 onClick={handleTestNotification}
 className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 font-semibold py-2 px-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5"
 >
 <Volume2 className="w-3.5 h-3.5" />
 <span>Testo Njoftimin</span>
 </button>
 </div>
 </div>

 {/* Per-Prayer Selectors */}
 <div className="space-y-1.5 pt-2">
 <label className="text-xs font-semibold text-slate-300 block mb-1">
 Njoftimet sipas Namazeve:
 </label>
 <div className="grid grid-cols-2 gap-1.5">
 {(['imsak', 'fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerName[]).map(
 prayerKey => {
 const isChecked = prayerSettings.notifyPrayers?.[prayerKey] ?? true;
 return (
 <label
 key={prayerKey}
 className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-850 text-xs text-slate-300 cursor-pointer"
 >
 <span>{PRAYER_ALBANIAN_NAMES[prayerKey]}</span>
 <input
 type="checkbox"
 checked={isChecked}
 onChange={e => {
 const currentNotify = prayerSettings.notifyPrayers || {};
 onUpdatePrayerSettings({
 ...prayerSettings,
 notifyPrayers: {
 ...currentNotify,
 [prayerKey]: e.target.checked
 }
 });
 }}
 className="w-3.5 h-3.5 accent-emerald-500 rounded"
 />
 </label>
 );
 }
 )}
 </div>
 </div>
 </>
 )}

 {testNotifMsg && (
 <p className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 rounded-lg p-2 text-center">
 {testNotifMsg}
 </p>
 )}
 </div>
 </div>

 {/* Dhikr Feedback Options Card */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-2">
 <Vibrate className="w-4 h-4 text-emerald-400" />
 <h3 className="font-bold text-sm text-emerald-300">Konfirmimi me Vibrim (Haptik) & Zë</h3>
 </div>
 <button
 onClick={() => triggerDhikrFeedback(prayerSettings.dhikrHapticEnabled ?? true, prayerSettings.dhikrSoundEnabled ?? true)}
 className="text-[11px] bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 px-2.5 py-1 rounded-lg transition-all active:scale-95 flex items-center space-x-1"
 >
 <Volume2 className="w-3 h-3" />
 <span>Provo Feedback-un</span>
 </button>
 </div>

 <p className="text-xs text-slate-400">
 Ofron konfirmim të lehtë taktil (dridhje) dhe tingull të lehtë sa herë që numëroni një thënie dhikri ose lutjeje.
 </p>

 <div className="space-y-2.5">
 {/* Haptic Toggle */}
 <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
 <div>
 <p className="text-xs font-semibold text-slate-200">Vibrimi Haptik (Vibration)</p>
 <p className="text-[11px] text-slate-400">Dridhje e lehtë 12ms në me çdo prekje numëruesi</p>
 </div>
 <input
 type="checkbox"
 id="toggle-dhikr-haptic"
 checked={prayerSettings.dhikrHapticEnabled ?? true}
 onChange={e =>
 onUpdatePrayerSettings({
 ...prayerSettings,
 dhikrHapticEnabled: e.target.checked
 })
 }
 className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
 />
 </div>

 {/* Sound Toggle */}
 <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
 <div>
 <p className="text-xs font-semibold text-slate-200">Tingulli i Butë i Klikimit (Click Sound)</p>
 <p className="text-[11px] text-slate-400">Efekt zëri me frekuencë të ngrohtë sintetike</p>
 </div>
 <input
 type="checkbox"
 id="toggle-dhikr-sound"
 checked={prayerSettings.dhikrSoundEnabled ?? true}
 onChange={e =>
 onUpdatePrayerSettings({
 ...prayerSettings,
 dhikrSoundEnabled: e.target.checked
 })
 }
 className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
 />
 </div>
 </div>
 </div>

  {/* Dhikr & Mburoja Font Size Control Card */}
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Type className="w-4 h-4 text-emerald-400" />
        <h3 className="font-bold text-sm text-emerald-300">Madhësia e Shkrimit (Font Size)</h3>
      </div>
      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-md">
        {['A- (Kompakt)', 'A (Standard)', 'A+ (I Madh)', 'A++ (Shumë i Madh)'][fontScale] || 'A (Standard)'}
      </span>
    </div>

    <p className="text-xs text-slate-400">
      Zgjidhni madhësinë e preferuar të tekstit arab, transliterimit dhe përkthimit për lutjet në Mburoja e Muslimanit dhe Dhikrin pas Namazit.
    </p>

    {/* Size Selector Buttons */}
    <div className="grid grid-cols-4 gap-2">
      {[
        { scale: 0, label: 'A-', desc: 'E Vogël' },
        { scale: 1, label: 'A', desc: 'Standard' },
        { scale: 2, label: 'A+', desc: 'E Madhe' },
        { scale: 3, label: 'A++', desc: 'Shumë E Madhe' }
      ].map(opt => (
        <button
          key={opt.scale}
          onClick={() => setScale(opt.scale)}
          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
            fontScale === opt.scale
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50 shadow-md shadow-emerald-950/50'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <span className="font-bold text-sm">{opt.label}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</span>
        </button>
      ))}
    </div>

    {/* Live Text Preview Box */}
    <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pamja paraprake (Preview):</p>
      <p className={`font-arabic text-emerald-300 ${
        fontScale === 0 ? 'text-lg leading-relaxed' : fontScale === 2 ? 'text-2xl leading-relaxed' : fontScale === 3 ? 'text-3xl leading-relaxed' : 'text-xl leading-relaxed'
      }`} dir="rtl">
        أَسْتَغْفِرُ اللَّهَ
      </p>
      <p className={`font-mono text-amber-200/90 italic ${
        fontScale === 0 ? 'text-[11px]' : fontScale === 2 ? 'text-sm' : fontScale === 3 ? 'text-base' : 'text-xs'
      }`}>
        Estagfirullāh
      </p>
      <p className={`font-sans text-slate-200 ${
        fontScale === 0 ? 'text-xs' : fontScale === 2 ? 'text-base' : fontScale === 3 ? 'text-lg' : 'text-sm'
      }`}>
        Kërkoj falje nga Allahu.
      </p>
    </div>
  </div>

  {/* Suggestion Toggles */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
 <h3 className="font-bold text-sm text-emerald-300">Sugjerimet Automatike në Kreu</h3>

 <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
 <div>
 <p className="text-xs font-semibold text-slate-200">Surja El-Kehf ditën e Xhuma</p>
 <p className="text-[11px] text-slate-400">Shfaqet automatikisht çdo të premte</p>
 </div>
 <input
 type="checkbox"
 checked={prayerSettings.showKahfFriday}
 onChange={e =>
 onUpdatePrayerSettings({
 ...prayerSettings,
 showKahfFriday: e.target.checked
 })
 }
 className="w-4 h-4 accent-emerald-500 rounded"
 />
 </div>

 <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
 <div>
 <p className="text-xs font-semibold text-slate-200">Surja Es-Sexhde & El-Mulk natën</p>
 <p className="text-[11px] text-slate-400">Shfaqet gjatë natës para gjumit</p>
 </div>
 <input
 type="checkbox"
 checked={prayerSettings.showSajdahMulkNight}
 onChange={e =>
 onUpdatePrayerSettings({
 ...prayerSettings,
 showSajdahMulkNight: e.target.checked
 })
 }
 className="w-4 h-4 accent-emerald-500 rounded"
 />
 </div>
 </div>

 {/* Preferencat e Leximit të Kuranit (Canonical Quran Preferences) */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
   <div className="flex items-center justify-between">
     <div className="flex items-center space-x-2">
       <BookOpen className="w-4 h-4 text-emerald-400" />
       <h3 className="font-bold text-sm text-emerald-300">Preferencat e Leximit të Kuranit</h3>
     </div>
     <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold">
       Sinkronizim i Plotë
     </span>
   </div>

   <p className="text-xs text-slate-400">
     Përshtatni pamjen, madhësinë e shkrimit, recituesin e zërit dhe qëllimin ditor për të gjithë modulet e Kuranit.
   </p>

   <QuranSettingsContent />
 </div>

 {/* Data Safety Export/Import v2 */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-2">
 <Database className="w-4 h-4 text-emerald-400" />
 <h3 className="font-bold text-sm text-emerald-300">Data Safety & Backup i Të Dhënave (JSON)</h3>
 </div>
 <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold">
 Local-First JSON
 </span>
 </div>

 <p className="text-xs text-slate-400 leading-relaxed">
 Të gjitha të dhënat tuaja ruhen vetëm lokalisht në pajisje. Mund të eksportoni një kopje rezervë (Backup) në formatin JSON për të ruajtur apo bartur të dhënat tuaja në një pajisje tjetër.
 </p>

 {/* What's Included Pills */}
 <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5">
 <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">
 Përmbajtja e Backup-it JSON:
 </span>
 <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300">
 <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">✓ Regjistrimet e Namazit</span>
 <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">✓ Sesionet e Dhikrit</span>
 <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">✓ Detyrat e Ditës</span>
 <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">✓ Regjistri i Agjërimit</span>
 <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">✓ Leximi, Shenjat & Shënimet e Kuranit</span>
 <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">✓ Cilësimet e Aplikacionit</span>
 </div>
 </div>

 {backupMessage && (
 <div
 className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
 backupMessage.type === 'success'
 ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
 : 'bg-rose-950/80 border-rose-700 text-rose-300'
 }`}
 >
 {backupMessage.type === 'success' ? (
 <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
 ) : (
 <AlertCircle className="w-4 h-4 flex-shrink-0" />
 )}
 <span>{backupMessage.text}</span>
 </div>
 )}

 <div className="grid grid-cols-2 gap-3 pt-1">
 <button
 id="btn-export-backup"
 onClick={handleExportBackup}
 className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow transition-all active:scale-95"
 >
 <Download className="w-4 h-4" />
 <span>Eksporto JSON</span>
 </button>

 <label
 id="btn-import-backup-label"
 className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-2 cursor-pointer text-center transition-all active:scale-95"
 >
 <Upload className="w-4 h-4" />
 <span>{isRestoring ? 'Rikthimi...' : 'Importo / Rikthe JSON'}</span>
 <input
 id="input-import-json"
 type="file"
 accept=".json"
 onChange={handleImportFile}
 className="hidden"
 />
 </label>
 </div>
 </div>

 {/* Quran Local Database & Source Attribution Info Card */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-2">
 <Database className="w-4 h-4 text-emerald-400" />
 <h3 className="font-bold text-sm text-emerald-300">Kurani — Burimi dhe Shkrimi</h3>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-850">
 <div>
 <span className="text-slate-400 block text-[10px]">Shkrimi & Fonti i Kuranit:</span>
 <span className="text-slate-200 font-semibold">KFGQPC Uthmanic Script Hafs — Unicode</span>
 </div>
 <div>
 <span className="text-slate-400 block text-[10px]">Përkthimi Shqip:</span>
 <span className="text-slate-200 font-semibold">Dr. Hasan Nahi (I plotë me 6236 ajete)</span>
 </div>
 <div>
 <span className="text-slate-400 block text-[10px]">Kompleksi Botues:</span>
 <span className="text-slate-200 font-mono font-semibold">KFGQPC / مجمع الملك فهد لطباعة المصحف الشريف</span>
 </div>
 <div>
 <span className="text-slate-400 block text-[10px]">Lloji i Ruajtjes:</span>
 <span className="text-emerald-400 font-semibold">Baza e të Dhënave Offline (0ms)</span>
 </div>
 </div>

 <p className="text-[11px] text-slate-400 leading-relaxed font-arabic opacity-85" dir="rtl">
 خط قرآن مصحف المدينة النبوية ١٤٤١هـ — مجمع الملك فهد لطباعة المصحف الشريف
 </p>

 <div className="pt-1 flex justify-end">
 <button
 onClick={async () => {
 const { rebuildQuranSearchIndex } = await import('../services/quranCorpusStore');
 await rebuildQuranSearchIndex();
 setBackupMessage({ type: 'success', text: 'Indeksi i kërkimit të Kuranit u rindërtua me sukses!' });
 setTimeout(() => setBackupMessage(null), 4000);
 }}
 className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
 >
 <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
 <span>Rindërto indeksin e kërkimit</span>
 </button>
 </div>
 </div>

 {/* PWA Service Worker Shell Info */}
 <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
 <div className="flex items-center justify-between text-xs font-mono">
 <span className="text-slate-400">Service Worker Cache Shell:</span>
 <span className="text-emerald-400 font-bold">{SW_CACHE_NAME}</span>
 </div>
 <div className="flex items-center justify-between text-xs font-mono">
 <span className="text-slate-400">IndexedDB Engine Version:</span>
 <span className="text-emerald-400 font-bold">DB_VERSION = 8</span>
 </div>
 <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
 Funksionet bazë dhe përmbajtja e shkarkuar janë të disponueshme offline. Audio streaming, AI dhe përmbajtja e pashkarkuar kërkojnë internet.
 </p>
 </div>

 {/* Religious Sources Disclaimer */}
 <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3.5 space-y-1 text-slate-300">
 <p className="text-[11px] font-semibold text-amber-300">
 Statusi i Përmbajtjes Fetare: <span className="font-mono underline">qualified-review-required</span>
 </p>
 <p className="text-[10px] text-slate-400 leading-relaxed">
 Mburoja e Muslimanit bazohet në librin e autorit Seid el-Kahtani (përkthyer nga Azem Bardhoshi, redaktuar nga Ismail Bardhoshi). Teksti i Kuranit dhe përkthimi i Hasan Nahit mundësohen përmes Quran.com API v4. Përmbajtja është strukturuar nga burimet e cituara dhe kërkon kontroll përfundimtar të kualifikuar.
 </p>
 </div>
 </div>
 );
};

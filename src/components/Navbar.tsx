/**
 * Navbar Component - 5 Primary Destinations Navigation & Header Gear Icon
 * Mobile: Fixed 5-item bottom bar
 * Tablet/Desktop: Top/Sidebar 5-item navigation + Header gear icon for Settings
 */
import React from 'react';
import { Home, Clock, BookOpen, Shield, Calendar, Settings } from 'lucide-react';

export type ActiveTab = 'home' | 'namazi' | 'kurani' | 'mburoja' | 'ditaIme' | 'settings' | 'hifz';

interface NavbarProps {
 activeTab: ActiveTab;
 setActiveTab: (tab: ActiveTab) => void;
 isOffline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isOffline }) => {
 const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
 { id: 'home', label: 'Kreu', icon: <Home className="w-5 h-5" /> },
 { id: 'namazi', label: 'Namazi', icon: <Clock className="w-5 h-5" /> },
 { id: 'kurani', label: 'Kurani', icon: <BookOpen className="w-5 h-5" /> },
 { id: 'mburoja', label: 'Mburoja', icon: <Shield className="w-5 h-5" /> },
 { id: 'ditaIme', label: 'Dita Ime', icon: <Calendar className="w-5 h-5" /> }
 ];

 return (
 <>
 {/* Top Header */}
 <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-emerald-900/40 text-slate-100 px-4 py-3 flex items-center justify-between shadow-md">
 <div className="flex items-center space-x-3">
 <button
 onClick={() => setActiveTab('home')}
 className="flex items-center space-x-2 text-left focus:outline-none group"
 >
 <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-inner group-hover:bg-emerald-600/50 transition-colors">
 ح
 </div>
 <div>
 <h1 className="text-base font-semibold tracking-wide text-emerald-300 font-serif">
 Hayat <span className="text-xs font-sans text-emerald-500 font-normal">| Jeta Islame</span>
 </h1>
 </div>
 </button>
 </div>

 {/* Desktop / Tablet Nav Links (Hidden on Mobile) */}
 <div className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
 {navItems.map((item) => {
 const isActive = activeTab === item.id || (item.id === 'kurani' && activeTab === 'hifz');
 return (
 <button
 key={item.id}
 id={`desktop-nav-btn-${item.id}`}
 onClick={() => setActiveTab(item.id)}
 className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
 isActive
 ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 font-semibold shadow-sm'
 : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
 }`}
 >
 <div className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
 {item.icon}
 </div>
 <span>{item.label}</span>
 </button>
 );
 })}
 </div>

 {/* Right Action Section: Offline badge, Version & Settings Gear */}
 <div className="flex items-center space-x-2">
 {isOffline && (
 <span id="offline-badge" className="text-xs bg-amber-950/80 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
 <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
 Offline
 </span>
 )}

 <span className="hidden sm:inline-block text-[10px] font-mono text-emerald-400/80 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
 v0.6.0
 </span>

 {/* Settings Gear Button in Top Header */}
 <button
 id="btn-header-settings"
 onClick={() => setActiveTab(activeTab === 'settings' ? 'home' : 'settings')}
 title="Cilësimet"
 className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
 activeTab === 'settings'
 ? 'bg-emerald-950 text-emerald-300 border-emerald-600 shadow-sm'
 : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
 }`}
 >
 <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'rotate-90 text-emerald-400' : 'text-slate-300'} transition-transform duration-300`} />
 </button>
 </div>
 </header>

 {/* Mobile Bottom Navigation Bar (5 Items) */}
 <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/98 border-t border-slate-800 backdrop-blur-md px-1 py-1 text-slate-400 shadow-2xl">
 <div className="flex justify-around items-center max-w-md mx-auto">
 {navItems.map((item) => {
 const isActive = activeTab === item.id || (item.id === 'kurani' && activeTab === 'hifz');
 return (
 <button
 key={item.id}
 id={`nav-btn-${item.id}`}
 onClick={() => setActiveTab(item.id)}
 className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-xs font-medium transition-all duration-150 ${
 isActive
 ? 'text-emerald-400 bg-emerald-950/60 font-semibold shadow-inner'
 : 'hover:text-slate-200 hover:bg-slate-800/50'
 }`}
 >
 <div className={`${isActive ? 'scale-110 text-emerald-400' : 'text-slate-400'} transition-transform`}>
 {item.icon}
 </div>
 <span className="mt-1 text-[10px] leading-none whitespace-nowrap">{item.label}</span>
 </button>
 );
 })}
 </div>
 </nav>
 </>
 );
};

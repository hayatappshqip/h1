import React, { useState, useEffect, useRef } from 'react';
import { Compass, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import { calculateQiblaBearing } from '../services/prayerEngine';
import { useCompassHeading } from '../hooks/useCompassHeading';

interface QiblaCompassProps {
 initialLatitude?: number;
 initialLongitude?: number;
 initialLocationName?: string;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({
 initialLatitude,
 initialLongitude,
 initialLocationName
}) => {
 const { heading, source, needsPerm, error: compassError, uncalibrated, noSignal, enable } = useCompassHeading();

 const [latitude, setLatitude] = useState<number | null>(initialLatitude ?? null);
 const [longitude, setLongitude] = useState<number | null>(initialLongitude ?? null);
 const [locationName, setLocationName] = useState<string>(initialLocationName || 'Vendndodhja juaj');
 
 const [geoError, setGeoError] = useState<string | null>(null);
 const [isLocating, setIsLocating] = useState<boolean>(false);

 // Default bearing: calculate if coordinates available, otherwise null
 const [qiblaBearing, setQiblaBearing] = useState<number | null>(() => {
 if (initialLatitude != null && initialLongitude != null) {
 return calculateQiblaBearing(initialLatitude, initialLongitude);
 }
 return null;
 });

 // Update bearing when coordinates change
 useEffect(() => {
 if (latitude !== null && longitude !== null) {
 const bearing = calculateQiblaBearing(latitude, longitude);
 setQiblaBearing(bearing);
 }
 }, [latitude, longitude]);

 // Geolocation with timeout (10000ms, maximumAge: 60000ms)
 const getLocation = () => {
 setIsLocating(true);
 setGeoError(null);
 if ('geolocation' in navigator) {
 navigator.geolocation.getCurrentPosition(
 (position) => {
 setLatitude(position.coords.latitude);
 setLongitude(position.coords.longitude);
 setLocationName('Vendndodhja aktuale');
 setIsLocating(false);
 },
 (err) => {
 setIsLocating(false);
 setGeoError('Gabim në marrjen e vendndodhjes: ' + err.message);
 },
 { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
 );
 } else {
 setIsLocating(false);
 setGeoError('Gjeolokacioni nuk suportohet në këtë shfletues.');
 }
 };

 // Rotation unwrap logic
 const arrowRotRef = useRef(0);
 const discRotRef = useRef(0);

 const qiblaTarget = qiblaBearing ?? 0;
 const arrowTarget = heading === null ? qiblaTarget : qiblaTarget - heading;
 const arrowDelta = ((arrowTarget - arrowRotRef.current + 540) % 360) - 180;
 arrowRotRef.current += arrowDelta;
 const arrowRotation = arrowRotRef.current;

 const discTarget = heading === null ? 0 : -heading;
 const discDelta = ((discTarget - discRotRef.current + 540) % 360) - 180;
 discRotRef.current += discDelta;
 const discRotation = discRotRef.current;

 const isFacingQibla = heading !== null && qiblaBearing !== null && Math.abs((((qiblaBearing - heading + 540) % 360) - 180)) < 5;

 return (
 <div className="space-y-6 text-center py-4">
 <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
 <div>
 <h3 className="text-lg font-bold font-serif text-emerald-300">Drejtimi i Kiblës</h3>
 <p className="text-xs text-slate-400 mt-1 flex items-center justify-center space-x-1">
 <MapPin className="w-3 h-3" />
 <span>{locationName}</span>
 </p>
 </div>

 <div className="flex flex-col items-center space-y-4">
 <div className="flex items-center space-x-4">
 <div className="flex flex-col items-center bg-slate-950 border border-slate-800 rounded-xl p-3">
 <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Kibla</span>
 <span className="text-xl font-mono font-bold text-emerald-400">
 {qiblaBearing !== null ? `${qiblaBearing.toFixed(1)}°` : '--°'}
 </span>
 </div>
 {heading !== null && (
 <div className="flex flex-col items-center bg-slate-950 border border-slate-800 rounded-xl p-3">
 <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Këndi Juaj</span>
 <span className="text-xl font-mono font-bold text-blue-400">{heading.toFixed(1)}°</span>
 </div>
 )}
 </div>
 </div>

 {/* Error Displays */}
 {compassError && (
 <div className="bg-red-950/40 border border-red-900/50 rounded-lg p-3 text-xs text-red-400 flex items-start space-x-2 text-left">
 <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
 <span>{compassError}</span>
 </div>
 )}

 {geoError && (
 <div className="bg-red-950/40 border border-red-900/50 rounded-lg p-3 text-xs text-red-400 flex items-start space-x-2 text-left">
 <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
 <span>{geoError}</span>
 </div>
 )}

 {uncalibrated && (
 <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg p-3 text-xs text-amber-300 flex items-start space-x-2 text-left">
 <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
 <span>Busulla nuk eshte e kalibruar. Levize telefonin ne forme tetesheje (∞) disa here.</span>
 </div>
 )}

 {noSignal && (
 <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg p-3 text-xs text-amber-300 flex items-start space-x-2 text-left">
 <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
 <span>Sensori nuk po dergon te dhena. iPhone: Settings &gt; Safari &gt; Motion &amp; Orientation Access. Nese e ke si aplikacion ne Home Screen, çinstaloje dhe riinstaloje.</span>
 </div>
 )}

 {source === "relative" && (
 <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg p-3 text-xs text-amber-300 flex items-start space-x-2 text-left">
 <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
 <span>Kjo pajisje nuk jep busull absolute; drejtimi mund te mos jete i sakte.</span>
 </div>
 )}

 <div className="relative w-64 h-64 mx-auto my-8 flex items-center justify-center">
 {/* Compass Background */}
 <div className="absolute inset-0 rounded-full border-2 border-slate-700 bg-slate-950 shadow-inner overflow-hidden">
 {/* Ticks */}
 {[...Array(72)].map((_, i) => (
 <div
 key={i}
 className={`absolute w-full h-full flex items-start justify-center ${i % 18 === 0 ? 'font-bold' : ''}`}
 style={{ transform: `rotate(${i * 5}deg)` }}
 >
 <div className={`w-0.5 ${i % 18 === 0 ? 'h-3 bg-slate-400' : i % 2 === 0 ? 'h-2 bg-slate-600' : 'h-1 bg-slate-700'}`}></div>
 </div>
 ))}
 </div>

 {/* Rotating elements based on device heading */}
 <div
 className="w-full h-full rounded-full relative flex items-center justify-center transition-transform duration-100 ease-out"
 style={{ transform: `rotate(${discRotation}deg)` }}
 >
 {/* North marker */}
 <div className="absolute top-4 font-mono text-xs text-red-500 font-bold">N</div>
 <div className="absolute right-4 font-mono text-xs text-slate-500">E</div>
 <div className="absolute bottom-4 font-mono text-xs text-slate-500">S</div>
 <div className="absolute left-4 font-mono text-xs text-slate-500">W</div>

 {/* Qibla Direction indicator on the ring */}
 {qiblaBearing !== null && (
 <div
 className="absolute w-full h-full flex items-start justify-center"
 style={{ transform: `rotate(${qiblaBearing}deg)` }}
 >
 <div className={`w-1.5 h-4 rounded-b-full ${source === 'relative' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
 </div>
 )}
 </div>

 {/* Center needle pointing to Qibla - ONLY when heading !== null */}
 {heading !== null && (
 <div
 className="absolute w-full h-full flex items-center justify-center transition-transform duration-100 ease-out z-10"
 style={{ transform: `rotate(${arrowRotation}deg)` }}
 >
 <div className={`flex flex-col items-center transform -translate-y-12 transition-all duration-300 ${
 isFacingQibla && source !== 'relative' ? 'scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : ''
 }`}>
 <div className={`w-0 h-0 border-l-[12px] border-r-[12px] border-b-[30px] border-l-transparent border-r-transparent ${
 source === 'relative' ? 'border-b-amber-500' : 'border-b-emerald-500'
 }`}></div>
 <div className={`w-1.5 h-16 rounded-b-full ${
 source === 'relative' ? 'bg-gradient-to-b from-amber-500 to-amber-900' : 'bg-gradient-to-b from-emerald-500 to-emerald-900'
 }`}></div>
 </div>
 
 <div className="absolute flex items-center justify-center w-full h-full transform -translate-y-24">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 text-sm transition-colors duration-300 ${
 isFacingQibla && source !== 'relative'
 ? 'bg-emerald-400 border-emerald-300 text-slate-900'
 : source === 'relative'
 ? 'bg-amber-900/80 border-amber-600 text-amber-200'
 : 'bg-slate-800 border-slate-600 text-white'
 }`}>
 🕋
 </div>
 </div>
 </div>
 )}

 {/* Center Dot */}
 <div className="absolute w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600 shadow z-20 flex items-center justify-center">
 <div className={`w-2 h-2 rounded-full ${source === 'relative' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
 </div>
 </div>

 {/* Controls */}
 <div className="space-y-3">
 {isFacingQibla && source !== 'relative' && (
 <div className="bg-emerald-950/60 text-emerald-400 border border-emerald-800 rounded-lg p-2 text-sm font-medium animate-pulse">
 Jeni drejtuar nga Kibla!
 </div>
 )}
 
 <div className="flex flex-col sm:flex-row gap-3 justify-center">
 {needsPerm && (
 <button
 onClick={enable}
 className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors mx-auto"
 >
 <Compass className="w-4 h-4" />
 <span>Lejo busullen</span>
 </button>
 )}
 <button
 onClick={getLocation}
 disabled={isLocating}
 className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors border border-slate-700"
 >
 <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
 <span>Gjej Vendndodhjen</span>
 </button>
 </div>
 <p className="text-[10px] text-slate-500 max-w-xs mx-auto pt-2">
 Për saktësi maksimale, mbajeni telefonin tuaj horizontalisht (larg objekteve magnetike).
 </p>
 </div>
 </div>
 </div>
 );
};

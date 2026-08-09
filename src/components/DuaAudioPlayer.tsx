import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, Mic, RefreshCw, Repeat, Gauge, Headphones, Trash2 } from 'lucide-react';
import { DuaItem } from '../types';

interface DuaAudioPlayerProps {
 dua: DuaItem;
 compact?: boolean;
}

export const DuaAudioPlayer: React.FC<DuaAudioPlayerProps> = ({ dua, compact = false }) => {
 const [isPlaying, setIsPlaying] = useState(false);
 const [playbackRate, setPlaybackRate] = useState<number>(0.8); // 0.8 is ideal for clear Arabic pronunciation
 const [isRepeating, setIsRepeating] = useState(false);
 const [speechSupported, setSpeechSupported] = useState(true);
 const [voiceLoaded, setVoiceLoaded] = useState(false);

 // Self-recording state
 const [showRecorder, setShowRecorder] = useState(false);
 const [isRecording, setIsRecording] = useState(false);
 const [recordingBlobUrl, setRecordingBlobUrl] = useState<string | null>(null);
 const [isPlayingRecording, setIsPlayingRecording] = useState(false);
 const [micError, setMicError] = useState<string | null>(null);

 const mediaRecorderRef = useRef<MediaRecorder | null>(null);
 const audioChunksRef = useRef<Blob[]>([]);
 const userAudioRef = useRef<HTMLAudioElement | null>(null);
 const isRepeatingRef = useRef(isRepeating);

 useEffect(() => {
 isRepeatingRef.current = isRepeating;
 }, [isRepeating]);

 useEffect(() => {
 if (!('speechSynthesis' in window)) {
 setSpeechSupported(false);
 } else {
 const updateVoices = () => {
 const voices = window.speechSynthesis.getVoices();
 if (voices.length > 0) {
 setVoiceLoaded(true);
 }
 };
 updateVoices();
 window.speechSynthesis.onvoiceschanged = updateVoices;
 }

 return () => {
 if ('speechSynthesis' in window) {
 window.speechSynthesis.cancel();
 }
 if (userAudioRef.current) {
 userAudioRef.current.pause();
 }
 };
 }, []);

 // Stop audio if dua changes
 useEffect(() => {
 if ('speechSynthesis' in window) {
 window.speechSynthesis.cancel();
 }
 setIsPlaying(false);
 setRecordingBlobUrl(null);
 setIsPlayingRecording(false);
 }, [dua.id]);

 const speakDua = (rate = playbackRate) => {
 if (!('speechSynthesis' in window)) {
 alert('Shfletuesi juaj nuk mbështet lexuesin e zërit (Speech Synthesis).');
 return;
 }

 window.speechSynthesis.cancel();

 const utterance = new SpeechSynthesisUtterance(dua.ar);
 utterance.lang = 'ar-SA';
 utterance.rate = rate;

 // Try to locate an Arabic voice
 const voices = window.speechSynthesis.getVoices();
 const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
 if (arabicVoice) {
 utterance.voice = arabicVoice;
 }

 utterance.onstart = () => {
 setIsPlaying(true);
 };

 utterance.onend = () => {
 if (isRepeatingRef.current) {
 setTimeout(() => speakDua(rate), 400);
 } else {
 setIsPlaying(false);
 }
 };

 utterance.onerror = (e) => {
 console.warn('Audio playback error:', e);
 setIsPlaying(false);
 };

 window.speechSynthesis.speak(utterance);
 };

 const stopDua = () => {
 if ('speechSynthesis' in window) {
 window.speechSynthesis.cancel();
 }
 setIsPlaying(false);
 };

 const togglePlay = () => {
 if (isPlaying) {
 stopDua();
 } else {
 speakDua(playbackRate);
 }
 };

 const changeRate = (newRate: number) => {
 setPlaybackRate(newRate);
 if (isPlaying) {
 stopDua();
 speakDua(newRate);
 }
 };

 // Self Recording Logic
 const startRecording = async () => {
 setMicError(null);
 try {
 if (isPlaying) stopDua();
 const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
 const mediaRecorder = new MediaRecorder(stream);
 mediaRecorderRef.current = mediaRecorder;
 audioChunksRef.current = [];

 mediaRecorder.ondataavailable = (e) => {
 if (e.data.size > 0) {
 audioChunksRef.current.push(e.data);
 }
 };

 mediaRecorder.onstop = () => {
 const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
 const url = URL.createObjectURL(audioBlob);
 setRecordingBlobUrl(url);
 stream.getTracks().forEach(track => track.stop());
 };

 mediaRecorder.start();
 setIsRecording(true);
 } catch (err: any) {
 console.error('Microphone error:', err);
 if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission denied')) {
 setMicError('Qasja në mikrofon u refuzua. Ju lutem lejoni përdorimin e mikrofonit në cilësimet e shfletuesit tuaj.');
 } else {
 setMicError('Nuk mund të hapej mikrofoni. Sigurohuni që mikrofoni është i lidhur.');
 }
 }
 };

 const stopRecording = () => {
 if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
 mediaRecorderRef.current.stop();
 setIsRecording(false);
 }
 };

 const playRecording = () => {
 if (!recordingBlobUrl) return;

 if (isPlayingRecording && userAudioRef.current) {
 userAudioRef.current.pause();
 setIsPlayingRecording(false);
 return;
 }

 if (isPlaying) stopDua();

 const audio = new Audio(recordingBlobUrl);
 userAudioRef.current = audio;

 audio.onended = () => {
 setIsPlayingRecording(false);
 };

 audio.onerror = () => {
 setIsPlayingRecording(false);
 };

 audio.play().then(() => setIsPlayingRecording(true)).catch(err => {
 console.warn('Dua recording play error:', err);
 setIsPlayingRecording(false);
 });
 };

 const deleteRecording = () => {
 if (userAudioRef.current) {
 userAudioRef.current.pause();
 }
 setRecordingBlobUrl(null);
 setIsPlayingRecording(false);
 };

 if (compact) {
 return (
 <div className="flex items-center space-x-1.5">
 <button
 onClick={togglePlay}
 className={`p-1.5 rounded-lg border transition-all flex items-center space-x-1 text-xs font-medium ${
 isPlaying
 ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300 animate-pulse'
 : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
 }`}
 title={isPlaying ? 'Ndal Zërin' : 'Dëgjo Prononcimin (Shqiptimin)'}
 >
 {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
 <span>{isPlaying ? 'Duke luajtur' : 'Dëgjo'}</span>
 </button>
 </div>
 );
 }

 return (
 <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 space-y-2.5">
 <div className="flex items-center justify-between flex-wrap gap-2">
 {/* Playback Controls */}
 <div className="flex items-center space-x-2">
 <button
 id={`btn-play-dua-${dua.id}`}
 onClick={togglePlay}
 className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-1.5 transition-all shadow ${
 isPlaying
 ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-950/50'
 : 'bg-emerald-900/40 hover:bg-emerald-900/60 border-emerald-700/60 text-emerald-300'
 }`}
 >
 {isPlaying ? (
 <>
 <Square className="w-3.5 h-3.5 fill-current" />
 <span>Ndal Audio</span>
 </>
 ) : (
 <>
 <Volume2 className="w-3.5 h-3.5" />
 <span>Dëgjo Prononcimin</span>
 </>
 )}
 </button>

 {/* Repeat Button */}
 <button
 onClick={() => setIsRepeating(!isRepeating)}
 className={`p-1.5 rounded-lg border text-xs transition-colors ${
 isRepeating
 ? 'bg-amber-950/80 border-amber-700 text-amber-300'
 : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
 }`}
 title={isRepeating ? 'Përsëritja Automatike është e Aktivizuar' : 'Aktivizo Përsëritjen Automatike'}
 >
 <Repeat className="w-3.5 h-3.5" />
 </button>

 {/* Speed Selector */}
 <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px]">
 <span className="px-1.5 text-slate-500 font-mono flex items-center">
 <Gauge className="w-3 h-3 mr-0.5" />
 </span>
 <button
 onClick={() => changeRate(0.7)}
 className={`px-1.5 py-0.5 rounded transition-colors ${
 playbackRate === 0.7 ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
 }`}
 title="Shpejtësi e ngadaltë për mësimin e prononcimit"
 >
 0.7x
 </button>
 <button
 onClick={() => changeRate(0.9)}
 className={`px-1.5 py-0.5 rounded transition-colors ${
 playbackRate === 0.9 ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
 }`}
 title="Shpejtësi standarde"
 >
 0.9x
 </button>
 <button
 onClick={() => changeRate(1.1)}
 className={`px-1.5 py-0.5 rounded transition-colors ${
 playbackRate === 1.1 ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
 }`}
 title="Më shpejt"
 >
 1.1x
 </button>
 </div>
 </div>

 {/* Self-Check Recording Toggle */}
 <button
 onClick={() => setShowRecorder(!showRecorder)}
 className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium flex items-center space-x-1 transition-colors ${
 showRecorder || recordingBlobUrl
 ? 'bg-slate-800 border-slate-700 text-slate-200'
 : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-300'
 }`}
 >
 <Mic className="w-3.5 h-3.5 text-amber-400" />
 <span>{recordingBlobUrl ? 'Luo Regjistrimin Tënd' : 'Sprovo Prononcimin'}</span>
 </button>
 </div>

 {/* Visual Audio Pulse when playing */}
 {isPlaying && (
 <div className="flex items-center space-x-1 py-1 px-2 bg-emerald-950/40 border border-emerald-900/40 rounded-lg">
 <span className="text-[10px] text-emerald-400 font-mono font-medium mr-2">Prononcimi në Arabisht...</span>
 <div className="flex items-center space-x-1 h-3">
 <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3"></span>
 <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2 delay-100"></span>
 <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3.5 delay-200"></span>
 <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-1.5 delay-150"></span>
 </div>
 </div>
 )}

 {/* Self-Recorder Drawer */}
 {showRecorder && (
 <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 space-y-2 animate-fadeIn text-xs">
 <div className="flex items-center justify-between text-[11px] text-slate-400">
 <span className="font-medium text-slate-300 flex items-center space-x-1">
 <Headphones className="w-3.5 h-3.5 text-amber-400" />
 <span>Praktiko Shqiptimin e Dutas</span>
 </span>
 <span className="text-[10px] text-slate-500">Regjistrim lokal vetëm për ju</span>
 </div>

 {micError && (
 <div className="bg-red-950/60 border border-red-800 text-red-200 p-2 rounded-lg text-[11px] flex items-center justify-between">
 <span>{micError}</span>
 <button
 onClick={() => setMicError(null)}
 className="ml-2 text-slate-400 hover:text-white font-bold"
 >
 ✕
 </button>
 </div>
 )}

 <div className="flex items-center space-x-2">
 {isRecording ? (
 <button
 onClick={stopRecording}
 className="flex-1 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 rounded-lg font-bold flex items-center justify-center space-x-1 animate-pulse"
 >
 <Square className="w-3.5 h-3.5 fill-current" />
 <span>Ndal Regjistrimin</span>
 </button>
 ) : (
 <button
 onClick={startRecording}
 className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-lg font-medium flex items-center justify-center space-x-1"
 >
 <Mic className="w-3.5 h-3.5 text-red-400" />
 <span>Nis Regjistrimin me Mikrofon</span>
 </button>
 )}

 {recordingBlobUrl && (
 <>
 <button
 onClick={playRecording}
 className={`px-3 py-1.5 rounded-lg border font-bold flex items-center space-x-1 ${
 isPlayingRecording
 ? 'bg-amber-950 border-amber-700 text-amber-300'
 : 'bg-emerald-950 border-emerald-800 text-emerald-300'
 }`}
 >
 {isPlayingRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
 <span>{isPlayingRecording ? 'Ndal' : 'Dëgjo Zërin Tënd'}</span>
 </button>

 <button
 onClick={deleteRecording}
 className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg border border-slate-800 hover:border-red-900/50"
 title="Fshij regjistrimin"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </>
 )}
 </div>
 </div>
 )}
 </div>
 );
};

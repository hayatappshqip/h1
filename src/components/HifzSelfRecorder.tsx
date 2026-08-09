import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Info, Headphones } from 'lucide-react';
import { AyahRecording, saveRecording, getRecordings, deleteRecording } from '../services/hifzRecordingsDb';

interface Props {
 ayahKey: string;
 referenceAudioUrl: string;
}

export const HifzSelfRecorder: React.FC<Props> = ({ ayahKey, referenceAudioUrl }) => {
 const [isRecording, setIsRecording] = useState(false);
 const [recordings, setRecordings] = useState<AyahRecording[]>([]);
 const [playingId, setPlayingId] = useState<string | null>(null);
 const [referencePlaying, setReferencePlaying] = useState(false);
 const [micError, setMicError] = useState<string | null>(null);
 
 const mediaRecorderRef = useRef<MediaRecorder | null>(null);
 const audioChunksRef = useRef<Blob[]>([]);
 const currentAudioRef = useRef<HTMLAudioElement | null>(null);
 const referenceAudioRef = useRef<HTMLAudioElement | null>(null);

 useEffect(() => {
 loadRecordings();
 
 referenceAudioRef.current = new Audio(referenceAudioUrl);
 referenceAudioRef.current.onended = () => setReferencePlaying(false);
 
 return () => {
 if (currentAudioRef.current) {
 currentAudioRef.current.pause();
 }
 if (referenceAudioRef.current) {
 referenceAudioRef.current.pause();
 }
 if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
 mediaRecorderRef.current.stop();
 }
 };
 }, [ayahKey, referenceAudioUrl]);
 
 // Reload reference audio if it changes
 useEffect(() => {
 if (referenceAudioRef.current) {
 referenceAudioRef.current.pause();
 referenceAudioRef.current.src = referenceAudioUrl;
 referenceAudioRef.current.load();
 setReferencePlaying(false);
 }
 }, [referenceAudioUrl]);

 const loadRecordings = async () => {
 const recs = await getRecordings(ayahKey);
 setRecordings(recs);
 };

 const startRecording = async () => {
 setMicError(null);
 try {
 const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
 const mediaRecorder = new MediaRecorder(stream);
 mediaRecorderRef.current = mediaRecorder;
 audioChunksRef.current = [];

 mediaRecorder.ondataavailable = (event) => {
 if (event.data.size > 0) {
 audioChunksRef.current.push(event.data);
 }
 };

 mediaRecorder.onstop = async () => {
 const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
 await saveRecording(ayahKey, audioBlob);
 await loadRecordings();
 
 // Stop all tracks to release microphone
 stream.getTracks().forEach(track => track.stop());
 };

 mediaRecorder.start();
 setIsRecording(true);
 
 // Ensure any playing audio is stopped
 if (currentAudioRef.current) {
 currentAudioRef.current.pause();
 setPlayingId(null);
 }
 if (referenceAudioRef.current) {
 referenceAudioRef.current.pause();
 setReferencePlaying(false);
 }
 
 } catch (err: any) {
 console.error("Error accessing microphone:", err);
 if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission denied')) {
 setMicError('Qasja në mikrofon u refuzua. Ju lutem lejoni përdorimin e mikrofonit në cilësimet e shfletuesit tuaj.');
 } else {
 setMicError('Microphone access is required to record your recitation.');
 }
 }
 };

 const stopRecording = () => {
 if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
 mediaRecorderRef.current.stop();
 setIsRecording(false);
 }
 };

 const playRecording = (recording: AyahRecording) => {
 if (currentAudioRef.current) {
 currentAudioRef.current.pause();
 }
 if (referenceAudioRef.current) {
 referenceAudioRef.current.pause();
 setReferencePlaying(false);
 }
 
 if (playingId === recording.id) {
 setPlayingId(null);
 return;
 }

 const audioUrl = URL.createObjectURL(recording.blob);
 const audio = new Audio(audioUrl);
 currentAudioRef.current = audio;
 
 audio.onended = () => {
 setPlayingId(null);
 URL.revokeObjectURL(audioUrl);
 };
 
 audio.onerror = () => {
 setPlayingId(null);
 };

 audio.play().then(() => setPlayingId(recording.id || null)).catch(err => {
 console.warn('Recorder play error:', err);
 setPlayingId(null);
 });
 };
 
 const toggleReference = () => {
 if (currentAudioRef.current) {
 currentAudioRef.current.pause();
 setPlayingId(null);
 }
 
 if (referenceAudioRef.current) {
 if (referencePlaying) {
 referenceAudioRef.current.pause();
 setReferencePlaying(false);
 } else {
 referenceAudioRef.current.currentTime = 0;
 referenceAudioRef.current.play().then(() => setReferencePlaying(true)).catch(err => {
 console.warn('Reference play error:', err);
 setReferencePlaying(false);
 });
 }
 }
 };

 const handleDelete = async (id: string) => {
 if (playingId === id && currentAudioRef.current) {
 currentAudioRef.current.pause();
 setPlayingId(null);
 }
 await deleteRecording(id);
 await loadRecordings();
 };

 return (
 <div className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-4">
 <div className="flex items-center justify-between">
 <h4 className="text-sm font-medium text-slate-300 flex items-center space-x-2">
 <Mic className="w-4 h-4 text-emerald-500" />
 <span>Self-Recording (Local Only)</span>
 </h4>
 <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
 Private
 </span>
 </div>

 {micError && (
 <div className="bg-red-950/60 border border-red-800 text-red-200 p-2.5 rounded-xl text-xs flex items-center justify-between">
 <span>{micError}</span>
 <button
 onClick={() => setMicError(null)}
 className="ml-2 text-slate-400 hover:text-white font-bold"
 >
 ✕
 </button>
 </div>
 )}
 
 <div className="flex flex-col sm:flex-row gap-3">
 {isRecording ? (
 <button 
 onClick={stopRecording}
 className="flex-1 py-3 bg-red-500/20 text-red-500 border border-red-500/50 rounded-xl flex items-center justify-center space-x-2 animate-pulse"
 >
 <Square className="w-5 h-5 fill-current" />
 <span className="font-medium">Stop Recording</span>
 </button>
 ) : (
 <button 
 onClick={startRecording}
 className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl flex items-center justify-center space-x-2 transition-colors"
 >
 <Mic className="w-5 h-5" />
 <span className="font-medium">Record Recitation</span>
 </button>
 )}
 
 <button 
 onClick={toggleReference}
 className={`px-4 py-3 border rounded-xl flex items-center justify-center space-x-2 transition-colors ${
 referencePlaying 
 ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/50' 
 : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-300'
 }`}
 >
 {referencePlaying ? <Square className="w-5 h-5 fill-current" /> : <Headphones className="w-5 h-5" />}
 <span className="font-medium text-sm whitespace-nowrap">Reciter</span>
 </button>
 </div>

 {recordings.length > 0 && (
 <div className="space-y-2 mt-4">
 <p className="text-xs text-slate-500 mb-2">Recent Recordings (Max 3)</p>
 {recordings.map((rec, i) => {
 const isPlaying = playingId === rec.id;
 return (
 <div key={rec.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-2">
 <div className="flex items-center space-x-3">
 <button
 onClick={() => playRecording(rec)}
 className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
 >
 {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
 </button>
 <span className="text-sm font-mono text-slate-300">
 Recording {i + 1}
 </span>
 </div>
 <button
 onClick={() => rec.id && handleDelete(rec.id)}
 className="p-2 text-slate-500 hover:text-red-400 transition-colors"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 );
 })}
 </div>
 )}
 
 <div className="bg-blue-950/20 border border-blue-900/30 p-3 rounded-xl flex items-start space-x-3 text-left mt-2">
 <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
 <p className="text-xs text-blue-300/80 leading-relaxed">
 Reciting to another person is part of the traditional method, because the brain auto-fills gaps when reciting alone. 
 Use this recording feature to listen to your own recitation and compare it with the reciter.
 </p>
 </div>
 </div>
 );
};

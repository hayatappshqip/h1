import { useState, useRef, useCallback, useEffect } from "react";

type Src = "absolute" | "webkit" | "relative" | null;

export function useCompassHeading() {
 const [heading, setHeading] = useState<number|null>(null);
 const [source, setSource] = useState<Src>(null);
 const [needsPerm, setNeedsPerm] = useState(false);
 const [error, setError] = useState<string|null>(null);
 const [uncalibrated, setUncal]= useState(false);
 const [noSignal, setNoSignal] = useState(false);

 const locked = useRef<Src>(null);
 const allowRel = useRef(false);
 const gotEvent = useRef(false);
 const sx = useRef(0), sy = useRef(0), primed = useRef(false);
 const pending = useRef<number|null>(null);
 const raf = useRef<number|null>(null);

 const screenAngle = () => {
 const so: any = (screen as any).orientation;
 if (so && typeof so.angle === "number") return so.angle;
 return typeof (window as any).orientation === "number" ? (window as any).orientation : 0;
 };
 const norm = (d: number) => ((d % 360) + 360) % 360;

 // Kyçet ne nje burim te vetem dhe filtron rrethorisht.
 const push = useCallback((raw: number, src: Src) => {
 if (locked.current === null) { locked.current = src; setSource(src); }
 else if (locked.current !== src) return; // <-- ndalon perzierjen
 gotEvent.current = true;

 const h = norm(raw + screenAngle());
 const r = h * Math.PI / 180;
 const k = primed.current ? 0.15 : 1; // low-pass
 primed.current = true;
 sx.current = sx.current * (1 - k) + Math.sin(r) * k;
 sy.current = sy.current * (1 - k) + Math.cos(r) * k;
 pending.current = norm(Math.atan2(sx.current, sy.current) * 180 / Math.PI);

 if (raf.current === null) { // max 1 setState per frame
 raf.current = requestAnimationFrame(() => {
 raf.current = null;
 if (pending.current !== null) setHeading(pending.current);
 });
 }
 }, []);

 const onAbsolute = useCallback((e: DeviceOrientationEvent) => {
 if (e.absolute !== true || e.alpha === null) return;
 push(360 - e.alpha, "absolute");
 }, [push]);

 const onOrientation = useCallback((e: any) => {
 if (typeof e.webkitCompassHeading === "number") { // iOS
 if (typeof e.webkitCompassAccuracy === "number") setUncal(e.webkitCompassAccuracy < 0);
 push(e.webkitCompassHeading, "webkit");
 return;
 }
 if (e.absolute === true && e.alpha !== null) { push(360 - e.alpha, "absolute"); return; }
 // Android: alpha relative — pranohet vetem nese s'erdhi asnje absolute
 if (allowRel.current && locked.current === null && e.alpha !== null)
 push(360 - e.alpha, "relative");
 }, [push]);

 const attach = useCallback(() => {
 window.addEventListener("deviceorientationabsolute", onAbsolute, true);
 window.addEventListener("deviceorientation", onOrientation, true);
 setTimeout(() => { allowRel.current = true; }, 1200);
 setTimeout(() => { if (!gotEvent.current) setNoSignal(true); }, 2500);
 }, [onAbsolute, onOrientation]);

 const enable = useCallback(async () => {
 setError(null); setNoSignal(false);
 const DOE: any = (window as any).DeviceOrientationEvent;
 if (!DOE) { setError("Ky shfletues nuk e mbeshtet sensorin e orientimit."); return; }
 if (typeof DOE.requestPermission === "function") {
 try {
 const res = await DOE.requestPermission();
 if (res !== "granted") {
 setError("Leja per busullen u refuzua. Hap Settings > Safari > Motion & Orientation Access, aktivizoje, pastaj rihap faqen.");
 return;
 }
 } catch (err: any) {
 setError("Kerkesa per leje deshtoi: " + (err?.message || err));
 return;
 }
 }
 setNeedsPerm(false);
 attach();
 }, [attach]);

 useEffect(() => {
 const DOE: any = (window as any).DeviceOrientationEvent;
 if (!DOE) { setError("Ky shfletues nuk e mbeshtet sensorin e orientimit."); return; }
 if (typeof DOE.requestPermission === "function") setNeedsPerm(true); // iOS: prit prekjen
 else attach();
 return () => {
 window.removeEventListener("deviceorientationabsolute", onAbsolute, true);
 window.removeEventListener("deviceorientation", onOrientation, true);
 if (raf.current !== null) cancelAnimationFrame(raf.current);
 };
 }, [attach, onAbsolute, onOrientation]);

 return { heading, source, needsPerm, error, uncalibrated, noSignal, enable };
}

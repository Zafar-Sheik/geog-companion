"use client";
import { useEffect, useState } from "react";
import { usePrefs } from "@/lib/prefs";

/** Applies the learner's display preferences to <html> as CSS classes / variables. */
export function PrefsApplier() {
  const p = usePrefs();
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const dark = p.theme === "dark" || p.theme === "contrast" || (p.theme === "system" && systemDark);
    html.classList.toggle("dark", dark);
    html.classList.toggle("contrast", p.theme === "contrast");
    html.classList.toggle("calm", p.calm);
    html.classList.toggle("font-atkinson", p.font === "atkinson");
    html.classList.toggle("font-dyslexic", p.font === "dyslexic");
    html.classList.toggle("focus-mode", p.focusMode);
    html.style.setProperty("--reading-scale", String(p.textScale));
    html.style.setProperty("--reading-leading", p.lineSpacing === "normal" ? "1.6" : p.lineSpacing === "relaxed" ? "1.8" : "2.1");
    html.style.colorScheme = dark ? "dark" : "light";
  }, [p, systemDark]);

  return null;
}

/** Inline script that sets the theme before first paint (prevents a white flash). */
export const themeBootScript = `(function(){try{var p=JSON.parse(localStorage.getItem('geomzansi:prefs')||'{}');var t=p.theme||'system';var d=t==='dark'||t==='contrast'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var c=document.documentElement.classList;if(d)c.add('dark');if(t==='contrast')c.add('contrast');if(p.calm)c.add('calm');if(p.font==='atkinson')c.add('font-atkinson');if(p.font==='dyslexic')c.add('font-dyslexic');if(p.textScale)document.documentElement.style.setProperty('--reading-scale',p.textScale);}catch(e){}})();`;

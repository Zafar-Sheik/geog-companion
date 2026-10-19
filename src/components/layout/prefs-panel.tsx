"use client";
import { AnimatePresence, motion } from "motion/react";
import { Accessibility, Contrast, Focus, Moon, Ruler, Sun, Type, Volume2, Wand2, X } from "lucide-react";
import { DEFAULT_PREFS, setPrefs, usePrefs, type Prefs } from "@/lib/prefs";
import { cn } from "@/lib/utils";

function Option<T extends string | number>({ value, current, onPick, children }: { value: T; current: T; onPick: (v: T) => void; children: React.ReactNode }) {
  const active = value === current;
  return (
    <button
      onClick={() => onPick(value)}
      aria-pressed={active}
      className={cn("flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition", active ? "border-brand bg-brand-soft text-brand" : "border-line text-muted hover:text-fg")}
    >
      {children}
    </button>
  );
}

function Toggle({ label, description, checked, onChange, icon }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void; icon: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 transition hover:border-brand/40">
      <span className="mt-0.5 text-brand">{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-fg">{label}</span>
        <span className="block text-xs text-muted">{description}</span>
      </span>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span aria-hidden className={cn("mt-1 h-6 w-11 shrink-0 rounded-full p-0.5 transition", checked ? "bg-brand" : "bg-surface-2 ring-1 ring-line")}>
        <span className={cn("block h-5 w-5 rounded-full bg-white shadow transition", checked && "translate-x-5")} />
      </span>
    </label>
  );
}

/** "Learning preferences" drawer – every ADHD / accessibility setting in one place. */
export function PrefsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const p = usePrefs();
  const set = <K extends keyof Prefs>(k: K) => (v: Prefs[K]) => setPrefs({ [k]: v } as Partial<Prefs>);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Learning preferences"
            className="fixed top-0 right-0 bottom-0 z-[80] w-full max-w-md overflow-y-auto border-l border-line bg-elevated p-5 shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Accessibility className="h-5 w-5 text-brand" /> Learning preferences</h2>
                <p className="text-sm text-muted">Make GeoMzansi work for <em>your</em> brain. Saved on this device.</p>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg" aria-label="Close preferences"><X className="h-5 w-5" /></button>
            </div>

            <section className="mb-5">
              <h3 className="mb-2 text-xs font-bold tracking-wider text-muted uppercase">Theme</h3>
              <div className="flex gap-2">
                <Option value="system" current={p.theme} onPick={set("theme")}>Auto</Option>
                <Option value="light" current={p.theme} onPick={set("theme")}><Sun className="mx-auto h-4 w-4" /></Option>
                <Option value="dark" current={p.theme} onPick={set("theme")}><Moon className="mx-auto h-4 w-4" /></Option>
                <Option value="contrast" current={p.theme} onPick={set("theme")}><Contrast className="mx-auto h-4 w-4" /></Option>
              </div>
            </section>

            <section className="mb-5">
              <h3 className="mb-2 flex items-center gap-1 text-xs font-bold tracking-wider text-muted uppercase"><Type className="h-3.5 w-3.5" /> Reading font</h3>
              <div className="flex gap-2">
                <Option value="default" current={p.font} onPick={set("font")}>Inter</Option>
                <Option value="atkinson" current={p.font} onPick={set("font")}><span style={{ fontFamily: "Atkinson Hyperlegible" }}>Hyperlegible</span></Option>
                <Option value="dyslexic" current={p.font} onPick={set("font")}><span style={{ fontFamily: "OpenDyslexic" }}>Dyslexic</span></Option>
              </div>
            </section>

            <section className="mb-5">
              <h3 className="mb-2 text-xs font-bold tracking-wider text-muted uppercase">Text size</h3>
              <div className="flex gap-2">
                {[1, 1.125, 1.25, 1.4].map((s) => (
                  <Option key={s} value={s} current={p.textScale} onPick={set("textScale")}><span style={{ fontSize: `${0.75 * s}rem` }}>Aa</span></Option>
                ))}
              </div>
            </section>

            <section className="mb-5">
              <h3 className="mb-2 text-xs font-bold tracking-wider text-muted uppercase">Line spacing</h3>
              <div className="flex gap-2">
                <Option value="normal" current={p.lineSpacing} onPick={set("lineSpacing")}>Normal</Option>
                <Option value="relaxed" current={p.lineSpacing} onPick={set("lineSpacing")}>Relaxed</Option>
                <Option value="loose" current={p.lineSpacing} onPick={set("lineSpacing")}>Loose</Option>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="mb-2 text-xs font-bold tracking-wider text-muted uppercase">Focus helpers</h3>
              <Toggle icon={<Focus className="h-4 w-4" />} label="One step at a time" description="Lessons show one bite-sized chunk at a time with a clear Next button." checked={p.stepMode} onChange={set("stepMode")} />
              <Toggle icon={<Focus className="h-4 w-4" />} label="Focus mode" description="Hides menus and side panels so only the lesson is on screen." checked={p.focusMode} onChange={set("focusMode")} />
              <Toggle icon={<Wand2 className="h-4 w-4" />} label="Calm mode" description="Turns off decorative animations and moving backgrounds." checked={p.calm} onChange={set("calm")} />
              <Toggle icon={<Ruler className="h-4 w-4" />} label="Reading ruler" description="A highlight band follows your pointer to help you keep your place." checked={p.ruler} onChange={set("ruler")} />
              <Toggle icon={<Type className="h-4 w-4" />} label="Word anchors" description="Bolds the start of each word in lesson text to guide your eyes." checked={p.wordAnchors} onChange={set("wordAnchors")} />
            </section>

            <section className="mt-5">
              <h3 className="mb-2 flex items-center gap-1 text-xs font-bold tracking-wider text-muted uppercase"><Volume2 className="h-3.5 w-3.5" /> Read-aloud speed</h3>
              <input type="range" min={0.6} max={1.6} step={0.1} value={p.speechRate} onChange={(e) => setPrefs({ speechRate: Number(e.target.value) })} className="w-full accent-[var(--brand)]" aria-label="Read aloud speed" />
              <div className="text-xs text-muted">{p.speechRate.toFixed(1)}×</div>
            </section>

            <button onClick={() => setPrefs(DEFAULT_PREFS)} className="mt-6 w-full rounded-xl border border-line py-2 text-sm text-muted hover:text-fg">Reset to defaults</button>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Aceternity UI "Floating Dock" – the mobile navigation bar. */
export function FloatingDock({ items }: { items: { title: string; href: string; icon: React.ReactNode }[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Main (mobile)" className="fixed inset-x-3 bottom-3 z-50 lg:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-between rounded-2xl border border-line bg-elevated/90 px-2 py-1.5 shadow-2xl shadow-black/20 backdrop-blur-xl">
        {items.map((it) => {
          const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn("flex min-w-14 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-medium transition", active ? "bg-brand-soft text-brand" : "text-muted hover:text-fg")}
              >
                <span className="h-5 w-5">{it.icon}</span>
                {it.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

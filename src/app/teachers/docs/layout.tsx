import Link from "next/link";
import { DOCS } from "@/lib/docs";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const groups = [...new Set(DOCS.map((d) => d.group))];
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[240px_1fr]">
      <nav aria-label="Documentation" className="hide-in-focus h-fit lg:sticky lg:top-20">
        <Link href="/teachers" className="mb-4 block font-display text-lg font-bold">Teacher Guide</Link>
        {groups.map((g) => (
          <div key={g} className="mb-4">
            <div className="mb-1 text-xs font-bold tracking-wider text-muted uppercase">{g}</div>
            <ul className="space-y-0.5">
              {DOCS.filter((d) => d.group === g).map((d) => (
                <li key={d.slug}><Link href={`/teachers/docs/${d.slug}`} className="block rounded-lg px-2 py-1 text-sm text-muted hover:bg-surface-2 hover:text-fg">{d.title}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

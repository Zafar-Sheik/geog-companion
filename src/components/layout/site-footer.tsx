import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="hide-in-focus mt-24 border-t border-line pb-28 lg:pb-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-md text-sm text-muted">
            An interactive Grade 12 Geography companion for the learners of Northwood Boys&apos; High School, Durban – built around the
            CAPS Grade 12 Geography curriculum and the NSC exam format (Paper 1 and Paper 2). Built for every learner, especially those who learn differently.
          </p>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-bold">Study</h3>
          <ul className="space-y-1 text-sm text-muted">
            <li><Link href="/learn?paper=1" className="hover:text-fg">Paper 1 – Physical</Link></li>
            <li><Link href="/learn?paper=2" className="hover:text-fg">Paper 2 – Human</Link></li>
            <li><Link href="/learn?topic=mapwork" className="hover:text-fg">Mapwork &amp; GIS</Link></li>
            <li><Link href="/flashcards" className="hover:text-fg">Flashcards</Link></li>
            <li><Link href="/exam" className="hover:text-fg">Exam Room</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-bold">For teachers</h3>
          <ul className="space-y-1 text-sm text-muted">
            <li><Link href="/teachers" className="hover:text-fg">Teacher guide</Link></li>
            <li><Link href="/teachers/docs/curriculum-map" className="hover:text-fg">CAPS curriculum map</Link></li>
            <li><Link href="/teachers/docs/overview" className="hover:text-fg">Documentation</Link></li>
          </ul>
        </div>
      </div>
      <p className="px-4 text-center text-xs text-muted">Your progress is stored only on this device. No accounts, no tracking. An independent study aid – always check with your teacher and the latest DBE exam guidelines.</p>
    </footer>
  );
}

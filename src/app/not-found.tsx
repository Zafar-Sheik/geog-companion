import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="font-mono text-sm text-danger">Grid reference not found on sheet 2931CC (Durban)</div>
      <h1 className="mt-3 font-display text-5xl font-bold">404</h1>
      <p className="mt-3 text-lg text-muted">You&apos;ve wandered off the edge of the map. Even the best orienteers take a wrong bearing sometimes.</p>
      <Link href="/" className="mt-6 inline-block rounded-xl bg-brand px-5 py-2.5 font-semibold text-white">Back to base camp</Link>
    </div>
  );
}

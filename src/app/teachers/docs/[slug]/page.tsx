import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DOCS, headings, readDoc } from "@/lib/docs";
import { DocRenderer } from "@/components/pages/doc-renderer";

export function generateStaticParams() {
  return DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = DOCS.find((x) => x.slug === slug);
  return { title: d ? `${d.title} – Teacher Guide` : "Teacher Guide" };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = readDoc(slug);
  if (!doc) notFound();
  const idx = DOCS.findIndex((d) => d.slug === slug);
  const prev = DOCS[idx - 1];
  const next = DOCS[idx + 1];
  const toc = headings(doc.markdown);
  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_220px]">
      <article className="min-w-0 rounded-3xl border border-line bg-surface p-6 md:p-10">
        <DocRenderer markdown={doc.markdown} />
        <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-line pt-6 text-sm">
          {prev ? <Link href={`/teachers/docs/${prev.slug}`} className="flex items-center gap-1 text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" />{prev.title}</Link> : <span />}
          {next && <Link href={`/teachers/docs/${next.slug}`} className="flex items-center gap-1 font-semibold text-brand">{next.title}<ArrowRight className="h-4 w-4" /></Link>}
        </div>
      </article>
      {toc.length > 0 && (
        <aside className="hidden h-fit xl:sticky xl:top-20 xl:block" aria-label="On this page">
          <div className="mb-2 text-xs font-bold tracking-wider text-muted uppercase">On this page</div>
          <ul className="space-y-1 border-l border-line">
            {toc.map((h) => <li key={h.id}><a href={`#${h.id}`} className="-ml-px block border-l-2 border-transparent py-0.5 pl-3 text-sm text-muted hover:border-brand hover:text-fg">{h.text}</a></li>)}
          </ul>
        </aside>
      )}
    </div>
  );
}

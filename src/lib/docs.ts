import { readFileSync } from "node:fs";
import { join } from "node:path";

/** The documentation set shown in the Teacher Guide (files live in /docs). */
export const DOCS = [
  { slug: "overview", file: "01-overview.md", title: "Overview", group: "Start here" },
  { slug: "teacher-quick-start", file: "02-teacher-quick-start.md", title: "Teacher quick-start", group: "Start here" },
  { slug: "curriculum-map", file: "03-curriculum-map.md", title: "CAPS curriculum map", group: "Teaching" },
  { slug: "learning-design", file: "04-learning-design.md", title: "Learning design & study tools", group: "Teaching" },
  { slug: "adhd-accessibility", file: "05-adhd-and-accessibility.md", title: "ADHD & accessibility", group: "Teaching" },
  { slug: "design-system", file: "06-design-system.md", title: "Colours, type & design system", group: "Design" },
  { slug: "architecture", file: "07-architecture.md", title: "Architecture", group: "Technical" },
  { slug: "content-authoring", file: "08-content-authoring.md", title: "Writing lessons & exam questions", group: "Technical" },
  { slug: "testing-deployment", file: "09-testing-and-deployment.md", title: "Testing & deployment", group: "Technical" },
  { slug: "privacy-security", file: "10-privacy-and-security.md", title: "Privacy & security", group: "Technical" },
  { slug: "faq", file: "11-faq.md", title: "FAQ & troubleshooting", group: "Help" },
] as const;

export type DocSlug = (typeof DOCS)[number]["slug"];

export function readDoc(slug: string): { title: string; markdown: string } | null {
  const d = DOCS.find((x) => x.slug === slug);
  if (!d) return null;
  const markdown = readFileSync(join(process.cwd(), "docs", d.file), "utf8");
  return { title: d.title, markdown };
}

/** Extracts ## headings for the "On this page" table of contents. */
export function headings(md: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  let inCode = false;
  for (const line of md.split("\n")) {
    if (line.startsWith("```")) inCode = !inCode;
    if (inCode) continue;
    const m = /^##\s+(.+)$/.exec(line);
    if (m) out.push({ id: headingId(m[1]), text: m[1].replace(/[*`]/g, "") });
  }
  return out;
}

export function headingId(text: string): string {
  return text.toLowerCase().replace(/[`*]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

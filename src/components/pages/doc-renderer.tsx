import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import { headingId } from "@/lib/docs";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) return textOf((node as { props: { children?: ReactNode } }).props.children);
  return "";
}

/** Server-rendered markdown for the Teacher Guide, with anchored headings. */
export function DocRenderer({ markdown }: { markdown: string }) {
  return (
    <div className="prose-docs">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => <h2 id={headingId(textOf(children))} className="scroll-mt-24">{children}</h2>,
          h3: ({ children }) => <h3 id={headingId(textOf(children))} className="scroll-mt-24">{children}</h3>,
          a: ({ href, children }) => <a href={href} {...(href?.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>{children}</a>,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

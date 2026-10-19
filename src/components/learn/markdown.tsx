"use client";
import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePrefs } from "@/lib/prefs";

/** Bold the first half of each word ("word anchors") – some ADHD/dyslexic readers find it guides the eye. */
function anchor(node: ReactNode): ReactNode {
  if (typeof node === "string") {
    return node.split(/(\s+)/).map((w, i) => {
      if (!w.trim() || w.length < 2) return w;
      const k = Math.ceil(w.length / 2);
      return <span key={i}><b className="font-bold">{w.slice(0, k)}</b>{w.slice(k)}</span>;
    });
  }
  if (Array.isArray(node)) return node.map((n, i) => <span key={i}>{anchor(n)}</span>);
  if (isValidElement<{ children?: ReactNode }>(node) && node.type !== "code") {
    return cloneElement(node, undefined, Children.map(node.props.children, anchor));
  }
  return node;
}

export function Markdown({ md, className = "prose-learn" }: { md: string; className?: string }) {
  const { wordAnchors } = usePrefs();
  const wrap = (Tag: "p" | "li") =>
    function Wrapped({ children }: { children?: ReactNode }) {
      return <Tag>{wordAnchors ? anchor(children) : children}</Tag>;
    };
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: wrap("p"), li: wrap("li") }}>{md}</ReactMarkdown>
    </div>
  );
}

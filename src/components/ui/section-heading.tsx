import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, description, className, align = "center" }: {
  eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; className?: string; align?: "center" | "left";
}) {
  return (
    <div className={cn("mb-10", align === "center" && "mx-auto max-w-2xl text-center", className)}>
      {eyebrow && <p className="mb-2 text-sm font-bold tracking-wider text-brand uppercase">{eyebrow}</p>}
      <h2 className="font-display text-3xl font-bold tracking-tight text-fg md:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-lg text-muted">{description}</p>}
    </div>
  );
}

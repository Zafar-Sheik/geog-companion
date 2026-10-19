import { cn } from "@/lib/utils";

/** Aceternity UI "Bento Grid". */
export function BentoGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3", className)}>{children}</div>;
}

export function BentoGridItem({ className, title, description, header, icon }: {
  className?: string; title?: React.ReactNode; description?: React.ReactNode; header?: React.ReactNode; icon?: React.ReactNode;
}) {
  return (
    <div className={cn("group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-2xl border border-line bg-surface p-4 shadow-sm transition duration-200 hover:shadow-xl hover:shadow-brand/10", className)}>
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        <div className="mt-2 mb-1 font-display text-lg font-bold text-fg">{title}</div>
        <div className="text-sm text-muted">{description}</div>
      </div>
    </div>
  );
}

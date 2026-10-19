import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:brightness-110 shadow-lg shadow-brand/25",
  secondary: "bg-surface-2 text-fg border border-line hover:border-brand/50",
  ghost: "text-muted hover:text-fg hover:bg-surface-2",
  danger: "bg-danger text-white hover:brightness-110",
  success: "bg-success text-white hover:brightness-110",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/** Buttons are always at least 32px tall – big, easy targets for every learner. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn("inline-flex select-none items-center justify-center font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)}
      {...props}
    />
  );
});

export function ButtonLink({ href, className, variant = "primary", size = "md", children }: { href: string; className?: string; variant?: Variant; size?: Size; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn("inline-flex items-center justify-center font-semibold transition active:scale-[0.98]", variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}

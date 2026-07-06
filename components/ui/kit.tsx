"use client";

/**
 * NEXORA UI kit — Apple-clean primitives.
 * Every page should compose these instead of hand-rolling styles.
 */

import { forwardRef, type ReactNode, type ComponentProps } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------- Button ---------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover shadow-sm",
  secondary:
    "bg-white text-ink border border-hairline hover:bg-[#fafafa] shadow-sm",
  ghost: "bg-transparent text-accent hover:bg-accent/8",
  danger: "bg-[#fff0f0] text-danger border border-danger/20 hover:bg-[#ffe4e4]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-4 text-[13px]",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ComponentProps<"button"> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
  }
>(function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
});

/* ---------------- Card ---------------- */

export function Card({
  children,
  className,
  hover = false,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "shadow-card rounded-[1.25rem] border border-black/[0.04] bg-white",
        hover &&
          "cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-[15px] font-semibold tracking-tight text-ink", className)}>
      {children}
    </h3>
  );
}

/* ---------------- Form fields ---------------- */

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <label className={cn("mb-1.5 block text-[13px] font-medium text-ink-secondary", className)}>
      {children}
    </label>
  );
}

const fieldBase =
  "w-full rounded-xl border border-hairline bg-white px-4 py-2.5 text-[15px] text-ink placeholder:text-ink-tertiary transition-all duration-200 focus:border-accent focus:ring-4 focus:ring-accent/10";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(function Input(
  { className, ...props },
  ref
) {
  return <input ref={ref} className={cn(fieldBase, className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(fieldBase, "resize-none", className)} {...props} />;
  }
);

export const Select = forwardRef<HTMLSelectElement, ComponentProps<"select">>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select ref={ref} className={cn(fieldBase, "cursor-pointer appearance-none", className)} {...props}>
      {children}
    </select>
  );
});

export function Field({
  label,
  children,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

/* ---------------- Badge ---------------- */

type BadgeTone = "neutral" | "blue" | "green" | "orange" | "red" | "violet";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-[#f0f0f2] text-ink-secondary",
  blue: "bg-[#e8f2ff] text-[#0064d1]",
  green: "bg-[#e6f6ea] text-[#1e7b36]",
  orange: "bg-[#fff3e0] text-[#b25000]",
  red: "bg-[#ffebeb] text-[#c30010]",
  violet: "bg-[#f0ecfd] text-[#5b45b0]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Map an event status string to a badge tone. */
export function statusTone(status: string): BadgeTone {
  switch (status) {
    case "Confirmed":
      return "green";
    case "Contract Pending":
      return "orange";
    case "Invoice Sent":
      return "blue";
    case "Lead / Inquiry":
      return "violet";
    default:
      return "neutral";
  }
}

/* ---------------- Page header ---------------- */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-ink-secondary">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}

/* ---------------- Empty state ---------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#f5f5f7] text-ink-tertiary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-secondary">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
}

/* ---------------- Skeleton loaders ---------------- */

export function SkeletonRows({ count = 3, height = "h-24" }: { count?: number; height?: string }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("skeleton w-full rounded-[1.25rem]", height)} />
      ))}
    </div>
  );
}

/* ---------------- Modal ---------------- */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-card-hover",
              wide ? "max-w-3xl" : "max-w-xl"
            )}
          >
            <div className="flex shrink-0 items-start justify-between border-b border-black/5 px-7 py-5">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
                {subtitle && <p className="mt-0.5 text-sm text-ink-secondary">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-ink-tertiary transition-colors hover:bg-black/5 hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>
            <div className="custom-scrollbar flex-1 overflow-y-auto px-7 py-6">{children}</div>
            {footer && (
              <div className="flex shrink-0 items-center justify-end gap-3 border-t border-black/5 bg-[#fafafa] px-7 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Confirm modal (replaces window.confirm) ---------------- */

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fff0f0]">
          <AlertTriangle className="size-5 text-danger" />
        </div>
        <p className="text-[15px] leading-relaxed text-ink-secondary">{description}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

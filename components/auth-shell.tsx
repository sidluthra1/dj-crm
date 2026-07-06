"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Enter } from "@/components/motion";

/** Shared centered card layout for all auth pages. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 py-12">
      <Enter>
        <Link href="/" className="mb-8 block text-center text-lg font-semibold tracking-[0.18em] text-ink">
          NEXORA
        </Link>
      </Enter>
      <Enter delay={0.08} className="w-full max-w-md">
        <div className="shadow-card rounded-[1.5rem] border border-black/[0.04] bg-white p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
            {subtitle && <p className="mt-1.5 text-[15px] text-ink-secondary">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-sm text-ink-secondary">{footer}</div>}
      </Enter>
    </div>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-5 rounded-xl border border-danger/15 bg-[#fff5f5] px-4 py-3 text-sm text-danger">
      {message}
    </div>
  );
}

export function AuthSuccess({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-5 rounded-xl border border-success/15 bg-[#f2fbf4] px-4 py-3 text-sm text-success">
      {message}
    </div>
  );
}

export function GoogleButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-hairline bg-white text-sm font-medium text-ink transition-all hover:bg-[#fafafa] active:scale-[0.98]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://www.google.com/favicon.ico" alt="" className="size-4" />
        {label}
      </button>
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-hairline" />
        <span className="text-xs text-ink-tertiary">or</span>
        <div className="h-px flex-1 bg-hairline" />
      </div>
    </>
  );
}

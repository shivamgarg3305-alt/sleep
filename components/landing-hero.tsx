"use client";

import { motion } from "framer-motion";
import { Moon } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

/**
 * Landing hero. Client component because it needs the real signIn() call
 * and reads `callbackUrl` (set by middleware when an unauthenticated user
 * hit a protected route directly).
 */
export function LandingHero() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-accent/10 blur-[100px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-sm flex-col items-center text-center"
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-glow-sm ring-1 ring-primary/20">
          <Moon className="h-7 w-7 text-primary" strokeWidth={1.75} />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-glow">
          Somnia
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          One tap to sleep. One tap to wake. Effortless tracking,
          beautifully simple insight.
        </p>

        <Button
          variant="glow"
          size="lg"
          className="mt-10 w-full gap-3"
          onClick={() => signIn("google", { callbackUrl })}
        >
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </Button>

        <p className="mt-6 text-xs text-muted-foreground/70">
          By continuing you agree to sleep better.
        </p>
      </motion.div>
    </main>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        opacity=".95"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z"
        opacity=".8"
      />
      <path
        fill="currentColor"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.85z"
        opacity=".65"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z"
        opacity=".9"
      />
    </svg>
  );
}

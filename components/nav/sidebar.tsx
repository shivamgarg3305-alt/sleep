"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LogOut, Moon as LogoIcon } from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";

import { NAV_ITEMS } from "./nav-items";
import { useActiveSection } from "./use-active-section";

interface SidebarProps {
  userName: string | null;
  userImage: string | null;
}

/**
 * Fixed left icon rail, desktop only (`hidden sm:flex`). Carries both
 * primary navigation (mirrors <BottomNav>) and, unlike the mobile bar,
 * identity + sign-out — on mobile those live in the top header instead,
 * since the bottom bar is nav-only real estate.
 */
export function Sidebar({ userName, userImage }: SidebarProps) {
  const activeId = useActiveSection(NAV_ITEMS.map((item) => item.id));

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col items-center border-r border-white/10 bg-oled-950/60 py-6 backdrop-blur-xl sm:flex">
      <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
        <LogoIcon className="h-5 w-5 text-primary" strokeWidth={1.75} />
      </div>

      <nav className="flex flex-1 flex-col items-center gap-2" aria-label="Primary">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeId === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              title={label}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 -z-10 rounded-xl bg-primary/10 ring-1 ring-primary/30"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="h-5 w-5" />
            </a>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-3">
        {userImage ? (
          <Image
            src={userImage}
            alt={userName ?? "Profile photo"}
            width={36}
            height={36}
            className="rounded-full ring-1 ring-white/10"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-secondary" />
        )}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Sign out</span>
        </button>
      </div>
    </aside>
  );
}

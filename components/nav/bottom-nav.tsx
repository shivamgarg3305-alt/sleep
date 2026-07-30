"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import { NAV_ITEMS } from "./nav-items";
import { useActiveSection } from "./use-active-section";

/**
 * Fixed bottom tab bar, mobile only (`sm:hidden`). Desktop gets the icon
 * rail <Sidebar> instead. Items are anchor links to the dashboard's own
 * sections — this is a single-page dashboard, so "navigation" here means
 * smooth-scrolling between the sleep toggle and the insights panel rather
 * than routing.
 */
export function BottomNav() {
  const activeId = useActiveSection(NAV_ITEMS.map((item) => item.id));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-oled-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden"
      aria-label="Primary"
    >
      <ul className="flex items-stretch justify-around">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeId === id;
          return (
            <li key={id} className="flex-1">
              <a
                href={`#${id}`}
                className="relative flex flex-col items-center gap-1 py-3 text-xs"
                aria-current={isActive ? "true" : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-px h-0.5 w-8 rounded-full bg-primary shadow-glow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

import { BarChart3, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  /** Also the id of the <section> this item scrolls to. */
  id: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "sleep", label: "Sleep", icon: Moon },
  { id: "insights", label: "Insights", icon: BarChart3 },
];

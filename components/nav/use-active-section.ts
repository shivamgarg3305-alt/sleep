"use client";

import { useEffect, useState } from "react";

/**
 * Observes the given section ids and returns whichever is most centered in
 * the viewport right now. Used to highlight the active item in both the
 * mobile bottom nav and the desktop sidebar as the single-page dashboard
 * scrolls between its "sleep" and "insights" sections.
 */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (mostVisible?.target.id) {
          setActive(mostVisible.target.id);
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `ids` is a stable module-level array
  }, []);

  return active;
}

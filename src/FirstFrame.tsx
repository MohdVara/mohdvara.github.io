import { useEffect, type ReactNode } from "react";

/** Place inside Suspense so readiness means the route content committed,
 * rather than its fallback. Optional imagery, scenery and analytics never gate it. */
export default function FirstFrame({ children }: { children: ReactNode }) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => window.dispatchEvent(new Event("portfolio:ready")));
    return () => cancelAnimationFrame(frame);
  }, []);
  return children;
}

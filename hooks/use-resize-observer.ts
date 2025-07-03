import { useEffect } from "react";

/**
 * useResizeObserver
 *
 * Attaches a ResizeObserver to a DOM element and calls the callback when its size changes.
 *
 * @param ref - React ref to a DOM element (e.g., useRef<HTMLDivElement | null>(null))
 * @param callback - Function to call when the element's size changes
 */
export function useResizeObserver<T extends Element>(
  ref: React.RefObject<T>,
  callback: (entry: ResizeObserverEntry) => void
) {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        callback(entry);
      }
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, callback]);
}

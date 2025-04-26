import { DashboardLink } from "@/utils/dashboard-navigation";
import { useEffect, useMemo, useState, useRef } from "react";

type DashboardBreadcrumbPathsSelectors = {
  visibleLinks: DashboardLink[];
  hiddenLinks: DashboardLink[];
  shouldShowDropdown: boolean;
};

type DashboardBreadcrumbPathsHook = {
  selectors: DashboardBreadcrumbPathsSelectors;
};

// Set some sensible defaults to avoid measuring DOM
const AVERAGE_LINK_WIDTH = 150;
const DROPDOWN_WIDTH = 50;
const GAP_WIDTH = 20;

export const useDashboardBreadcrumbPaths = (
  links: DashboardLink[],
  containerRef: React.RefObject<HTMLDivElement>
): DashboardBreadcrumbPathsHook => {
  const [visibleCount, setVisibleCount] = useState(links.length);
  const isInitialRender = useRef(true);

  // Use ResizeObserver only once on component mount
  useEffect(() => {
    const calculateVisibleCount = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;

      // For very small screens, always show at least the last link
      if (containerWidth < 360) {
        setVisibleCount(1);
        return;
      }

      // Calculate how many links can fit using average width
      const availableSpace = containerWidth;

      // First check if all links fit without a dropdown
      const allLinksWidth = links.length * AVERAGE_LINK_WIDTH + (links.length - 1) * GAP_WIDTH;

      if (allLinksWidth <= availableSpace) {
        // All links fit, no dropdown needed
        setVisibleCount(links.length);
        return;
      }

      // We need a dropdown - calculate how many links can fit with it
      const spaceWithDropdown = availableSpace - DROPDOWN_WIDTH;
      let count = Math.floor(spaceWithDropdown / (AVERAGE_LINK_WIDTH + GAP_WIDTH));

      // Always show at least one link
      count = Math.max(1, count);

      // Don't exceed the number of links
      count = Math.min(links.length, count);

      setVisibleCount(count);
    };

    if (isInitialRender.current) {
      calculateVisibleCount();
      isInitialRender.current = false;
    }

    const observer = new ResizeObserver(calculateVisibleCount);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [links.length, containerRef]);

  return useMemo(() => {
    const visibleLinks = links.slice(-visibleCount).filter(Boolean);
    const hiddenLinks = links.slice(0, -visibleCount).filter(Boolean);

    return {
      selectors: {
        visibleLinks: visibleLinks,
        hiddenLinks: hiddenLinks,
        shouldShowDropdown: hiddenLinks.length > 0,
      },
    };
  }, [links, visibleCount]);
};

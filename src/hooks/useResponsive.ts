import { useState, useEffect } from "react";

export type BreakpointKey = "mobile" | "tablet" | "desktop";

interface UseResponsiveReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  currentBreakpoint: BreakpointKey;
  screenWidth: number;
  screenHeight: number;
}

const breakpoints = {
  mobile: 768, // Below 768px is mobile
  tablet: 1024, // Between 768px and 1024px is tablet
  desktop: 1024, // Above 1024px is desktop
};

export const useResponsive = (): UseResponsiveReturn => {
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);

  useEffect(() => {
    // Set initial values
    const updateDimensions = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };

    // Initial call
    updateDimensions();

    // Add event listener
    window.addEventListener("resize", updateDimensions);

    // Cleanup
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const isMobile = screenWidth < breakpoints.mobile;
  const isTablet =
    screenWidth >= breakpoints.mobile && screenWidth < breakpoints.tablet;
  const isDesktop = screenWidth >= breakpoints.desktop;

  const currentBreakpoint: BreakpointKey = isMobile
    ? "mobile"
    : isTablet
    ? "tablet"
    : "desktop";

  return {
    isMobile,
    isTablet,
    isDesktop,
    currentBreakpoint,
    screenWidth,
    screenHeight,
  };
};

// Custom hook for detecting scroll direction
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null
  );
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    let scrollTimer: NodeJS.Timeout;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? "down" : "up";

      // Only update direction if there's a significant scroll change
      if (
        direction !== scrollDirection &&
        Math.abs(scrollY - lastScrollY) > 5
      ) {
        setScrollDirection(direction);
      }

      setIsScrolling(true);
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      lastScrollY = scrollY;
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    const onScroll = () => requestTick();

    // Listen to scroll events on both window and document
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimer);
    };
  }, [scrollDirection]);

  return { scrollDirection, isScrolling };
};

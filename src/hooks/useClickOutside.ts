"use client";
import { useEffect, useRef } from "react";

interface UseClickOutsideOptions {
  enabled?: boolean;
  onClickOutside: () => void;
}

export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  options: UseClickOutsideOptions
) => {
  const { enabled = true, onClickOutside } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [enabled, onClickOutside]);

  return ref;
};

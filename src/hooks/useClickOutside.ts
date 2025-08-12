"use client";
import { useRef, useEffect } from "react";

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
    if (!enabled || !ref.current) return;

    const element = ref.current;
    const rootNode = element.getRootNode() as Document | ShadowRoot;

    const handleClickOutside = (event: Event) => {
      const target = event.target as Node;
      if (element && !element.contains(target)) {
        onClickOutside();
      }
    };

    const handleEscape = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === "Escape") {
        onClickOutside();
      }
    };

    // Use the root node instead of document directly
    rootNode.addEventListener("mousedown", handleClickOutside);
    rootNode.addEventListener("keydown", handleEscape);

    return () => {
      rootNode.removeEventListener("mousedown", handleClickOutside);
      rootNode.removeEventListener("keydown", handleEscape);
    };
  }, [enabled, onClickOutside]);

  return ref;
};

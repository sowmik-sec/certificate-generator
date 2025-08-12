"use client";
import { useRef } from "react";

interface UseClickOutsideOptions {
  enabled?: boolean;
  onClickOutside: () => void;
}

// Alternative approach: Use React's onBlur and onFocus events
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  options: UseClickOutsideOptions
) => {
  const { enabled = true, onClickOutside } = options;
  const ref = useRef<T>(null);
  const isClickInsideRef = useRef(false);

  const handleMouseDown = () => {
    isClickInsideRef.current = true;
  };

  const handleMouseUp = () => {
    // Small delay to ensure this runs after any click events
    setTimeout(() => {
      isClickInsideRef.current = false;
    }, 0);
  };

  // This will be called when focus leaves the element tree
  const handleBlur = (event: React.FocusEvent) => {
    if (!enabled) return;

    // Check if the new focus target is outside our element
    const currentTarget = event.currentTarget;
    const relatedTarget = event.relatedTarget as Node;

    if (
      !isClickInsideRef.current &&
      relatedTarget &&
      !currentTarget.contains(relatedTarget)
    ) {
      onClickOutside();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!enabled) return;

    if (event.key === "Escape") {
      onClickOutside();
    }
  };

  // Provide event handlers that components can use
  const eventHandlers = {
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    tabIndex: -1, // Make the element focusable
  };

  return { ref: ref as React.RefObject<T>, eventHandlers };
};

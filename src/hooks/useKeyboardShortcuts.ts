"use client";
import { useEffect, useRef } from "react";

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  target?: "window" | "element";
}

export const useKeyboardShortcuts = (
  shortcuts: Record<string, (e: KeyboardEvent) => void>,
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { enabled = true, target = "window" } = options;
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if we're typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true" ||
        (target.classList && target.classList.contains("text-cursor")) || // Fabric.js text editing cursor
        (target.classList && target.classList.contains("cursor")) // Additional Fabric.js class
      ) {
        return;
      }

      // Skip if any text object is currently being edited
      // This is a more robust check for Fabric.js text editing
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      // Create a key combination string
      const keys = [];
      if (e.ctrlKey) keys.push("ctrl");
      if (e.metaKey) keys.push("meta");
      if (e.shiftKey) keys.push("shift");
      if (e.altKey) keys.push("alt");
      keys.push(e.key.toLowerCase());

      const keyCombo = keys.join("+");

      // Try to find and execute the matching shortcut
      if (shortcuts[keyCombo]) {
        console.log("Keyboard shortcut matched:", keyCombo);
        shortcuts[keyCombo](e);
      } else {
        console.log(
          "No shortcut found for:",
          keyCombo,
          "Available shortcuts:",
          Object.keys(shortcuts)
        );
      }
    };

    const targetElement = target === "element" ? elementRef.current : window;

    if (targetElement) {
      targetElement.addEventListener("keydown", handleKeyDown as EventListener);
      return () => {
        targetElement.removeEventListener(
          "keydown",
          handleKeyDown as EventListener
        );
      };
    }
  }, [shortcuts, enabled, target]);

  return elementRef;
};

// Specific hook for common editor shortcuts
export const useEditorShortcuts = (
  callbacks: {
    onUndo?: () => void;
    onRedo?: () => void;
    onCopy?: () => void;
    onPaste?: () => void;
    onDelete?: () => void;
    onGroup?: () => void;
    onUngroup?: () => void;
    onBringForward?: () => void;
    onSendBackward?: () => void;
    onBringToFront?: () => void;
    onSendToBack?: () => void;
  },
  options: UseKeyboardShortcutsOptions = {}
) => {
  const shortcuts: Record<string, (e: KeyboardEvent) => void> = {};

  // Undo/Redo shortcuts - highest priority
  if (callbacks.onUndo) {
    shortcuts["ctrl+z"] = shortcuts["meta+z"] = (e) => {
      e.preventDefault();
      e.stopPropagation();
      callbacks.onUndo!();
    };
  }

  if (callbacks.onRedo) {
    // Ctrl+Y for Windows/Linux, Ctrl+Shift+Z for Mac
    shortcuts["ctrl+y"] =
      shortcuts["ctrl+shift+z"] =
      shortcuts["meta+shift+z"] =
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          callbacks.onRedo!();
        };
  }

  if (callbacks.onCopy) {
    shortcuts["ctrl+c"] = shortcuts["meta+c"] = (e) => {
      e.preventDefault();
      e.stopPropagation();
      callbacks.onCopy!();
    };
  }

  if (callbacks.onPaste) {
    shortcuts["ctrl+v"] = shortcuts["meta+v"] = (e) => {
      e.preventDefault();
      e.stopPropagation();
      callbacks.onPaste!();
    };
  }

  if (callbacks.onDelete) {
    shortcuts["delete"] = shortcuts["backspace"] = (e) => {
      e.preventDefault();
      e.stopPropagation();
      callbacks.onDelete!();
    };
  }

  if (callbacks.onGroup) {
    shortcuts["ctrl+g"] = shortcuts["meta+g"] = (e) => {
      e.preventDefault();
      e.stopPropagation();
      callbacks.onGroup!();
    };
  }

  if (callbacks.onUngroup) {
    shortcuts["ctrl+shift+g"] = shortcuts["meta+shift+g"] = (e) => {
      e.preventDefault();
      e.stopPropagation();
      callbacks.onUngroup!();
    };
  }

  if (callbacks.onBringForward) {
    shortcuts["ctrl+]"] = shortcuts["meta+]"] = (e) => {
      e.preventDefault();
      callbacks.onBringForward!();
    };
  }

  if (callbacks.onSendBackward) {
    shortcuts["ctrl+["] = shortcuts["meta+["] = (e) => {
      e.preventDefault();
      callbacks.onSendBackward!();
    };
  }

  if (callbacks.onBringToFront) {
    shortcuts["ctrl+shift+]"] = shortcuts["meta+shift+]"] = (e) => {
      e.preventDefault();
      callbacks.onBringToFront!();
    };
  }

  if (callbacks.onSendToBack) {
    shortcuts["ctrl+shift+["] = shortcuts["meta+shift+["] = (e) => {
      e.preventDefault();
      callbacks.onSendToBack!();
    };
  }

  return useKeyboardShortcuts(shortcuts, options);
};

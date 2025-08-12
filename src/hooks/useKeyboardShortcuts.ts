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
        target.contentEditable === "true"
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
        shortcuts[keyCombo](e);
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

  if (callbacks.onUndo) {
    shortcuts["ctrl+z"] = shortcuts["meta+z"] = (e) => {
      if (!e.shiftKey) {
        e.preventDefault();
        callbacks.onUndo!();
      }
    };
  }

  if (callbacks.onRedo) {
    shortcuts["ctrl+y"] = shortcuts["meta+y"] = (e) => {
      e.preventDefault();
      callbacks.onRedo!();
    };
    shortcuts["ctrl+shift+z"] = shortcuts["meta+shift+z"] = (e) => {
      e.preventDefault();
      callbacks.onRedo!();
    };
  }

  if (callbacks.onCopy) {
    shortcuts["ctrl+c"] = shortcuts["meta+c"] = (e) => {
      e.preventDefault();
      callbacks.onCopy!();
    };
  }

  if (callbacks.onPaste) {
    shortcuts["ctrl+v"] = shortcuts["meta+v"] = (e) => {
      e.preventDefault();
      callbacks.onPaste!();
    };
  }

  if (callbacks.onDelete) {
    shortcuts["delete"] = shortcuts["backspace"] = (e) => {
      e.preventDefault();
      callbacks.onDelete!();
    };
  }

  if (callbacks.onGroup) {
    shortcuts["ctrl+g"] = shortcuts["meta+g"] = (e) => {
      e.preventDefault();
      callbacks.onGroup!();
    };
  }

  if (callbacks.onUngroup) {
    shortcuts["ctrl+shift+g"] = shortcuts["meta+shift+g"] = (e) => {
      e.preventDefault();
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

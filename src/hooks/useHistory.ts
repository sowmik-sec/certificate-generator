/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useCallback, useState } from "react";
import { useHistoryStore } from "@/stores/useHistoryStore";

/**
 * React hook that returns { undo, redo, canUndo, canRedo } exactly as specified
 */
export const useHistory = () => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Subscribe to temporal state changes
  useEffect(() => {
    const unsubscribe = useHistoryStore.temporal.subscribe((temporalState) => {
      setCanUndo(temporalState.pastStates.length > 0);
      setCanRedo(temporalState.futureStates.length > 0);
    });

    // Initial state
    const temporalState = useHistoryStore.temporal.getState();
    setCanUndo(temporalState.pastStates.length > 0);
    setCanRedo(temporalState.futureStates.length > 0);

    return unsubscribe;
  }, []);

  // Undo function
  const undo = useCallback(() => {
    const temporal = useHistoryStore.temporal.getState();
    console.log("⏪ Undo called - pastStates:", temporal.pastStates.length);
    if (temporal.pastStates.length > 0) {
      temporal.undo();
      console.log("✅ Undo executed");
    } else {
      console.log("❌ Cannot undo - no past states");
    }
  }, []);

  // Redo function
  const redo = useCallback(() => {
    const temporal = useHistoryStore.temporal.getState();
    console.log("⏩ Redo called - futureStates:", temporal.futureStates.length);
    if (temporal.futureStates.length > 0) {
      temporal.redo();
      console.log("✅ Redo executed");
    } else {
      console.log("❌ Cannot redo - no future states");
    }
  }, []);

  // Keyboard shortcuts: Ctrl+Z, Ctrl+Shift+Z / Cmd+Z, Cmd+Shift+Z
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as any)?.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

      if (ctrlKey && event.key === "z") {
        event.preventDefault();

        if (event.shiftKey) {
          // Ctrl+Shift+Z or Cmd+Shift+Z for redo
          redo();
        } else {
          // Ctrl+Z or Cmd+Z for undo
          undo();
        }
      }

      // Alternative redo shortcut: Ctrl+Y or Cmd+Y
      if (ctrlKey && event.key === "y") {
        event.preventDefault();
        redo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);

  return {
    undo,
    redo,
    canUndo,
    canRedo,
  };
};

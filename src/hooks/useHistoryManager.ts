/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect } from "react";
import { useCanvasHistorySimple } from "./useCanvasHistorySimple";
import { useEditorShortcuts } from "./useKeyboardShortcuts";
import { toast } from "sonner";

interface UseHistoryManagerOptions {
  enableKeyboardShortcuts?: boolean;
  enableToasts?: boolean;
  maxHistorySize?: number;
}

export const useHistoryManager = (options: UseHistoryManagerOptions = {}) => {
  const {
    enableKeyboardShortcuts = true,
    enableToasts = false,
    maxHistorySize = 50,
  } = options;

  const {
    canUndo,
    canRedo,
    undo: performUndo,
    redo: performRedo,
    clearHistory: performClearHistory,
    canvas,
  } = useCanvasHistorySimple();

  // Enhanced undo with optional feedback
  const undo = useCallback(() => {
    if (canUndo) {
      performUndo();
      if (enableToasts) {
        toast.success("Action undone");
      }
    } else if (enableToasts) {
      toast.info("Nothing to undo");
    }
  }, [canUndo, performUndo, enableToasts]);

  // Enhanced redo with optional feedback
  const redo = useCallback(() => {
    if (canRedo) {
      performRedo();
      if (enableToasts) {
        toast.success("Action redone");
      }
    } else if (enableToasts) {
      toast.info("Nothing to redo");
    }
  }, [canRedo, performRedo, enableToasts]);

  // Clear history with confirmation
  const clearHistory = useCallback(
    (force = false) => {
      if (force || canUndo || canRedo) {
        performClearHistory();
        if (enableToasts) {
          toast.success("History cleared");
        }
      }
    },
    [canUndo, canRedo, performClearHistory, enableToasts]
  );

  // Setup keyboard shortcuts
  useEditorShortcuts(
    {
      onUndo: enableKeyboardShortcuts ? undo : undefined,
      onRedo: enableKeyboardShortcuts ? redo : undefined,
    },
    { enabled: enableKeyboardShortcuts }
  );

  // History optimization - limit history size
  useEffect(() => {
    if (canvas && typeof canvas.historyUndo !== "undefined") {
      const checkHistorySize = () => {
        if (canvas.historyUndo && canvas.historyUndo.length > maxHistorySize) {
          // Remove oldest entries but keep some minimum
          const keepSize = Math.floor(maxHistorySize * 0.8);
          const removeCount = canvas.historyUndo.length - keepSize;
          canvas.historyUndo.splice(0, removeCount);
        }
      };

      // Check on history append
      const originalHistorySaveAction = canvas._historySaveAction;
      if (originalHistorySaveAction) {
        canvas._historySaveAction = function (e: any) {
          originalHistorySaveAction.call(this, e);
          checkHistorySize();
        };
      }
    }
  }, [canvas, maxHistorySize]);

  // Auto-save initial state when canvas is first created
  useEffect(() => {
    if (canvas && typeof canvas.saveInitialState === "function") {
      // Ensure initial state is saved
      const saveTimer = setTimeout(() => {
        if (canvas.historyUndo && canvas.historyUndo.length === 0) {
          canvas.saveInitialState();
        }
      }, 200);

      return () => clearTimeout(saveTimer);
    }
  }, [canvas]);

  return {
    // State
    canUndo,
    canRedo,

    // Actions
    undo,
    redo,
    clearHistory,

    // Canvas reference
    canvas,

    // Utility
    hasHistory: canUndo || canRedo,
  };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback } from "react";
import { useHistoryStore } from "@/stores/useHistoryStore";

export const useCanvasHistory = (canvas: any) => {
  const {
    saveToHistory: saveToHistoryStore,
    undo: undoStore,
    redo: redoStore,
    canUndo: canUndoStore,
    canRedo: canRedoStore,
  } = useHistoryStore();

  const saveToHistory = useCallback(() => {
    // Add defensive check to ensure canvas is ready
    if (canvas && typeof canvas.toJSON === "function") {
      // Use setTimeout to handle the async nature and prevent blocking
      setTimeout(async () => {
        try {
          await saveToHistoryStore(canvas);
        } catch (error) {
          console.warn("History save failed:", error);
        }
      }, 20); // Increased delay to allow canvas to stabilize after template loading
    }
  }, [canvas, saveToHistoryStore]);

  const undo = useCallback(() => {
    if (canvas && typeof canvas.loadFromJSON === "function") {
      undoStore(canvas);
    }
  }, [canvas, undoStore]);

  const redo = useCallback(() => {
    if (canvas && typeof canvas.loadFromJSON === "function") {
      redoStore(canvas);
    }
  }, [canvas, redoStore]);

  const canUndo = canUndoStore();
  const canRedo = canRedoStore();

  return {
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};

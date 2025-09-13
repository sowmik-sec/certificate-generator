/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback } from "react";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useHistoryStore } from "@/stores/useHistoryStore";

let CanvasWithHistoryClass: any = null;

// Load the history-enabled canvas class
const loadHistoryCanvas = async () => {
  if (CanvasWithHistoryClass) return CanvasWithHistoryClass;

  try {
    const historyModule = await import("fabric-history-v6");
    CanvasWithHistoryClass = historyModule.CanvasWithHistory;
    return CanvasWithHistoryClass;
  } catch (error) {
    console.error("Failed to load CanvasWithHistory:", error);
    return null;
  }
};

export const useCanvasWithHistory = () => {
  const { fabric } = useCanvasStore();
  const {
    canUndo,
    canRedo,
    setCanUndo,
    setCanRedo,
    setCanvas: setHistoryCanvas,
  } = useHistoryStore();

  const updateHistoryState = useCallback(
    (canvasInstance: any) => {
      if (canvasInstance && typeof canvasInstance.canUndo === "function") {
        setCanUndo(canvasInstance.canUndo());
        setCanRedo(canvasInstance.canRedo());
      }
    },
    [setCanUndo, setCanRedo]
  );

  const setupHistoryEvents = useCallback(
    (canvasInstance: any) => {
      canvasInstance.on("history:append", () => {
        updateHistoryState(canvasInstance);
      });

      canvasInstance.on("history:undo", () => {
        updateHistoryState(canvasInstance);
      });

      canvasInstance.on("history:redo", () => {
        updateHistoryState(canvasInstance);
      });

      canvasInstance.on("history:clear", () => {
        setCanUndo(false);
        setCanRedo(false);
      });
    },
    [setCanUndo, setCanRedo, updateHistoryState]
  );

  const createHistoryCanvas = useCallback(
    async (canvasElement: HTMLCanvasElement, options: any) => {
      const HistoryCanvasClass = await loadHistoryCanvas();

      if (!HistoryCanvasClass) {
        // Fallback to regular canvas if history loading fails
        console.warn("Using regular canvas without history");
        if (fabric && fabric.Canvas) {
          return new fabric.Canvas(canvasElement, options);
        }
        return null;
      }

      // Create canvas with history
      const canvasInstance = new HistoryCanvasClass(canvasElement, options);

      // Set up event listeners
      setupHistoryEvents(canvasInstance);

      // Set canvas in store
      setHistoryCanvas(canvasInstance);

      // Update initial state
      updateHistoryState(canvasInstance);

      console.log("Canvas with history created successfully");
      return canvasInstance;
    },
    [fabric, setupHistoryEvents, setHistoryCanvas, updateHistoryState]
  );

  return {
    createHistoryCanvas,
    canUndo,
    canRedo,
  };
};

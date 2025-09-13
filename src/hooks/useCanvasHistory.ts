/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useRef } from "react";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useHistoryStore } from "@/stores/useHistoryStore";

export const useCanvasHistory = () => {
  const { fabric, canvas } = useCanvasStore();
  const {
    canUndo,
    canRedo,
    isHistoryEnabled,
    setCanUndo,
    setCanRedo,
    setCanvas: setHistoryCanvas,
    undo,
    redo,
    clearHistory,
  } = useHistoryStore();

  const historyInitialized = useRef(false);

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
      // Listen to history events to update UI state
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

  // Initialize history when canvas is available
  useEffect(() => {
    if (canvas && fabric && !historyInitialized.current) {
      // Dynamic import for fabric-history-v6
      import("fabric-history-v6")
        .then((historyModule) => {
          const { HistoryMixin } = historyModule;

          if (!HistoryMixin) {
            console.error("HistoryMixin not found in fabric-history-v6");
            return;
          }

          try {
            // Check if history methods already exist
            if (typeof canvas.undo === "function") {
              console.log("History already initialized");
              setHistoryCanvas(canvas);
              setupHistoryEvents(canvas);
              updateHistoryState(canvas);
              historyInitialized.current = true;
              return;
            }

            // Initialize history properties first
            canvas.historyUndo = [];
            canvas.historyRedo = [];
            canvas.extraProps = ["selectable", "editable"];
            canvas.historyProcessing = false;
            canvas._isMoving = false;
            canvas.historyNextState = null;

            // Get a temporary instance to copy methods from
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = 100;
            tempCanvas.height = 100;
            const TempCanvasClass = HistoryMixin(fabric.Canvas);
            const tempInstance = new TempCanvasClass(tempCanvas, {
              width: 100,
              height: 100,
            });

            // Copy history methods to the existing canvas
            const methodsToMixin = [
              "_historyInit",
              "_historyDispose",
              "_historySaveAction",
              "_handleObjectModified",
              "_objectMoving",
              "_historyNext",
              "_loadHistory",
              "_bindHistoryEvents",
              "undo",
              "redo",
              "canUndo",
              "canRedo",
              "clearHistory",
              "onHistory",
              "offHistory",
              "saveInitialState",
            ];

            methodsToMixin.forEach((method) => {
              if (typeof tempInstance[method] === "function") {
                canvas[method] = tempInstance[method].bind(canvas);
              }
            });

            // Clean up temp canvas
            tempInstance.dispose();

            // Now initialize history (this will set up event listeners)
            if (typeof canvas._historyInit === "function") {
              canvas._historyInit();
            }

            // Set up history event listeners for UI updates
            setupHistoryEvents(canvas);

            // Save initial state after a short delay
            setTimeout(() => {
              if (typeof canvas.saveInitialState === "function") {
                canvas.saveInitialState();
              }
              updateHistoryState(canvas);
            }, 200);

            // Set canvas in history store
            setHistoryCanvas(canvas);
            historyInitialized.current = true;

            console.log("History successfully initialized");
          } catch (error) {
            console.error("Error initializing history:", error);
          }
        })
        .catch((error) => {
          console.error("Failed to load fabric-history-v6:", error);
        });
    }
  }, [
    canvas,
    fabric,
    setHistoryCanvas,
    setupHistoryEvents,
    updateHistoryState,
  ]);

  // Enhanced history operations with proper state updates
  const performUndo = useCallback(() => {
    if (canvas && canUndo) {
      undo();
    }
  }, [canvas, canUndo, undo]);

  const performRedo = useCallback(() => {
    if (canvas && canRedo) {
      redo();
    }
  }, [canvas, canRedo, redo]);

  const performClearHistory = useCallback(() => {
    if (canvas) {
      clearHistory();
    }
  }, [canvas, clearHistory]);

  // Toggle history recording
  const enableHistory = useCallback(() => {
    if (canvas && typeof canvas.onHistory === "function") {
      canvas.onHistory();
    }
  }, [canvas]);

  const disableHistory = useCallback(() => {
    if (canvas && typeof canvas.offHistory === "function") {
      canvas.offHistory();
    }
  }, [canvas]);

  return {
    // State
    canUndo,
    canRedo,
    isHistoryEnabled,

    // Operations
    undo: performUndo,
    redo: performRedo,
    clearHistory: performClearHistory,
    enableHistory,
    disableHistory,

    // Canvas reference
    canvas,
  };
};

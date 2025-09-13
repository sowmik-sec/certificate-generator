/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useRef } from "react";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useHistoryStore } from "@/stores/useHistoryStore";

export const useCanvasHistorySimple = () => {
  const { fabric, canvas } = useCanvasStore();
  const {
    canUndo,
    canRedo,
    setCanUndo,
    setCanRedo,
    setCanvas: setHistoryCanvas,
  } = useHistoryStore();

  const historyInitialized = useRef(false);
  const historyStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const currentStateIndex = useRef(0);

  const updateHistoryState = useCallback(() => {
    setCanUndo(historyStack.current.length > 1);
    setCanRedo(redoStack.current.length > 0);
  }, [setCanUndo, setCanRedo]);

  const saveState = useCallback(() => {
    if (
      !canvas ||
      historyInitialized.current === false ||
      canvas.historyInitialized === false
    )
      return;

    try {
      // Use a robust serialization approach that handles textbox issues
      const safeObjects = canvas.getObjects().map((obj: any, index: number) => {
        try {
          if (obj.type === "textbox" || obj.type === "text") {
            // Create a completely safe textbox representation
            return {
              type: obj.type,
              version: "6.0.0",
              text: String(obj.text || ""),
              left: Number(obj.left) || 0,
              top: Number(obj.top) || 0,
              width: Number(obj.width) || 100,
              height: Number(obj.height) || 100,
              fontSize: Number(obj.fontSize) || 16,
              fontFamily: String(obj.fontFamily || "Times New Roman"),
              fill: String(obj.fill || "#000000"),
              textAlign: String(obj.textAlign || "left"),
              fontWeight: String(obj.fontWeight || "normal"),
              fontStyle: String(obj.fontStyle || "normal"),
              underline: Boolean(obj.underline),
              overline: Boolean(obj.overline),
              linethrough: Boolean(obj.linethrough),
              angle: Number(obj.angle) || 0,
              scaleX: Number(obj.scaleX) || 1,
              scaleY: Number(obj.scaleY) || 1,
              flipX: Boolean(obj.flipX),
              flipY: Boolean(obj.flipY),
              opacity: Number(obj.opacity !== undefined ? obj.opacity : 1),
              visible: Boolean(obj.visible !== undefined ? obj.visible : true),
              selectable: Boolean(
                obj.selectable !== undefined ? obj.selectable : true
              ),
              evented: Boolean(obj.evented !== undefined ? obj.evented : true),
              originX: String(obj.originX || "left"),
              originY: String(obj.originY || "top"),
            };
          } else {
            // For non-text objects, try standard serialization with fallback
            try {
              const objData = obj.toObject();
              // Test if it can be stringified
              JSON.stringify(objData);
              return objData;
            } catch (objError) {
              console.warn(
                `⚠️ Object at index ${index} (type: ${obj.type}) using minimal fallback:`,
                objError
              );
              // Minimal fallback for any object type
              return {
                type: obj.type || "rect",
                left: Number(obj.left) || 0,
                top: Number(obj.top) || 0,
                width: Number(obj.width) || 100,
                height: Number(obj.height) || 100,
                fill: String(obj.fill || "#000000"),
                angle: Number(obj.angle) || 0,
                scaleX: Number(obj.scaleX) || 1,
                scaleY: Number(obj.scaleY) || 1,
                opacity: Number(obj.opacity !== undefined ? obj.opacity : 1),
                visible: Boolean(
                  obj.visible !== undefined ? obj.visible : true
                ),
              };
            }
          }
        } catch (error) {
          console.error(
            `❌ Failed to serialize object at index ${index}:`,
            error
          );
          // Return a placeholder that won't break JSON
          return {
            type: "rect",
            left: 0,
            top: 0,
            width: 1,
            height: 1,
            fill: "transparent",
            visible: false,
          };
        }
      });

      const state = JSON.stringify({
        version: "6.0.0",
        objects: safeObjects,
        background: canvas.backgroundColor || "#ffffff",
        width: canvas.width || 800,
        height: canvas.height || 600,
      });

      // Don't save if it's the same as the last state
      if (
        historyStack.current.length > 0 &&
        historyStack.current[historyStack.current.length - 1] === state
      ) {
        return;
      }

      historyStack.current.push(state);

      // Limit history size to prevent memory issues
      if (historyStack.current.length > 50) {
        historyStack.current = historyStack.current.slice(-40); // Keep last 40
      }

      // Clear redo stack when new action is performed
      redoStack.current = [];
      currentStateIndex.current = historyStack.current.length - 1;

      updateHistoryState();
      console.log("✅ Canvas state saved successfully - New history state:", {
        historyLength: historyStack.current.length,
        redoLength: redoStack.current.length,
        canUndo: historyStack.current.length > 1,
        canRedo: redoStack.current.length > 0,
      });
    } catch (error) {
      console.error("Error saving canvas state:", error);
      // Don't save anything if there's a critical error
    }
  }, [canvas, updateHistoryState]);

  const undo = useCallback(() => {
    console.log("🔄 Undo called, current state:", {
      historyLength: historyStack.current.length,
      redoLength: redoStack.current.length,
      canUndo: historyStack.current.length > 1,
    });

    if (!canvas || historyStack.current.length <= 1) {
      console.log("❌ Cannot undo: no canvas or insufficient history");
      return;
    }

    try {
      // Move current state to redo stack
      const currentState = historyStack.current.pop();
      if (currentState) {
        redoStack.current.push(currentState);
        console.log("📤 Moved current state to redo stack");
      }

      // Get previous state
      const previousState =
        historyStack.current[historyStack.current.length - 1];
      if (previousState) {
        console.log("📥 Loading previous state...");
        // Temporarily disable history recording
        historyInitialized.current = false;

        canvas.loadFromJSON(previousState, () => {
          canvas.renderAll();
          // Re-enable history recording after load
          setTimeout(() => {
            historyInitialized.current = true;
            updateHistoryState();
            console.log("✅ Undo completed successfully");
          }, 100);
        });
      }
    } catch (error) {
      console.error("❌ Error during undo:", error);
      historyInitialized.current = true; // Re-enable even if error
    }
  }, [canvas, updateHistoryState]);

  const redo = useCallback(() => {
    console.log("🔄 Redo called, current state:", {
      historyLength: historyStack.current.length,
      redoLength: redoStack.current.length,
      canRedo: redoStack.current.length > 0,
    });

    if (!canvas || redoStack.current.length === 0) {
      console.log("❌ Cannot redo: no canvas or no redo history");
      return;
    }

    try {
      // Get state from redo stack
      const redoState = redoStack.current.pop();
      if (redoState) {
        console.log("📥 Loading redo state...");
        // Add back to history stack
        historyStack.current.push(redoState);

        // Temporarily disable history recording
        historyInitialized.current = false;

        canvas.loadFromJSON(redoState, () => {
          canvas.renderAll();
          // Re-enable history recording after load
          setTimeout(() => {
            historyInitialized.current = true;
            updateHistoryState();
            console.log("✅ Redo completed successfully");
          }, 100);
        });
      }
    } catch (error) {
      console.error("❌ Error during redo:", error);
      historyInitialized.current = true; // Re-enable even if error
    }
  }, [canvas, updateHistoryState]);

  const clearHistory = useCallback(() => {
    historyStack.current = [];
    redoStack.current = [];
    currentStateIndex.current = 0;
    updateHistoryState();
  }, [updateHistoryState]);

  // Initialize simple history when canvas is available
  useEffect(() => {
    if (canvas && fabric && !historyInitialized.current) {
      console.log("🔧 Initializing simple canvas history...");

      // Add custom methods to canvas
      canvas.undo = undo;
      canvas.redo = redo;
      canvas.canUndo = () => historyStack.current.length > 1;
      canvas.canRedo = () => redoStack.current.length > 0;
      canvas.clearHistory = clearHistory;

      // Add reference to the history initialized flag for template loader
      canvas.historyInitialized = historyInitialized.current;

      // Set up event listeners with different timing strategies
      const immediateEvents = [
        "selection:cleared",
        "object:modified",
        "path:created",
      ];

      const debouncedEvents = [
        "object:added",
        "object:removed",
        "object:skewing",
      ];

      let saveTimer: NodeJS.Timeout;

      // Immediate save for when user finishes an action
      const immediateSave = () => {
        clearTimeout(saveTimer);
        console.log("💾 Immediate save triggered...");
        saveState();
      };

      // Debounced save for events that might fire rapidly
      const debouncedSave = () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          console.log("💾 Debounced save triggered...");
          saveState();
        }, 100); // Reduced from 300ms to 100ms for faster response
      };

      // Set up immediate save events (when user stops interacting)
      immediateEvents.forEach((event) => {
        canvas.on(event, immediateSave);
      });

      // Set up debounced save events (for rapid changes)
      debouncedEvents.forEach((event) => {
        canvas.on(event, debouncedSave);
      });

      // Additional responsive events for better UX
      let interactionTimer: NodeJS.Timeout;

      const handleInteractionEnd = () => {
        clearTimeout(interactionTimer);
        interactionTimer = setTimeout(() => {
          // Only save if there are selected objects or recent changes
          if (
            canvas.getActiveObject() === null &&
            canvas.getObjects().length > 0
          ) {
            console.log("💾 Interaction end save triggered...");
            immediateSave();
          }
        }, 150); // Short delay to detect end of interaction
      };

      // Listen for mouse up (when user releases mouse after dragging/resizing)
      canvas.on("mouse:up", handleInteractionEnd);

      // Listen for when objects lose focus (selection cleared)
      canvas.on("before:selection:cleared", () => {
        // Small delay to ensure the object state is finalized
        setTimeout(immediateSave, 50);
      });

      // Save initial state
      setTimeout(() => {
        historyInitialized.current = true;
        canvas.historyInitialized = true;
        console.log("💾 Saving initial canvas state...");
        saveState(); // Save initial state
        setHistoryCanvas(canvas);
        console.log("✅ Simple canvas history initialized successfully");
        console.log("📊 Initial history state:", {
          canUndo: historyStack.current.length > 1,
          canRedo: redoStack.current.length > 0,
          historyLength: historyStack.current.length,
          redoLength: redoStack.current.length,
        });
      }, 500);

      return () => {
        // Cleanup both immediate and debounced events
        immediateEvents.forEach((event) => {
          canvas.off(event, immediateSave);
        });
        debouncedEvents.forEach((event) => {
          canvas.off(event, debouncedSave);
        });
        // Cleanup interaction events
        canvas.off("mouse:up", handleInteractionEnd);
        canvas.off("before:selection:cleared", immediateSave);
        clearTimeout(saveTimer);
        clearTimeout(interactionTimer);
      };
    }
  }, [canvas, fabric, undo, redo, clearHistory, saveState, setHistoryCanvas]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    clearHistory,
    canvas,
  };
};

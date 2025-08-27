/* eslint-disable @typescript-eslint/no-explicit-any */
import { useHistoryStore } from "@/stores/useHistoryStore";

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Flag to prevent infinite loops during undo/redo
let isRestoringFromHistory = false;

/**
 * Robust canvas state serialization with comprehensive error handling
 */
function saveCanvasState(canvasInstance: any) {
  try {
    // Get fresh store reference to avoid stale closure
    const { setJson } = useHistoryStore.getState();

    // Validate canvas instance
    if (!canvasInstance || typeof canvasInstance.getObjects !== "function") {
      console.error("❌ Invalid canvas instance");
      return;
    }

    // Get objects with error handling
    let objects;
    try {
      objects = canvasInstance.getObjects();
    } catch (error) {
      console.error("❌ Error getting canvas objects:", error);
      return;
    }

    if (!Array.isArray(objects)) {
      console.error("❌ getObjects() returned non-array:", objects);
      return;
    }

    const objectCount = objects.length;

    // Try standard serialization first
    let json;
    try {
      const jsonData =
        objectCount > 1000
          ? canvasInstance.toDatalessJSON()
          : canvasInstance.toJSON();
      json = JSON.stringify(jsonData);
    } catch (serializationError) {
      console.warn(
        "❌ Standard serialization failed, using safe mode:",
        serializationError
      );

      // Safe serialization: handle each object individually
      try {
        const safeObjects = [];

        for (let i = 0; i < objects.length; i++) {
          try {
            const obj = objects[i];
            if (!obj) continue;

            if (typeof obj.toObject === "function") {
              safeObjects.push(obj.toObject());
            } else {
              // Create minimal representation for problematic objects
              safeObjects.push({
                type: obj.type || "unknown",
                left: obj.left || 0,
                top: obj.top || 0,
                width: obj.width || 0,
                height: obj.height || 0,
                angle: obj.angle || 0,
                scaleX: obj.scaleX || 1,
                scaleY: obj.scaleY || 1,
              });
            }
          } catch (objError) {
            console.warn(`⚠️ Skipping object ${i}:`, objError);
          }
        }

        // Create safe JSON structure
        const safeCanvasData = {
          version: canvasInstance.version || "5.3.0",
          objects: safeObjects,
          background:
            canvasInstance.backgroundColor ||
            canvasInstance.background ||
            "#ffffff",
          width: canvasInstance.width || 800,
          height: canvasInstance.height || 600,
        };

        json = JSON.stringify(safeCanvasData);
        console.log("✅ Used safe serialization");
      } catch (fallbackError) {
        console.error("❌ Safe serialization failed:", fallbackError);

        // Absolute fallback: minimal canvas state
        json = JSON.stringify({
          version: "5.3.0",
          objects: [],
          background: "#ffffff",
          width: canvasInstance.width || 800,
          height: canvasInstance.height || 600,
        });
        console.log("⚠️ Used minimal fallback");
      }
    }

    console.log(
      `💾 Saved canvas: ${objectCount} objects, ${json.length} chars`
    );
    setJson(json);
  } catch (error) {
    console.error("❌ Critical error in saveCanvasState:", error);
  }
}

/**
 * Initialize Fabric.js canvas with history support
 */
export function initFabric(canvas: any) {
  if (!canvas) {
    console.error("initFabric: Canvas required");
    return canvas;
  }

  // Validate canvas has required methods
  if (
    typeof canvas.getObjects !== "function" ||
    typeof canvas.toJSON !== "function"
  ) {
    console.error("initFabric: Canvas missing required methods");
    return canvas;
  }

  console.log("🎯 Initializing canvas history");

  // Create debounced save (250ms delay)
  const debouncedSave = debounce(() => {
    if (!isRestoringFromHistory) {
      saveCanvasState(canvas);
    }
  }, 250);

  // Register all change event listeners
  const events = [
    "object:added",
    "object:removed",
    "object:modified",
    "object:moving",
    "object:scaling",
    "object:rotating",
    "object:skewing",
    "text:changed",
    "text:selection:changed",
    "path:created",
    "mouse:up",
    "canvas:cleared",
    "group:selected",
    "selection:created",
    "selection:updated",
  ];

  events.forEach((eventName) => {
    canvas.on(eventName, debouncedSave);
  });

  // Save initial state with retry logic
  const saveInitialState = () => {
    if (
      !isRestoringFromHistory &&
      canvas &&
      typeof canvas.getObjects === "function"
    ) {
      try {
        const objects = canvas.getObjects();
        if (Array.isArray(objects)) {
          console.log("💾 Saving initial state");
          saveCanvasState(canvas);
        } else {
          setTimeout(saveInitialState, 100);
        }
      } catch {
        setTimeout(saveInitialState, 100);
      }
    }
  };

  setTimeout(saveInitialState, 500);

  console.log("✅ Canvas history initialized");
  return canvas;
}

/**
 * Restore canvas from JSON state
 */
export function restoreCanvasFromHistory(canvas: any, json: string | null) {
  if (!canvas || !json) {
    console.log("❌ Cannot restore: missing canvas or JSON");
    return;
  }

  console.log("🔄 Restoring canvas from history");
  isRestoringFromHistory = true;

  try {
    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
      isRestoringFromHistory = false;
      console.log("✅ Canvas restored");
    });
  } catch (error) {
    console.error("❌ Failed to restore canvas:", error);
    isRestoringFromHistory = false;
  }
}

/**
 * Check if currently restoring from history
 */
export function isRestoringCanvas() {
  return isRestoringFromHistory;
}

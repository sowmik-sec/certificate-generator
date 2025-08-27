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
 * initFabric(canvas) utility that sets up listeners and debounced save
 * FIXED: Gets fresh store reference on each save to avoid stale closures
 * @param canvas - The Fabric canvas instance (already created and stored in React ref)
 * @returns The same canvas instance (for chaining if needed)
 */
export function initFabric(canvas: any) {
  if (!canvas) {
    console.error("initFabric: Canvas instance is required");
    return canvas;
  }

  // Validate canvas is properly initialized with required methods
  if (typeof canvas.getObjects !== 'function' || typeof canvas.toJSON !== 'function') {
    console.error("initFabric: Canvas is not properly initialized with required methods");
    return canvas;
  }

  console.log("🎯 initFabric: Starting canvas history initialization");

  // Function to save canvas state to history - gets fresh store each time
  function saveCanvasState(canvasInstance: any) {
    try {
      console.log("🔍 Starting saveCanvasState, canvas:", canvasInstance);
      
      // CRITICAL FIX: Get fresh store reference each time we save
      // This prevents the stale closure issue that was breaking the sync
      const { setJson } = useHistoryStore.getState();
      console.log("🔍 Got store reference, setJson:", typeof setJson);

      // Add defensive checks for canvas validity
      if (!canvasInstance) {
        console.error("❌ Canvas instance is null or undefined");
        return;
      }

      // Check if getObjects method exists and is callable
      if (typeof canvasInstance.getObjects !== 'function') {
        console.error("❌ Canvas getObjects method is not available");
        return;
      }

      console.log("🔍 About to call getObjects()");
      // If canvas has 1000+ objects, use toDatalessJSON() to reduce size
      const objects = canvasInstance.getObjects();
      console.log("🔍 Got objects:", objects, "Type:", typeof objects, "IsArray:", Array.isArray(objects));
      
      if (!objects || !Array.isArray(objects)) {
        console.error("❌ Canvas getObjects returned invalid data:", objects);
        return;
      }

      const objectCount = objects.length;
      console.log("🔍 Object count:", objectCount);
      
      // Debug individual objects to find problematic ones
      objects.forEach((obj: any, index: number) => {
        try {
          console.log(`🔍 Object ${index}:`, obj?.type, obj?.id, "valid:", !!obj);
          if (!obj) {
            console.warn(`⚠️ Object at index ${index} is null/undefined`);
          }
        } catch (objError) {
          console.error(`❌ Error checking object ${index}:`, objError);
        }
      });

      // Additional check for toJSON method
      if (typeof canvasInstance.toJSON !== 'function') {
        console.error("❌ Canvas toJSON method is not available");
        return;
      }

      console.log("🔍 About to call toJSON()");
      let jsonData;
      try {
        jsonData = objectCount > 1000 
          ? canvasInstance.toDatalessJSON()
          : canvasInstance.toJSON();
        console.log("🔍 Got JSON data:", typeof jsonData);
      } catch (jsonError) {
        console.error("❌ Error in toJSON():", jsonError);
        if (jsonError instanceof Error) {
          console.error("JSON Error stack:", jsonError.stack);
        }
        // Try alternative serialization
        try {
          console.log("� Trying alternative serialization...");
          jsonData = canvasInstance.toDatalessJSON();
          console.log("�🔍 Alternative JSON data:", typeof jsonData);
        } catch (altError) {
          console.error("❌ Alternative serialization also failed:", altError);
          throw jsonError; // Re-throw original error
        }
      }
      
      let json;
      try {
        json = JSON.stringify(jsonData);
        console.log("🔍 Stringified JSON length:", json.length);
      } catch (stringifyError) {
        console.error("❌ Error in JSON.stringify():", stringifyError);
        throw stringifyError;
      }

      console.log(
        `💾 Saving canvas state: ${objectCount} objects, ${json.length} chars`
      );
      
      setJson(json);
      console.log("✅ Canvas state saved to Zustand store");
    } catch (error) {
      console.error("❌ Failed to save canvas state:", error);
      console.error("Canvas instance:", canvasInstance);
      if (error instanceof Error) {
        console.error("Error details:", error.stack);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
      }
    }
  }

  // Create debounced save function (250ms to avoid lag as requested)
  const debouncedSave = debounce(() => {
    if (!isRestoringFromHistory) {
      console.log("⏱️ Debounced save triggered (250ms delay)");
      saveCanvasState(canvas);
    } else {
      console.log("⏭️ Skipping save - currently restoring from history");
    }
  }, 250);

  // Listen to ALL change events as specified, then push JSON to store:

  // Object manipulation events
  canvas.on("object:added", debouncedSave);
  canvas.on("object:removed", debouncedSave);
  canvas.on("object:modified", debouncedSave); // covers move, scale, rotate, skew

  // Real-time manipulation events (debounced to prevent 100 history points during drag)
  canvas.on("object:moving", debouncedSave);
  canvas.on("object:scaling", debouncedSave);
  canvas.on("object:rotating", debouncedSave);
  canvas.on("object:skewing", debouncedSave);

  // Text editing events
  canvas.on("text:changed", debouncedSave);
  canvas.on("text:selection:changed", debouncedSave);

  // Drawing events
  canvas.on("path:created", debouncedSave);
  canvas.on("mouse:up", debouncedSave); // after free drawing

  // Canvas clearing
  canvas.on("canvas:cleared", debouncedSave);

  // Group/selection events (for future grouping functionality)
  canvas.on("group:selected", debouncedSave);
  canvas.on("selection:created", debouncedSave);
  canvas.on("selection:updated", debouncedSave);

  // Save initial state after ensuring canvas is fully ready
  const saveInitialState = () => {
    if (!isRestoringFromHistory && canvas && typeof canvas.getObjects === 'function') {
      try {
        const objects = canvas.getObjects();
        if (Array.isArray(objects)) {
          console.log("💾 Saving initial canvas state...");
          saveCanvasState(canvas);
          console.log("✅ Initial state saved to history");
        } else {
          console.log("⏳ Canvas not ready yet, retrying in 100ms...");
          setTimeout(saveInitialState, 100);
        }
      } catch {
        console.log("⏳ Canvas not ready yet, retrying in 100ms...");
        setTimeout(saveInitialState, 100);
      }
    }
  };

  // Start initial save after a delay to ensure canvas is ready
  setTimeout(saveInitialState, 500);

  console.log("initFabric: Canvas initialized with history support");
  return canvas;
}

/**
 * Restore canvas from JSON state
 * Avoid infinite loop: when loading JSON during undo/redo, do NOT trigger another save
 * @param canvas - The Fabric canvas instance
 * @param json - The JSON string to restore from
 */
export function restoreCanvasFromHistory(canvas: any, json: string | null) {
  if (!canvas || !json) {
    console.log("❌ Cannot restore: missing canvas or JSON");
    return;
  }

  console.log("🔄 Starting canvas restoration...");

  // Prevent infinite loop during undo/redo
  isRestoringFromHistory = true;

  try {
    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
      isRestoringFromHistory = false;
      console.log("✅ Canvas restored from history successfully");
    });
  } catch (error) {
    console.error("❌ Failed to restore canvas from history:", error);
    isRestoringFromHistory = false;
  }
}

/**
 * Check if we're currently restoring from history
 * Prevents triggering saves during undo/redo operations
 */
export function isRestoringCanvas() {
  return isRestoringFromHistory;
}

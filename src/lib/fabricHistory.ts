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

// Flag to prevent auto-restore during template loading
let isLoadingTemplate = false;

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
        "❌ Standard toJSON failed, trying toDatalessJSON:",
        serializationError
      );

      // Strategy 2: Try toDatalessJSON even for smaller canvases
      try {
        const datalessJson = canvasInstance.toDatalessJSON();
        json = JSON.stringify(datalessJson);
        console.log("✅ toDatalessJSON worked as fallback");
      } catch (datalessError) {
        console.warn(
          "❌ toDatalessJSON also failed, using safe object-by-object serialization:",
          datalessError
        );

        // Strategy 3: Safe serialization - handle each object individually
        try {
          const safeObjects = [];

          for (let i = 0; i < objects.length; i++) {
            try {
              const obj = objects[i];
              if (!obj) continue;

              // Enhanced object serialization with better text support
              if (typeof obj.toObject === "function") {
                // For text objects, ensure we capture ALL essential text properties
                if (
                  obj.type === "text" ||
                  obj.type === "textbox" ||
                  obj.type === "i-text"
                ) {
                  try {
                    const textObj = obj.toObject([
                      "text",
                      "fontFamily",
                      "fontSize",
                      "fontWeight",
                      "fontStyle",
                      "textDecoration",
                      "textAlign",
                      "lineHeight",
                      "charSpacing",
                      "fill",
                      "stroke",
                      "strokeWidth",
                      "originX",
                      "originY",
                      "textBackgroundColor",
                      "underline",
                      "overline",
                      "linethrough",
                      "fontStretch",
                      "letterSpacing",
                      "wordSpacing",
                    ]);
                    safeObjects.push(textObj);
                  } catch (textObjError) {
                    console.warn(
                      `⚠️ Text toObject failed for object ${i}, using basic serialization:`,
                      textObjError
                    );
                    // Fallback for problematic text objects
                    safeObjects.push({
                      type: obj.type,
                      left: obj.left || 0,
                      top: obj.top || 0,
                      width: obj.width || 0,
                      height: obj.height || 0,
                      angle: obj.angle || 0,
                      scaleX: obj.scaleX || 1,
                      scaleY: obj.scaleY || 1,
                      text: obj.text || "",
                      fontFamily: obj.fontFamily || "Arial",
                      fontSize: obj.fontSize || 20,
                      fill: obj.fill || "#000000",
                      textAlign: obj.textAlign || "left",
                      originX: obj.originX || "left",
                      originY: obj.originY || "top",
                      fontWeight: obj.fontWeight || "normal",
                      fontStyle: obj.fontStyle || "normal",
                    });
                  }
                } else {
                  try {
                    safeObjects.push(obj.toObject());
                  } catch (nonTextObjError) {
                    console.warn(
                      `⚠️ Non-text toObject failed for object ${i}, using basic serialization:`,
                      nonTextObjError
                    );
                    // Basic fallback for any object
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
                }
              } else {
                // Create minimal representation for problematic objects
                const basicObj: any = {
                  type: obj.type || "unknown",
                  left: obj.left || 0,
                  top: obj.top || 0,
                  width: obj.width || 0,
                  height: obj.height || 0,
                  angle: obj.angle || 0,
                  scaleX: obj.scaleX || 1,
                  scaleY: obj.scaleY || 1,
                };

                // Add text-specific properties if it's a text object
                if (
                  obj.type === "text" ||
                  obj.type === "textbox" ||
                  obj.type === "i-text"
                ) {
                  basicObj.text = obj.text || "";
                  basicObj.fontFamily = obj.fontFamily || "Arial";
                  basicObj.fontSize = obj.fontSize || 20;
                  basicObj.fill = obj.fill || "#000000";
                  basicObj.textAlign = obj.textAlign || "left";
                  basicObj.originX = obj.originX || "left";
                  basicObj.originY = obj.originY || "top";
                  basicObj.fontWeight = obj.fontWeight || "normal";
                  basicObj.fontStyle = obj.fontStyle || "normal";
                }

                safeObjects.push(basicObj);
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
          console.log("✅ Used safe object-by-object serialization");
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
      } // Close the datalessError catch block
    } // Close the serializationError catch block

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
    if (!isRestoringFromHistory && !isLoadingTemplate) {
      saveCanvasState(canvas);
    } else if (isLoadingTemplate) {
      console.log("⏭️ Skipping save - template is loading");
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
    // Parse JSON first to validate it
    const canvasData = JSON.parse(json);
    console.log(
      `🔄 Restoring ${canvasData.objects?.length || 0} objects from history`
    );

    canvas.loadFromJSON(json, () => {
      try {
        canvas.renderAll();
        isRestoringFromHistory = false;
        console.log("✅ Canvas restored successfully");
      } catch (renderError) {
        console.error(
          "❌ Error during canvas render after restore:",
          renderError
        );
        isRestoringFromHistory = false;
      }
    });
  } catch (error) {
    console.error("❌ Failed to restore canvas:", error);
    isRestoringFromHistory = false;

    // Try to at least clear the canvas if restore fails
    try {
      canvas.clear();
      canvas.renderAll();
    } catch (clearError) {
      console.error(
        "❌ Failed to clear canvas after restore error:",
        clearError
      );
    }
  }
}

/**
 * Check if currently restoring from history
 */
export function isRestoringCanvas() {
  return isRestoringFromHistory;
}

/**
 * Set template loading state to prevent auto-restore during template loading
 */
export function setTemplateLoading(loading: boolean) {
  isLoadingTemplate = loading;
  console.log(`📄 Template loading state: ${loading}`);
}

/**
 * Check if template is currently loading
 */
export function isTemplateLoading() {
  return isLoadingTemplate;
}

/**
 * Clear history and reset to clean state after template loading
 */
export function clearHistoryAfterTemplateLoad() {
  try {
    // Get the temporal store methods
    const store = useHistoryStore.temporal;

    // Clear all history
    store.getState().clear();

    console.log(
      "🧹 History cleared after template loading - no initial undo state"
    );
  } catch (error) {
    console.warn("❌ Failed to clear history:", error);
  }
}

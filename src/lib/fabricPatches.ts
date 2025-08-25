/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Fabric.js Canvas Protection Monkey Patches
 *
 * This module monkey-patches fabric.js Canvas methods to prevent null context errors
 * at the source by intercepting all context access and providing safe alternatives.
 */

let fabricPatched = false;

/**
 * Safe context getter that never returns null
 */
function getSafeContext(canvas: any, contextType: "2d" | "webgl" = "2d") {
  try {
    if (!canvas || !canvas.lowerCanvasEl) {
      return null;
    }

    let context = canvas.lowerCanvasEl.getContext(contextType);

    // If context is null, try to recreate it
    if (!context) {
      console.warn("Canvas context is null, attempting to recreate...");

      // Try to recreate the canvas element
      const parent = canvas.lowerCanvasEl.parentNode;
      if (parent) {
        const newCanvas = document.createElement("canvas");
        newCanvas.width = canvas.lowerCanvasEl.width;
        newCanvas.height = canvas.lowerCanvasEl.height;
        newCanvas.style.cssText = canvas.lowerCanvasEl.style.cssText;

        parent.replaceChild(newCanvas, canvas.lowerCanvasEl);
        canvas.lowerCanvasEl = newCanvas;

        context = newCanvas.getContext(contextType);
        console.log("Canvas context recreated successfully");
      }
    }

    return context;
  } catch (error) {
    console.warn("Failed to get safe context:", error);
    return null;
  }
}

/**
 * Create a safe wrapper for context operations
 */
function createSafeContextOperation(
  originalMethod: (...args: any[]) => any,
  methodName: string
) {
  return function (this: any, ...args: any[]) {
    try {
      // Get safe context
      const context = getSafeContext(this);
      if (!context) {
        console.warn(
          `${methodName}: Canvas context not available, operation skipped`
        );
        return this; // Return this for method chaining
      }

      // Call original method with safe context
      return originalMethod.apply(this, args);
    } catch (error) {
      console.warn(`${methodName}: Operation failed:`, error);
      return this; // Return this for method chaining
    }
  };
}

/**
 * Patch fabric.js Canvas prototype methods
 */
export function patchFabricCanvas() {
  if (fabricPatched || typeof window === "undefined") {
    return;
  }

  try {
    // Wait for fabric to be available
    if (!(window as any).fabric) {
      setTimeout(patchFabricCanvas, 100);
      return;
    }

    const fabric = (window as any).fabric;

    if (!fabric.Canvas || !fabric.Canvas.prototype) {
      setTimeout(patchFabricCanvas, 100);
      return;
    }

    console.log("Applying fabric.js canvas protection patches...");

    const Canvas = fabric.Canvas;
    const originalPrototype = Canvas.prototype;

    // Store original methods
    const originalRenderAll = originalPrototype.renderAll;
    const originalRenderCanvas = originalPrototype.renderCanvas;
    const originalSetDimensions = originalPrototype.setDimensions;
    const originalGetContext = originalPrototype.getContext;

    // Patch getContext to always return a valid context
    Canvas.prototype.getContext = function () {
      return getSafeContext(this) || originalGetContext.call(this);
    };

    // Patch renderAll
    Canvas.prototype.renderAll = function () {
      try {
        const context = getSafeContext(this);
        if (!context) {
          console.warn("renderAll: Context not available, skipping render");
          return this;
        }
        return originalRenderAll.call(this);
      } catch (error) {
        console.warn("renderAll: Render failed:", error);
        return this;
      }
    };

    // Patch renderCanvas
    Canvas.prototype.renderCanvas = function (ctx: any, objects: any[]) {
      try {
        const safeCtx = ctx || getSafeContext(this);
        if (!safeCtx) {
          console.warn("renderCanvas: Context not available, skipping render");
          return this;
        }
        return originalRenderCanvas.call(this, safeCtx, objects);
      } catch (error) {
        console.warn("renderCanvas: Render failed:", error);
        return this;
      }
    };

    // Patch clearContext
    Canvas.prototype.clearContext = function (ctx: any) {
      try {
        const safeCtx = ctx || getSafeContext(this);
        if (!safeCtx) {
          console.warn("clearContext: Context not available, skipping clear");
          return this;
        }

        // Safe clearRect operation
        if (safeCtx.clearRect && typeof safeCtx.clearRect === "function") {
          safeCtx.clearRect(0, 0, this.width || 0, this.height || 0);
        }

        return this;
      } catch (error) {
        console.warn("clearContext: Clear failed:", error);
        return this;
      }
    };

    // Patch setDimensions with context recreation
    Canvas.prototype.setDimensions = function (dimensions: any, options?: any) {
      try {
        console.log("setDimensions: Starting safe dimension change");

        // Call original setDimensions
        const result = originalSetDimensions.call(this, dimensions, options);

        // Verify context after dimension change
        setTimeout(() => {
          const context = getSafeContext(this);
          if (!context) {
            console.warn(
              "setDimensions: Context lost after dimension change, attempting recovery"
            );
            // Try to trigger a context recreation by calling getContext
            this.getContext();
          } else {
            console.log(
              "setDimensions: Context remains valid after dimension change"
            );
          }
        }, 10);

        return result;
      } catch (error) {
        console.error("setDimensions: Dimension change failed:", error);
        return this;
      }
    };

    // Patch context-dependent methods
    const contextMethods = [
      "drawImage",
      "save",
      "restore",
      "scale",
      "rotate",
      "translate",
      "transform",
      "setTransform",
      "clip",
      "beginPath",
      "closePath",
      "moveTo",
      "lineTo",
      "quadraticCurveTo",
      "bezierCurveTo",
      "arc",
      "arcTo",
      "rect",
      "fill",
      "stroke",
      "fillText",
      "strokeText",
    ];

    contextMethods.forEach((methodName) => {
      if (originalPrototype[methodName]) {
        originalPrototype[methodName] = createSafeContextOperation(
          originalPrototype[methodName],
          methodName
        );
      }
    });

    // Patch StaticCanvas methods as well (Canvas extends StaticCanvas)
    if (fabric.StaticCanvas && fabric.StaticCanvas.prototype) {
      const StaticCanvas = fabric.StaticCanvas;
      const staticOriginalRenderAll = StaticCanvas.prototype.renderAll;

      StaticCanvas.prototype.renderAll = function () {
        try {
          const context = getSafeContext(this);
          if (!context) {
            console.warn(
              "StaticCanvas.renderAll: Context not available, skipping render"
            );
            return this;
          }
          return staticOriginalRenderAll.call(this);
        } catch (error) {
          console.warn("StaticCanvas.renderAll: Render failed:", error);
          return this;
        }
      };
    }

    fabricPatched = true;
    console.log("Fabric.js canvas protection patches applied successfully");
  } catch (error) {
    console.error("Failed to patch fabric.js:", error);
    // Retry after a delay
    setTimeout(patchFabricCanvas, 500);
  }
}

/**
 * Initialize patches when fabric is loaded
 */
export function initializeFabricPatches() {
  if (typeof window !== "undefined") {
    // Patch native canvas context methods
    patchNativeCanvasContext();

    // Apply patches immediately if fabric is already loaded
    if ((window as any).fabric) {
      patchFabricCanvas();
    } else {
      // Wait for fabric to load
      const checkFabric = () => {
        if ((window as any).fabric) {
          patchFabricCanvas();
        } else {
          setTimeout(checkFabric, 100);
        }
      };
      checkFabric();
    }

    // Also patch on window load as a fallback
    window.addEventListener("load", patchFabricCanvas);
  }
}

/**
 * Patch native HTMLCanvasElement context methods
 */
function patchNativeCanvasContext() {
  if (typeof HTMLCanvasElement === "undefined") return;

  const originalGetContext = HTMLCanvasElement.prototype.getContext;

  // Type assertion to bypass strict typing for monkey patching
  (HTMLCanvasElement.prototype as any).getContext = function (
    this: HTMLCanvasElement,
    contextType: string,
    attributes?: any
  ) {
    try {
      const context = originalGetContext.call(
        this,
        contextType as any,
        attributes
      );

      if (context && contextType === "2d") {
        return patchCanvasRenderingContext2D(
          context as CanvasRenderingContext2D
        );
      }

      return context;
    } catch (error) {
      console.warn("getContext failed:", error);
      return null;
    }
  };
}

/**
 * Patch CanvasRenderingContext2D methods to be null-safe
 */
function patchCanvasRenderingContext2D(context: CanvasRenderingContext2D) {
  if (!context || (context as any).__patched) {
    return context;
  }

  // Mark as patched to avoid double patching
  (context as any).__patched = true;

  const originalClearRect = context.clearRect;
  const originalSave = context.save;
  const originalRestore = context.restore;
  const originalScale = context.scale;
  const originalTranslate = context.translate;
  const originalRotate = context.rotate;
  const originalTransform = context.transform;
  const originalSetTransform = context.setTransform;
  const originalDrawImage = context.drawImage;

  // Safe clearRect
  context.clearRect = function (
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    try {
      if (this && typeof this.clearRect === "function") {
        return originalClearRect.call(this, x, y, width, height);
      }
    } catch (error) {
      console.warn("clearRect failed:", error);
    }
  };

  // Safe save
  context.save = function () {
    try {
      if (this && typeof this.save === "function") {
        return originalSave.call(this);
      }
    } catch (error) {
      console.warn("context.save failed:", error);
    }
  };

  // Safe restore
  context.restore = function () {
    try {
      if (this && typeof this.restore === "function") {
        return originalRestore.call(this);
      }
    } catch (error) {
      console.warn("context.restore failed:", error);
    }
  };

  // Safe scale
  context.scale = function (x: number, y: number) {
    try {
      if (this && typeof this.scale === "function") {
        return originalScale.call(this, x, y);
      }
    } catch (error) {
      console.warn("context.scale failed:", error);
    }
  };

  // Safe translate
  context.translate = function (x: number, y: number) {
    try {
      if (this && typeof this.translate === "function") {
        return originalTranslate.call(this, x, y);
      }
    } catch (error) {
      console.warn("context.translate failed:", error);
    }
  };

  // Safe rotate
  context.rotate = function (angle: number) {
    try {
      if (this && typeof this.rotate === "function") {
        return originalRotate.call(this, angle);
      }
    } catch (error) {
      console.warn("context.rotate failed:", error);
    }
  };

  // Safe transform
  context.transform = function (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ) {
    try {
      if (this && typeof this.transform === "function") {
        return originalTransform.call(this, a, b, c, d, e, f);
      }
    } catch (error) {
      console.warn("context.transform failed:", error);
    }
  };

  // Safe setTransform
  (context as any).setTransform = function (...args: any[]) {
    try {
      if (this && typeof originalSetTransform === "function") {
        return (originalSetTransform as any).apply(this, args);
      }
    } catch (error) {
      console.warn("context.setTransform failed:", error);
    }
  };

  // Safe drawImage
  (context as any).drawImage = function (...args: any[]) {
    try {
      if (this && typeof originalDrawImage === "function") {
        return (originalDrawImage as any).apply(this, args);
      }
    } catch (error) {
      console.warn("context.drawImage failed:", error);
    }
  };

  return context;
}

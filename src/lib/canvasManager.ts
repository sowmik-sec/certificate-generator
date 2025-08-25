/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Canvas Manager - Provides safe canvas operations with context protection
 */

export class CanvasManager {
  private canvas: any = null;
  private isResizing = false;
  private pendingOperations: (() => void)[] = [];
  private contextCheckInterval: NodeJS.Timeout | null = null;

  constructor(canvas: any) {
    this.canvas = canvas;
    this.startContextMonitoring();
  }

  /**
   * Set the resizing state
   */
  setResizing(resizing: boolean) {
    this.isResizing = resizing;
    if (!resizing) {
      // Execute pending operations when resizing is done
      this.executePendingOperations();
    }
  }

  /**
   * Check if canvas context is valid
   */
  private isContextValid(): boolean {
    try {
      if (!this.canvas) return false;
      if (this.canvas.getContext && this.canvas.getContext() === null)
        return false;
      if (this.canvas.lowerCanvasEl) {
        const ctx = this.canvas.lowerCanvasEl.getContext("2d");
        if (!ctx) return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Monitor context validity and execute pending operations
   */
  private startContextMonitoring() {
    this.contextCheckInterval = setInterval(() => {
      if (
        this.isContextValid() &&
        !this.isResizing &&
        this.pendingOperations.length > 0
      ) {
        this.executePendingOperations();
      }
    }, 50);
  }

  /**
   * Execute all pending operations
   */
  private executePendingOperations() {
    const operations = [...this.pendingOperations];
    this.pendingOperations = [];

    operations.forEach((operation) => {
      try {
        operation();
      } catch (error) {
        console.warn("Pending canvas operation failed:", error);
      }
    });
  }

  /**
   * Safe render operation
   */
  safeRender(callback?: () => void): void {
    const operation = () => {
      try {
        if (this.isContextValid()) {
          this.canvas.renderAll();
          callback?.();
        } else {
          console.warn("Canvas context invalid, render skipped");
        }
      } catch (error) {
        console.warn("Canvas render failed:", error);
      }
    };

    if (this.isResizing || !this.isContextValid()) {
      // Queue operation for later
      this.pendingOperations.push(operation);
    } else {
      // Execute immediately
      operation();
    }
  }

  /**
   * Safe dimension change
   */
  safeDimensionChange(
    width: number,
    height: number,
    callback?: () => void
  ): void {
    this.setResizing(true);

    try {
      // Store the callback for after resize
      if (callback) {
        this.pendingOperations.push(callback);
      }

      // Perform dimension change
      if (this.canvas && this.canvas.setDimensions) {
        this.canvas.setDimensions({ width, height });

        // Wait for fabric.js to stabilize
        setTimeout(() => {
          this.setResizing(false);
        }, 100);
      } else {
        this.setResizing(false);
      }
    } catch (error) {
      console.error("Dimension change failed:", error);
      this.setResizing(false);
    }
  }

  /**
   * Safe JSON loading
   */
  safeLoadFromJSON(json: any, callback?: () => void): void {
    const operation = () => {
      try {
        if (this.canvas && this.canvas.loadFromJSON && this.isContextValid()) {
          this.canvas.loadFromJSON(json, () => {
            this.safeRender(callback);
          });
        } else {
          console.warn("Cannot load from JSON: canvas or context invalid");
        }
      } catch (error) {
        console.warn("Load from JSON failed:", error);
      }
    };

    if (this.isResizing || !this.isContextValid()) {
      this.pendingOperations.push(operation);
    } else {
      operation();
    }
  }

  /**
   * Safe canvas operation wrapper
   */
  safeOperation<T>(operation: () => T, fallback?: T): T | undefined {
    try {
      if (this.isContextValid() && !this.isResizing) {
        return operation();
      } else {
        console.warn("Canvas operation skipped: invalid context or resizing");
        return fallback;
      }
    } catch (error) {
      console.warn("Canvas operation failed:", error);
      return fallback;
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.contextCheckInterval) {
      clearInterval(this.contextCheckInterval);
      this.contextCheckInterval = null;
    }
    this.pendingOperations = [];
    this.canvas = null;
  }
}

// Global canvas managers registry
const canvasManagers = new WeakMap<any, CanvasManager>();

/**
 * Get or create a canvas manager for a canvas instance
 */
export function getCanvasManager(canvas: any): CanvasManager {
  if (!canvasManagers.has(canvas)) {
    canvasManagers.set(canvas, new CanvasManager(canvas));
  }
  return canvasManagers.get(canvas)!;
}

/**
 * Safe fabric.js operations using canvas manager
 */
export function withCanvasManager<T>(
  canvas: any,
  operation: (manager: CanvasManager) => T,
  fallback?: T
): T | undefined {
  if (!canvas) return fallback;

  try {
    const manager = getCanvasManager(canvas);
    return operation(manager);
  } catch (error) {
    console.warn("Canvas manager operation failed:", error);
    return fallback;
  }
}

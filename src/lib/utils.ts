/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely render a fabric.js canvas, handling null context errors
 * @param canvas - The fabric canvas instance to render
 * @param skipErrorLogging - Whether to skip logging render errors (default: false)
 */
 
export function safeCanvasRender(canvas: any, skipErrorLogging = false) {
  if (!canvas) return;

  try {
    // Multiple checks for canvas context validity
    if (canvas.getContext && canvas.getContext() === null) {
      if (!skipErrorLogging) {
        console.warn("Canvas context is null, skipping render");
      }
      return;
    }

    // Check if the canvas element exists
    if (canvas.lowerCanvasEl && !canvas.lowerCanvasEl.getContext) {
      if (!skipErrorLogging) {
        console.warn("Canvas element invalid, skipping render");
      }
      return;
    }

    // Additional check for 2d context specifically
    if (canvas.lowerCanvasEl) {
      const ctx = canvas.lowerCanvasEl.getContext("2d");
      if (!ctx) {
        if (!skipErrorLogging) {
          console.warn("2D context not available, skipping render");
        }
        return;
      }
    }

    canvas.renderAll();
  } catch (renderError) {
    if (!skipErrorLogging) {
      console.warn("Canvas render failed:", renderError);
    }
  }
}

/**
 * Safely execute a canvas operation with context validation
 * @param canvas - The fabric canvas instance
 * @param operation - The operation to perform
 * @param skipErrorLogging - Whether to skip logging errors
 */
 
export function safeCanvasOperation(
  canvas: any,
  operation: () => void,
  skipErrorLogging = false
) {
  if (!canvas) return;

  try {
    // Check if canvas context is valid
    if (canvas.getContext && canvas.getContext() === null) {
      if (!skipErrorLogging) {
        console.warn("Canvas context is null, skipping operation");
      }
      return;
    }

    operation();
  } catch (error) {
    if (!skipErrorLogging) {
      console.warn("Canvas operation failed:", error);
    }
  }
}

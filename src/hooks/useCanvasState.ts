"use client";

/**
 * Simplified canvas state hook without history functionality
 */
export const useCanvasState = () => {
  // Return empty state since history functionality is removed
  return {
    json: null,
    setJson: () => {},
  };
};

"use client";

/**
 * useCanvasStore() - simplified without history functionality
 */
export const useCanvasStore = () => {
  // Return empty json state since history functionality is removed
  return {
    json: null,
    setJson: () => {},
  };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

interface ToolsState {
  // Drawing tool state
  isDrawing: boolean;
  setIsDrawing: (isDrawing: boolean) => void;
  toggleDrawing: () => void;

  // Drawing settings
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;

  // Cursor state
  showDrawingCursor: boolean;
  setShowDrawingCursor: (show: boolean) => void;
  isMouseOverCanvas: boolean;
  setIsMouseOverCanvas: (over: boolean) => void;

  // Frame settings
  frameColor: string;
  setFrameColor: (color: string) => void;
  frameWidth: number;
  setFrameWidth: (width: number) => void;

  // Tool state management
  applyDrawingSettings: (canvas: any) => void;
  updateCanvasCursor: (canvas: any) => void;
  resetToDefaults: () => void;
}

export const useToolsStore = create<ToolsState>((set, get) => ({
  // Drawing tool state
  isDrawing: false,
  setIsDrawing: (isDrawing) => set({ isDrawing }),
  toggleDrawing: () => set((state) => ({ isDrawing: !state.isDrawing })),

  // Drawing settings
  brushColor: "#000000",
  setBrushColor: (color) => set({ brushColor: color }),
  brushSize: 5,
  setBrushSize: (size) => set({ brushSize: size }),

  // Cursor state
  showDrawingCursor: false,
  setShowDrawingCursor: (show) => set({ showDrawingCursor: show }),
  isMouseOverCanvas: false,
  setIsMouseOverCanvas: (over) => set({ isMouseOverCanvas: over }),

  // Frame settings
  frameColor: "#000000",
  setFrameColor: (color) => set({ frameColor: color }),
  frameWidth: 2,
  setFrameWidth: (width) => set({ frameWidth: width }),

  // Tool state management methods
  applyDrawingSettings: (canvas) => {
    const { isDrawing, brushColor, brushSize, isMouseOverCanvas } = get();
    if (!canvas) return;

    // Enable/disable drawing mode
    canvas.isDrawingMode = isDrawing;

    // Show drawing cursor only when drawing mode is active AND mouse is over canvas
    set({ showDrawingCursor: isDrawing && isMouseOverCanvas });

    // Apply brush settings if drawing mode is enabled
    if (isDrawing && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushSize;
    }
  },

  updateCanvasCursor: (canvas) => {
    const { isDrawing, showDrawingCursor } = get();
    if (!canvas) return;

    if (isDrawing && showDrawingCursor) {
      canvas.defaultCursor = "crosshair";
      canvas.hoverCursor = "crosshair";
    } else {
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
    }
  },

  resetToDefaults: () =>
    set({
      isDrawing: false,
      brushColor: "#000000",
      brushSize: 5,
      showDrawingCursor: false,
      isMouseOverCanvas: false,
      frameColor: "#000000",
      frameWidth: 2,
    }),
}));

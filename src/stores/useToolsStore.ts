/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

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

  // Table settings
  tableRows: number;
  setTableRows: (rows: number) => void;
  tableCols: number;
  setTableCols: (cols: number) => void;

  // Frame settings
  frameColor: string;
  setFrameColor: (color: string) => void;
  frameWidth: number;
  setFrameWidth: (width: number) => void;

  // Tool state management
  applyDrawingSettings: (canvas: any) => void;
  resetToDefaults: () => void;
}

const defaultState = {
  isDrawing: false,
  brushColor: '#000000',
  brushSize: 5,
  tableRows: 2,
  tableCols: 2,
  frameColor: '#8B4513',
  frameWidth: 4,
};

export const useToolsStore = create<ToolsState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    ...defaultState,

    // Drawing actions
    setIsDrawing: (isDrawing) => set({ isDrawing }),
    toggleDrawing: () => set((state) => ({ isDrawing: !state.isDrawing })),

    // Drawing settings
    setBrushColor: (color) => set({ brushColor: color }),
    setBrushSize: (size) => set({ brushSize: size }),

    // Table settings
    setTableRows: (rows) => set({ tableRows: rows }),
    setTableCols: (cols) => set({ tableCols: cols }),

    // Frame settings
    setFrameColor: (color) => set({ frameColor: color }),
    setFrameWidth: (width) => set({ frameWidth: width }),

    // Apply settings to canvas
    applyDrawingSettings: (canvas: any) => {
      if (!canvas) return;
      const { isDrawing, brushColor, brushSize } = get();
      canvas.isDrawingMode = isDrawing;
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushSize;
    },

    // Reset to defaults
    resetToDefaults: () => set(defaultState),
  }))
);

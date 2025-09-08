/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

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
  updateCanvasCursor: (canvas: any) => void;
  resetToDefaults: () => void;
}

const defaultState = {
  isDrawing: false,
  brushColor: "#000000",
  brushSize: 5,
  showDrawingCursor: false,
  isMouseOverCanvas: false,
  tableRows: 2,
  tableCols: 2,
  frameColor: "#8B4513",
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

    // Cursor state
    setShowDrawingCursor: (show) => set({ showDrawingCursor: show }),
    setIsMouseOverCanvas: (over) => set({ isMouseOverCanvas: over }),

    // Table settings
    setTableRows: (rows) => set({ tableRows: rows }),
    setTableCols: (cols) => set({ tableCols: cols }),

    // Frame settings
    setFrameColor: (color) => set({ frameColor: color }),
    setFrameWidth: (width) => set({ frameWidth: width }),

    // Apply settings to canvas
    applyDrawingSettings: (canvas: any) => {
      if (!canvas) return;
      const {
        isDrawing,
        brushColor,
        brushSize,
        setShowDrawingCursor,
        isMouseOverCanvas,
      } = get();

      canvas.isDrawingMode = isDrawing;
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushSize;

      // Update cursor visibility based on drawing mode and mouse position
      const shouldShowCursor = isDrawing && isMouseOverCanvas;
      setShowDrawingCursor(shouldShowCursor);

      if (isDrawing) {
        // DISABLE OBJECT SELECTION AND UI ELEMENTS - PRESERVE DRAWING PATHS
        canvas.selection = false; // Disable group selection
        canvas.skipTargetFind = true; // Skip finding targets (objects)

        // Store current objects to avoid affecting newly drawn paths
        const currentObjects = canvas.getObjects();

        // Disable selection only on non-path objects (preserve existing objects)
        currentObjects.forEach((obj: any) => {
          if (obj.type !== "path") {
            obj.selectable = false;
            obj.evented = false;
          }
        });

        // Hide selection controls
        canvas.selectionBorderColor = "transparent";
        canvas.selectionLineWidth = 0;
        canvas.selectionDashArray = [];
        canvas.selectionColor = "transparent";

        // Hide object controls
        canvas.centeredRotation = false;
        canvas.centeredScaling = false;

        // Deselect any currently selected objects
        canvas.discardActiveObject();

        // Hide cursor completely - our custom pen cursor will handle visualization
        canvas.defaultCursor = "none";
        canvas.freeDrawingCursor = "none";
        canvas.moveCursor = "none";
        canvas.hoverCursor = "none";

        // Configure brush settings for smooth drawing
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.color = brushColor;
          canvas.freeDrawingBrush.width = brushSize;
          // Make brush round for natural pen feel
          canvas.freeDrawingBrush.strokeLineCap = "round";
          canvas.freeDrawingBrush.strokeLineJoin = "round";
        }

        if (canvas.upperCanvasEl) {
          canvas.upperCanvasEl.style.cursor = "none";
        }
        if (canvas.lowerCanvasEl) {
          canvas.lowerCanvasEl.style.cursor = "none";
        }
      } else {
        // RESTORE OBJECT SELECTION AND UI ELEMENTS - PRESERVE ALL OBJECTS INCLUDING PATHS
        canvas.selection = true; // Enable group selection
        canvas.skipTargetFind = false; // Enable finding targets

        // Restore selectability for ALL objects (including newly drawn paths)
        const allObjects = canvas.getObjects();

        allObjects.forEach((obj: any) => {
          obj.selectable = true;
          obj.evented = true;
        });

        // Restore selection controls
        canvas.selectionBorderColor = "#1976d2";
        canvas.selectionLineWidth = 1;
        canvas.selectionDashArray = [];
        canvas.selectionColor = "rgba(100, 181, 246, 0.3)";

        // Restore object controls
        canvas.centeredRotation = true;
        canvas.centeredScaling = true;

        // Restore cursor on canvas elements
        canvas.defaultCursor = "default";
        canvas.freeDrawingCursor = "crosshair";
        canvas.moveCursor = "move";
        canvas.hoverCursor = "move";

        if (canvas.upperCanvasEl) {
          canvas.upperCanvasEl.style.cursor = "default";
        }
        if (canvas.lowerCanvasEl) {
          canvas.lowerCanvasEl.style.cursor = "default";
        }
      }

      // Force render to apply changes
      canvas.renderAll();
    },

    // Update canvas cursor visibility
    updateCanvasCursor: (canvas: any) => {
      if (!canvas) return;
      const { isDrawing, isMouseOverCanvas, setShowDrawingCursor } = get();
      setShowDrawingCursor(isDrawing && isMouseOverCanvas);
    },

    // Reset to defaults
    resetToDefaults: () => set(defaultState),
  }))
);

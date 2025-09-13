import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { FabricCanvas } from "@/types/fabric";

// Extended canvas type with history methods
interface CanvasWithHistory extends FabricCanvas {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  onHistory: () => void;
  offHistory: () => void;
}

interface HistoryState {
  // State tracking
  canUndo: boolean;
  canRedo: boolean;
  isHistoryEnabled: boolean;

  // Actions
  setCanUndo: (canUndo: boolean) => void;
  setCanRedo: (canRedo: boolean) => void;
  setHistoryEnabled: (enabled: boolean) => void;

  // History operations
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Canvas reference for operations
  canvas: CanvasWithHistory | null;
  setCanvas: (canvas: CanvasWithHistory | null) => void;
}

export const useHistoryStore = create<HistoryState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    canUndo: false,
    canRedo: false,
    isHistoryEnabled: true,
    canvas: null,

    // Actions
    setCanUndo: (canUndo) => set({ canUndo }),
    setCanRedo: (canRedo) => set({ canRedo }),
    setHistoryEnabled: (enabled) => set({ isHistoryEnabled: enabled }),
    setCanvas: (canvas) => set({ canvas }),

    // History operations
    undo: () => {
      const { canvas, canUndo } = get();
      if (canvas && canUndo && typeof canvas.undo === "function") {
        canvas.undo();
        // Update state after undo
        set({
          canUndo: canvas.canUndo(),
          canRedo: canvas.canRedo(),
        });
      }
    },

    redo: () => {
      const { canvas, canRedo } = get();
      if (canvas && canRedo && typeof canvas.redo === "function") {
        canvas.redo();
        // Update state after redo
        set({
          canUndo: canvas.canUndo(),
          canRedo: canvas.canRedo(),
        });
      }
    },

    clearHistory: () => {
      const { canvas } = get();
      if (canvas && typeof canvas.clearHistory === "function") {
        canvas.clearHistory();
        set({
          canUndo: false,
          canRedo: false,
        });
      }
    },
  }))
);

/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getCanvasManager, withCanvasManager } from "@/lib/canvasManager";

// Function to sanitize canvas data and fix invalid properties
const sanitizeCanvasData = (canvasData: any) => {
  if (!canvasData || !canvasData.objects) return canvasData;

  return {
    ...canvasData,
    objects: canvasData.objects.map((obj: any) => {
      const sanitizedObj = { ...obj };

      // Fix invalid textBaseline values
      if (sanitizedObj.textBaseline === "alphabetical") {
        sanitizedObj.textBaseline = "alphabetic";
      }

      // Remove any other invalid or problematic properties
      // Add more sanitization rules here as needed

      return sanitizedObj;
    }),
  };
};

interface HistoryState {
  // History data
  history: string[];
  historyIndex: number;
  maxHistorySize: number;

  // State tracking
  isUndoing: boolean;
  isRedoing: boolean;
  isSavingToHistory: boolean;
  isCanvasResizing: boolean;

  // Actions
  saveToHistory: (canvas: any) => Promise<void>;
  undo: (canvas: any) => void;
  redo: (canvas: any) => void;

  // History management
  clearHistory: () => void;
  setMaxHistorySize: (size: number) => void;
  trimHistory: () => void;

  // State getters
  canUndo: () => boolean;
  canRedo: () => boolean;
  getHistoryPosition: () => { current: number; total: number };

  // Advanced history features
  createCheckpoint: (canvas: any, label?: string) => void;
  getHistoryPreview: (index: number) => any;
  jumpToHistoryState: (canvas: any, index: number) => void;

  // Settings
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  autoSaveInterval: number;
  setAutoSaveInterval: (interval: number) => void;

  // Internal state management
  setIsUndoing: (undoing: boolean) => void;
  setIsRedoing: (redoing: boolean) => void;
  setIsSavingToHistory: (saving: boolean) => void;
  setIsCanvasResizing: (resizing: boolean) => void;
}

export const useHistoryStore = create<HistoryState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    history: [],
    historyIndex: -1,
    maxHistorySize: 50,
    isUndoing: false,
    isRedoing: false,
    isSavingToHistory: false,
    isCanvasResizing: false,
    autoSaveEnabled: true,
    autoSaveInterval: 1000,

    // Core actions
    saveToHistory: async (canvas: any) => {
      // Use canvas manager for safer operations
      return (
        withCanvasManager(canvas, (manager) => {
          return manager.safeOperation(async () => {
            const {
              isUndoing,
              isRedoing,
              isSavingToHistory,
              history,
              historyIndex,
              maxHistorySize,
            } = get();

            // Prevent saving during undo/redo operations
            if (isUndoing || isRedoing || isSavingToHistory) return;

            set({ isSavingToHistory: true });

            try {
              // Get canvas JSON with canvas manager safety
              const canvasData = await new Promise((resolve, reject) => {
                try {
                  // Use canvas manager safe operation for JSON serialization
                  manager.safeOperation(() => {
                    const data = canvas.toJSON();
                    resolve(data);
                  }, null);
                } catch (error) {
                  reject(error);
                }
              });

              // Validate that canvasData is an object and not undefined
              if (!canvasData || typeof canvasData !== "object") {
                console.warn(
                  "Canvas toJSON returned invalid data:",
                  canvasData
                );
                return;
              }

              const state = JSON.stringify(canvasData);

              // Validate that state is not empty
              if (!state || state === "{}" || state === "null") {
                console.warn(
                  "Canvas serialized to empty state, skipping history save"
                );
                return;
              }

              // Remove any history after current index (when creating a new branch)
              const newHistory = [...history.slice(0, historyIndex + 1), state];

              // Trim history if it exceeds max size
              if (newHistory.length > maxHistorySize) {
                newHistory.shift(); // Remove oldest entry
                set({
                  history: newHistory,
                  historyIndex: newHistory.length - 1,
                });
              } else {
                set({
                  history: newHistory,
                  historyIndex: newHistory.length - 1,
                });
              }
            } catch (error) {
              console.error("Failed to save to history:", error);
            } finally {
              set({ isSavingToHistory: false });
            }
          }, Promise.resolve());
        }) || Promise.resolve()
      );
    },

    undo: (canvas: any) => {
      return withCanvasManager(canvas, (manager) => {
        const { history, historyIndex, isUndoing, isCanvasResizing } = get();

        if (isUndoing || isCanvasResizing || historyIndex <= 0) {
          if (isCanvasResizing) {
            console.warn("Cannot undo while canvas is resizing");
          }
          return;
        }

        set({ isUndoing: true });

        try {
          const newIndex = historyIndex - 1;
          const state = JSON.parse(history[newIndex]);
          const sanitizedState = sanitizeCanvasData(state);

          // Use canvas manager for safe JSON loading
          manager.safeLoadFromJSON(sanitizedState, () => {
            set({
              historyIndex: newIndex,
              isUndoing: false,
            });
          });
        } catch (error) {
          console.error("Failed to undo:", error);
          set({ isUndoing: false });
        }
      });
    },

    redo: (canvas: any) => {
      return withCanvasManager(canvas, (manager) => {
        const { history, historyIndex, isRedoing, isCanvasResizing } = get();

        if (
          isRedoing ||
          isCanvasResizing ||
          historyIndex >= history.length - 1
        ) {
          if (isCanvasResizing) {
            console.warn("Cannot redo while canvas is resizing");
          }
          return;
        }

        set({ isRedoing: true });

        try {
          const newIndex = historyIndex + 1;
          const state = JSON.parse(history[newIndex]);
          const sanitizedState = sanitizeCanvasData(state);

          // Use canvas manager for safe JSON loading
          manager.safeLoadFromJSON(sanitizedState, () => {
            set({
              historyIndex: newIndex,
              isRedoing: false,
            });
          });
        } catch (error) {
          console.error("Failed to redo:", error);
          set({ isRedoing: false });
        }
      });
    },

    // History management
    clearHistory: () => set({ history: [], historyIndex: -1 }),

    setMaxHistorySize: (size: number) => {
      set({ maxHistorySize: Math.max(1, size) });
      get().trimHistory();
    },

    trimHistory: () => {
      const { history, historyIndex, maxHistorySize } = get();
      if (history.length <= maxHistorySize) return;

      const trimAmount = history.length - maxHistorySize;
      const newHistory = history.slice(trimAmount);
      const newIndex = Math.max(0, historyIndex - trimAmount);

      set({
        history: newHistory,
        historyIndex: newIndex,
      });
    },

    // State getters
    canUndo: () => {
      const { historyIndex, isUndoing } = get();
      return !isUndoing && historyIndex > 0;
    },

    canRedo: () => {
      const { history, historyIndex, isRedoing } = get();
      return !isRedoing && historyIndex < history.length - 1;
    },

    getHistoryPosition: () => {
      const { history, historyIndex } = get();
      return {
        current: historyIndex + 1,
        total: history.length,
      };
    },

    // Advanced features
    createCheckpoint: (canvas: any, label?: string) => {
      if (!canvas) return;

      // Add a labeled checkpoint to history
      const state = JSON.stringify({
        ...canvas.toJSON(),
        _checkpoint: {
          label: label || `Checkpoint ${new Date().toLocaleTimeString()}`,
          timestamp: Date.now(),
        },
      });

      const { history, historyIndex } = get();
      const newHistory = [...history.slice(0, historyIndex + 1), state];

      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    },

    getHistoryPreview: (index: number) => {
      const { history } = get();
      if (index < 0 || index >= history.length) return null;

      try {
        return JSON.parse(history[index]);
      } catch {
        return null;
      }
    },

    jumpToHistoryState: (canvas: any, index: number) => {
      if (!canvas) return;

      const { history, isUndoing, isRedoing } = get();

      if (isUndoing || isRedoing || index < 0 || index >= history.length)
        return;

      set({ isUndoing: true });

      try {
        const state = JSON.parse(history[index]);
        const sanitizedState = sanitizeCanvasData(state);
        canvas.loadFromJSON(sanitizedState, () => {
          canvas.renderAll();
          set({
            historyIndex: index,
            isUndoing: false,
          });
        });
      } catch (error) {
        console.error("Failed to jump to history state:", error);
        set({ isUndoing: false });
      }
    },

    // Settings
    setAutoSaveEnabled: (enabled: boolean) => set({ autoSaveEnabled: enabled }),
    setAutoSaveInterval: (interval: number) =>
      set({ autoSaveInterval: Math.max(100, interval) }),

    // Internal state management
    setIsUndoing: (undoing: boolean) => set({ isUndoing: undoing }),
    setIsRedoing: (redoing: boolean) => set({ isRedoing: redoing }),
    setIsSavingToHistory: (saving: boolean) =>
      set({ isSavingToHistory: saving }),
    setIsCanvasResizing: (resizing: boolean) =>
      set({ isCanvasResizing: resizing }),
  }))
);

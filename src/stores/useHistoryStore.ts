/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Function to sanitize canvas data and fix invalid properties
const sanitizeCanvasData = (canvasData: any) => {
  if (!canvasData || !canvasData.objects) return canvasData;

  return {
    ...canvasData,
    objects: canvasData.objects.map((obj: any) => {
      const sanitizedObj = { ...obj };
      
      // Fix invalid textBaseline values
      if (sanitizedObj.textBaseline === 'alphabetical') {
        sanitizedObj.textBaseline = 'alphabetic';
      }
      
      // Remove any other invalid or problematic properties
      // Add more sanitization rules here as needed
      
      return sanitizedObj;
    })
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
    autoSaveEnabled: true,
    autoSaveInterval: 1000,

    // Core actions
    saveToHistory: async (canvas: any) => {
      // Validate canvas and its methods
      if (!canvas || typeof canvas.toJSON !== 'function') {
        return; // Silently return if canvas is not ready (common during initialization)
      }
      
      // Check if canvas is properly initialized by testing if it has required properties
      if (!canvas.getObjects || typeof canvas.getObjects !== 'function') {
        return;
      }
      
      const { isUndoing, isRedoing, isSavingToHistory, history, historyIndex, maxHistorySize } = get();
      
      // Prevent saving during undo/redo operations
      if (isUndoing || isRedoing || isSavingToHistory) return;
      
      set({ isSavingToHistory: true });
      
      try {
        // Get canvas JSON with comprehensive error handling
        let canvasData;
        try {
          // Ensure canvas is in a stable state before serialization
          if (canvas.discardActiveObject && typeof canvas.discardActiveObject === 'function') {
            canvas.discardActiveObject();
          }
          canvas.renderAll();
          
          // Add a small delay to ensure any pending operations are complete
          await new Promise(resolve => setTimeout(resolve, 10));
          
          canvasData = canvas.toJSON();
        } catch (jsonError: any) {
          // Check if this is a template loading related error
          if (jsonError?.message && (jsonError.message.includes('reading \'0\'') || jsonError.message.includes('Cannot read properties of undefined'))) {
            console.warn('Canvas serialization failed during template loading, skipping history save', jsonError.message);
            // Don't save history if serialization fails during template loading
            return;
          }
          console.error('Failed to serialize canvas to JSON:', jsonError);
          return;
        }
        
        // Validate that canvasData is an object and not undefined
        if (!canvasData || typeof canvasData !== 'object') {
          console.warn('Canvas toJSON returned invalid data:', canvasData);
          return;
        }
        
        const state = JSON.stringify(canvasData);
        
        // Validate that state is not empty
        if (!state || state === '{}' || state === 'null') {
          console.warn('Canvas serialized to empty state, skipping history save');
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
        console.error('Failed to save to history:', error);
      } finally {
        set({ isSavingToHistory: false });
      }
    },

    undo: (canvas: any) => {
      if (!canvas) return;
      
      const { history, historyIndex, isUndoing } = get();
      
      if (isUndoing || historyIndex <= 0) return;
      
      set({ isUndoing: true });
      
      try {
        const newIndex = historyIndex - 1;
        const state = JSON.parse(history[newIndex]);
        const sanitizedState = sanitizeCanvasData(state);
        
        canvas.loadFromJSON(sanitizedState, () => {
          canvas.renderAll();
          set({
            historyIndex: newIndex,
            isUndoing: false,
          });
        });
      } catch (error) {
        console.error('Failed to undo:', error);
        set({ isUndoing: false });
      }
    },

    redo: (canvas: any) => {
      if (!canvas) return;
      
      const { history, historyIndex, isRedoing } = get();
      
      if (isRedoing || historyIndex >= history.length - 1) return;
      
      set({ isRedoing: true });
      
      try {
        const newIndex = historyIndex + 1;
        const state = JSON.parse(history[newIndex]);
        const sanitizedState = sanitizeCanvasData(state);
        
        canvas.loadFromJSON(sanitizedState, () => {
          canvas.renderAll();
          set({
            historyIndex: newIndex,
            isRedoing: false,
          });
        });
      } catch (error) {
        console.error('Failed to redo:', error);
        set({ isRedoing: false });
      }
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
      
      if (isUndoing || isRedoing || index < 0 || index >= history.length) return;
      
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
        console.error('Failed to jump to history state:', error);
        set({ isUndoing: false });
      }
    },

    // Settings
    setAutoSaveEnabled: (enabled: boolean) => set({ autoSaveEnabled: enabled }),
    setAutoSaveInterval: (interval: number) => set({ autoSaveInterval: Math.max(100, interval) }),

    // Internal state management
    setIsUndoing: (undoing: boolean) => set({ isUndoing: undoing }),
    setIsRedoing: (redoing: boolean) => set({ isRedoing: redoing }),
    setIsSavingToHistory: (saving: boolean) => set({ isSavingToHistory: saving }),
  }))
);

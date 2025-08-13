/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { EditorMode } from '@/components/sidebar-navigation';
import { CanvasSize, PRESET_SIZES } from '@/components/canvas-size-panel';

interface EditorState {
  // Editor mode state
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;

  // Canvas size state
  canvasSize: CanvasSize;
  setCanvasSize: (size: CanvasSize) => void;
  
  // Modal states
  showCanvasSizeModal: boolean;
  setShowCanvasSizeModal: (show: boolean) => void;
  
  pendingCanvasSize: CanvasSize | null;
  setPendingCanvasSize: (size: CanvasSize | null) => void;

  // Computed properties
  hasCanvasObjects: boolean;
  setHasCanvasObjects: (hasObjects: boolean) => void;
  
  // Derived state - whether canvas size panel should be shown
  getShouldShowCanvasSize: () => boolean;
}

export const useEditorStore = create<EditorState>()(
  subscribeWithSelector((set, get) => ({
    // Initial states
    editorMode: 'templates',
    canvasSize: PRESET_SIZES.CUSTOM,
    showCanvasSizeModal: false,
    pendingCanvasSize: null,
    hasCanvasObjects: false,

    // Actions
    setEditorMode: (mode) => set({ editorMode: mode }),
    
    setCanvasSize: (size) => set({ canvasSize: size }),
    
    setShowCanvasSizeModal: (show) => set({ showCanvasSizeModal: show }),
    
    setPendingCanvasSize: (size) => set({ pendingCanvasSize: size }),
    
    setHasCanvasObjects: (hasObjects) => set({ hasCanvasObjects: hasObjects }),

    // Computed getter
    getShouldShowCanvasSize: () => {
      const state = get();
      const isInDesignMode = state.editorMode !== 'templates';
      return !state.hasCanvasObjects && !isInDesignMode;
    },
  }))
);

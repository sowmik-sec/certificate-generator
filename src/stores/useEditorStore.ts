import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { EditorMode } from "@/components/sidebar-navigation";
import { CanvasSize, PRESET_SIZES } from "@/components/canvas-size-panel";

interface EditorState {
  // Editor mode state
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;

  // Hover state for sidebar
  hoveredMode: EditorMode;
  setHoveredMode: (mode: EditorMode) => void;

  // Mobile responsive states
  isMobileView: boolean;
  setIsMobileView: (isMobile: boolean) => void;

  // Mobile panel states
  showMobileBottomPanel: boolean;
  setShowMobileBottomPanel: (show: boolean) => void;

  showMobilePropertyPanel: boolean;
  setShowMobilePropertyPanel: (show: boolean) => void;

  // Mobile toolbar visibility (for auto-hide on scroll)
  isMobileToolbarVisible: boolean;
  setIsMobileToolbarVisible: (visible: boolean) => void;

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
    editorMode: null,
    hoveredMode: null,
    canvasSize: PRESET_SIZES.CUSTOM,
    showCanvasSizeModal: false,
    pendingCanvasSize: null,
    hasCanvasObjects: false,

    // Mobile responsive states
    isMobileView: false,
    showMobileBottomPanel: false,
    showMobilePropertyPanel: false,
    isMobileToolbarVisible: true,

    // Actions
    setEditorMode: (mode) => set({ editorMode: mode }),

    setHoveredMode: (mode) => set({ hoveredMode: mode }),

    // Mobile actions
    setIsMobileView: (isMobile) => set({ isMobileView: isMobile }),

    setShowMobileBottomPanel: (show) => set({ showMobileBottomPanel: show }),

    setShowMobilePropertyPanel: (show) =>
      set({ showMobilePropertyPanel: show }),

    setIsMobileToolbarVisible: (visible) =>
      set({ isMobileToolbarVisible: visible }),

    setCanvasSize: (size) => set({ canvasSize: size }),

    setShowCanvasSizeModal: (show) => set({ showCanvasSizeModal: show }),

    setPendingCanvasSize: (size) => set({ pendingCanvasSize: size }),

    setHasCanvasObjects: (hasObjects) => set({ hasCanvasObjects: hasObjects }),

    // Computed getter
    getShouldShowCanvasSize: () => {
      const state = get();
      const activeMode = state.editorMode || state.hoveredMode;
      const isInDesignMode = activeMode !== "templates" && activeMode !== null;
      return !state.hasCanvasObjects && !isInDesignMode;
    },
  }))
);

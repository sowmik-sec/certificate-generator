/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface TemplatesState {
  // Background color state
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  
  // Template selection state
  selectedTemplate: string | null;
  setSelectedTemplate: (templateName: string | null) => void;
  
  // UI state
  isTemplatesPanelExpanded: boolean;
  setIsTemplatesPanelExpanded: (expanded: boolean) => void;
  
  // Template loading state
  isLoadingTemplate: boolean;
  setIsLoadingTemplate: (loading: boolean) => void;
  
  // Template history
  recentTemplates: string[];
  addToRecentTemplates: (templateName: string) => void;
  clearRecentTemplates: () => void;
  
  // Background color presets
  backgroundColorPresets: string[];
  addBackgroundColorPreset: (color: string) => void;
  removeBackgroundColorPreset: (color: string) => void;
  
  // Actions
  applyBackgroundToCanvas: (canvas: any, color?: string) => void;
  resetTemplateState: () => void;
  
  // Helper functions
  getTemplateDisplayName: (templateName: string) => string;
  isCustomBackgroundColor: () => boolean;
}

const defaultBackgroundColorPresets = [
  '#ffffff',
  '#f8f9fa',
  '#e9ecef',
  '#dee2e6',
  '#fdf5e6',
  '#fff8dc',
  '#f0f8ff',
  '#f5f5f5',
  '#ffe4e1',
  '#f0fff0',
  '#f5f5dc',
  '#ffefd5',
];

export const useTemplatesStore = create<TemplatesState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    backgroundColor: '#ffffff',
    selectedTemplate: null,
    isTemplatesPanelExpanded: true,
    isLoadingTemplate: false,
    recentTemplates: [],
    backgroundColorPresets: defaultBackgroundColorPresets,

    // Actions
    setBackgroundColor: (color) => {
      set({ backgroundColor: color });
      // Auto-apply to canvas if available in context
      const canvas = (window as any).currentCanvas;
      if (canvas) {
        get().applyBackgroundToCanvas(canvas, color);
      }
    },

    setSelectedTemplate: (templateName) => set({ selectedTemplate: templateName }),

    setIsTemplatesPanelExpanded: (expanded) => set({ isTemplatesPanelExpanded: expanded }),

    setIsLoadingTemplate: (loading) => set({ isLoadingTemplate: loading }),

    addToRecentTemplates: (templateName) => {
      const { recentTemplates } = get();
      const newRecentTemplates = [
        templateName,
        ...recentTemplates.filter(name => name !== templateName)
      ].slice(0, 5); // Keep only 5 recent templates
      set({ recentTemplates: newRecentTemplates });
    },

    clearRecentTemplates: () => set({ recentTemplates: [] }),

    addBackgroundColorPreset: (color) => {
      const { backgroundColorPresets } = get();
      if (!backgroundColorPresets.includes(color)) {
        set({
          backgroundColorPresets: [color, ...backgroundColorPresets].slice(0, 20)
        });
      }
    },

    removeBackgroundColorPreset: (color) => {
      const { backgroundColorPresets } = get();
      set({
        backgroundColorPresets: backgroundColorPresets.filter(preset => preset !== color)
      });
    },

    applyBackgroundToCanvas: (canvas: any, color?: string) => {
      if (!canvas) return;
      const colorToApply = color || get().backgroundColor;
      canvas.setBackgroundColor(colorToApply, canvas.renderAll.bind(canvas));
    },

    resetTemplateState: () => set({
      backgroundColor: '#ffffff',
      selectedTemplate: null,
      isLoadingTemplate: false,
    }),

    // Helper functions
    getTemplateDisplayName: (templateName: string) => {
      const templateNames: Record<string, string> = {
        'blank': 'Blank Canvas',
        'modern': 'Modern Certificate',
        'classic': 'Classic Certificate',
        'playful': 'Playful Certificate',
      };
      return templateNames[templateName.toLowerCase()] || templateName;
    },

    isCustomBackgroundColor: () => {
      const { backgroundColor, backgroundColorPresets } = get();
      return !backgroundColorPresets.includes(backgroundColor);
    },
  }))
);

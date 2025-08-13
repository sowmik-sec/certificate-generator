/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface LayerInfo {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  object: any;
  zIndex: number;
}

interface LayerState {
  // Layer data
  layers: LayerInfo[];
  setLayers: (layers: LayerInfo[]) => void;
  updateLayer: (layerId: string, updates: Partial<LayerInfo>) => void;

  // UI state
  draggedLayer: string | null;
  setDraggedLayer: (layerId: string | null) => void;

  editingLayer: string | null;
  setEditingLayer: (layerId: string | null) => void;

  editingName: string;
  setEditingName: (name: string) => void;

  // Helper functions
  generateLayerName: (obj: any, index: number) => string;
  getLayerIcon: (type: string) => React.ReactNode;
}

export const useLayerStore = create<LayerState>()(
  subscribeWithSelector((set, get) => ({
    // Initial states
    layers: [],
    draggedLayer: null,
    editingLayer: null,
    editingName: '',

    // Actions
    setLayers: (layers) => set({ layers }),

    updateLayer: (layerId, updates) => {
      const { layers } = get();
      const updatedLayers = layers.map(layer => 
        layer.id === layerId ? { ...layer, ...updates } : layer
      );
      set({ layers: updatedLayers });
    },

    setDraggedLayer: (layerId) => set({ draggedLayer: layerId }),

    setEditingLayer: (layerId) => set({ editingLayer: layerId }),

    setEditingName: (name) => set({ editingName: name }),

    // Helper functions
    generateLayerName: (obj: any, index: number) => {
      const type = obj.type || 'Object';

      switch (type.toLowerCase()) {
        case 'textbox':
        case 'text':
          const text = obj.text || 'Text';
          return text.length > 20 ? `${text.substring(0, 20)}...` : text;
        case 'rect':
        case 'rectangle':
          return `Rectangle ${index + 1}`;
        case 'circle':
        case 'ellipse':
          return `Circle ${index + 1}`;
        case 'image':
          return `Image ${index + 1}`;
        case 'group':
          return `Group ${index + 1}`;
        default:
          return `${type} ${index + 1}`;
      }
    },

    getLayerIcon: (type: string) => {
      // This will be implemented in the component using lucide-react icons
      return null;
    },
  }))
);

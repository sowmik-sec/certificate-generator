/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { FabricModule, FabricObject, FabricCanvas } from '@/types/fabric';

// Global Fabric.js loading state to prevent multiple loads
let fabricLoadingPromise: Promise<any> | null = null;
let fabricInstance: FabricModule | null = null;

interface CanvasState {
  // Fabric.js instances
  fabric: FabricModule | null;
  setFabric: (fabric: FabricModule | null) => void;
  loadFabric: () => Promise<FabricModule>;

  canvas: FabricCanvas | null;
  setCanvas: (canvas: FabricCanvas | null) => void;

  // Selected objects
  selectedObject: FabricObject | null;
  setSelectedObject: (obj: FabricObject | null) => void;

  selectedObjects: any[];
  setSelectedObjects: (objects: any[]) => void;

  // Canvas event handlers
  setupCanvasEventListeners: (canvasInstance: FabricCanvas) => void;
}

export const useCanvasStore = create<CanvasState>()(
  subscribeWithSelector((set, get) => ({
    // Initial states
    fabric: null,
    canvas: null,
    selectedObject: null,
    selectedObjects: [],

    // Actions
    setFabric: (fabric) => set({ fabric }),

    // Load Fabric.js with singleton pattern
    loadFabric: async () => {
      // Return cached instance if available
      if (fabricInstance) {
        const currentFabric = get().fabric;
        if (!currentFabric) {
          set({ fabric: fabricInstance });
        }
        return fabricInstance;
      }

      // If already loading, return the existing promise
      if (fabricLoadingPromise) {
        return fabricLoadingPromise;
      }

      // Check if Fabric is already available globally
      if (typeof window !== 'undefined' && (window as any).fabric) {
        fabricInstance = (window as any).fabric;
        set({ fabric: fabricInstance });
        return fabricInstance;
      }

      // Start loading Fabric.js
      fabricLoadingPromise = new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
          reject(new Error('Cannot load Fabric.js on server side'));
          return;
        }

        // Check if script is already loaded
        const existingScript = document.querySelector(
          'script[src*="fabric.min.js"]'
        );
        
        if (existingScript) {
          // Wait a bit for the script to execute
          const checkFabric = () => {
            if ((window as any).fabric) {
              fabricInstance = (window as any).fabric;
              set({ fabric: fabricInstance });
              resolve(fabricInstance);
            } else {
              setTimeout(checkFabric, 50);
            }
          };
          checkFabric();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
        script.async = true;
        
        script.onload = () => {
          if ((window as any).fabric) {
            fabricInstance = (window as any).fabric;
            set({ fabric: fabricInstance });
            resolve(fabricInstance);
          } else {
            reject(new Error('Fabric.js loaded but not available'));
          }
        };
        
        script.onerror = () => {
          fabricLoadingPromise = null;
          reject(new Error('Failed to load Fabric.js'));
        };
        
        document.head.appendChild(script);
      });

      try {
        const fabric = await fabricLoadingPromise;
        return fabric;
      } catch (error) {
        fabricLoadingPromise = null;
        throw error;
      }
    },

    setCanvas: (canvas) => {
      set({ canvas });
      
      // Setup event listeners when canvas is set
      if (canvas) {
        get().setupCanvasEventListeners(canvas);
      }
    },

    setSelectedObject: (obj) => set({ selectedObject: obj }),

    setSelectedObjects: (objects) => set({ selectedObjects: objects }),

    // Setup canvas event listeners
    setupCanvasEventListeners: (canvasInstance) => {
      const { setSelectedObject, setSelectedObjects } = get();

      // Set up selection tracking
      canvasInstance.on('selection:created', (e: any) => {
        const selectedObjs = e.selected || [e.target].filter(Boolean);
        setSelectedObject(e.selected?.[0] || null);
        setSelectedObjects(selectedObjs);
      });

      canvasInstance.on('selection:updated', (e: any) => {
        const selectedObjs = e.selected || [e.target].filter(Boolean);
        setSelectedObject(e.selected?.[0] || null);
        setSelectedObjects(selectedObjs);
      });

      canvasInstance.on('selection:cleared', () => {
        setSelectedObject(null);
        setSelectedObjects([]);
      });

      canvasInstance.on('object:modified', () => canvasInstance.renderAll());
    },
  }))
);

/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface GridAlignmentState {
  // Grid state
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  toggleGrid: () => void;

  // Snap to grid state
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  toggleSnapToGrid: () => void;

  // Grid settings
  gridSize: number;
  setGridSize: (size: number) => void;

  // Grid color and style
  gridColor: string;
  setGridColor: (color: string) => void;
  gridOpacity: number;
  setGridOpacity: (opacity: number) => void;

  // Snap to objects settings
  snapToObjects: boolean;
  setSnapToObjects: (snap: boolean) => void;
  snapTolerance: number;
  setSnapTolerance: (tolerance: number) => void;

  // Alignment preferences
  alignmentGuideColor: string;
  setAlignmentGuideColor: (color: string) => void;
  showAlignmentGuides: boolean;
  setShowAlignmentGuides: (show: boolean) => void;

  // Grid management functions
  applyGridToCanvas: (canvas: any) => void;
  removeGridFromCanvas: (canvas: any) => void;
  drawGrid: (canvas: any) => void;

  // Snap functions
  snapObjectToGrid: (obj: any) => void;
  setupCanvasSnapping: (canvas: any) => void;
  removeCanvasSnapping: (canvas: any) => void;

  // Alignment functions
  alignObjects: (canvas: any, alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeObjects: (canvas: any, direction: 'horizontal' | 'vertical') => void;

  // Reset functions
  resetGridSettings: () => void;
  resetAlignmentSettings: () => void;
}

const defaultGridSettings = {
  showGrid: false,
  snapToGrid: false,
  gridSize: 20,
  gridColor: '#ddd',
  gridOpacity: 0.5,
  snapToObjects: true,
  snapTolerance: 10,
  alignmentGuideColor: '#ff0000',
  showAlignmentGuides: true,
};

export const useGridAlignmentStore = create<GridAlignmentState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    ...defaultGridSettings,

    // Grid actions
    setShowGrid: (show) => set({ showGrid: show }),
    toggleGrid: () => {
      const currentShow = get().showGrid;
      set({ showGrid: !currentShow });
    },

    setSnapToGrid: (snap) => set({ snapToGrid: snap }),
    toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

    setGridSize: (size) => set({ gridSize: size }),
    setGridColor: (color) => set({ gridColor: color }),
    setGridOpacity: (opacity) => set({ gridOpacity: opacity }),

    // Snap settings
    setSnapToObjects: (snap) => set({ snapToObjects: snap }),
    setSnapTolerance: (tolerance) => set({ snapTolerance: tolerance }),

    // Alignment settings
    setAlignmentGuideColor: (color) => set({ alignmentGuideColor: color }),
    setShowAlignmentGuides: (show) => set({ showAlignmentGuides: show }),

    // Grid management functions
    applyGridToCanvas: (canvas: any) => {
      if (!canvas) return;
      const { showGrid } = get();
      if (showGrid) {
        get().drawGrid(canvas);
      } else {
        get().removeGridFromCanvas(canvas);
      }
    },

    removeGridFromCanvas: (canvas: any) => {
      if (!canvas) return;
      const objects = canvas.getObjects().filter((obj: any) => obj.id === 'grid-line');
      objects.forEach((obj: any) => canvas.remove(obj));
      canvas.renderAll();
    },

    drawGrid: (canvas: any) => {
      if (!canvas) return;
      const { gridSize, gridColor, gridOpacity } = get();

      // Remove existing grid
      get().removeGridFromCanvas(canvas);

      const canvasWidth = canvas.getWidth() / canvas.getZoom();
      const canvasHeight = canvas.getHeight() / canvas.getZoom();
      const fabric = (window as any).fabric;
      if (!fabric) return;

      const gridGroup = [];

      // Vertical lines
      for (let i = 0; i <= canvasWidth; i += gridSize) {
        const line = new fabric.Line([i, 0, i, canvasHeight], {
          stroke: gridColor,
          strokeWidth: 0.5,
          opacity: gridOpacity,
          selectable: false,
          evented: false,
          excludeFromExport: true,
          id: 'grid-line',
        });
        gridGroup.push(line);
      }

      // Horizontal lines
      for (let i = 0; i <= canvasHeight; i += gridSize) {
        const line = new fabric.Line([0, i, canvasWidth, i], {
          stroke: gridColor,
          strokeWidth: 0.5,
          opacity: gridOpacity,
          selectable: false,
          evented: false,
          excludeFromExport: true,
          id: 'grid-line',
        });
        gridGroup.push(line);
      }

      gridGroup.forEach((line) => {
        canvas.add(line);
        canvas.sendToBack(line);
      });

      canvas.renderAll();
    },

    // Snap functions
    snapObjectToGrid: (obj: any) => {
      const { snapToGrid, gridSize } = get();
      if (!snapToGrid || !obj) return;

      obj.set({
        left: Math.round(obj.left / gridSize) * gridSize,
        top: Math.round(obj.top / gridSize) * gridSize,
      });
      obj.setCoords();
    },

    setupCanvasSnapping: (canvas: any) => {
      if (!canvas) return;
      const { snapToGrid } = get();

      const handleObjectMoving = (e: any) => {
        if (!snapToGrid) return;
        get().snapObjectToGrid(e.target);
      };

      canvas.on('object:moving', handleObjectMoving);
      
      // Store reference for cleanup
      (canvas as any)._snapHandler = handleObjectMoving;
    },

    removeCanvasSnapping: (canvas: any) => {
      if (!canvas || !(canvas as any)._snapHandler) return;
      canvas.off('object:moving', (canvas as any)._snapHandler);
      delete (canvas as any)._snapHandler;
    },

    // Alignment functions
    alignObjects: (canvas: any, alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
      if (!canvas) return;
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length === 0) return;

      const canvasWidth = canvas.getWidth() / canvas.getZoom();
      const canvasHeight = canvas.getHeight() / canvas.getZoom();

      switch (alignment) {
        case 'left':
          const leftmost = Math.min(...activeObjects.map((obj: any) => obj.left - (obj.width * obj.scaleX) / 2));
          activeObjects.forEach((obj: any) => {
            obj.set({ left: leftmost + (obj.width * obj.scaleX) / 2 });
            obj.setCoords();
          });
          break;

        case 'center':
          const centerX = canvasWidth / 2;
          activeObjects.forEach((obj: any) => {
            obj.set({ left: centerX });
            obj.setCoords();
          });
          break;

        case 'right':
          const rightmost = Math.max(...activeObjects.map((obj: any) => obj.left + (obj.width * obj.scaleX) / 2));
          activeObjects.forEach((obj: any) => {
            obj.set({ left: rightmost - (obj.width * obj.scaleX) / 2 });
            obj.setCoords();
          });
          break;

        case 'top':
          const topmost = Math.min(...activeObjects.map((obj: any) => obj.top - (obj.height * obj.scaleY) / 2));
          activeObjects.forEach((obj: any) => {
            obj.set({ top: topmost + (obj.height * obj.scaleY) / 2 });
            obj.setCoords();
          });
          break;

        case 'middle':
          const centerY = canvasHeight / 2;
          activeObjects.forEach((obj: any) => {
            obj.set({ top: centerY });
            obj.setCoords();
          });
          break;

        case 'bottom':
          const bottommost = Math.max(...activeObjects.map((obj: any) => obj.top + (obj.height * obj.scaleY) / 2));
          activeObjects.forEach((obj: any) => {
            obj.set({ top: bottommost - (obj.height * obj.scaleY) / 2 });
            obj.setCoords();
          });
          break;
      }

      canvas.renderAll();
    },

    distributeObjects: (canvas: any, direction: 'horizontal' | 'vertical') => {
      if (!canvas) return;
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length < 3) return;

      if (direction === 'horizontal') {
        const sortedObjects = [...activeObjects].sort((a: any, b: any) => a.left - b.left);
        const leftmost = sortedObjects[0].left;
        const rightmost = sortedObjects[sortedObjects.length - 1].left;
        const totalWidth = rightmost - leftmost;
        const spacing = totalWidth / (sortedObjects.length - 1);

        sortedObjects.forEach((obj: any, index: number) => {
          if (index > 0 && index < sortedObjects.length - 1) {
            obj.set({ left: leftmost + spacing * index });
            obj.setCoords();
          }
        });
      } else {
        const sortedObjects = [...activeObjects].sort((a: any, b: any) => a.top - b.top);
        const topmost = sortedObjects[0].top;
        const bottommost = sortedObjects[sortedObjects.length - 1].top;
        const totalHeight = bottommost - topmost;
        const spacing = totalHeight / (sortedObjects.length - 1);

        sortedObjects.forEach((obj: any, index: number) => {
          if (index > 0 && index < sortedObjects.length - 1) {
            obj.set({ top: topmost + spacing * index });
            obj.setCoords();
          }
        });
      }

      canvas.renderAll();
    },

    // Reset functions
    resetGridSettings: () => set({
      showGrid: defaultGridSettings.showGrid,
      snapToGrid: defaultGridSettings.snapToGrid,
      gridSize: defaultGridSettings.gridSize,
      gridColor: defaultGridSettings.gridColor,
      gridOpacity: defaultGridSettings.gridOpacity,
    }),

    resetAlignmentSettings: () => set({
      snapToObjects: defaultGridSettings.snapToObjects,
      snapTolerance: defaultGridSettings.snapTolerance,
      alignmentGuideColor: defaultGridSettings.alignmentGuideColor,
      showAlignmentGuides: defaultGridSettings.showAlignmentGuides,
    }),
  }))
);

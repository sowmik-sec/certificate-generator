/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

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

  // Enhanced snapping settings
  smoothSnapping: boolean;
  setSmoothSnapping: (smooth: boolean) => void;
  snapAnimationDuration: number;
  setSnapAnimationDuration: (duration: number) => void;

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
  snapObjectToGrid: (obj: any) => boolean;
  setupCanvasSnapping: (canvas: any) => void;
  removeCanvasSnapping: (canvas: any) => void;
  snapToObjectAlignment: (
    movingObj: any,
    objects: any[],
    tolerance: number
  ) => boolean;

  // Alignment functions
  alignObjects: (
    canvas: any,
    alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
  ) => void;
  distributeObjects: (
    canvas: any,
    direction: "horizontal" | "vertical"
  ) => void;

  // Reset functions
  resetGridSettings: () => void;
  resetAlignmentSettings: () => void;
}

const defaultGridSettings = {
  showGrid: false,
  snapToGrid: false,
  gridSize: 20,
  gridColor: "#ddd",
  gridOpacity: 0.5,
  snapToObjects: true,
  snapTolerance: 10,
  alignmentGuideColor: "#ff0000",
  showAlignmentGuides: true,
  smoothSnapping: true,
  snapAnimationDuration: 150,
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

    // Enhanced snapping settings
    setSmoothSnapping: (smooth) => set({ smoothSnapping: smooth }),
    setSnapAnimationDuration: (duration) =>
      set({ snapAnimationDuration: duration }),

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
      const objects = canvas
        .getObjects()
        .filter((obj: any) => obj.id === "grid-line");
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
          id: "grid-line",
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
          id: "grid-line",
        });
        gridGroup.push(line);
      }

      gridGroup.forEach((line) => {
        canvas.add(line);
        canvas.sendToBack(line);
      });

      canvas.renderAll();
    },

    // Enhanced snap functions with smooth movement
    snapObjectToGrid: (obj: any) => {
      const { snapToGrid, gridSize } = get();
      if (!snapToGrid || !obj) return false;

      const snappedLeft = Math.round(obj.left / gridSize) * gridSize;
      const snappedTop = Math.round(obj.top / gridSize) * gridSize;

      // Only snap if close enough (within threshold)
      const threshold = gridSize / 4;
      const leftDiff = Math.abs(obj.left - snappedLeft);
      const topDiff = Math.abs(obj.top - snappedTop);

      if (leftDiff < threshold || topDiff < threshold) {
        obj.set({
          left: leftDiff < threshold ? snappedLeft : obj.left,
          top: topDiff < threshold ? snappedTop : obj.top,
        });
        obj.setCoords();
        return true;
      }
      return false;
    },

    setupCanvasSnapping: (canvas: any) => {
      if (!canvas) return;

      const handleObjectMoving = (e: any) => {
        const { snapToGrid, snapToObjects, snapTolerance } = get();
        const obj = e.target;

        // Prevent excessive updates that cause shaking
        if (obj._isSnapping) return;
        obj._isSnapping = true;

        let snapped = false;

        // Grid snapping with smooth threshold
        if (snapToGrid) {
          snapped = get().snapObjectToGrid(obj) || snapped;
        }

        // Object alignment snapping
        if (snapToObjects && !snapped) {
          const objects = canvas
            .getObjects()
            .filter(
              (o: any) =>
                o !== obj &&
                o.id !== "alignment-line" &&
                o.id !== "grid-line" &&
                !o.excludeFromExport
            );

          if (objects.length > 0) {
            get().snapToObjectAlignment(obj, objects, snapTolerance);
          }
        }

        // Clear the snapping flag after a short delay
        setTimeout(() => {
          obj._isSnapping = false;
        }, 16); // ~60fps
      };

      const handleObjectModified = (e: any) => {
        const obj = e.target;
        obj._isSnapping = false;
        obj.setCoords();
      };

      canvas.on("object:moving", handleObjectMoving);
      canvas.on("object:modified", handleObjectModified);

      // Store references for cleanup
      (canvas as any)._snapHandler = handleObjectMoving;
      (canvas as any)._modifiedHandler = handleObjectModified;
    },

    removeCanvasSnapping: (canvas: any) => {
      if (!canvas) return;

      if ((canvas as any)._snapHandler) {
        canvas.off("object:moving", (canvas as any)._snapHandler);
        delete (canvas as any)._snapHandler;
      }

      if ((canvas as any)._modifiedHandler) {
        canvas.off("object:modified", (canvas as any)._modifiedHandler);
        delete (canvas as any)._modifiedHandler;
      }
    },

    // New function for smooth object-to-object alignment
    snapToObjectAlignment: (
      movingObj: any,
      objects: any[],
      tolerance: number
    ) => {
      const movingBounds = movingObj.getBoundingRect();
      const movingCenter = movingObj.getCenterPoint();

      let bestSnapX = null;
      let bestSnapY = null;
      let minDistanceX = tolerance;
      let minDistanceY = tolerance;

      objects.forEach((obj: any) => {
        const objBounds = obj.getBoundingRect();
        const objCenter = obj.getCenterPoint();

        // Horizontal center alignment
        const centerDistX = Math.abs(movingCenter.x - objCenter.x);
        if (centerDistX < minDistanceX) {
          bestSnapX = objCenter.x;
          minDistanceX = centerDistX;
        }

        // Vertical center alignment
        const centerDistY = Math.abs(movingCenter.y - objCenter.y);
        if (centerDistY < minDistanceY) {
          bestSnapY = objCenter.y;
          minDistanceY = centerDistY;
        }

        // Edge alignments with smaller tolerance for edges
        const edgeTolerance = tolerance * 0.7;

        // Left edge alignment
        const leftDist = Math.abs(movingBounds.left - objBounds.left);
        if (leftDist < edgeTolerance && leftDist < minDistanceX) {
          bestSnapX = objBounds.left + movingBounds.width / 2;
          minDistanceX = leftDist;
        }

        // Right edge alignment
        const rightDist = Math.abs(
          movingBounds.left +
            movingBounds.width -
            (objBounds.left + objBounds.width)
        );
        if (rightDist < edgeTolerance && rightDist < minDistanceX) {
          bestSnapX = objBounds.left + objBounds.width - movingBounds.width / 2;
          minDistanceX = rightDist;
        }

        // Top edge alignment
        const topDist = Math.abs(movingBounds.top - objBounds.top);
        if (topDist < edgeTolerance && topDist < minDistanceY) {
          bestSnapY = objBounds.top + movingBounds.height / 2;
          minDistanceY = topDist;
        }

        // Bottom edge alignment
        const bottomDist = Math.abs(
          movingBounds.top +
            movingBounds.height -
            (objBounds.top + objBounds.height)
        );
        if (bottomDist < edgeTolerance && bottomDist < minDistanceY) {
          bestSnapY =
            objBounds.top + objBounds.height - movingBounds.height / 2;
          minDistanceY = bottomDist;
        }
      });

      // Apply smooth snapping
      if (bestSnapX !== null) {
        movingObj.set({ left: bestSnapX });
      }
      if (bestSnapY !== null) {
        movingObj.set({ top: bestSnapY });
      }

      if (bestSnapX !== null || bestSnapY !== null) {
        movingObj.setCoords();
        return true;
      }

      return false;
    },

    // Alignment functions
    alignObjects: (
      canvas: any,
      alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
    ) => {
      if (!canvas) return;
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length === 0) return;

      const canvasWidth = canvas.getWidth() / canvas.getZoom();
      const canvasHeight = canvas.getHeight() / canvas.getZoom();

      switch (alignment) {
        case "left":
          const leftmost = Math.min(
            ...activeObjects.map(
              (obj: any) => obj.left - (obj.width * obj.scaleX) / 2
            )
          );
          activeObjects.forEach((obj: any) => {
            obj.set({ left: leftmost + (obj.width * obj.scaleX) / 2 });
            obj.setCoords();
          });
          break;

        case "center":
          const centerX = canvasWidth / 2;
          activeObjects.forEach((obj: any) => {
            obj.set({ left: centerX });
            obj.setCoords();
          });
          break;

        case "right":
          const rightmost = Math.max(
            ...activeObjects.map(
              (obj: any) => obj.left + (obj.width * obj.scaleX) / 2
            )
          );
          activeObjects.forEach((obj: any) => {
            obj.set({ left: rightmost - (obj.width * obj.scaleX) / 2 });
            obj.setCoords();
          });
          break;

        case "top":
          const topmost = Math.min(
            ...activeObjects.map(
              (obj: any) => obj.top - (obj.height * obj.scaleY) / 2
            )
          );
          activeObjects.forEach((obj: any) => {
            obj.set({ top: topmost + (obj.height * obj.scaleY) / 2 });
            obj.setCoords();
          });
          break;

        case "middle":
          const centerY = canvasHeight / 2;
          activeObjects.forEach((obj: any) => {
            obj.set({ top: centerY });
            obj.setCoords();
          });
          break;

        case "bottom":
          const bottommost = Math.max(
            ...activeObjects.map(
              (obj: any) => obj.top + (obj.height * obj.scaleY) / 2
            )
          );
          activeObjects.forEach((obj: any) => {
            obj.set({ top: bottommost - (obj.height * obj.scaleY) / 2 });
            obj.setCoords();
          });
          break;
      }

      canvas.renderAll();
    },

    distributeObjects: (canvas: any, direction: "horizontal" | "vertical") => {
      if (!canvas) return;
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length < 3) return;

      if (direction === "horizontal") {
        const sortedObjects = [...activeObjects].sort(
          (a: any, b: any) => a.left - b.left
        );
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
        const sortedObjects = [...activeObjects].sort(
          (a: any, b: any) => a.top - b.top
        );
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
    resetGridSettings: () =>
      set({
        showGrid: defaultGridSettings.showGrid,
        snapToGrid: defaultGridSettings.snapToGrid,
        gridSize: defaultGridSettings.gridSize,
        gridColor: defaultGridSettings.gridColor,
        gridOpacity: defaultGridSettings.gridOpacity,
      }),

    resetAlignmentSettings: () =>
      set({
        snapToObjects: defaultGridSettings.snapToObjects,
        snapTolerance: defaultGridSettings.snapTolerance,
        alignmentGuideColor: defaultGridSettings.alignmentGuideColor,
        showAlignmentGuides: defaultGridSettings.showAlignmentGuides,
      }),
  }))
);

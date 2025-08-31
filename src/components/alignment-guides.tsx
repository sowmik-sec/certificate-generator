/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useCallback } from "react";
import { useGridAlignmentStore } from "@/stores/useGridAlignmentStore";

interface AlignmentGuidesProps {
  canvas: any;
  fabric: any;
}

const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  canvas,
  fabric,
}) => {
  const alignmentLinesRef = useRef<any[]>([]);
  const guideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef(false);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    showAlignmentGuides,
    alignmentGuideColor,
    snapToObjects,
    snapTolerance,
  } = useGridAlignmentStore();

  const clearAlignmentLines = useCallback(() => {
    if (!canvas) return;

    // Clear any pending timeout
    if (guideTimeoutRef.current) {
      clearTimeout(guideTimeoutRef.current);
      guideTimeoutRef.current = null;
    }

    alignmentLinesRef.current.forEach((line: any) => {
      if (canvas.contains(line)) {
        canvas.remove(line);
      }
    });
    alignmentLinesRef.current = [];
  }, [canvas]);

  // Force clear all alignment lines (even orphaned ones)
  const forceClearAlignmentLines = useCallback(() => {
    if (!canvas) return;

    // Clear any pending timeout
    if (guideTimeoutRef.current) {
      clearTimeout(guideTimeoutRef.current);
      guideTimeoutRef.current = null;
    }

    // Remove all objects with alignment-line id
    const allObjects = canvas.getObjects();
    const alignmentLines = allObjects.filter(
      (obj: any) => obj.id === "alignment-line"
    );

    alignmentLines.forEach((line: any) => {
      canvas.remove(line);
    });

    alignmentLinesRef.current = [];
    isDraggingRef.current = false; // Reset dragging state
  }, [canvas]);

  const createAlignmentLine = useCallback(
    (x1: number, y1: number, x2: number, y2: number) => {
      if (!fabric) return null;

      return new fabric.Line([x1, y1, x2, y2], {
        stroke: alignmentGuideColor,
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        id: "alignment-line",
        opacity: 0.8,
      });
    },
    [fabric, alignmentGuideColor]
  );

  const drawAlignmentGuides = useCallback(
    (movingObject: any) => {
      if (!canvas || !showAlignmentGuides || !snapToObjects) {
        clearAlignmentLines();
        return;
      }

      clearAlignmentLines();

      const canvasObjects = canvas
        .getObjects()
        .filter(
          (obj: any) =>
            obj !== movingObject &&
            obj.id !== "alignment-line" &&
            obj.id !== "grid-line" &&
            !obj.excludeFromExport
        );

      if (canvasObjects.length === 0) return;

      const movingBounds = movingObject.getBoundingRect();
      const movingCenter = movingObject.getCenterPoint();
      const canvasWidth = canvas.getWidth() / canvas.getZoom();
      const canvasHeight = canvas.getHeight() / canvas.getZoom();

      const guides: any[] = [];

      canvasObjects.forEach((obj: any) => {
        const objBounds = obj.getBoundingRect();
        const objCenter = obj.getCenterPoint();

        // Center alignment guides
        const centerDistX = Math.abs(movingCenter.x - objCenter.x);
        const centerDistY = Math.abs(movingCenter.y - objCenter.y);

        if (centerDistX < snapTolerance) {
          const line = createAlignmentLine(
            objCenter.x,
            0,
            objCenter.x,
            canvasHeight
          );
          if (line) guides.push(line);
        }

        if (centerDistY < snapTolerance) {
          const line = createAlignmentLine(
            0,
            objCenter.y,
            canvasWidth,
            objCenter.y
          );
          if (line) guides.push(line);
        }

        // Edge alignment guides
        const edgeTolerance = snapTolerance * 0.8;

        // Left edges
        if (Math.abs(movingBounds.left - objBounds.left) < edgeTolerance) {
          const line = createAlignmentLine(
            objBounds.left,
            0,
            objBounds.left,
            canvasHeight
          );
          if (line) guides.push(line);
        }

        // Right edges
        const movingRight = movingBounds.left + movingBounds.width;
        const objRight = objBounds.left + objBounds.width;
        if (Math.abs(movingRight - objRight) < edgeTolerance) {
          const line = createAlignmentLine(objRight, 0, objRight, canvasHeight);
          if (line) guides.push(line);
        }

        // Top edges
        if (Math.abs(movingBounds.top - objBounds.top) < edgeTolerance) {
          const line = createAlignmentLine(
            0,
            objBounds.top,
            canvasWidth,
            objBounds.top
          );
          if (line) guides.push(line);
        }

        // Bottom edges
        const movingBottom = movingBounds.top + movingBounds.height;
        const objBottom = objBounds.top + objBounds.height;
        if (Math.abs(movingBottom - objBottom) < edgeTolerance) {
          const line = createAlignmentLine(
            0,
            objBottom,
            canvasWidth,
            objBottom
          );
          if (line) guides.push(line);
        }
      });

      // Add canvas center guides
      const canvasCenterX = canvasWidth / 2;
      const canvasCenterY = canvasHeight / 2;

      if (Math.abs(movingCenter.x - canvasCenterX) < snapTolerance) {
        const line = createAlignmentLine(
          canvasCenterX,
          0,
          canvasCenterX,
          canvasHeight
        );
        if (line) guides.push(line);
      }

      if (Math.abs(movingCenter.y - canvasCenterY) < snapTolerance) {
        const line = createAlignmentLine(
          0,
          canvasCenterY,
          canvasWidth,
          canvasCenterY
        );
        if (line) guides.push(line);
      }

      // Add guides to canvas
      guides.forEach((line) => {
        canvas.add(line);
        canvas.bringToFront(line);
      });

      alignmentLinesRef.current = guides;

      // Only render if we have guides to show
      if (guides.length > 0) {
        canvas.renderAll();
      }

      // Auto-clear guides after a short delay to handle cases where events don't fire
      if (isDraggingRef.current) {
        if (guideTimeoutRef.current) {
          clearTimeout(guideTimeoutRef.current);
        }
        guideTimeoutRef.current = setTimeout(() => {
          if (!isDraggingRef.current) {
            forceClearAlignmentLines();
            canvas.renderAll();
          }
        }, 100);
      }
    },
    [
      canvas,
      showAlignmentGuides,
      snapToObjects,
      snapTolerance,
      clearAlignmentLines,
      createAlignmentLine,
      forceClearAlignmentLines,
    ]
  );

  useEffect(() => {
    if (!canvas || !fabric) return;

    // Set up periodic cleanup to ensure alignment lines never get stuck
    cleanupIntervalRef.current = setInterval(() => {
      if (!isDraggingRef.current) {
        // Only force clear if there are orphaned alignment lines
        const allObjects = canvas.getObjects();
        const hasAlignmentLines = allObjects.some(
          (obj: any) => obj.id === "alignment-line"
        );
        if (hasAlignmentLines) {
          forceClearAlignmentLines();
          canvas.renderAll();
        }
      }
    }, 500); // Check every 500ms

    const handleMouseDown = () => {
      isDraggingRef.current = true;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      // Force clear alignment guides when mouse is released
      setTimeout(() => {
        forceClearAlignmentLines();
        canvas.renderAll();
      }, 50);
    };

    const handleObjectMoving = (e: any) => {
      if (showAlignmentGuides && snapToObjects) {
        isDraggingRef.current = true;
        // Remove throttling to ensure more reliable guide updates
        drawAlignmentGuides(e.target);
      }
    };

    const handleObjectModified = () => {
      isDraggingRef.current = false;
      forceClearAlignmentLines();
      canvas.renderAll();
    };

    const handleSelectionCleared = () => {
      isDraggingRef.current = false;
      forceClearAlignmentLines();
      canvas.renderAll();
    };

    const handleSelectionCreated = () => {
      forceClearAlignmentLines();
      canvas.renderAll();
    };

    const handlePathCreated = () => {
      forceClearAlignmentLines();
      canvas.renderAll();
    };

    const handleObjectAdded = () => {
      forceClearAlignmentLines();
      canvas.renderAll();
    };

    const handleObjectRemoved = () => {
      forceClearAlignmentLines();
      canvas.renderAll();
    };

    // Add event listeners
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("object:moving", handleObjectMoving);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("selection:cleared", handleSelectionCleared);
    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("path:created", handlePathCreated);
    canvas.on("object:added", handleObjectAdded);
    canvas.on("object:removed", handleObjectRemoved);

    return () => {
      // Cleanup
      forceClearAlignmentLines();

      // Clear interval
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
        cleanupIntervalRef.current = null;
      }

      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:up", handleMouseUp);
      canvas.off("object:moving", handleObjectMoving);
      canvas.off("object:modified", handleObjectModified);
      canvas.off("selection:cleared", handleSelectionCleared);
      canvas.off("selection:created", handleSelectionCreated);
      canvas.off("path:created", handlePathCreated);
      canvas.off("object:added", handleObjectAdded);
      canvas.off("object:removed", handleObjectRemoved);
    };
  }, [
    canvas,
    fabric,
    showAlignmentGuides,
    snapToObjects,
    snapTolerance,
    alignmentGuideColor,
    drawAlignmentGuides,
    clearAlignmentLines,
    forceClearAlignmentLines,
  ]);

  // This component doesn't render anything visible itself
  return null;
};

export default AlignmentGuides;

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect } from "react";

interface LineVisibilityEnhancerProps {
  canvas: any;
  fabric: any;
}

const LineVisibilityEnhancer: React.FC<LineVisibilityEnhancerProps> = ({
  canvas,
  fabric,
}) => {
  useEffect(() => {
    if (!canvas || !fabric) return;

    // Enhanced selection visual feedback for thin lines
    const enhanceLineVisibility = () => {
      const handleSelectionCreated = (e: any) => {
        const activeObject = e.selected?.[0];
        if (!activeObject) return;

        // For thin lines, add a visual highlight
        if (activeObject.isType && activeObject.isType("line")) {
          const strokeWidth = activeObject.strokeWidth || 1;
          if (strokeWidth <= 3) {
            // Thin lines
            // Add a temporary highlight overlay
            const lineCoords = activeObject.calcLinePoints();
            const highlight = new fabric.Line(
              [lineCoords.x1, lineCoords.y1, lineCoords.x2, lineCoords.y2],
              {
                left: activeObject.left,
                top: activeObject.top,
                stroke: "rgba(25, 118, 210, 0.3)", // Semi-transparent blue
                strokeWidth: Math.max(strokeWidth + 6, 8),
                selectable: false,
                evented: false,
                excludeFromExport: true,
                id: "line-highlight",
                opacity: 0.6,
              }
            );

            canvas.add(highlight);
            canvas.sendToBack(highlight);
            canvas.renderAll();

            // Store reference for cleanup
            activeObject._highlight = highlight;
          }
        }

        // For groups containing thin lines
        if (activeObject.isType && activeObject.isType("group")) {
          const groupObjects = activeObject.getObjects();
          const thinLines = groupObjects.filter(
            (obj: any) =>
              obj.isType && obj.isType("line") && (obj.strokeWidth || 1) <= 3
          );

          if (thinLines.length > 0) {
            // Add highlights for thin lines in group
            const highlights: any[] = [];
            thinLines.forEach((line: any) => {
              const strokeWidth = line.strokeWidth || 1;
              const lineCoords = line.calcLinePoints
                ? line.calcLinePoints()
                : {
                    x1: line.x1 || 0,
                    y1: line.y1 || 0,
                    x2: line.x2 || 100,
                    y2: line.y2 || 0,
                  };

              const highlight = new fabric.Line(
                [lineCoords.x1, lineCoords.y1, lineCoords.x2, lineCoords.y2],
                {
                  left: line.left + activeObject.left,
                  top: line.top + activeObject.top,
                  stroke: "rgba(255, 152, 0, 0.4)", // Semi-transparent orange for group lines
                  strokeWidth: Math.max(strokeWidth + 4, 6),
                  selectable: false,
                  evented: false,
                  excludeFromExport: true,
                  id: "group-line-highlight",
                  opacity: 0.5,
                }
              );

              canvas.add(highlight);
              canvas.sendToBack(highlight);
              highlights.push(highlight);
            });

            // Store references for cleanup
            activeObject._groupHighlights = highlights;
            canvas.renderAll();
          }
        }
      };

      const handleSelectionCleared = () => {
        // Remove all highlights when selection is cleared
        const highlights = canvas
          .getObjects()
          .filter(
            (obj: any) =>
              obj.id === "line-highlight" || obj.id === "group-line-highlight"
          );

        highlights.forEach((highlight: any) => {
          canvas.remove(highlight);
        });

        // Clean up references
        canvas.getObjects().forEach((obj: any) => {
          if (obj._highlight) {
            delete obj._highlight;
          }
          if (obj._groupHighlights) {
            delete obj._groupHighlights;
          }
        });

        canvas.renderAll();
      };

      const handleSelectionUpdated = (e: any) => {
        // Clear previous highlights first
        handleSelectionCleared();
        // Add new highlights
        handleSelectionCreated(e);
      };

      // Mouse hover effects for better line visibility
      const handleMouseMove = (e: any) => {
        const target = canvas.findTarget(e.e);

        // Change cursor for thin lines
        if (target && target.isType && target.isType("line")) {
          const strokeWidth = target.strokeWidth || 1;
          if (strokeWidth <= 3) {
            canvas.setCursor("pointer");

            // Optional: Add temporary hover highlight
            if (!target._hoverHighlight) {
              const lineCoords = target.calcLinePoints();
              const hoverHighlight = new fabric.Line(
                [lineCoords.x1, lineCoords.y1, lineCoords.x2, lineCoords.y2],
                {
                  left: target.left,
                  top: target.top,
                  stroke: "rgba(25, 118, 210, 0.2)",
                  strokeWidth: Math.max(strokeWidth + 4, 6),
                  selectable: false,
                  evented: false,
                  excludeFromExport: true,
                  id: "line-hover-highlight",
                  opacity: 0.4,
                }
              );

              canvas.add(hoverHighlight);
              canvas.sendToBack(hoverHighlight);
              target._hoverHighlight = hoverHighlight;
              canvas.renderAll();

              // Remove hover highlight after a delay
              setTimeout(() => {
                if (
                  target._hoverHighlight &&
                  canvas.contains(target._hoverHighlight)
                ) {
                  canvas.remove(target._hoverHighlight);
                  delete target._hoverHighlight;
                  canvas.renderAll();
                }
              }, 1500);
            }
          }
        }
      };

      // Add event listeners
      canvas.on("selection:created", handleSelectionCreated);
      canvas.on("selection:updated", handleSelectionUpdated);
      canvas.on("selection:cleared", handleSelectionCleared);
      canvas.on("mouse:move", handleMouseMove);

      return () => {
        // Cleanup
        canvas.off("selection:created", handleSelectionCreated);
        canvas.off("selection:updated", handleSelectionUpdated);
        canvas.off("selection:cleared", handleSelectionCleared);
        canvas.off("mouse:move", handleMouseMove);

        // Remove any remaining highlights
        handleSelectionCleared();
      };
    };

    // Apply enhancements
    const cleanup = enhanceLineVisibility();

    return cleanup;
  }, [canvas, fabric]);

  return null;
};

export default LineVisibilityEnhancer;

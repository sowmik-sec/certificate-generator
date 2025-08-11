/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FabricCanvas, FabricModule } from "@/types/fabric";
import { FabricObject } from "fabric";
import { useCallback, useEffect, useRef } from "react";

interface CanvasComponentProps {
  fabric: FabricModule;
  setCanvas: (canvas: any) => void;
  setSelectedObject: (obj: FabricObject | null) => void;
  snapToObjects?: boolean;
  snapTolerance?: number;
  canvasWidth?: number;
  canvasHeight?: number;
}
const CanvasComponent: React.FC<CanvasComponentProps> = ({
  fabric,
  setCanvas,
  setSelectedObject,
  snapToObjects = true,
  snapTolerance = 10,
  canvasWidth = 800,
  canvasHeight = 566,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const alignmentLinesRef = useRef<any[]>([]);

  const resizeCanvas = useCallback(
    (canvasInstance: FabricCanvas) => {
      if (!containerRef.current || !canvasInstance) return;

      const container = containerRef.current;
      const { width: containerWidth, height: containerHeight } =
        container.getBoundingClientRect();

      // Calculate scale to fit canvas in container with some padding
      const padding = 40; // 20px padding on each side
      const availableWidth = containerWidth - padding;
      const availableHeight = containerHeight - padding;

      const scaleX = availableWidth / canvasWidth;
      const scaleY = availableHeight / canvasHeight;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

      const scaledWidth = canvasWidth * scale;
      const scaledHeight = canvasHeight * scale;

      canvasInstance.setDimensions({
        width: scaledWidth,
        height: scaledHeight,
      });
      canvasInstance.setZoom(scale);
      canvasInstance.renderAll();
    },
    [canvasWidth, canvasHeight]
  );

  useEffect(() => {
    if (!canvasRef.current || !fabric) return;
    const canvasInstance = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "#ffffff",
    });

    canvasInstance.on("selection:created", (e: any) =>
      setSelectedObject(e.selected?.[0] || null)
    );
    canvasInstance.on("selection:updated", (e: any) =>
      setSelectedObject(e.selected?.[0] || null)
    );
    canvasInstance.on("selection:cleared", () => setSelectedObject(null));
    canvasInstance.on("object:modified", () => canvasInstance.renderAll());

    // Snap-to-object guides functionality
    const drawAlignmentLines = (aligningObject: any, canvasObjects: any[]) => {
      const objectCenter = aligningObject.getCenterPoint();
      const objectBounds = aligningObject.getBoundingRect();
      const alignmentLines: any[] = [];

      canvasObjects.forEach((obj: any) => {
        if (
          obj === aligningObject ||
          obj.id === "alignment-line" ||
          obj.id === "grid-line"
        )
          return;

        const objCenter = obj.getCenterPoint();
        const objBounds = obj.getBoundingRect();
        const tolerance = snapTolerance;

        // Vertical alignment lines (center, left, right)
        if (Math.abs(objectCenter.x - objCenter.x) < tolerance) {
          const line = new fabric.Line(
            [
              objCenter.x,
              0,
              objCenter.x,
              canvasInstance.getHeight() / canvasInstance.getZoom(),
            ],
            {
              stroke: "#ff0000",
              strokeWidth: 1,
              strokeDashArray: [5, 5],
              selectable: false,
              evented: false,
              id: "alignment-line",
            }
          );
          alignmentLines.push(line);
          aligningObject.set({ left: objCenter.x });
        }

        // Left edge alignment
        if (Math.abs(objectBounds.left - objBounds.left) < tolerance) {
          const line = new fabric.Line(
            [
              objBounds.left,
              0,
              objBounds.left,
              canvasInstance.getHeight() / canvasInstance.getZoom(),
            ],
            {
              stroke: "#ff0000",
              strokeWidth: 1,
              strokeDashArray: [5, 5],
              selectable: false,
              evented: false,
              id: "alignment-line",
            }
          );
          alignmentLines.push(line);
          const diff = objBounds.left - objectBounds.left;
          aligningObject.set({ left: aligningObject.left + diff });
        }

        // Right edge alignment
        if (
          Math.abs(
            objectBounds.left +
              objectBounds.width -
              (objBounds.left + objBounds.width)
          ) < tolerance
        ) {
          const rightX = objBounds.left + objBounds.width;
          const line = new fabric.Line(
            [
              rightX,
              0,
              rightX,
              canvasInstance.getHeight() / canvasInstance.getZoom(),
            ],
            {
              stroke: "#ff0000",
              strokeWidth: 1,
              strokeDashArray: [5, 5],
              selectable: false,
              evented: false,
              id: "alignment-line",
            }
          );
          alignmentLines.push(line);
          const targetRight = rightX - objectBounds.width;
          const diff = targetRight - objectBounds.left;
          aligningObject.set({ left: aligningObject.left + diff });
        }

        // Horizontal alignment lines (center, top, bottom)
        if (Math.abs(objectCenter.y - objCenter.y) < tolerance) {
          const line = new fabric.Line(
            [
              0,
              objCenter.y,
              canvasInstance.getWidth() / canvasInstance.getZoom(),
              objCenter.y,
            ],
            {
              stroke: "#ff0000",
              strokeWidth: 1,
              strokeDashArray: [5, 5],
              selectable: false,
              evented: false,
              id: "alignment-line",
            }
          );
          alignmentLines.push(line);
          aligningObject.set({ top: objCenter.y });
        }

        // Top edge alignment
        if (Math.abs(objectBounds.top - objBounds.top) < tolerance) {
          const line = new fabric.Line(
            [
              0,
              objBounds.top,
              canvasInstance.getWidth() / canvasInstance.getZoom(),
              objBounds.top,
            ],
            {
              stroke: "#ff0000",
              strokeWidth: 1,
              strokeDashArray: [5, 5],
              selectable: false,
              evented: false,
              id: "alignment-line",
            }
          );
          alignmentLines.push(line);
          const diff = objBounds.top - objectBounds.top;
          aligningObject.set({ top: aligningObject.top + diff });
        }

        // Bottom edge alignment
        if (
          Math.abs(
            objectBounds.top +
              objectBounds.height -
              (objBounds.top + objBounds.height)
          ) < tolerance
        ) {
          const bottomY = objBounds.top + objBounds.height;
          const line = new fabric.Line(
            [
              0,
              bottomY,
              canvasInstance.getWidth() / canvasInstance.getZoom(),
              bottomY,
            ],
            {
              stroke: "#ff0000",
              strokeWidth: 1,
              strokeDashArray: [5, 5],
              selectable: false,
              evented: false,
              id: "alignment-line",
            }
          );
          alignmentLines.push(line);
          const targetBottom = bottomY - objectBounds.height;
          const diff = targetBottom - objectBounds.top;
          aligningObject.set({ top: aligningObject.top + diff });
        }
      });

      return alignmentLines;
    };

    const clearAlignmentLines = () => {
      const lines = canvasInstance
        .getObjects()
        .filter((obj: any) => obj.id === "alignment-line");
      lines.forEach((line: any) => canvasInstance.remove(line));
      alignmentLinesRef.current = [];
    };

    if (snapToObjects) {
      canvasInstance.on("object:moving", (e: any) => {
        clearAlignmentLines();
        const movingObject = e.target;
        const canvasObjects = canvasInstance
          .getObjects()
          .filter(
            (obj: any) =>
              obj !== movingObject &&
              obj.id !== "alignment-line" &&
              obj.id !== "grid-line"
          );

        if (canvasObjects.length > 0) {
          const lines = drawAlignmentLines(movingObject, canvasObjects);
          alignmentLinesRef.current = lines;
          lines.forEach((line) => {
            canvasInstance.add(line);
            canvasInstance.bringToFront(line);
          });
        }

        movingObject.setCoords();
        canvasInstance.renderAll();
      });

      canvasInstance.on("object:modified", () => {
        clearAlignmentLines();
        canvasInstance.renderAll();
      });

      canvasInstance.on("selection:cleared", () => {
        clearAlignmentLines();
        canvasInstance.renderAll();
      });

      canvasInstance.on("selection:created", () => {
        clearAlignmentLines();
        canvasInstance.renderAll();
      });
    }

    // Add double-click event listener for editing text in groups
    canvasInstance.on("mouse:dblclick", (options: any) => {
      const target = options.target;

      if (target && target.isType("group")) {
        const group = target;
        let clickedTextObject = null;

        // Get all text objects in the group
        const textObjects = group
          .getObjects()
          .filter((o: any) => o.isType("textbox"));

        if (textObjects.length > 0) {
          const pointer = canvasInstance.getPointer(options.e);

          // Calculate the group's transformation matrix
          const groupTransform = group.calcTransformMatrix();
          const invertedTransform = fabric.util.invertTransform(groupTransform);
          const localPoint = fabric.util.transformPoint(
            pointer,
            invertedTransform
          );

          // Find the closest text object to the click point
          let minDistance = Infinity;
          let bestMatch = null;

          for (const textObj of textObjects) {
            // Get text object bounds in local coordinates
            const textBounds = {
              left: textObj.left - textObj.width / 2,
              top: textObj.top - textObj.height / 2,
              width: textObj.width,
              height: textObj.height,
            };

            // Check if point is inside text bounds
            if (
              localPoint.x >= textBounds.left &&
              localPoint.x <= textBounds.left + textBounds.width &&
              localPoint.y >= textBounds.top &&
              localPoint.y <= textBounds.top + textBounds.height
            ) {
              clickedTextObject = textObj;
              break;
            }

            // Calculate distance from click point to text center as fallback
            const centerX = textBounds.left + textBounds.width / 2;
            const centerY = textBounds.top + textBounds.height / 2;
            const distance = Math.sqrt(
              Math.pow(localPoint.x - centerX, 2) +
                Math.pow(localPoint.y - centerY, 2)
            );

            if (distance < minDistance) {
              minDistance = distance;
              bestMatch = textObj;
            }
          }

          // If no direct hit, use the closest text object
          if (!clickedTextObject) {
            clickedTextObject = bestMatch || textObjects[0];
          }

          if (clickedTextObject) {
            console.log("Editing text object:", clickedTextObject.text);

            // Store original properties for restoration
            const originalProps = {
              left: group.left,
              top: group.top,
              scaleX: group.scaleX || 1,
              scaleY: group.scaleY || 1,
              angle: group.angle || 0,
            };

            // Store reference to group objects
            const groupObjects = group.getObjects().slice();

            // Ungroup - restore object states and remove group
            group._restoreObjectsState();
            canvasInstance.remove(group);

            // Add individual objects back to canvas
            groupObjects.forEach((obj: any) => {
              canvasInstance.add(obj);
            });

            canvasInstance.renderAll();

            // Set active object and enter editing mode
            canvasInstance.setActiveObject(clickedTextObject);
            clickedTextObject.enterEditing();
            clickedTextObject.selectAll();

            // Handle editing exit
            const handleEditExit = () => {
              console.log("Exiting edit mode, regrouping...");

              try {
                // Remove individual objects
                groupObjects.forEach((obj: any) => {
                  if (canvasInstance.contains(obj)) {
                    canvasInstance.remove(obj);
                  }
                });

                // Create new group with updated objects
                const newGroup = new fabric.Group(groupObjects, originalProps);
                canvasInstance.add(newGroup);
                canvasInstance.setActiveObject(newGroup);
                canvasInstance.renderAll();
              } catch (error) {
                console.error("Error during regrouping:", error);
                // Fallback: add objects back individually if grouping fails
                groupObjects.forEach((obj: any) => {
                  if (!canvasInstance.contains(obj)) {
                    canvasInstance.add(obj);
                  }
                });
                canvasInstance.renderAll();
              }
            };

            clickedTextObject.once("editing:exited", handleEditExit);
          }
        }
      }
    });

    setCanvas(canvasInstance);

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas(canvasInstance);
    });
    const currentContainer = containerRef.current; // Copy ref value to a local variable

    if (currentContainer) {
      resizeObserver.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        resizeObserver.unobserve(currentContainer);
      }
      canvasInstance.dispose();
    };
  }, [
    fabric,
    setCanvas,
    setSelectedObject,
    resizeCanvas,
    snapTolerance,
    snapToObjects,
    canvasWidth,
    canvasHeight,
  ]);

  // Handle canvas size changes - re-center when dimensions change
  useEffect(() => {
    if (canvasRef.current && fabric) {
      const canvasInstance = fabric.getCanvasFromElement?.(canvasRef.current);
      if (canvasInstance) {
        resizeCanvas(canvasInstance);
      }
    }
  }, [canvasWidth, canvasHeight, fabric, resizeCanvas]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    >
      <div className="shadow-xl bg-white rounded-lg overflow-hidden border border-gray-200 relative transition-all duration-300 ease-in-out">
        <canvas ref={canvasRef} className="display-block" />
      </div>
    </div>
  );
};

export default CanvasComponent;

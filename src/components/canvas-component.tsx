/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FabricCanvas, FabricModule } from "@/types/fabric";
import { FabricObject } from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";
import { safeCanvasRender, safeCanvasOperation } from "@/lib/utils";

interface CanvasComponentProps {
  fabric: FabricModule;
  setCanvas: (canvas: any) => void;
  setSelectedObject: (obj: FabricObject | null) => void;
  canvasWidth?: number;
  canvasHeight?: number;
}
const CanvasComponent: React.FC<CanvasComponentProps> = ({
  fabric,
  setCanvas,
  setSelectedObject,
  canvasWidth = 800,
  canvasHeight = 566,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Note: This component could use setHasCanvasObjects from useEditorStore for tracking
  // canvas objects, but it's handled in the main page component instead

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

      // Use safe canvas operation for rendering
      safeCanvasOperation(canvasInstance, () => {
        canvasInstance.renderAll();
      });
    },
    [canvasWidth, canvasHeight]
  );

  useEffect(() => {
    if (!canvasRef.current || !fabric || !isClient) return;
    const canvasInstance = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "#ffffff",
      // Improve performance and reduce jitter
      enableRetinaScaling: false,
      stateful: true,
      renderOnAddRemove: false,
    });

    // Enhanced selection handling
    canvasInstance.on("selection:created", (e: any) => {
      const selected = e.selected?.[0] || null;
      setSelectedObject(selected);
      safeCanvasOperation(canvasInstance, () => canvasInstance.renderAll());
    });

    canvasInstance.on("selection:updated", (e: any) => {
      const selected = e.selected?.[0] || null;
      setSelectedObject(selected);
      safeCanvasOperation(canvasInstance, () => canvasInstance.renderAll());
    });

    canvasInstance.on("selection:cleared", () => {
      setSelectedObject(null);
      safeCanvasOperation(canvasInstance, () => canvasInstance.renderAll());
    });

    // Improved object modification handling
    canvasInstance.on("object:modified", (e: any) => {
      const obj = e.target;
      if (obj) {
        obj.setCoords();
      }
      safeCanvasOperation(canvasInstance, () => canvasInstance.renderAll());
    });

    // Smooth object movement
    canvasInstance.on("object:moving", (e: any) => {
      const obj = e.target;
      if (obj) {
        // Prevent rapid coordinate updates that cause shaking
        obj.setCoords();
      }
    });

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

            safeCanvasOperation(canvasInstance, () =>
              canvasInstance.renderAll()
            );

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
                safeCanvasOperation(canvasInstance, () =>
                  canvasInstance.renderAll()
                );
              } catch (error) {
                console.error("Error during regrouping:", error);
                // Fallback: add objects back individually if grouping fails
                groupObjects.forEach((obj: any) => {
                  if (!canvasInstance.contains(obj)) {
                    canvasInstance.add(obj);
                  }
                });
                safeCanvasOperation(canvasInstance, () =>
                  canvasInstance.renderAll()
                );
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
    const currentContainer = containerRef.current;

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
    canvasWidth,
    canvasHeight,
    isClient,
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

  // Prevent hydration issues by only rendering canvas on client
  if (!isClient) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      >
        <div className="shadow-xl bg-white rounded-lg overflow-hidden border border-gray-200 relative transition-all duration-300 ease-in-out">
          <div className="w-full h-[566px] flex items-center justify-center text-gray-500">
            Loading Canvas...
          </div>
        </div>
      </div>
    );
  }

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

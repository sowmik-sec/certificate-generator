/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FabricCanvas, FabricModule } from "@/types/fabric";
import { FabricObject } from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";
import { safeCanvasOperation } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useToolsStore } from "@/stores/useToolsStore";
import DrawingCursor from "./drawing-cursor";

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

  // Access tools store for drawing cursor functionality
  const {
    isDrawing,
    brushColor,
    brushSize,
    showDrawingCursor,
    setIsMouseOverCanvas,
    applyDrawingSettings,
  } = useToolsStore();

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

      // Calculate available space with some padding for better UX
      const availableWidth = containerWidth - 20; // Small margin for breathing room
      const availableHeight = containerHeight - 20;

      // Calculate scale to fit canvas in available space
      const scaleX = availableWidth / canvasWidth;
      const scaleY = availableHeight / canvasHeight;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond original size

      const scaledWidth = canvasWidth * scale;
      const scaledHeight = canvasHeight * scale;

      // Set canvas dimensions to the scaled size
      canvasInstance.setDimensions({
        width: scaledWidth,
        height: scaledHeight,
      });
      canvasInstance.setZoom(scale);

      // Update canvas element style
      if (canvasRef.current) {
        canvasRef.current.style.width = `${scaledWidth}px`;
        canvasRef.current.style.height = `${scaledHeight}px`;
      }

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
      // Enable retina scaling for high-quality exports on mobile
      enableRetinaScaling: true,
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

    // Add double-click event listener for editing text in groups (including sticky notes)
    canvasInstance.on("mouse:dblclick", (options: any) => {
      console.log("Double-click detected on:", options.target);
      const target = options.target;

      // Handle double-click on groups (sticky notes and tables)
      if (target && target.isType("group")) {
        const group = target;
        console.log("Group detected:", group.type, group._stickyNote);
        let clickedTextObject = null;

        // Special handling for sticky notes
        if (group._stickyNote || group.type === "sticky-note") {
          console.log("Processing sticky note double-click");
          // For sticky notes, find the text object directly
          const textObjects = group
            .getObjects()
            .filter((o: any) => o.isType("textbox") || o._stickyNoteText);

          console.log("Found text objects:", textObjects.length);
          if (textObjects.length > 0) {
            clickedTextObject = textObjects[0]; // Take the first (and likely only) text object
            console.log(
              "Selected text object for editing:",
              clickedTextObject.text
            );
          }
        } else {
          // Original logic for other groups (like tables)
          const textObjects = group
            .getObjects()
            .filter((o: any) => o.isType("textbox"));

          if (textObjects.length > 0) {
            const pointer = canvasInstance.getPointer(options.e);

            // Calculate the group's transformation matrix
            const groupTransform = group.calcTransformMatrix();
            const invertedTransform =
              fabric.util.invertTransform(groupTransform);
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
          }
        }

        if (clickedTextObject) {
          console.log("Starting text editing for:", clickedTextObject.text);

          // Prevent event bubbling to stop other handlers
          options.e.preventDefault();
          options.e.stopPropagation();

          // Store original properties for restoration
          const originalProps = {
            left: group.left,
            top: group.top,
            scaleX: group.scaleX || 1,
            scaleY: group.scaleY || 1,
            angle: group.angle || 0,
            // Keep sticky note properties
            _stickyNote: group._stickyNote,
            type: group.type,
          };

          // Store reference to group objects
          const groupObjects = group.getObjects().slice();

          // Ungroup - restore object states and remove group
          group._restoreObjectsState();
          canvasInstance.remove(group);

          // Add individual objects back to canvas with proper positioning
          groupObjects.forEach((obj: any) => {
            // For sticky notes, maintain the relative positioning
            if (group._stickyNote || group.type === "sticky-note") {
              // Convert group coordinates to canvas coordinates
              const groupCenter = { x: group.left, y: group.top };
              // For objects with center origin, the positioning is simpler
              obj.set({
                left: groupCenter.x + (obj.left || 0),
                top: groupCenter.y + (obj.top || 0),
              });
            }
            canvasInstance.add(obj);
          });

          safeCanvasOperation(canvasInstance, () => canvasInstance.renderAll());

          // Set active object and enter editing mode
          canvasInstance.setActiveObject(clickedTextObject);

          // Force immediate editing
          setTimeout(() => {
            // Ensure styles are initialized before editing
            if (!clickedTextObject.styles) {
              clickedTextObject.styles = {};
            }
            clickedTextObject.enterEditing();
            // Don't select all - let natural word selection happen on double-click
            console.log("Text editing mode entered");
          }, 50);

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

              // For sticky notes, reset positions relative to center
              if (
                originalProps._stickyNote ||
                originalProps.type === "sticky-note"
              ) {
                // Reset object positions to be relative to group center
                groupObjects.forEach((obj: any) => {
                  if (obj._stickyNoteText || obj.isType("textbox")) {
                    // Keep text centered with slight upward offset for visual balance
                    obj.set({
                      left: 0, // Center horizontally
                      top: -20, // Slightly above center
                      originX: "center",
                      originY: "center",
                    });
                  } else {
                    // Background stays centered
                    obj.set({
                      left: 0,
                      top: 0,
                      originX: "center",
                      originY: "center",
                    });
                  }
                });
              }

              // Create new group with updated objects
              const newGroup = new fabric.Group(groupObjects, originalProps);

              // Restore custom properties
              newGroup._stickyNote = originalProps._stickyNote;
              newGroup.type = originalProps.type;

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
    });

    // Add mouse enter/leave handlers for drawing cursor
    canvasInstance.on("mouse:over", () => {
      setIsMouseOverCanvas(true);
      applyDrawingSettings(canvasInstance);
    });

    canvasInstance.on("mouse:out", () => {
      setIsMouseOverCanvas(false);
      applyDrawingSettings(canvasInstance);
    });

    // Add listeners for drawing path events
    canvasInstance.on("path:created", (e: any) => {
      console.log("[PathCreated] New drawing path added:", e.path);
      console.log(
        "[PathCreated] Total objects:",
        canvasInstance.getObjects().length
      );
    });

    canvasInstance.on("object:added", (e: any) => {
      if (e.target.type === "path") {
        console.log("[ObjectAdded] Drawing path added to canvas");
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
    setIsMouseOverCanvas,
    applyDrawingSettings,
    // Removed isDrawing from here to prevent canvas recreation
  ]);

  // Separate useEffect for handling drawing mode changes
  useEffect(() => {
    const currentCanvas =
      canvasRef.current && fabric?.getCanvasFromElement?.(canvasRef.current);
    if (currentCanvas) {
      console.log("[DrawingMode] Changed to:", isDrawing);
      applyDrawingSettings(currentCanvas);
    }
  }, [isDrawing, fabric, applyDrawingSettings]);

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
      <div ref={containerRef} className="w-full h-full">
        <Card
          className="w-full h-full shadow-xl overflow-hidden border border-gray-200 relative transition-all duration-300 ease-in-out bg-transparent"
          style={{ padding: 0, margin: 0 }}
        >
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Loading Canvas...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <DrawingCursor
        color={brushColor}
        size={brushSize}
        isVisible={showDrawingCursor}
      />
      <div ref={containerRef} className="w-full h-full">
        <Card
          className={`w-full h-full shadow-xl overflow-hidden border border-gray-200 relative transition-all duration-300 ease-in-out flex items-center justify-center bg-transparent canvas-container ${
            isDrawing ? "drawing-active" : ""
          }`}
          style={{
            padding: 0,
            margin: 0,
          }}
        >
          <canvas
            ref={canvasRef}
            className="shadow-md"
            style={{
              cursor: isDrawing ? "none" : "default",
            }}
          />
        </Card>
      </div>
    </>
  );
};

export default CanvasComponent;

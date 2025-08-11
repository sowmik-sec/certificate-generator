/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FabricCanvas, FabricModule } from "@/app/page";
import { FabricObject } from "fabric";
import { useCallback, useEffect, useRef } from "react";

interface CanvasComponentProps {
  fabric: FabricModule;
  setCanvas: (canvas: any) => void;
  setSelectedObject: (obj: FabricObject | null) => void;
}
const CanvasComponent: React.FC<CanvasComponentProps> = ({
  fabric,
  setCanvas,
  setSelectedObject,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const resizeCanvas = useCallback((canvasInstance: FabricCanvas) => {
    if (!containerRef.current || !canvasInstance) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const scale = Math.min(width / 800, height / 566);
    canvasInstance.setDimensions({ width: 800 * scale, height: 566 * scale });
    canvasInstance.setZoom(scale);
    canvasInstance.renderAll();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !fabric) return;
    const canvasInstance = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 566,
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

    // Add double-click event listener for editing text in groups
    canvasInstance.on("mouse:dblclick", (options: any) => {
      const target = options.target;

      if (target && target.isType("group")) {
        const group = target;
        let clickedTextObject = null;
        
        // Get all text objects in the group
        const textObjects = group.getObjects().filter((o: any) => o.isType("textbox"));
        
        if (textObjects.length > 0) {
          const pointer = canvasInstance.getPointer(options.e);
          
          // Calculate the group's transformation matrix
          const groupTransform = group.calcTransformMatrix();
          const invertedTransform = fabric.util.invertTransform(groupTransform);
          const localPoint = fabric.util.transformPoint(pointer, invertedTransform);
          
          // Find the closest text object to the click point
          let minDistance = Infinity;
          let bestMatch = null;
          
          for (const textObj of textObjects) {
            // Get text object bounds in local coordinates
            const textBounds = {
              left: textObj.left - (textObj.width / 2),
              top: textObj.top - (textObj.height / 2),
              width: textObj.width,
              height: textObj.height
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
              Math.pow(localPoint.x - centerX, 2) + Math.pow(localPoint.y - centerY, 2)
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
            console.log('Editing text object:', clickedTextObject.text);
            
            // Store original properties for restoration
            const originalProps = {
              left: group.left,
              top: group.top,
              scaleX: group.scaleX || 1,
              scaleY: group.scaleY || 1,
              angle: group.angle || 0
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
              console.log('Exiting edit mode, regrouping...');
              
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
                console.error('Error during regrouping:', error);
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
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      canvasInstance.dispose();
    };
  }, [fabric, setCanvas, setSelectedObject, resizeCanvas]);

  return (
    <div ref={containerRef} className="w-full h-full shadow-lg">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CanvasComponent;

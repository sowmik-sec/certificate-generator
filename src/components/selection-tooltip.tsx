/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useCallback } from "react";
import { Lock, Unlock, Trash2, MoreHorizontal, CopyPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SelectionTooltipProps {
  canvas: any;
  fabric: any;
  selectedObject: any;
  position?: { x: number; y: number };
  onHide?: () => void;
}

const SelectionTooltip: React.FC<SelectionTooltipProps> = ({
  canvas,
  fabric,
  selectedObject,
  position,
  onHide,
}) => {
  const [tooltipState, setTooltipState] = useState({
    visible: false,
    x: 0,
    y: 0,
    object: null as any,
  });

  const updateTooltipPosition = useCallback(
    (obj: any) => {
      if (!obj || !canvas) return;

      // If position is provided from parent, use it
      if (position) {
        setTooltipState({
          visible: true,
          x: position.x,
          y: position.y,
          object: obj,
        });
        return;
      }

      const objBounds = obj.getBoundingRect();
      const canvasContainer = canvas.getElement().parentNode;
      const containerRect = canvasContainer.getBoundingClientRect();
      const zoom = canvas.getZoom();

      // Calculate position above the object
      const x =
        containerRect.left + (objBounds.left + objBounds.width / 2) * zoom;
      const y = containerRect.top + objBounds.top * zoom - 10; // 10px above

      setTooltipState({
        visible: true,
        x,
        y,
        object: obj,
      });
    },
    [canvas, position]
  );

  const hideTooltip = useCallback(() => {
    if (onHide) {
      onHide();
    } else {
      setTooltipState((prev) => ({ ...prev, visible: false }));
    }
  }, [onHide]);

  useEffect(() => {
    // Only handle canvas events if position is not provided from parent
    if (position) {
      // Update tooltip state with provided position and selected object
      if (selectedObject && !selectedObject.excludeFromExport) {
        setTooltipState({
          visible: true,
          x: position.x,
          y: position.y,
          object: selectedObject,
        });
      }
      return;
    }

    if (!canvas || !fabric) return;

    const handleSelectionCreated = (e: any) => {
      const obj = e.selected?.[0];
      if (obj && !obj.excludeFromExport) {
        setTimeout(() => updateTooltipPosition(obj), 100); // Delay to ensure object is positioned
      }
    };

    const handleSelectionUpdated = (e: any) => {
      const obj = e.selected?.[0];
      if (obj && !obj.excludeFromExport) {
        setTimeout(() => updateTooltipPosition(obj), 100);
      }
    };

    const handleSelectionCleared = () => {
      hideTooltip();
    };

    const handleObjectModified = () => {
      if (selectedObject && !selectedObject.excludeFromExport) {
        setTimeout(() => updateTooltipPosition(selectedObject), 100);
      }
    };

    // Handle canvas panning/zooming
    const handleCanvasMove = () => {
      if (selectedObject && !selectedObject.excludeFromExport) {
        updateTooltipPosition(selectedObject);
      }
    };

    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionUpdated);
    canvas.on("selection:cleared", handleSelectionCleared);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("path:created", handleCanvasMove);

    return () => {
      canvas.off("selection:created", handleSelectionCreated);
      canvas.off("selection:updated", handleSelectionUpdated);
      canvas.off("selection:cleared", handleSelectionCleared);
      canvas.off("object:modified", handleObjectModified);
      canvas.off("path:created", handleCanvasMove);
    };
  }, [
    canvas,
    fabric,
    selectedObject,
    updateTooltipPosition,
    hideTooltip,
    position,
  ]);

  const handleLockToggle = () => {
    const targetObject = position ? selectedObject : tooltipState.object;
    if (!targetObject || !canvas) return;

    const isLocked = targetObject.lockMovementX || targetObject.lockMovementY;

    // Toggle lock state with proper fabric.js properties
    targetObject.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      lockRotation: !isLocked,
      selectable: true, // Keep selectable so user can still unlock it
      evented: true, // Keep events enabled for selection
    });

    // Update object coordinates and render
    targetObject.setCoords();
    canvas.renderAll();

    // Update tooltip position if using internal state
    if (!position) {
      setTimeout(() => updateTooltipPosition(targetObject), 100);
    }
  };

  const handleDuplicate = () => {
    const targetObject = position ? selectedObject : tooltipState.object;
    if (!targetObject || !canvas || !fabric) return;

    // Use the same robust duplication logic as the context menu
    const createSafeCopy = (obj: any) => {
      const safeCopy: any = {
        type: obj.type,
        left: obj.left || 0,
        top: obj.top || 0,
        width: obj.width,
        height: obj.height,
        scaleX: obj.scaleX || 1,
        scaleY: obj.scaleY || 1,
        angle: obj.angle || 0,
        opacity: obj.opacity || 1,
        visible: obj.visible !== false,
        flipX: obj.flipX || false,
        flipY: obj.flipY || false,
        skewX: obj.skewX || 0,
        skewY: obj.skewY || 0,
      };

      // Handle different object types
      switch (obj.type) {
        case "textbox":
        case "text":
          safeCopy.text = obj.text || "Text";
          safeCopy.fontSize = obj.fontSize || 20;
          safeCopy.fontFamily = obj.fontFamily || "Arial";
          safeCopy.fontWeight = obj.fontWeight || "normal";
          safeCopy.fontStyle = obj.fontStyle || "normal";
          safeCopy.fill = obj.fill || "#000000";
          safeCopy.textAlign = obj.textAlign || "left";
          safeCopy.lineHeight = obj.lineHeight || 1.16;
          if (obj.type === "textbox") {
            safeCopy.width = obj.width || 200;
          }
          break;

        case "rect":
        case "triangle":
        case "circle":
        case "ellipse":
          safeCopy.fill = obj.fill || "#000000";
          safeCopy.stroke = obj.stroke;
          safeCopy.strokeWidth = obj.strokeWidth || 1;
          if (obj.type === "circle") {
            safeCopy.radius = obj.radius || 50;
          }
          if (obj.type === "ellipse") {
            safeCopy.rx = obj.rx || 50;
            safeCopy.ry = obj.ry || 30;
          }
          break;

        case "line":
          safeCopy.x1 = obj.x1 || 0;
          safeCopy.y1 = obj.y1 || 0;
          safeCopy.x2 = obj.x2 || 100;
          safeCopy.y2 = obj.y2 || 0;
          safeCopy.stroke = obj.stroke || "#000000";
          safeCopy.strokeWidth = obj.strokeWidth || 1;
          safeCopy.strokeDashArray = obj.strokeDashArray;
          break;

        case "group":
          safeCopy.objects = [];
          if (obj.getObjects) {
            obj.getObjects().forEach((subObj: any) => {
              safeCopy.objects.push(createSafeCopy(subObj));
            });
          }
          break;
      }

      return safeCopy;
    };

    const createFabricObject = (objData: any) => {
      const baseProps = {
        left: (objData.left || 0) + 20,
        top: (objData.top || 0) + 20,
        scaleX: objData.scaleX || 1,
        scaleY: objData.scaleY || 1,
        angle: objData.angle || 0,
        opacity: objData.opacity || 1,
        flipX: objData.flipX || false,
        flipY: objData.flipY || false,
        skewX: objData.skewX || 0,
        skewY: objData.skewY || 0,
      };

      let fabricObj;

      switch (objData.type) {
        case "textbox":
          fabricObj = new fabric.Textbox(objData.text || "Text", {
            ...baseProps,
            width: objData.width || 200,
            fontSize: objData.fontSize || 20,
            fontFamily: objData.fontFamily || "Arial",
            fontWeight: objData.fontWeight || "normal",
            fontStyle: objData.fontStyle || "normal",
            fill: objData.fill || "#000000",
            textAlign: objData.textAlign || "left",
            lineHeight: objData.lineHeight || 1.16,
          });
          break;

        case "text":
          fabricObj = new fabric.Text(objData.text || "Text", {
            ...baseProps,
            fontSize: objData.fontSize || 20,
            fontFamily: objData.fontFamily || "Arial",
            fontWeight: objData.fontWeight || "normal",
            fontStyle: objData.fontStyle || "normal",
            fill: objData.fill || "#000000",
            textAlign: objData.textAlign || "left",
            lineHeight: objData.lineHeight || 1.16,
          });
          break;

        case "rect":
          fabricObj = new fabric.Rect({
            ...baseProps,
            width: objData.width || 100,
            height: objData.height || 100,
            fill: objData.fill || "#000000",
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth || 1,
          });
          break;

        case "circle":
          fabricObj = new fabric.Circle({
            ...baseProps,
            radius: objData.radius || 50,
            fill: objData.fill || "#000000",
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth || 1,
          });
          break;

        case "triangle":
          fabricObj = new fabric.Triangle({
            ...baseProps,
            width: objData.width || 100,
            height: objData.height || 100,
            fill: objData.fill || "#000000",
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth || 1,
          });
          break;

        case "ellipse":
          fabricObj = new fabric.Ellipse({
            ...baseProps,
            rx: objData.rx || 50,
            ry: objData.ry || 30,
            fill: objData.fill || "#000000",
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth || 1,
          });
          break;

        case "line":
          fabricObj = new fabric.Line(
            [
              objData.x1 || 0,
              objData.y1 || 0,
              objData.x2 || 100,
              objData.y2 || 0,
            ],
            {
              ...baseProps,
              stroke: objData.stroke || "#000000",
              strokeWidth: objData.strokeWidth || 1,
              strokeDashArray: objData.strokeDashArray,
            }
          );
          break;

        case "group":
          if (objData.objects && objData.objects.length > 0) {
            const groupObjects = objData.objects
              .map((subObj: any) =>
                createFabricObject({
                  ...subObj,
                  left: subObj.left || 0,
                  top: subObj.top || 0,
                })
              )
              .filter(Boolean);

            if (groupObjects.length > 0) {
              fabricObj = new fabric.Group(groupObjects, baseProps);
            }
          }
          break;

        default:
          // Fallback to rectangle
          fabricObj = new fabric.Rect({
            ...baseProps,
            width: 100,
            height: 100,
            fill: "#cccccc",
          });
      }

      return fabricObj;
    };

    try {
      // Try fabric clone method first for better compatibility
      if (targetObject.clone && typeof targetObject.clone === "function") {
        targetObject.clone((cloned: any) => {
          cloned.set({
            left: cloned.left + 20,
            top: cloned.top + 20,
          });
          canvas.add(cloned);
          canvas.setActiveObject(cloned);
          canvas.renderAll();
        });
      } else {
        // Fallback to safe recreation method
        const safeCopy = createSafeCopy(targetObject);
        const newObj = createFabricObject(safeCopy);
        if (newObj) {
          canvas.add(newObj);
          canvas.setActiveObject(newObj);
          canvas.renderAll();
        }
      }
    } catch (error) {
      console.error("Fabric clone failed, using safe recreation:", error);
      // Fallback to safe recreation method
      try {
        const safeCopy = createSafeCopy(targetObject);
        const newObj = createFabricObject(safeCopy);
        if (newObj) {
          canvas.add(newObj);
          canvas.setActiveObject(newObj);
          canvas.renderAll();
        }
      } catch (fallbackError) {
        console.error("All duplication methods failed:", fallbackError);
      }
    }
  };

  const handleDelete = () => {
    const targetObject = position ? selectedObject : tooltipState.object;
    if (!targetObject) return;

    canvas.remove(targetObject);
    canvas.renderAll();
    hideTooltip();
  };

  const handleShowMore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const targetObject = position ? selectedObject : tooltipState.object;
    if (!targetObject || !canvas) return;

    // Find the CanvaContextMenu trigger element by looking for the canvas wrapper
    const canvasContainer = canvas.getElement().parentNode;
    if (!canvasContainer) return;

    // Find the ContextMenuTrigger element (should be the parent of the canvas container)
    const contextMenuTrigger = canvasContainer.parentNode;
    if (!contextMenuTrigger) return;

    // Calculate position for the context menu
    const targetRect = (e.target as HTMLElement).getBoundingClientRect();

    // Create synthetic right-click event on the ContextMenuTrigger
    const syntheticEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: targetRect.left + targetRect.width / 2,
      clientY: targetRect.bottom + 5,
      button: 2, // Right mouse button
    });

    // Dispatch to the ContextMenuTrigger element
    contextMenuTrigger.dispatchEvent(syntheticEvent);

    // Hide the tooltip
    hideTooltip();
  };
  if (position) {
    // When position is provided, use selectedObject directly
    if (!selectedObject || selectedObject.excludeFromExport) return null;

    const isLocked =
      selectedObject.lockMovementX || selectedObject.lockMovementY;

    return (
      <>
        {/* Overlay to detect clicks outside */}
        <div
          className="fixed inset-0 z-40"
          onClick={hideTooltip}
          style={{ pointerEvents: "auto" }}
        />

        {/* Tooltip */}
        <Card
          className="fixed p-2 z-50 flex flex-row items-center gap-1 bg-white border shadow-lg"
          style={{
            left: position.x - 60, // Center horizontally
            top: position.y - 45, // Position above
            pointerEvents: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Lock/Unlock Button */}
          <Button
            onClick={handleLockToggle}
            variant="ghost"
            size="sm"
            className={`p-2 h-auto ${
              isLocked ? "text-red-600" : "text-gray-600"
            }`}
            title={isLocked ? "Unlock" : "Lock"}
          >
            {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
          </Button>

          {/* Duplicate Button */}
          <Button
            onClick={handleDuplicate}
            variant="ghost"
            size="sm"
            className="p-2 h-auto text-gray-600"
            title="Duplicate"
          >
            <CopyPlus size={16} />
          </Button>

          {/* Delete Button */}
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="sm"
            className="p-2 h-auto text-red-600"
            title="Delete"
          >
            <Trash2 size={16} />
          </Button>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* More Options Button */}
          <Button
            onClick={handleShowMore}
            variant="ghost"
            size="sm"
            className="p-2 h-auto text-gray-600"
            title="More options"
          >
            <MoreHorizontal size={16} />
          </Button>
        </Card>
      </>
    );
  }

  // Original logic for backward compatibility
  if (!tooltipState.visible || !tooltipState.object) return null;

  const isLocked =
    tooltipState.object.lockMovementX || tooltipState.object.lockMovementY;

  return (
    <>
      {/* Overlay to detect clicks outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={hideTooltip}
        style={{ pointerEvents: tooltipState.visible ? "auto" : "none" }}
      />

      {/* Tooltip */}
      <Card
        className="fixed p-2 z-50 flex flex-row items-center gap-1 bg-white border shadow-lg"
        style={{
          left: tooltipState.x - 60, // Center horizontally
          top: tooltipState.y - 45, // Position above
          pointerEvents: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Lock/Unlock Button */}
        <Button
          onClick={handleLockToggle}
          variant="ghost"
          size="sm"
          className={`p-2 h-auto ${
            isLocked ? "text-red-600" : "text-gray-600"
          }`}
          title={isLocked ? "Unlock" : "Lock"}
        >
          {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
        </Button>

        {/* Duplicate Button */}
        <Button
          onClick={handleDuplicate}
          variant="ghost"
          size="sm"
          className="p-2 h-auto text-gray-600"
          title="Duplicate"
        >
          <CopyPlus size={16} />
        </Button>

        {/* Delete Button */}
        <Button
          onClick={handleDelete}
          variant="ghost"
          size="sm"
          className="p-2 h-auto text-red-600"
          title="Delete"
        >
          <Trash2 size={16} />
        </Button>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* More Options Button */}
        <Button
          onClick={handleShowMore}
          variant="ghost"
          size="sm"
          className="p-2 h-auto text-gray-600"
          title="More options"
        >
          <MoreHorizontal size={16} />
        </Button>
      </Card>
    </>
  );
};

export default SelectionTooltip;

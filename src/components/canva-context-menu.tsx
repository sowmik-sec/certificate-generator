/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Move3D,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Link,
  Type,
  Palette,
} from "lucide-react";
import { useCanvasStore } from "@/stores/useCanvasStore";

// Helper function to initialize styles for text objects to prevent removeStyleFromTo errors
const initializeTextStyles = (fabricObj: any) => {
  if (
    fabricObj &&
    (fabricObj.type === "textbox" || fabricObj.type === "text") &&
    !fabricObj.styles
  ) {
    fabricObj.styles = {};
  }
  return fabricObj;
};

interface CanvaContextMenuProps {
  canvas: any;
  children: React.ReactNode;
  selectedObject?: any;
}

const CanvaContextMenu: React.FC<CanvaContextMenuProps> = ({
  canvas,
  children,
  selectedObject,
}) => {
  const [copiedObject, setCopiedObject] = useState<any>(null);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [copiedStyle, setCopiedStyle] = useState<any>(null);

  // Simplified state tracking
  const isDraggingRef = useRef(false);
  const { fabric, setSelectedObject } = useCanvasStore();

  // Ensure we have a consistent selectedObject reference
  const effectiveSelectedObject =
    selectedObject || canvas?.getActiveObject() || null;

  // Simplified context menu state handler with minimal canvas operations
  const handleOpenChangeWithFocusCheck = (open: boolean) => {
    setContextMenuOpen(open);

    // Reset drag state when menu closes
    if (!open) {
      isDraggingRef.current = false;
    }
  }; // Wrapper function to ensure context menu closes for every action
  const createMenuHandler = (handler: () => void) => {
    return () => {
      // Force close context menu immediately
      setContextMenuOpen(false);
      // Execute the actual handler
      handler();
    };
  };

  // Enhanced copy functionality like Canva
  const handleCopy = useCallback(() => {
    if (!effectiveSelectedObject || !fabric) return;

    // Close context menu immediately
    setContextMenuOpen(false);

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

        case "image":
          safeCopy.src = obj.getSrc ? obj.getSrc() : obj.src;
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

    try {
      // Try normal clone first
      effectiveSelectedObject.clone((cloned: any) => {
        setCopiedObject(cloned);
        // Also save to localStorage for persistence
        const safeCopy = createSafeCopy(effectiveSelectedObject);
        localStorage.setItem("copiedObject", JSON.stringify(safeCopy));
      });
    } catch (error) {
      console.log("Normal cloning failed, using safe copy method:", error);
      const safeCopy = createSafeCopy(effectiveSelectedObject);
      setCopiedObject(safeCopy);
      localStorage.setItem("copiedObject", JSON.stringify(safeCopy));
    }
  }, [effectiveSelectedObject, fabric]);

  const handleCopyStyle = useCallback(() => {
    if (!selectedObject) return;

    // Close context menu immediately
    setContextMenuOpen(false);

    const style = {
      fill: selectedObject.fill,
      stroke: selectedObject.stroke,
      strokeWidth: selectedObject.strokeWidth,
      opacity: selectedObject.opacity,
      shadow: selectedObject.shadow,
      fontFamily: selectedObject.fontFamily,
      fontSize: selectedObject.fontSize,
      fontWeight: selectedObject.fontWeight,
      fontStyle: selectedObject.fontStyle,
      textAlign: selectedObject.textAlign,
      lineHeight: selectedObject.lineHeight,
    };

    setCopiedStyle(style);
    localStorage.setItem("copiedStyle", JSON.stringify(style));
  }, [selectedObject]);

  const handleCut = useCallback(() => {
    if (!selectedObject || !canvas) return;

    // Close context menu immediately
    setContextMenuOpen(false);

    // First copy the object
    handleCopy();

    // Then remove it from canvas
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    setSelectedObject(null);
    canvas.renderAll();
  }, [selectedObject, canvas, handleCopy, setSelectedObject]);

  const handlePaste = useCallback(() => {
    if (!canvas || !fabric) return;

    // Close context menu immediately
    setContextMenuOpen(false);

    // Get the copied object (prefer in-memory, fallback to localStorage)
    let effectiveCopied = copiedObject;
    if (!effectiveCopied) {
      try {
        const stored = localStorage.getItem("copiedObject");
        if (stored) {
          effectiveCopied = JSON.parse(stored);
        }
      } catch {
        console.log("No valid copied object found");
        return;
      }
    }

    if (!effectiveCopied) return;

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

      // Initialize styles for text objects to prevent removeStyleFromTo errors
      return initializeTextStyles(fabricObj);
    };

    try {
      // If we have a live fabric object with clone method, use it
      if (
        copiedObject &&
        copiedObject.clone &&
        typeof copiedObject.clone === "function"
      ) {
        copiedObject.clone((cloned: any) => {
          cloned.set({
            left: cloned.left + 20,
            top: cloned.top + 20,
          });
          canvas.add(cloned);
          canvas.setActiveObject(cloned);
          setSelectedObject(cloned);
          canvas.renderAll();
        });
      } else {
        // Use stored data to recreate object
        const newObj = createFabricObject(effectiveCopied);
        if (newObj) {
          canvas.add(newObj);
          canvas.setActiveObject(newObj);
          setSelectedObject(newObj);
          canvas.renderAll();
        }
      }
    } catch (error) {
      console.error("Failed to paste object:", error);
      // Fallback: try to create a simple rectangle if paste fails completely
      try {
        const fallbackObj = new fabric.Rect({
          left: 50,
          top: 50,
          width: 100,
          height: 100,
          fill: "#cccccc",
        });
        canvas.add(fallbackObj);
        canvas.setActiveObject(fallbackObj);
        setSelectedObject(fallbackObj);
        canvas.renderAll();
      } catch (fallbackError) {
        console.error("Even fallback paste failed:", fallbackError);
      }
    }
  }, [copiedObject, canvas, fabric, setSelectedObject]);

  const handlePasteStyle = useCallback(() => {
    if (!selectedObject || !canvas) return;

    let styleToApply = copiedStyle;
    if (!styleToApply) {
      const copiedStyleStr = localStorage.getItem("copiedStyle");
      if (!copiedStyleStr) return;

      try {
        styleToApply = JSON.parse(copiedStyleStr);
      } catch (error) {
        console.error("Error parsing copied style:", error);
        return;
      }
    }

    try {
      // Apply style properties that are relevant to the object type
      const updates: any = {};

      // Common properties for all objects
      if (styleToApply.fill !== undefined && styleToApply.fill !== null) {
        updates.fill = styleToApply.fill;
      }
      if (styleToApply.stroke !== undefined && styleToApply.stroke !== null) {
        updates.stroke = styleToApply.stroke;
      }
      if (
        styleToApply.strokeWidth !== undefined &&
        styleToApply.strokeWidth !== null
      ) {
        updates.strokeWidth = styleToApply.strokeWidth;
      }
      if (styleToApply.opacity !== undefined && styleToApply.opacity !== null) {
        updates.opacity = styleToApply.opacity;
      }

      // Text-specific styles - only apply to text objects
      if (selectedObject.type === "textbox" || selectedObject.type === "text") {
        if (
          styleToApply.fontFamily !== undefined &&
          styleToApply.fontFamily !== null
        ) {
          updates.fontFamily = styleToApply.fontFamily;
        }
        if (
          styleToApply.fontSize !== undefined &&
          styleToApply.fontSize !== null
        ) {
          updates.fontSize = styleToApply.fontSize;
        }
        if (
          styleToApply.fontWeight !== undefined &&
          styleToApply.fontWeight !== null
        ) {
          updates.fontWeight = styleToApply.fontWeight;
        }
        if (
          styleToApply.fontStyle !== undefined &&
          styleToApply.fontStyle !== null
        ) {
          updates.fontStyle = styleToApply.fontStyle;
        }
        if (
          styleToApply.textAlign !== undefined &&
          styleToApply.textAlign !== null
        ) {
          updates.textAlign = styleToApply.textAlign;
        }
        if (
          styleToApply.lineHeight !== undefined &&
          styleToApply.lineHeight !== null
        ) {
          updates.lineHeight = styleToApply.lineHeight;
        }
      }

      // Only apply updates if we have valid properties
      if (Object.keys(updates).length > 0) {
        selectedObject.set(updates);
        canvas.renderAll();
      }
    } catch (error) {
      console.error("Error applying style:", error);
    }
  }, [selectedObject, canvas, copiedStyle]);

  const handleDuplicate = useCallback(() => {
    if (!selectedObject || !canvas || !fabric) return;

    // Close context menu immediately
    setContextMenuOpen(false);

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

      // Initialize styles for text objects to prevent removeStyleFromTo errors
      return initializeTextStyles(fabricObj);
    };

    try {
      // Try fabric clone method first for better compatibility
      if (selectedObject.clone && typeof selectedObject.clone === "function") {
        selectedObject.clone((cloned: any) => {
          cloned.set({
            left: cloned.left + 20,
            top: cloned.top + 20,
          });
          canvas.add(cloned);
          canvas.setActiveObject(cloned);
          setSelectedObject(cloned);
          canvas.renderAll();
        });
      } else {
        // Fallback to safe recreation method
        const safeCopy = createSafeCopy(selectedObject);
        const newObj = createFabricObject(safeCopy);
        if (newObj) {
          canvas.add(newObj);
          canvas.setActiveObject(newObj);
          setSelectedObject(newObj);
          canvas.renderAll();
        }
      }
    } catch (error) {
      console.error("Fabric clone failed, using safe recreation:", error);
      // Fallback to safe recreation method
      try {
        const safeCopy = createSafeCopy(selectedObject);
        const newObj = createFabricObject(safeCopy);
        if (newObj) {
          canvas.add(newObj);
          canvas.setActiveObject(newObj);
          setSelectedObject(newObj);
          canvas.renderAll();
        }
      } catch (fallbackError) {
        console.error("All duplication methods failed:", fallbackError);
        // Last resort: create a simple copy
        try {
          const lastResortObj = new fabric.Rect({
            left: (selectedObject.left || 0) + 20,
            top: (selectedObject.top || 0) + 20,
            width: selectedObject.width || 100,
            height: selectedObject.height || 100,
            fill: selectedObject.fill || "#cccccc",
          });
          canvas.add(lastResortObj);
          canvas.setActiveObject(lastResortObj);
          setSelectedObject(lastResortObj);
          canvas.renderAll();
        } catch {
          console.error("All duplication attempts failed");
        }
      }
    }
  }, [selectedObject, canvas, fabric, setSelectedObject]);

  const handleDelete = useCallback(() => {
    if (!selectedObject || !canvas) return;

    // Close context menu immediately
    setContextMenuOpen(false);

    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    setSelectedObject(null);
    canvas.renderAll();
  }, [selectedObject, canvas, setSelectedObject]);

  const handleLockToggle = useCallback(() => {
    if (!selectedObject || !canvas) return;

    const isLocked =
      selectedObject.lockMovementX || selectedObject.lockMovementY;

    selectedObject.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      lockRotation: !isLocked,
      lockSkewingX: !isLocked,
      lockSkewingY: !isLocked,
      hasControls: isLocked, // Show/hide controls when locked/unlocked
      hasBorders: isLocked, // Show/hide borders when locked/unlocked
    });

    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleVisibilityToggle = useCallback(() => {
    if (!selectedObject || !canvas) return;

    const newVisibility = !selectedObject.visible;
    selectedObject.set("visible", newVisibility);

    // If hiding the object, deselect it
    if (!newVisibility) {
      canvas.discardActiveObject();
      setSelectedObject(null);
    }

    canvas.renderAll();
  }, [selectedObject, canvas, setSelectedObject]);

  const handleBringToFront = useCallback(() => {
    if (!selectedObject || !canvas) return;

    // Close context menu immediately
    setContextMenuOpen(false);

    canvas.bringToFront(selectedObject);
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleSendToBack = useCallback(() => {
    if (!selectedObject || !canvas) return;

    // Close context menu immediately
    setContextMenuOpen(false);

    canvas.sendToBack(selectedObject);
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleBringForward = useCallback(() => {
    if (!selectedObject || !canvas) return;

    // Close context menu immediately
    setContextMenuOpen(false);

    canvas.bringForward(selectedObject);
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleSendBackward = useCallback(() => {
    if (!selectedObject || !canvas) return;

    // Close context menu immediately
    setContextMenuOpen(false);

    canvas.sendBackwards(selectedObject);
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleAlignLeft = useCallback(() => {
    if (!selectedObject || !canvas) return;
    const objectBounds = selectedObject.getBoundingRect();
    const newLeft = selectedObject.left - objectBounds.left;
    selectedObject.set("left", newLeft);
    selectedObject.setCoords();
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleAlignCenter = useCallback(() => {
    if (!selectedObject || !canvas) return;
    const canvasWidth = canvas.getWidth();
    const objectBounds = selectedObject.getBoundingRect();
    const objectCenterX = objectBounds.left + objectBounds.width / 2;
    const canvasCenterX = canvasWidth / 2;
    const offsetX = canvasCenterX - objectCenterX;
    selectedObject.set("left", selectedObject.left + offsetX);
    selectedObject.setCoords();
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleAlignRight = useCallback(() => {
    if (!selectedObject || !canvas) return;
    const canvasWidth = canvas.getWidth();
    const objectBounds = selectedObject.getBoundingRect();
    const objectRightEdge = objectBounds.left + objectBounds.width;
    const offsetX = canvasWidth - objectRightEdge;
    selectedObject.set("left", selectedObject.left + offsetX);
    selectedObject.setCoords();
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleAlignTop = useCallback(() => {
    if (!selectedObject || !canvas) return;
    const objectBounds = selectedObject.getBoundingRect();
    const newTop = selectedObject.top - objectBounds.top;
    selectedObject.set("top", newTop);
    selectedObject.setCoords();
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleAlignMiddle = useCallback(() => {
    if (!selectedObject || !canvas) return;
    const canvasHeight = canvas.getHeight();
    const objectBounds = selectedObject.getBoundingRect();
    const objectCenterY = objectBounds.top + objectBounds.height / 2;
    const canvasCenterY = canvasHeight / 2;
    const offsetY = canvasCenterY - objectCenterY;
    selectedObject.set("top", selectedObject.top + offsetY);
    selectedObject.setCoords();
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleAlignBottom = useCallback(() => {
    if (!selectedObject || !canvas) return;
    const canvasHeight = canvas.getHeight();
    const objectBounds = selectedObject.getBoundingRect();
    const objectBottomEdge = objectBounds.top + objectBounds.height;
    const offsetY = canvasHeight - objectBottomEdge;
    selectedObject.set("top", selectedObject.top + offsetY);
    selectedObject.setCoords();
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleAddLink = useCallback(() => {
    if (!selectedObject || !canvas) return;

    try {
      const url = prompt("Enter URL:", selectedObject.link || "");
      if (url !== null) {
        selectedObject.set("link", url);
        // Visual indication for linked objects
        if (url.trim()) {
          selectedObject.set("stroke", "#0066cc");
          selectedObject.set("strokeWidth", 1);
        } else {
          selectedObject.set("stroke", "");
          selectedObject.set("strokeWidth", 0);
        }
        canvas.renderAll();
      }
    } catch (error) {
      console.error("Error setting link:", error);
    }
  }, [selectedObject, canvas]);

  const handleAltText = useCallback(() => {
    if (!selectedObject || !canvas) return;

    try {
      const alt = prompt("Enter alternative text:", selectedObject.alt || "");
      if (alt !== null) {
        selectedObject.set("alt", alt);
        canvas.renderAll();
      }
    } catch (error) {
      console.error("Error setting alt text:", error);
    }
  }, [selectedObject, canvas]);

  const handleGroup = useCallback(() => {
    if (!canvas || !fabric) return;

    const activeSelection = canvas.getActiveObject();
    if (!activeSelection || activeSelection.type !== "activeSelection") return;

    const group = activeSelection.toGroup();
    if (group) {
      canvas.setActiveObject(group);
      setSelectedObject(group);
      canvas.renderAll();
    }
  }, [canvas, fabric, setSelectedObject]);

  const handleUngroup = useCallback(() => {
    if (!selectedObject || !canvas || !fabric) return;

    if (selectedObject.type === "group") {
      const activeSelection = selectedObject.toActiveSelection();
      if (activeSelection) {
        canvas.renderAll();
        // Clear the selection immediately after ungrouping
        canvas.discardActiveObject();
        setSelectedObject(null);
        canvas.renderAll();
      }
    }
  }, [selectedObject, canvas, fabric, setSelectedObject]);

  // Add keyboard shortcuts support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if we're typing in an input/textarea or editing text
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true" ||
        (target.classList && target.classList.contains("text-cursor")) ||
        // Check if any text object is in editing mode
        (canvas &&
          canvas.getActiveObject &&
          typeof canvas.getActiveObject === "function" &&
          canvas.getActiveObject()?.isEditing)
      ) {
        return;
      }

      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Handle delete/backspace keys (without modifier)
      if (!modifier && !e.shiftKey && !e.altKey && selectedObject) {
        switch (e.key) {
          case "Delete":
          case "Backspace":
            e.preventDefault();
            handleDelete();
            break;
        }
      }

      // Handle Ctrl/Cmd combinations
      if (modifier && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "c":
            if (selectedObject) {
              e.preventDefault();
              handleCopy();
            }
            break;
          case "x":
            if (selectedObject) {
              e.preventDefault();
              handleCut();
            }
            break;
          case "v":
            e.preventDefault();
            handlePaste();
            break;
          case "d":
            if (selectedObject) {
              e.preventDefault();
              handleDuplicate();
            }
            break;
          case "g":
            if (
              canvas &&
              canvas.getActiveObject()?.type === "activeSelection"
            ) {
              e.preventDefault();
              handleGroup();
            }
            break;
          case "]":
            if (selectedObject) {
              e.preventDefault();
              handleBringToFront();
            }
            break;
          case "[":
            if (selectedObject) {
              e.preventDefault();
              handleSendToBack();
            }
            break;
        }
      }
      // Handle Ctrl/Cmd + Shift combinations
      else if (modifier && e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "c":
            if (selectedObject) {
              e.preventDefault();
              handleCopyStyle();
            }
            break;
          case "v":
            if (selectedObject) {
              e.preventDefault();
              handlePasteStyle();
            }
            break;
          case "g":
            if (selectedObject?.type === "group") {
              e.preventDefault();
              handleUngroup();
            }
            break;
          case "]":
            if (selectedObject) {
              e.preventDefault();
              handleBringForward();
            }
            break;
          case "[":
            if (selectedObject) {
              e.preventDefault();
              handleSendBackward();
            }
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    canvas,
    selectedObject,
    handleCopy,
    handleCut,
    handlePaste,
    handleDuplicate,
    handleCopyStyle,
    handlePasteStyle,
    handleDelete,
    handleGroup,
    handleUngroup,
    handleBringToFront,
    handleSendToBack,
    handleBringForward,
    handleSendBackward,
  ]);

  // Handle context menu state and canvas events
  useEffect(() => {
    if (!canvas) return;

    const handleSelectionCleared = () => {
      setContextMenuOpen(false);
    };

    const handleCanvasMouseDown = (e: any) => {
      // Close context menu on any non-right-click
      if (e.e.button !== 2) {
        setContextMenuOpen(false);
      }
    };

    const handleObjectMoving = () => {
      isDraggingRef.current = true;
      setContextMenuOpen(false);
    };

    const handleObjectModified = () => {
      setContextMenuOpen(false);
    };

    const handleDragEnd = () => {
      if (isDraggingRef.current) {
        console.log("🔥 DRAG ENDED - RESETTING CANVAS STATE");
        isDraggingRef.current = false;
        setContextMenuOpen(false);

        // CRITICAL: Force reset canvas state after dragging
        if (canvas) {
          canvas.selection = true;
          canvas.defaultCursor = "default";
          canvas.hoverCursor = "move";

          // Ensure all objects are selectable after drag
          canvas.forEachObject((obj: any) => {
            if (!obj.lockMovementX && !obj.lockMovementY) {
              obj.selectable = true;
              obj.evented = true;
            }
          });

          canvas.renderAll();
          console.log("🟢 Canvas state reset after drag");
        }
      }
    };

    // Add canvas event listeners
    canvas.on("selection:cleared", handleSelectionCleared);
    canvas.on("selection:created", handleSelectionCleared);
    canvas.on("selection:updated", handleSelectionCleared);
    canvas.on("mouse:down", handleCanvasMouseDown);
    canvas.on("object:moving", handleObjectMoving);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("mouse:up", handleDragEnd);
    canvas.on("object:moved", handleDragEnd);

    return () => {
      canvas.off("selection:cleared", handleSelectionCleared);
      canvas.off("selection:created", handleSelectionCleared);
      canvas.off("selection:updated", handleSelectionCleared);
      canvas.off("mouse:down", handleCanvasMouseDown);
      canvas.off("object:moving", handleObjectMoving);
      canvas.off("object:modified", handleObjectModified);
      canvas.off("mouse:up", handleDragEnd);
      canvas.off("object:moved", handleDragEnd);
    };
  }, [canvas]);

  // Improved document click handler for closing context menu
  useEffect(() => {
    if (!contextMenuOpen) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      console.log(
        "🔍 Document click - contextMenuOpen:",
        contextMenuOpen,
        "isDragging:",
        isDraggingRef.current
      );

      // Ensure target is a valid Element with closest method
      if (!target || typeof target.closest !== "function") {
        return;
      }

      // Don't close if clicking on context menu content, selection UI, or tooltips
      if (
        target.closest("[data-slot='context-menu-content']") ||
        target.closest("[data-slot='context-menu-sub-content']") ||
        target.closest("[data-selection-ui]") ||
        target.closest("[data-selection-tooltip]") ||
        target.closest("[role='menu']") ||
        target.closest("[role='menuitem']")
      ) {
        console.log("🚫 Clicked on UI element - not closing context menu");
        return;
      }

      // FORCE CLOSE: Immediately close context menu
      console.log("✅ FORCE CLOSING CONTEXT MENU");
      setContextMenuOpen(false);

      // CRITICAL: Force Radix to close by dispatching escape key immediately
      const escapeEvent = new KeyboardEvent("keydown", {
        key: "Escape",
        keyCode: 27,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(escapeEvent);

      // CRITICAL: After drag, force reset canvas to ensure it's interactive
      if (canvas) {
        canvas.selection = true;
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "move";

        // Force all objects to be selectable
        canvas.forEachObject((obj: any) => {
          if (!obj.lockMovementX && !obj.lockMovementY) {
            obj.selectable = true;
            obj.evented = true;
          }
        });

        canvas.renderAll();
        console.log("🔧 Canvas forced to interactive state");
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenuOpen(false);
      }
    };

    // Use capture phase with high priority to handle context menu first
    document.addEventListener("mousedown", handleDocumentClick, true);
    document.addEventListener("keydown", handleEscapeKey, true);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick, true);
      document.removeEventListener("keydown", handleEscapeKey, true);
    };
  }, [contextMenuOpen, canvas]);

  // REMOVED: Complex timeout-based monitoring that was causing delays
  // No more timeout useEffect here

  const isLocked =
    selectedObject?.lockMovementX || selectedObject?.lockMovementY;
  const isVisible = selectedObject?.visible !== false;
  const hasCopiedObject =
    copiedObject !== null || localStorage.getItem("copiedObject") !== null;
  const hasCopiedStyle =
    copiedStyle !== null || localStorage.getItem("copiedStyle") !== null;
  const isMultipleSelection =
    canvas?.getActiveObject()?.type === "activeSelection";
  const isGroup = selectedObject?.type === "group";

  return (
    <ContextMenu onOpenChange={handleOpenChangeWithFocusCheck}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuPortal>
        <ContextMenuContent className="w-64 z-[9999]" data-selection-ui>
          {/* Basic Actions */}
          <ContextMenuItem
            onClick={createMenuHandler(handleCopy)}
            disabled={!selectedObject}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem
            onClick={createMenuHandler(handleCopyStyle)}
            disabled={!selectedObject}
          >
            <Palette className="mr-2 h-4 w-4" />
            Copy style
            <ContextMenuShortcut>⌘⇧C</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem
            onClick={createMenuHandler(handleCut)}
            disabled={!selectedObject}
          >
            <Scissors className="mr-2 h-4 w-4" />
            Cut
            <ContextMenuShortcut>⌘X</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem
            onClick={createMenuHandler(handlePaste)}
            disabled={!hasCopiedObject}
          >
            <Clipboard className="mr-2 h-4 w-4" />
            Paste
            <ContextMenuShortcut>⌘V</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem
            onClick={createMenuHandler(handlePasteStyle)}
            disabled={!selectedObject || !hasCopiedStyle}
          >
            <Palette className="mr-2 h-4 w-4" />
            Paste style
            <ContextMenuShortcut>⌘⇧V</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={createMenuHandler(handleDuplicate)}
            disabled={!selectedObject}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
            <ContextMenuShortcut>⌘D</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem
            onClick={createMenuHandler(handleDelete)}
            disabled={!selectedObject}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSeparator />

          {/* Group/Ungroup Actions */}
          <ContextMenuItem
            onClick={handleGroup}
            disabled={!isMultipleSelection}
          >
            <Move3D className="mr-2 h-4 w-4" />
            Group
            <ContextMenuShortcut>⌘G</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem onClick={handleUngroup} disabled={!isGroup}>
            <Move3D className="mr-2 h-4 w-4" />
            Ungroup
            <ContextMenuShortcut>⌘⇧G</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSeparator />

          {/* Layer Actions */}
          <ContextMenuSub>
            <ContextMenuSubTrigger disabled={!selectedObject}>
              <Move3D className="mr-2 h-4 w-4" />
              Layer
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem onClick={createMenuHandler(handleBringToFront)}>
                Bring to front
                <ContextMenuShortcut>⌘]</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={createMenuHandler(handleBringForward)}>
                Bring forward
                <ContextMenuShortcut>⌘⇧]</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={createMenuHandler(handleSendBackward)}>
                Send backward
                <ContextMenuShortcut>⌘⇧[</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={createMenuHandler(handleSendToBack)}>
                Send to back
                <ContextMenuShortcut>⌘[</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Align Actions */}
          <ContextMenuSub>
            <ContextMenuSubTrigger disabled={!selectedObject}>
              <AlignCenter className="mr-2 h-4 w-4" />
              Align to page
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuGroup>
                <ContextMenuItem onClick={handleAlignLeft}>
                  <AlignLeft className="mr-2 h-4 w-4" />
                  Align left
                </ContextMenuItem>
                <ContextMenuItem onClick={handleAlignCenter}>
                  <AlignCenter className="mr-2 h-4 w-4" />
                  Center horizontally
                </ContextMenuItem>
                <ContextMenuItem onClick={handleAlignRight}>
                  <AlignRight className="mr-2 h-4 w-4" />
                  Align right
                </ContextMenuItem>
              </ContextMenuGroup>
              <ContextMenuSeparator />
              <ContextMenuGroup>
                <ContextMenuItem onClick={handleAlignTop}>
                  <AlignStartVertical className="mr-2 h-4 w-4" />
                  Align top
                </ContextMenuItem>
                <ContextMenuItem onClick={handleAlignMiddle}>
                  <AlignCenterVertical className="mr-2 h-4 w-4" />
                  Center vertically
                </ContextMenuItem>
                <ContextMenuItem onClick={handleAlignBottom}>
                  <AlignEndVertical className="mr-2 h-4 w-4" />
                  Align bottom
                </ContextMenuItem>
              </ContextMenuGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />

          {/* Object Properties */}
          <ContextMenuItem
            onClick={handleLockToggle}
            disabled={!selectedObject}
          >
            {isLocked ? (
              <>
                <Unlock className="mr-2 h-4 w-4" />
                Unlock
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Lock
              </>
            )}
          </ContextMenuItem>

          <ContextMenuItem
            onClick={handleVisibilityToggle}
            disabled={!selectedObject}
          >
            {isVisible ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show
              </>
            )}
          </ContextMenuItem>

          <ContextMenuSeparator />

          {/* Additional Options */}
          <ContextMenuItem onClick={handleAddLink} disabled={!selectedObject}>
            <Link className="mr-2 h-4 w-4" />
            {selectedObject?.link ? "Edit link" : "Add link"}
          </ContextMenuItem>

          <ContextMenuItem onClick={handleAltText} disabled={!selectedObject}>
            <Type className="mr-2 h-4 w-4" />
            {selectedObject?.alt ? "Edit alt text" : "Add alt text"}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuPortal>
    </ContextMenu>
  );
};

export default CanvaContextMenu;

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useCallback, useEffect } from "react";
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
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { alignmentUtils } from "@/lib/alignmentUtils";

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
  const [copiedStyle, setCopiedStyle] = useState<any>(null);

  const { saveToHistory } = useHistoryStore();
  const { fabric, setSelectedObject } = useCanvasStore();

  // Enhanced copy functionality like Canva
  const handleCopy = useCallback(() => {
    if (!selectedObject || !fabric) return;

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
      selectedObject.clone((cloned: any) => {
        setCopiedObject(cloned);
        // Also save to localStorage for persistence
        const safeCopy = createSafeCopy(selectedObject);
        localStorage.setItem("copiedObject", JSON.stringify(safeCopy));
      });
    } catch (error) {
      console.log("Normal cloning failed, using safe copy method:", error);
      const safeCopy = createSafeCopy(selectedObject);
      setCopiedObject(safeCopy);
      localStorage.setItem("copiedObject", JSON.stringify(safeCopy));
    }
  }, [selectedObject, fabric]);

  const handleCopyStyle = useCallback(() => {
    if (!selectedObject) return;

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

    // First copy the object
    handleCopy();

    // Then remove it from canvas
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    setSelectedObject(null);
    canvas.renderAll();
    saveToHistory(canvas);
  }, [selectedObject, canvas, handleCopy, setSelectedObject, saveToHistory]);

  const handlePaste = useCallback(() => {
    if (!canvas || !fabric) return;

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

      return fabricObj;
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
          saveToHistory(canvas);
        });
      } else {
        // Use stored data to recreate object
        const newObj = createFabricObject(effectiveCopied);
        if (newObj) {
          canvas.add(newObj);
          canvas.setActiveObject(newObj);
          setSelectedObject(newObj);
          canvas.renderAll();
          saveToHistory(canvas);
        }
      }
    } catch (error) {
      console.error("Failed to paste object:", error);
    }
  }, [copiedObject, canvas, fabric, setSelectedObject, saveToHistory]);

  const handlePasteStyle = useCallback(() => {
    if (!selectedObject) return;

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

      if (styleToApply.fill !== undefined) updates.fill = styleToApply.fill;
      if (styleToApply.stroke !== undefined)
        updates.stroke = styleToApply.stroke;
      if (styleToApply.strokeWidth !== undefined)
        updates.strokeWidth = styleToApply.strokeWidth;
      if (styleToApply.opacity !== undefined)
        updates.opacity = styleToApply.opacity;
      if (styleToApply.shadow !== undefined)
        updates.shadow = styleToApply.shadow;

      // Text-specific styles
      if (selectedObject.type === "textbox" || selectedObject.type === "text") {
        if (styleToApply.fontFamily !== undefined)
          updates.fontFamily = styleToApply.fontFamily;
        if (styleToApply.fontSize !== undefined)
          updates.fontSize = styleToApply.fontSize;
        if (styleToApply.fontWeight !== undefined)
          updates.fontWeight = styleToApply.fontWeight;
        if (styleToApply.fontStyle !== undefined)
          updates.fontStyle = styleToApply.fontStyle;
        if (styleToApply.textAlign !== undefined)
          updates.textAlign = styleToApply.textAlign;
        if (styleToApply.lineHeight !== undefined)
          updates.lineHeight = styleToApply.lineHeight;
      }

      selectedObject.set(updates);
      canvas.renderAll();
      saveToHistory(canvas);
    } catch (error) {
      console.error("Error applying style:", error);
    }
  }, [selectedObject, canvas, copiedStyle, saveToHistory]);

  const handleDuplicate = useCallback(() => {
    if (!selectedObject || !canvas) return;

    try {
      selectedObject.clone((cloned: any) => {
        cloned.set({
          left: cloned.left + 20,
          top: cloned.top + 20,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        setSelectedObject(cloned);
        canvas.renderAll();
        saveToHistory(canvas);
      });
    } catch (error) {
      console.error("Error duplicating object:", error);
    }
  }, [selectedObject, canvas, setSelectedObject, saveToHistory]);

  const handleDelete = useCallback(() => {
    if (!selectedObject || !canvas) return;

    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    setSelectedObject(null);
    canvas.renderAll();
    saveToHistory(canvas);
  }, [selectedObject, canvas, setSelectedObject, saveToHistory]);

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
      selectable: isLocked, // When locked, make it non-selectable in the future
      evented: isLocked, // Disable events when locked
    });

    canvas.renderAll();
    saveToHistory(canvas);
  }, [selectedObject, canvas, saveToHistory]);

  const handleVisibilityToggle = useCallback(() => {
    if (!selectedObject || !canvas) return;

    selectedObject.set("visible", !selectedObject.visible);
    canvas.renderAll();
    saveToHistory(canvas);
  }, [selectedObject, canvas, saveToHistory]);

  const handleBringToFront = useCallback(() => {
    if (!selectedObject || !canvas) return;
    canvas.bringToFront(selectedObject);
    canvas.renderAll();
    saveToHistory(canvas);
  }, [selectedObject, canvas, saveToHistory]);

  const handleSendToBack = useCallback(() => {
    if (!selectedObject || !canvas) return;
    canvas.sendToBack(selectedObject);
    canvas.renderAll();
    saveToHistory(canvas);
  }, [selectedObject, canvas, saveToHistory]);

  const handleBringForward = useCallback(() => {
    if (!selectedObject || !canvas) return;
    canvas.bringForward(selectedObject);
    canvas.renderAll();
    saveToHistory(canvas);
  }, [selectedObject, canvas, saveToHistory]);

  const handleSendBackward = useCallback(() => {
    if (!selectedObject || !canvas) return;
    canvas.sendBackward(selectedObject);
    canvas.renderAll();
    saveToHistory(canvas);
  }, [selectedObject, canvas, saveToHistory]);

  const handleAlignLeft = useCallback(() => {
    alignmentUtils.alignToLeft({ canvas, selectedObject });
    saveToHistory(canvas);
  }, [selectedObject, canvas, saveToHistory]);

  const handleAlignCenter = useCallback(() => {
    alignmentUtils.alignToCenter({ canvas, selectedObject });
    saveToHistory(canvas);
  }, [selectedObject, canvas, saveToHistory]);

  const handleAlignRight = useCallback(() => {
    alignmentUtils.alignToRight({ canvas, selectedObject });
    saveToHistory(canvas);
  }, [selectedObject, canvas, saveToHistory]);

  const handleAlignTop = useCallback(() => {
    alignmentUtils.alignToTop({ canvas, selectedObject });
    saveToHistory(canvas);
  }, [selectedObject, canvas, saveToHistory]);

  const handleAlignMiddle = useCallback(() => {
    alignmentUtils.alignToMiddle({ canvas, selectedObject });
    saveToHistory(canvas);
  }, [selectedObject, canvas, saveToHistory]);

  const handleAlignBottom = useCallback(() => {
    alignmentUtils.alignToBottom({ canvas, selectedObject });
    saveToHistory(canvas);
  }, [selectedObject, canvas, saveToHistory]);

  const handleAddLink = useCallback(() => {
    if (!selectedObject) return;

    const url = prompt("Enter URL:", selectedObject.link || "");
    if (url !== null) {
      selectedObject.set("link", url);
      // Visual indication for linked objects
      if (url) {
        selectedObject.set("stroke", "#0066cc");
        selectedObject.set("strokeWidth", 1);
      } else {
        selectedObject.set("stroke", "");
        selectedObject.set("strokeWidth", 0);
      }
      canvas.renderAll();
      saveToHistory(canvas);
    }
  }, [selectedObject, canvas, saveToHistory]);

  const handleAltText = useCallback(() => {
    if (!selectedObject) return;

    const alt = prompt("Enter alternative text:", selectedObject.alt || "");
    if (alt !== null) {
      selectedObject.set("alt", alt);
      canvas.renderAll();
      saveToHistory(canvas);
    }
  }, [selectedObject, canvas, saveToHistory]);

  const handleGroup = useCallback(() => {
    if (!canvas || !fabric) return;

    const activeSelection = canvas.getActiveObject();
    if (!activeSelection || activeSelection.type !== "activeSelection") return;

    const group = activeSelection.toGroup();
    canvas.setActiveObject(group);
    canvas.renderAll();
    saveToHistory(canvas);
  }, [canvas, fabric, saveToHistory]);

  const handleUngroup = useCallback(() => {
    if (!selectedObject || !canvas || !fabric) return;

    if (selectedObject.type === "group") {
      selectedObject.toActiveSelection();
      canvas.renderAll();
      saveToHistory(canvas);
    }
  }, [selectedObject, canvas, fabric, saveToHistory]);

  // Add keyboard shortcuts support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if we're typing in an input/textarea or editing text
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true" ||
        target.classList.contains("text-cursor")
      ) {
        return;
      }

      // Skip if no object is selected
      if (!selectedObject) return;

      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "c":
            e.preventDefault();
            handleCopy();
            break;
          case "x":
            e.preventDefault();
            handleCut();
            break;
          case "v":
            e.preventDefault();
            handlePaste();
            break;
          case "d":
            e.preventDefault();
            handleDuplicate();
            break;
          case "g":
            e.preventDefault();
            handleGroup();
            break;
        }
      } else if (modifier && e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "c":
            e.preventDefault();
            handleCopyStyle();
            break;
          case "v":
            e.preventDefault();
            handlePasteStyle();
            break;
          case "g":
            e.preventDefault();
            handleUngroup();
            break;
        }
      } else if (!modifier && !e.shiftKey && !e.altKey) {
        switch (e.key) {
          case "Delete":
          case "Backspace":
            e.preventDefault();
            handleDelete();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
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
  ]);

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
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuPortal>
        <ContextMenuContent className="w-64">
          {/* Basic Actions */}
          <ContextMenuItem onClick={handleCopy} disabled={!selectedObject}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem onClick={handleCopyStyle} disabled={!selectedObject}>
            <Palette className="mr-2 h-4 w-4" />
            Copy style
            <ContextMenuShortcut>⌘⇧C</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem onClick={handleCut} disabled={!selectedObject}>
            <Scissors className="mr-2 h-4 w-4" />
            Cut
            <ContextMenuShortcut>⌘X</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem onClick={handlePaste} disabled={!hasCopiedObject}>
            <Clipboard className="mr-2 h-4 w-4" />
            Paste
            <ContextMenuShortcut>⌘V</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem
            onClick={handlePasteStyle}
            disabled={!selectedObject || !hasCopiedStyle}
          >
            <Palette className="mr-2 h-4 w-4" />
            Paste style
            <ContextMenuShortcut>⌘⇧V</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={handleDuplicate} disabled={!selectedObject}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
            <ContextMenuShortcut>⌘D</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem
            onClick={handleDelete}
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
              <ContextMenuItem onClick={handleBringToFront}>
                Bring to front
                <ContextMenuShortcut>⌘]</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={handleBringForward}>
                Bring forward
                <ContextMenuShortcut>⌘⇧]</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={handleSendBackward}>
                Send backward
                <ContextMenuShortcut>⌘⇧[</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={handleSendToBack}>
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

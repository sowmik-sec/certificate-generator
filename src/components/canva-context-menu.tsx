/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useCallback } from "react";
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

  const handleCopy = useCallback(() => {
    if (!selectedObject) return;

    selectedObject.clone((cloned: any) => {
      setCopiedObject(cloned);
    });
  }, [selectedObject]);

  const handleCopyStyle = useCallback(() => {
    if (!selectedObject) return;

    const style = {
      fill: selectedObject.fill,
      stroke: selectedObject.stroke,
      strokeWidth: selectedObject.strokeWidth,
      opacity: selectedObject.opacity,
      shadow: selectedObject.shadow,
    };

    localStorage.setItem("copiedStyle", JSON.stringify(style));
  }, [selectedObject]);

  const handleCut = useCallback(() => {
    if (!selectedObject) return;

    selectedObject.clone((cloned: any) => {
      setCopiedObject(cloned);
      canvas.remove(selectedObject);
      canvas.renderAll();
    });
  }, [selectedObject, canvas]);

  const handlePaste = useCallback(() => {
    if (!copiedObject || !canvas) return;

    copiedObject.clone((cloned: any) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  }, [copiedObject, canvas]);

  const handlePasteStyle = useCallback(() => {
    if (!selectedObject) return;

    const copiedStyleStr = localStorage.getItem("copiedStyle");
    if (!copiedStyleStr) return;

    try {
      const style = JSON.parse(copiedStyleStr);
      selectedObject.set(style);
      canvas.renderAll();
    } catch (error) {
      console.error("Error pasting style:", error);
    }
  }, [selectedObject, canvas]);

  const handleDuplicate = useCallback(() => {
    if (!selectedObject) return;

    selectedObject.clone((cloned: any) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  }, [selectedObject, canvas]);

  const handleDelete = useCallback(() => {
    if (!selectedObject) return;

    canvas.remove(selectedObject);
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleLockToggle = useCallback(() => {
    if (!selectedObject) return;

    const isLocked =
      selectedObject.lockMovementX || selectedObject.lockMovementY;

    selectedObject.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      lockRotation: !isLocked,
      selectable: isLocked,
    });

    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleVisibilityToggle = useCallback(() => {
    if (!selectedObject) return;

    selectedObject.set("visible", !selectedObject.visible);
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleBringToFront = useCallback(() => {
    if (!selectedObject) return;
    canvas.bringToFront(selectedObject);
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleSendToBack = useCallback(() => {
    if (!selectedObject) return;
    canvas.sendToBack(selectedObject);
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleBringForward = useCallback(() => {
    if (!selectedObject) return;
    canvas.bringForward(selectedObject);
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleSendBackward = useCallback(() => {
    if (!selectedObject) return;
    canvas.sendBackward(selectedObject);
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleAlignLeft = useCallback(() => {
    if (!selectedObject) return;
    const objectWidth = selectedObject.getScaledWidth();
    selectedObject.set({ left: objectWidth / 2 });
    selectedObject.setCoords();
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleAlignCenter = useCallback(() => {
    if (!selectedObject) return;
    const canvasWidth = canvas.getWidth() / canvas.getZoom();
    selectedObject.set({ left: canvasWidth / 2 });
    selectedObject.setCoords();
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleAlignRight = useCallback(() => {
    if (!selectedObject) return;
    const canvasWidth = canvas.getWidth() / canvas.getZoom();
    const objectWidth = selectedObject.getScaledWidth();
    selectedObject.set({ left: canvasWidth - objectWidth / 2 });
    selectedObject.setCoords();
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleAlignTop = useCallback(() => {
    if (!selectedObject) return;
    const objectHeight = selectedObject.getScaledHeight();
    selectedObject.set({ top: objectHeight / 2 });
    selectedObject.setCoords();
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleAlignMiddle = useCallback(() => {
    if (!selectedObject) return;
    const canvasHeight = canvas.getHeight() / canvas.getZoom();
    selectedObject.set({ top: canvasHeight / 2 });
    selectedObject.setCoords();
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const handleAlignBottom = useCallback(() => {
    if (!selectedObject) return;
    const canvasHeight = canvas.getHeight() / canvas.getZoom();
    const objectHeight = selectedObject.getScaledHeight();
    selectedObject.set({ top: canvasHeight - objectHeight / 2 });
    selectedObject.setCoords();
    canvas.renderAll();
  }, [selectedObject, canvas]);

  const isLocked =
    selectedObject?.lockMovementX || selectedObject?.lockMovementY;
  const isVisible = selectedObject?.visible !== false;
  const hasCopiedStyle = localStorage.getItem("copiedStyle") !== null;

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

          <ContextMenuItem onClick={handlePaste} disabled={!copiedObject}>
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
          <ContextMenuItem disabled={!selectedObject}>
            <Link className="mr-2 h-4 w-4" />
            Link
          </ContextMenuItem>

          <ContextMenuItem disabled={!selectedObject}>
            <Type className="mr-2 h-4 w-4" />
            Alternative text
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuPortal>
    </ContextMenu>
  );
};

export default CanvaContextMenu;

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useCallback } from "react";
import { Lock, Unlock, Copy, Trash2, MoreHorizontal } from "lucide-react";
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

    targetObject.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      lockRotation: !isLocked,
      selectable: true, // Keep selectable so user can still unlock it
    });

    canvas.renderAll();

    // Update tooltip position in case object state changed
    if (!position) {
      setTimeout(() => updateTooltipPosition(targetObject), 100);
    }
  };

  const handleDuplicate = () => {
    const targetObject = position ? selectedObject : tooltipState.object;
    if (!targetObject) return;

    targetObject.clone((cloned: any) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
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
            <Copy size={16} />
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
          <Copy size={16} />
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

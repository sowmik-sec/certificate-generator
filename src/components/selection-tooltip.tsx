/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useCallback } from "react";
import { Lock, Unlock, Copy, Trash2, MoreHorizontal } from "lucide-react";

interface SelectionTooltipProps {
  canvas: any;
  fabric: any;
  selectedObject: any;
}

const SelectionTooltip: React.FC<SelectionTooltipProps> = ({
  canvas,
  fabric,
  selectedObject,
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
    [canvas]
  );

  const hideTooltip = useCallback(() => {
    setTooltipState((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
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
  }, [canvas, fabric, selectedObject, updateTooltipPosition, hideTooltip]);

  const handleLockToggle = () => {
    if (!tooltipState.object) return;

    const isLocked =
      tooltipState.object.lockMovementX || tooltipState.object.lockMovementY;

    tooltipState.object.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      lockRotation: !isLocked,
      selectable: isLocked, // If locking, make it unselectable; if unlocking, make it selectable
    });

    canvas.renderAll();
  };

  const handleDuplicate = () => {
    if (!tooltipState.object) return;

    tooltipState.object.clone((cloned: any) => {
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
    if (!tooltipState.object) return;

    canvas.remove(tooltipState.object);
    canvas.renderAll();
    hideTooltip();
  };

  const handleShowMore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!tooltipState.object || !canvas) return;

    // Create a synthetic right-click event at the cursor position
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const syntheticEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + rect.width / 2,
      clientY: rect.bottom + 5,
    });

    // Dispatch to the document to trigger the context menu
    document.dispatchEvent(syntheticEvent);

    // Hide the tooltip
    hideTooltip();
  };

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
      <div
        className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 flex items-center gap-1"
        style={{
          left: tooltipState.x - 60, // Center horizontally
          top: tooltipState.y - 45, // Position above
          pointerEvents: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Lock/Unlock Button */}
        <button
          onClick={handleLockToggle}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            isLocked ? "text-red-600" : "text-gray-600"
          }`}
          title={isLocked ? "Unlock" : "Lock"}
        >
          {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>

        {/* Duplicate Button */}
        <button
          onClick={handleDuplicate}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
          title="Duplicate"
        >
          <Copy size={16} />
        </button>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-red-600"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* More Options Button */}
        <button
          onClick={handleShowMore}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
          title="More options"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </>
  );
};

export default SelectionTooltip;

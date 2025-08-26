/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useRef, useEffect } from "react";
import { FabricCanvas } from "@/types/fabric";
import TopPropertyPanel from "./top-property-panel";
import SelectionTooltip from "./selection-tooltip";
import { EditorMode } from "./sidebar-navigation";
import { SelectionState } from "@/hooks/useSelectionState";

interface SelectionOverlayProps {
  canvas: FabricCanvas;
  fabric: any;
  selectionState: SelectionState;
  onHideSelection: () => void;
  setEditorMode: (mode: EditorMode) => void;
}

const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  canvas,
  fabric,
  selectionState,
  onHideSelection,
  setEditorMode,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside canvas bounds to close selection
  useEffect(() => {
    if (!selectionState.visible) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't close if clicking on selection components themselves
      if (target.closest("[data-selection-ui]")) {
        return;
      }

      // Don't close if clicking on left panel or its hover trigger area
      if (
        target.closest("[data-left-panel]") ||
        target.closest("[data-sidebar-nav]")
      ) {
        return;
      }

      if (canvas) {
        const canvasElement = canvas.getElement();
        const canvasContainer = canvasElement.parentNode as HTMLElement;

        if (canvasContainer) {
          const canvasRect = canvasContainer.getBoundingClientRect();
          const clickX = e.clientX;
          const clickY = e.clientY;

          // Get actual canvas dimensions (considering zoom)
          const actualCanvasWidth = canvas.getWidth();
          const actualCanvasHeight = canvas.getHeight();

          // Calculate canvas bounds within the container
          const canvasCenterX = canvasRect.left + canvasRect.width / 2;
          const canvasCenterY = canvasRect.top + canvasRect.height / 2;

          const canvasLeft = canvasCenterX - actualCanvasWidth / 2;
          const canvasRight = canvasCenterX + actualCanvasWidth / 2;
          const canvasTop = canvasCenterY - actualCanvasHeight / 2;
          const canvasBottom = canvasCenterY + actualCanvasHeight / 2;

          // Check if click is outside the actual canvas bounds
          if (
            clickX < canvasLeft ||
            clickX > canvasRight ||
            clickY < canvasTop ||
            clickY > canvasBottom
          ) {
            // Click is outside canvas bounds - clear selection
            if (canvas.getActiveObject()) {
              canvas.discardActiveObject();
              canvas.renderAll();
            }
            onHideSelection();
            return;
          }
        }

        // If click is within canvas bounds, let fabric.js handle it normally
        // Check if we clicked on empty canvas area
        const target = canvas.findTarget(e as any);

        if (!target) {
          // Clicked on empty canvas area
          if (canvas.getActiveObject()) {
            canvas.discardActiveObject();
            canvas.renderAll();
          }
          onHideSelection();
        }
      }
    };

    // Add event listener with high priority
    document.addEventListener("mousedown", handleClickOutside, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [selectionState.visible, canvas, onHideSelection]);

  if (!selectionState.visible || !selectionState.object) {
    return null;
  }

  return (
    <div ref={overlayRef} className="absolute inset-0 pointer-events-none z-40">
      {/* Top Property Panel */}
      <div className="pointer-events-auto" data-selection-ui>
        <TopPropertyPanel
          selectedObject={selectionState.object}
          canvas={canvas}
          setEditorMode={setEditorMode}
        />
      </div>

      {/* Selection Tooltip */}
      {selectionState.tooltipPosition && (
        <div className="pointer-events-auto" data-selection-ui>
          <SelectionTooltip
            canvas={canvas}
            fabric={fabric}
            selectedObject={selectionState.object}
            position={selectionState.tooltipPosition}
            onHide={onHideSelection}
          />
        </div>
      )}
    </div>
  );
};

export default SelectionOverlay;

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
  // Only close selection when clicking completely outside the canvas area
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

      // Don't interfere with canvas interactions - let Fabric.js handle them
      if (target.tagName === "CANVAS") {
        return;
      }

      if (canvas) {
        const canvasElement = canvas.getElement();
        const canvasContainer = canvasElement.parentNode as HTMLElement;

        // Only close selection if clicking completely outside the canvas container
        if (canvasContainer && !canvasContainer.contains(target)) {
          // Click is outside canvas container - clear selection
          if (canvas.getActiveObject()) {
            canvas.discardActiveObject();
            canvas.renderAll();
          }
          onHideSelection();
        }
      }
    };

    // Use normal phase and lower priority to avoid interfering with Fabric.js
    document.addEventListener("mousedown", handleClickOutside, false);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, false);
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

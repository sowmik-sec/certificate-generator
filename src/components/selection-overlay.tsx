/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useRef, useEffect } from "react";
import { FabricCanvas } from "@/types/fabric";
import TopPropertyPanel from "./top-property-panel";
import SelectionTooltip from "./selection-tooltip";
import { EditorMode } from "./sidebar-navigation";
import { SelectionState } from "@/hooks/useSelectionState";
import { useResponsive } from "@/hooks/useResponsive";
import { useEditorStore } from "@/stores/useEditorStore";

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
  const { isMobile } = useResponsive();
  const { showMobilePropertyPanel, setShowMobilePropertyPanel } =
    useEditorStore();

  // Auto-open mobile property panel when object is selected on mobile
  useEffect(() => {
    if (isMobile && selectionState.visible && selectionState.object) {
      setShowMobilePropertyPanel(true);
    } else if (!selectionState.visible) {
      setShowMobilePropertyPanel(false);
    }
  }, [
    isMobile,
    selectionState.visible,
    selectionState.object,
    setShowMobilePropertyPanel,
  ]);

  const handleMobilePropertyClose = () => {
    setShowMobilePropertyPanel(false);
    // Also hide the selection when closing mobile property panel
    onHideSelection();
  };

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
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none z-[120]"
    >
      {/* Top Property Panel - Always render, but mobile/desktop handled inside */}
      <div className="pointer-events-auto" data-selection-ui>
        <TopPropertyPanel
          selectedObject={selectionState.object}
          canvas={canvas}
          setEditorMode={setEditorMode}
          isMobilePropertyOpen={showMobilePropertyPanel}
          onMobilePropertyClose={handleMobilePropertyClose}
        />
      </div>

      {/* Selection Tooltip - Only show on desktop and tablets */}
      {!isMobile && selectionState.tooltipPosition && (
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

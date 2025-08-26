/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
import { FabricCanvas } from "@/types/fabric";

export interface SelectionState {
  visible: boolean;
  object: any | null;
  tooltipPosition: { x: number; y: number } | null;
}

export const useSelectionState = (canvas: FabricCanvas | null, fabric: any) => {
  const [selectionState, setSelectionState] = useState<SelectionState>({
    visible: false,
    object: null,
    tooltipPosition: null,
  });

  const updateTooltipPosition = useCallback(
    (obj: any) => {
      if (!obj || !canvas) return null;

      const objBounds = obj.getBoundingRect();
      const canvasContainer = canvas.getElement().parentNode;
      const containerRect = canvasContainer.getBoundingClientRect();
      const zoom = canvas.getZoom();

      // Calculate position above the object
      const x =
        containerRect.left + (objBounds.left + objBounds.width / 2) * zoom;
      const y = containerRect.top + objBounds.top * zoom - 10; // 10px above

      return { x, y };
    },
    [canvas]
  );

  const showSelection = useCallback(
    (object: any) => {
      if (!object || object.excludeFromExport) return;

      const tooltipPosition = updateTooltipPosition(object);
      setSelectionState({
        visible: true,
        object,
        tooltipPosition,
      });
    },
    [updateTooltipPosition]
  );

  const hideSelection = useCallback(() => {
    setSelectionState({
      visible: false,
      object: null,
      tooltipPosition: null,
    });
  }, []);

  const updateTooltipPositionOnly = useCallback(() => {
    if (selectionState.visible && selectionState.object) {
      const tooltipPosition = updateTooltipPosition(selectionState.object);
      setSelectionState((prev) => ({
        ...prev,
        tooltipPosition,
      }));
    }
  }, [selectionState.visible, selectionState.object, updateTooltipPosition]);

  // Handle canvas events
  useEffect(() => {
    if (!canvas || !fabric) return;

    const handleSelectionCreated = (e: any) => {
      const obj = e.selected?.[0];
      if (obj && !obj.excludeFromExport) {
        setTimeout(() => showSelection(obj), 100); // Delay to ensure object is positioned
      }
    };

    const handleSelectionUpdated = (e: any) => {
      const obj = e.selected?.[0];
      if (obj && !obj.excludeFromExport) {
        setTimeout(() => showSelection(obj), 100);
      }
    };

    const handleSelectionCleared = () => {
      hideSelection();
    };

    const handleObjectModified = () => {
      setTimeout(updateTooltipPositionOnly, 100);
    };

    // Handle canvas panning/zooming
    const handleCanvasMove = () => {
      updateTooltipPositionOnly();
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
  }, [canvas, fabric, showSelection, hideSelection, updateTooltipPositionOnly]);

  return {
    selectionState,
    showSelection,
    hideSelection,
    updateTooltipPositionOnly,
  };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect, useRef } from "react";
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

  // Track selection clearing timeout to prevent flickering
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

      // Clear any pending hide timeout
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
        selectionTimeoutRef.current = null;
      }

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
    // Clear any pending timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
      selectionTimeoutRef.current = null;
    }

    // Use a small delay to prevent flickering when switching between objects
    selectionTimeoutRef.current = setTimeout(() => {
      setSelectionState({
        visible: false,
        object: null,
        tooltipPosition: null,
      });
      selectionTimeoutRef.current = null;
    }, 50);
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
        // Immediate selection change for smooth transition
        showSelection(obj);
      }
    };

    const handleSelectionUpdated = (e: any) => {
      const obj = e.selected?.[0];
      if (obj && !obj.excludeFromExport) {
        // Immediate selection change for smooth transition
        showSelection(obj);
      } else {
        hideSelection();
      }
    };

    const handleSelectionCleared = () => {
      hideSelection();
    };

    const handleObjectModified = () => {
      // Only update position if we have an active selection
      if (selectionState.visible && selectionState.object) {
        setTimeout(updateTooltipPositionOnly, 50);
      }
    };

    // Handle canvas panning/zooming
    const handleCanvasMove = () => {
      if (selectionState.visible && selectionState.object) {
        updateTooltipPositionOnly();
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
    showSelection,
    hideSelection,
    updateTooltipPositionOnly,
    selectionState.visible,
    selectionState.object,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

  return {
    selectionState,
    showSelection,
    hideSelection,
    updateTooltipPositionOnly,
  };
};

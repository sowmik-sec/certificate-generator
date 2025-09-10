/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect, useRef } from "react";
import { FabricCanvas } from "@/types/fabric";

export interface SelectionState {
  visible: boolean;
  object: any | null;
  tooltipPosition: { x: number; y: number } | null;
}

export const useSelectionState = (canvas: FabricCanvas | null, fabric: any) => {
  const DEBUG_HOVER = false; // set true to enable debug logs for hover behavior
  const [selectionState, setSelectionState] = useState<SelectionState>({
    visible: false,
    object: null,
    tooltipPosition: null,
  });

  // Track selection clearing timeout to prevent flickering
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track all pending timeouts for immediate cleanup
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Clear all pending timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];

    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
      selectionTimeoutRef.current = null;
    }
  }, []);

  // Add timeout with tracking
  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      callback();
      // Remove from tracking array
      timeoutRefs.current = timeoutRefs.current.filter(
        (id: NodeJS.Timeout) => id !== timeoutId
      );
    }, delay);
    timeoutRefs.current.push(timeoutId);
    return timeoutId;
  }, []);

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

  /***** Hover bounding-box handling *****/
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverRectRef = useRef<any | null>(null);
  // Track the last object we showed hover for to avoid stale state
  const lastHoveredObjectRef = useRef<any | null>(null);

  const createHoverRect = useCallback(
    (obj: any) => {
      if (!canvas || !obj) return null;

      // Use a DOM overlay instead of a Fabric object for hover bbox. This
      // prevents Fabric from ever selecting the hover element and avoids
      // device-specific long-press selection races.
      const bounds = obj.getBoundingRect(true);
      const canvasEl = canvas.getElement?.();
      const container = canvasEl ? (canvasEl.parentNode as HTMLElement) : null;
      if (!container) return null;

      let el = hoverRectRef.current as HTMLElement | null;
      const zoom = canvas.getZoom?.() || 1;

      // Create overlay element if missing
      if (!el) {
        el = document.createElement("div");
        el.style.position = "absolute";
        el.style.pointerEvents = "none"; // must not intercept pointer events
        el.style.boxSizing = "border-box";
        el.style.border = "1.5px dashed #3b82f6";
        el.style.background = "transparent";
        el.style.zIndex = "9999";
        el.setAttribute("data-hover-bbox", "true");
        hoverRectRef.current = el;
        container.appendChild(el);
      }

      // Position and size overlay. Place it by center so rotation works via CSS
      const left = (bounds.left + bounds.width / 2) * zoom;
      const top = (bounds.top + bounds.height / 2) * zoom;
      const width = bounds.width * zoom;
      const height = bounds.height * zoom;
      const angle = obj.angle || 0;

      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      el.style.width = `${Math.max(0, width)}px`;
      el.style.height = `${Math.max(0, height)}px`;
      el.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      el.style.transformOrigin = "50% 50%";

      return el;
    },
    [canvas]
  );

  const showHover = useCallback(
    (object: any) => {
      if (!object || object.excludeFromExport) return;

      if (canvas && canvas.getActiveObject() === object) return;

      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }

      // track last hovered object
      lastHoveredObjectRef.current = object;
      createHoverRect(object);
    },
    [canvas, createHoverRect]
  );

  const hideHover = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    const el = hoverRectRef.current as HTMLElement | null;
    if (el && el.parentNode) {
      try {
        el.parentNode.removeChild(el);
      } catch {
        // ignore
      }
    }
    lastHoveredObjectRef.current = null;
    hoverRectRef.current = null;
  }, []);

  // Immediate remove helper (used for mouse out / selection change)
  const removeHoverNow = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    const el = hoverRectRef.current as HTMLElement | null;
    if (el && el.parentNode) {
      try {
        el.parentNode.removeChild(el);
      } catch {
        // ignore
      }
    }
    lastHoveredObjectRef.current = null;
    hoverRectRef.current = null;
  }, []);

  const showSelection = useCallback(
    (object: any) => {
      if (!object || object.excludeFromExport) return;
      // Remove any hover rectangle immediately when an object becomes selected
      removeHoverNow();

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
    [updateTooltipPosition, removeHoverNow]
  );

  const hideSelection = useCallback(() => {
    // Clear ALL pending timeouts immediately for instant response
    clearAllTimeouts();

    // Also ensure hover rectangle is removed when selection is hidden
    removeHoverNow();

    // Set state immediately without any delay to prevent slow hiding
    setSelectionState({
      visible: false,
      object: null,
      tooltipPosition: null,
    });
  }, [removeHoverNow, clearAllTimeouts]);

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
      const obj = e.selected?.[0] || null;
      // Always remove any hover overlay when a true selection is created.
      removeHoverNow();
      if (obj && !obj.excludeFromExport) {
        // Immediate selection change for smooth transition
        showSelection(obj);
      }
    };

    const handleSelectionUpdated = (e: any) => {
      const obj = e.selected?.[0] || null;
      // Ensure hover overlay removed on selection update
      removeHoverNow();
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
        // Reduce delay and use tracked timeout
        addTimeout(updateTooltipPositionOnly, 25);
      }
    };

    // Handle canvas panning/zooming
    const handleCanvasMove = () => {
      if (selectionState.visible && selectionState.object) {
        updateTooltipPositionOnly();
      }
    };

    // Hover handlers
    const handleObjectOver = (e: any) => {
      const obj = e.target;
      // ignore canvas background or groups without targets
      if (!obj) return;
      if (DEBUG_HOVER) console.debug("hover: mouse over ->", obj?.type || obj);
      showHover(obj);
    };

    const handleObjectOut = () => {
      if (DEBUG_HOVER) console.debug("hover: mouse out");
      // remove immediately when pointer leaves object
      removeHoverNow();
    };

    const handleObjectMoving = (e: any) => {
      // Update hover overlay to follow moving object
      const obj = e.target;
      const el = hoverRectRef.current as HTMLElement | null;
      if (el && obj && canvas) {
        try {
          const bounds = obj.getBoundingRect(true);
          const zoom = canvas.getZoom?.() || 1;
          const left = (bounds.left + bounds.width / 2) * zoom;
          const top = (bounds.top + bounds.height / 2) * zoom;
          const width = bounds.width * zoom;
          const height = bounds.height * zoom;
          const angle = obj.angle || 0;
          el.style.left = `${left}px`;
          el.style.top = `${top}px`;
          el.style.width = `${Math.max(0, width)}px`;
          el.style.height = `${Math.max(0, height)}px`;
          el.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        } catch {
          // ignore
        }
      }
      // If selection is active and the moving object is the selected object, update tooltip immediately
      if (
        selectionState.visible &&
        selectionState.object &&
        selectionState.object === obj
      ) {
        // Update immediately without delay for smooth following
        updateTooltipPositionOnly();
      }
    };

    // Hide hover immediately if pointer is over empty canvas, or show when moving over objects
    const handleMouseMove = (e: any) => {
      const obj = e.target;
      if (obj) {
        // If there's an active selection for the same object, ensure hover is not shown
        if (canvas && canvas.getActiveObject() === obj) {
          hideHover();
          return;
        }
        showHover(obj);
      } else {
        // Immediately remove hover overlay to avoid persistence
        removeHoverNow();
      }
    };

    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionUpdated);
    canvas.on("selection:cleared", handleSelectionCleared);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("path:created", handleCanvasMove);
    canvas.on("mouse:over", handleObjectOver);
    canvas.on("mouse:out", handleObjectOut);
    canvas.on("mouse:move", handleMouseMove);
    // Ensure hover removed on mouse down (click) anywhere on canvas
    const handleMouseDown = () => removeHoverNow();
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("object:moving", handleObjectMoving);

    // Also listen to DOM leave so when pointer leaves canvas element entirely we remove hover
    const canvasEl = canvas.getElement?.();
    if (canvasEl && canvasEl.addEventListener) {
      canvasEl.addEventListener("mouseleave", removeHoverNow, {
        passive: true,
      });
    }

    // Add a document-level pointermove handler to catch cases where UI overlays
    // (selection tooltip / panels) intercept pointer events and Fabric mouse events
    // are not fired. If pointer moves outside the canvas container or into
    // any element marked with data-selection-ui, drop the hover immediately.
    const canvasContainer = canvasEl
      ? (canvasEl.parentNode as HTMLElement)
      : null;
    const handleDocumentPointerMove = (ev: PointerEvent) => {
      try {
        const target = ev.target as HTMLElement | null;
        if (!canvasContainer) return;
        // If pointer is outside canvas container -> remove hover
        if (!canvasContainer.contains(target)) {
          if (DEBUG_HOVER)
            console.debug("hover: pointer moved outside canvas container");
          removeHoverNow();
          return;
        }

        // If pointer is inside a selection UI overlay, remove hover
        if (target && target.closest && target.closest("[data-selection-ui]")) {
          if (DEBUG_HOVER) console.debug("hover: pointer entered selection UI");
          removeHoverNow();
          return;
        }
      } catch {
        // swallow
      }
    };

    document.addEventListener("pointermove", handleDocumentPointerMove, {
      passive: true,
    });

    return () => {
      canvas.off("selection:created", handleSelectionCreated);
      canvas.off("selection:updated", handleSelectionUpdated);
      canvas.off("selection:cleared", handleSelectionCleared);
      canvas.off("object:modified", handleObjectModified);
      canvas.off("path:created", handleCanvasMove);
      canvas.off("mouse:over", handleObjectOver);
      canvas.off("mouse:out", handleObjectOut);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("object:moving", handleObjectMoving);
      if (canvasEl && canvasEl.removeEventListener) {
        canvasEl.removeEventListener("mouseleave", removeHoverNow as any);
      }
      document.removeEventListener(
        "pointermove",
        handleDocumentPointerMove as any
      );

      // Remove DOM overlay if present
      const el = hoverRectRef.current as HTMLElement | null;
      if (el && el.parentNode) {
        try {
          el.parentNode.removeChild(el);
        } catch {
          // ignore
        }
      }
    };
  }, [
    canvas,
    fabric,
    showSelection,
    hideSelection,
    updateTooltipPositionOnly,
    showHover,
    hideHover,
    removeHoverNow,
    DEBUG_HOVER,
    selectionState.visible,
    selectionState.object,
    addTimeout,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [clearAllTimeouts]);

  return {
    selectionState,
    showSelection,
    hideSelection,
    updateTooltipPositionOnly,
  };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useRef } from "react";
import CanvasComponent from "@/components/canvas-component";
import AlignmentGuides from "@/components/alignment-guides";
import CanvasStability from "@/components/canvas-stability";
import PrecisionSelection from "@/components/precision-selection";
import ContextMenu from "@/components/context-menu";
import LineVisibilityEnhancer from "@/components/line-visibility-enhancer";
import SelectionTooltip from "@/components/selection-tooltip";
import CanvaContextMenu from "@/components/canva-context-menu";
import TextEditingEnhancer from "@/components/text-editing-enhancer";
import TopPropertyPanel from "@/components/top-property-panel";
import AlignmentToolbar from "@/components/alignment-toolbar";
import LayerPanel from "@/components/layer-panel";
import CanvasSizePanel, { CanvasSize } from "@/components/canvas-size-panel";
import { useEditorStore } from "@/stores/useEditorStore";
import { useCanvasStore } from "@/stores/useCanvasStore";

// Import custom hooks
import { useFabricCanvas } from "@/hooks/useFabricCanvas";
import { useCanvasHistory } from "@/hooks/useCanvasHistory";
import { useCanvasShapes } from "@/hooks/useCanvasShapes";
import { useCanvasLines } from "@/hooks/useCanvasLines";
import { useCanvasText } from "@/hooks/useCanvasText";
import { useCanvasFrames } from "@/hooks/useCanvasFrames";
import { useCanvasOperations } from "@/hooks/useCanvasOperations";
import { useLayerManagement } from "@/hooks/useLayerManagement";
import { useCanvasExport } from "@/hooks/useCanvasExport";
import { useTemplateLoader } from "@/hooks/useTemplateLoader";
import { useEditorShortcuts } from "@/hooks/useKeyboardShortcuts";

// Import UI components
import SidebarNavigation from "@/components/sidebar-navigation";
import LeftPanel from "@/components/left-panel";
import LayerControls from "@/components/layer-controls";
import HeaderActions from "@/components/header-actions";
import { ConfirmModal } from "@/components/confirm-modal";

// Main App Component
export default function CertificateGeneratorPage() {
  // Zustand stores
  const {
    editorMode,
    setEditorMode,
    hoveredMode,
    setHoveredMode,
    canvasSize,
    setCanvasSize,
    showCanvasSizeModal,
    setShowCanvasSizeModal,
    pendingCanvasSize,
    setPendingCanvasSize,
    getShouldShowCanvasSize,
    setHasCanvasObjects,
  } = useEditorStore();

  const { fabric, canvas, selectedObject, selectedObjects, setSelectedObject } =
    useCanvasStore();

  const imageInputRef = useRef<HTMLInputElement>(null);

  // Custom hooks
  const { handleSetCanvas } = useFabricCanvas();

  const { saveToHistory, undo, redo, canUndo, canRedo } =
    useCanvasHistory(canvas);

  const shapeHooks = useCanvasShapes(canvas, fabric, saveToHistory);
  const lineHooks = useCanvasLines(canvas, fabric, saveToHistory);
  const textHooks = useCanvasText(canvas, fabric, saveToHistory);
  const frameHooks = useCanvasFrames(canvas, fabric, saveToHistory);

  const {
    deleteSelected,
    addImageFromURL,
    addStickyNote,
    addTable,
    handleCopy,
    handlePaste,
  } = useCanvasOperations(
    canvas,
    fabric,
    selectedObject,
    setSelectedObject,
    saveToHistory
  );

  const layerManagement = useLayerManagement(canvas, fabric, saveToHistory);
  const { exportAsPNG, exportAsPDF } = useCanvasExport(canvas, canvasSize);
  const { loadTemplate, handleBackgroundImageUpload } = useTemplateLoader(
    canvas,
    canvasSize,
    saveToHistory
  );

  // Helper function to check if text is being edited
  const isTextBeingEdited = () => {
    if (!canvas) return false;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) return false;

    // Check multiple properties to determine text editing state
    return (
      activeObject.isEditing === true ||
      activeObject.__isEditing === true ||
      activeObject.editing === true ||
      (activeObject.hiddenTextarea &&
        activeObject.hiddenTextarea.style.display !== "none") ||
      ((activeObject.type === "textbox" || activeObject.type === "i-text") &&
        document.activeElement &&
        (document.activeElement.tagName === "TEXTAREA" ||
          document.activeElement.getAttribute("contenteditable") === "true"))
    );
  };

  // Consolidated keyboard shortcuts for all canvas operations with improved text editing detection
  useEditorShortcuts({
    onUndo: () => {
      console.log(
        "Undo shortcut triggered, text editing:",
        isTextBeingEdited()
      );
      if (!isTextBeingEdited()) {
        console.log("Calling undo function");
        undo();
      }
    },
    onRedo: () => {
      console.log(
        "Redo shortcut triggered, text editing:",
        isTextBeingEdited()
      );
      if (!isTextBeingEdited()) {
        console.log("Calling redo function");
        redo();
      }
    },
    onCopy: () => {
      if (!isTextBeingEdited() && selectedObject) {
        handleCopy();
      }
    },
    onPaste: () => {
      if (!isTextBeingEdited()) {
        handlePaste();
      }
    },
    onDelete: () => {
      if (!isTextBeingEdited() && selectedObject) {
        deleteSelected();
      }
    },
    onGroup: layerManagement.groupObjects,
    onUngroup: layerManagement.ungroupObjects,
    onBringForward: layerManagement.bringForward,
    onSendBackward: layerManagement.sendBackward,
    onBringToFront: layerManagement.bringToFront,
    onSendToBack: layerManagement.sendToBack,
  });

  const handleCanvasSizeChange = (newSize: CanvasSize) => {
    const previousSize = canvasSize;

    if (canvas) {
      // Calculate scale factors
      const scaleX = newSize.width / previousSize.width;
      const scaleY = newSize.height / previousSize.height;

      // Check if there are objects on canvas and if scale change is significant
      const objects = canvas.getObjects();
      const hasObjects = objects.length > 0;
      const significantChange =
        Math.abs(scaleX - 1) > 0.1 || Math.abs(scaleY - 1) > 0.1;

      if (hasObjects && significantChange) {
        // Show modal instead of window.confirm
        setPendingCanvasSize(newSize);
        setShowCanvasSizeModal(true);
        return;
      }

      // Apply canvas size change immediately if no objects or insignificant change
      applyCanvasSizeChange(newSize);
      setCanvasSize(newSize);
    } else {
      // No canvas, just update the size state
      setCanvasSize(newSize);
    }
  };

  const applyCanvasSizeChange = (newSize: CanvasSize) => {
    if (!canvas) return;

    console.log("Starting canvas size change...");
    const previousSize = canvasSize;

    // Calculate simple scale factors
    const scaleX = newSize.width / previousSize.width;
    const scaleY = newSize.height / previousSize.height;

    console.log(`Scaling factors: ${scaleX}, ${scaleY}`);

    // Get all objects before changing canvas size
    const objects = canvas.getObjects();
    console.log(`Found ${objects.length} objects to scale`);

    objects.forEach((obj: any, index: number) => {
      try {
        if (obj.type !== "grid-line" && obj.id !== "alignment-line") {
          // Simple scaling - just scale position and size
          const newLeft = obj.left * scaleX;
          const newTop = obj.top * scaleY;

          obj.set({
            left: newLeft,
            top: newTop,
          });

          // Scale dimensions if they exist
          if (obj.width) {
            obj.set("width", obj.width * scaleX);
          }
          if (obj.height) {
            obj.set("height", obj.height * scaleY);
          }

          // Scale font size for text objects
          if (obj.fontSize) {
            obj.set("fontSize", obj.fontSize * Math.min(scaleX, scaleY));
          }

          obj.setCoords();
          console.log(`Scaled object ${index} successfully`);
        }
      } catch (error) {
        console.error(`Error scaling object ${index}:`, error);
      }
    });

    try {
      // Set new canvas dimensions
      canvas.setDimensions({ width: newSize.width, height: newSize.height });
      canvas.renderAll();
      saveToHistory();
      console.log("Canvas resize completed successfully");
    } catch (error) {
      console.error("Error setting canvas dimensions:", error);
    }
  };

  const handleConfirmCanvasSizeChange = () => {
    console.log("CONFIRM BUTTON CLICKED - CLOSING MODAL FIRST");

    // CLOSE MODAL IMMEDIATELY - NO MATTER WHAT
    setShowCanvasSizeModal(false);

    // Then try to apply scaling
    try {
      if (pendingCanvasSize) {
        console.log("Applying canvas size change...");
        applyCanvasSizeChange(pendingCanvasSize);
        setCanvasSize(pendingCanvasSize);
        setPendingCanvasSize(null);
        console.log("Canvas size change applied successfully");
      }
    } catch (error) {
      console.error("Error during canvas scaling:", error);
      // Even if scaling fails, we already closed the modal
    }
  };

  const handleCancelCanvasSizeChange = () => {
    console.log("CANCEL BUTTON CLICKED - CLOSING MODAL IMMEDIATELY");

    // CLOSE MODAL IMMEDIATELY
    setShowCanvasSizeModal(false);
    setPendingCanvasSize(null);

    console.log("Modal closed and pending size cleared");
  };

  const handleImageElementUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result;
      if (typeof data === "string") {
        addImageFromURL(data);
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  // Update hasCanvasObjects in store when canvas changes
  React.useEffect(() => {
    if (!canvas) {
      setHasCanvasObjects(false);
      return;
    }

    const updateObjectCount = () => {
      const objects = canvas
        .getObjects()
        .filter(
          (obj: any) => obj.id !== "grid-line" && obj.id !== "alignment-line"
        );
      const hasObjects = objects.length > 0;
      setHasCanvasObjects(hasObjects);
    };

    // Initial check
    updateObjectCount();

    // Listen for canvas changes
    const handleObjectChange = () => {
      // Use setTimeout to debounce rapid changes
      setTimeout(updateObjectCount, 50);
    };

    canvas.on("object:added", handleObjectChange);
    canvas.on("object:removed", handleObjectChange);

    return () => {
      canvas.off("object:added", handleObjectChange);
      canvas.off("object:removed", handleObjectChange);
    };
  }, [canvas, setHasCanvasObjects]);

  // Get shouldShowCanvasSize from store
  const shouldShowCanvasSize = getShouldShowCanvasSize();

  if (!fabric) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">
          Loading Editor...
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col md:flex-row h-screen w-screen bg-gray-100 font-sans overflow-hidden relative"
      onClick={(e) => {
        // Close hover panel if clicking outside and it's not pinned
        if (
          !editorMode &&
          hoveredMode &&
          !(e.target as Element).closest("aside")
        ) {
          setHoveredMode(null);
        }
      }}
    >
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        className="hidden text-gray-700"
        onChange={handleImageElementUpload}
      />

      {/* Left Sidebar - Navigation */}
      <SidebarNavigation
        editorMode={editorMode}
        setEditorMode={setEditorMode}
        hoveredMode={hoveredMode}
        setHoveredMode={setHoveredMode}
        onImageUpload={() => imageInputRef.current?.click()}
      />

      {/* Left Panel - Tools */}
      <LeftPanel
        editorMode={editorMode}
        hoveredMode={hoveredMode}
        setHoveredMode={setHoveredMode}
        setEditorMode={setEditorMode}
        canvas={canvas}
        selectedObject={selectedObject}
        onSelectTemplate={loadTemplate}
        onImageUpload={handleBackgroundImageUpload}
        {...shapeHooks}
        {...lineHooks}
        {...textHooks}
        {...frameHooks}
        addStickyNote={addStickyNote}
        addTable={addTable}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md z-10 flex justify-between items-center p-2 space-x-2 flex-shrink-0">
          {/* Layer Management Controls */}
          <LayerControls
            selectedObjects={selectedObjects}
            {...layerManagement}
          />

          {/* Center Controls - Canvas Size */}
          <div className="flex items-center space-x-2">
            <CanvasSizePanel
              currentSize={canvasSize}
              onSizeChange={handleCanvasSizeChange}
              shouldShow={shouldShowCanvasSize}
            />
            {!shouldShowCanvasSize && (
              <div className="text-sm text-gray-500 px-3 py-2 bg-gray-100 rounded-md">
                Canvas size locked while designing
              </div>
            )}
          </div>

          {/* Right side controls */}
          <HeaderActions
            selectedObject={selectedObject}
            deleteSelected={deleteSelected}
            exportAsPNG={exportAsPNG}
            exportAsPDF={exportAsPDF}
          />
        </header>

        {/* Alignment Toolbar */}
        {/* <AlignmentToolbar canvas={canvas} selectedObjects={selectedObjects} /> */}

        {/* Canvas and Properties Panel Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div
            className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden min-w-0"
            style={{
              backgroundImage: `
                   linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                   linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                   linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                   linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                 `,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              backgroundColor: "#e5e5e5",
            }}
          >
            <CanvaContextMenu canvas={canvas} selectedObject={selectedObject}>
              <div className="w-full h-full relative">
                {/* Top Property Panel - Appears above canvas when object is selected */}
                {selectedObject && (
                  <TopPropertyPanel
                    selectedObject={selectedObject}
                    canvas={canvas}
                    setHoveredMode={setHoveredMode}
                    setEditorMode={setEditorMode}
                  />
                )}

                <CanvasComponent
                  fabric={fabric}
                  setCanvas={handleSetCanvas}
                  setSelectedObject={setSelectedObject}
                  canvasWidth={canvasSize.width}
                  canvasHeight={canvasSize.height}
                />
                {/* Add alignment guides component */}
                <AlignmentGuides canvas={canvas} fabric={fabric} />
                {/* Add canvas stability component */}
                <CanvasStability canvas={canvas} fabric={fabric} />
                {/* Add precision selection component */}
                <PrecisionSelection canvas={canvas} fabric={fabric} />
                {/* Add context menu for better object selection */}
                <ContextMenu canvas={canvas} fabric={fabric} />
                {/* Add line visibility enhancer */}
                <LineVisibilityEnhancer canvas={canvas} fabric={fabric} />
                {/* Add text editing enhancer to fix typing delays */}
                <TextEditingEnhancer canvas={canvas} fabric={fabric} />
                {/* Add selection tooltip */}
                <SelectionTooltip
                  canvas={canvas}
                  fabric={fabric}
                  selectedObject={selectedObject}
                />
              </div>
            </CanvaContextMenu>
          </div>

          {/* Right Panel - Layer Panel Only */}
          <aside className="w-80 bg-white border-l border-gray-200 overflow-hidden shadow-lg flex-shrink-0 flex flex-col">
            {/* Layer Panel */}
            <div className="flex-1 overflow-hidden">
              <LayerPanel
                canvas={canvas}
                selectedObjects={selectedObjects}
                onSelectionChange={() => {}} // This is handled by the canvas itself
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Canvas Size Change Confirmation Modal */}
      <ConfirmModal
        isOpen={showCanvasSizeModal}
        title="Change Canvas Size"
        message="Changing canvas size will scale existing objects. Do you want to continue?"
        confirmText="Scale Objects"
        cancelText="Cancel"
        onConfirm={handleConfirmCanvasSizeChange}
        onCancel={handleCancelCanvasSizeChange}
      />

      {/* Debug: Force close button */}
      {showCanvasSizeModal && (
        <button
          onClick={() => {
            console.log("FORCE CLOSING MODAL");
            setShowCanvasSizeModal(false);
            setPendingCanvasSize(null);
          }}
          className="fixed top-4 right-4 z-[60] bg-red-600 text-white px-4 py-2 rounded"
        >
          FORCE CLOSE MODAL
        </button>
      )}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef } from "react";
import CanvasComponent from "@/components/canvas-component";
import PropertiesPanel from "@/components/properties-pannel";
import AlignmentToolbar from "@/components/alignment-toolbar";
import LayerPanel from "@/components/layer-panel";
import CanvasSizePanel, {
  CanvasSize,
  PRESET_SIZES,
} from "@/components/canvas-size-panel";

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

// Import UI components
import SidebarNavigation, { EditorMode } from "@/components/sidebar-navigation";
import LeftPanel from "@/components/left-panel";
import LayerControls from "@/components/layer-controls";
import HeaderActions from "@/components/header-actions";

// Main App Component
export default function CertificateGeneratorPage() {
  const [editorMode, setEditorMode] = useState<EditorMode>("templates");
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(PRESET_SIZES.CUSTOM);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Custom hooks
  const {
    fabric,
    canvas,
    selectedObject,
    selectedObjects,
    setSelectedObject,
    handleSetCanvas,
  } = useFabricCanvas();

  const { saveToHistory, undo, redo } = useCanvasHistory(canvas);

  const shapeHooks = useCanvasShapes(canvas, fabric, saveToHistory);
  const lineHooks = useCanvasLines(canvas, fabric, saveToHistory);
  const textHooks = useCanvasText(canvas, fabric, saveToHistory);
  const frameHooks = useCanvasFrames(canvas, fabric, saveToHistory);

  const { deleteSelected, addImageFromURL, addStickyNote, addTable } =
    useCanvasOperations(
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

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

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
        const shouldScale = window.confirm(
          "Changing canvas size will scale existing objects. Do you want to continue?"
        );

        if (!shouldScale) {
          return; // User cancelled
        }

        // Scale all objects
        objects.forEach((obj: any) => {
          if (obj.type !== "grid-line" && obj.id !== "alignment-line") {
            obj.scaleX = (obj.scaleX || 1) * scaleX;
            obj.scaleY = (obj.scaleY || 1) * scaleY;
            obj.left = obj.left * scaleX;
            obj.top = obj.top * scaleY;
            obj.setCoords();
          }
        });
      }

      // Set new canvas dimensions
      canvas.setDimensions({ width: newSize.width, height: newSize.height });
      canvas.renderAll();
      saveToHistory();
    }

    setCanvasSize(newSize);
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
    <div className="flex flex-col md:flex-row h-screen w-screen bg-gray-100 font-sans overflow-hidden">
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
        onImageUpload={() => imageInputRef.current?.click()}
      />

      {/* Left Panel - Tools */}
      <LeftPanel
        editorMode={editorMode}
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
            />
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
        <AlignmentToolbar canvas={canvas} selectedObjects={selectedObjects} />

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
            <CanvasComponent
              fabric={fabric}
              setCanvas={handleSetCanvas}
              setSelectedObject={setSelectedObject}
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
            />
          </div>

          {/* Right Panels */}
          <aside className="w-80 bg-white border-l border-gray-200 overflow-hidden shadow-lg flex-shrink-0 flex flex-col">
            {/* Layer Panel */}
            <div className="flex-1 overflow-hidden">
              <LayerPanel
                canvas={canvas}
                selectedObjects={selectedObjects}
                onSelectionChange={() => {}} // This is handled by the canvas itself
              />
            </div>

            {/* Properties Panel - Only show when object is selected */}
            {selectedObject && (
              <div className="border-t border-gray-200 max-h-96 overflow-y-auto p-4">
                <PropertiesPanel
                  selectedObject={selectedObject}
                  canvas={canvas}
                />
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

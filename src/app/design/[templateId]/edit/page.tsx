/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import CanvasComponent from "@/components/canvas-component";
import AlignmentGuides from "@/components/alignment-guides";
import CanvasStability from "@/components/canvas-stability";
import PrecisionSelection from "@/components/precision-selection";
import ContextMenu from "@/components/context-menu";
import LineVisibilityEnhancer from "@/components/line-visibility-enhancer";
import CanvaContextMenu from "@/components/canva-context-menu";
import TextEditingEnhancer from "@/components/text-editing-enhancer";
import SelectionOverlay from "@/components/selection-overlay";
import CanvasSizePanel, { CanvasSize } from "@/components/canvas-size-panel";
import { useEditorStore } from "@/stores/useEditorStore";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useSelectionState } from "@/hooks/useSelectionState";
import { getCanvasManager } from "@/lib/canvasManager";
import { getTemplate, isValidTemplateId } from "@/lib/templateMap";

// Import custom hooks
import { useFabricCanvas } from "@/hooks/useFabricCanvas";
import { useCanvasShapes } from "@/hooks/useCanvasShapes";
import { useCanvasLines } from "@/hooks/useCanvasLines";
import { useCanvasText } from "@/hooks/useCanvasText";
import { useCanvasFrames } from "@/hooks/useCanvasFrames";
import { useCanvasOperations } from "@/hooks/useCanvasOperations";
import { useLayerManagement } from "@/hooks/useLayerManagement";
import { useCanvasExport } from "@/hooks/useCanvasExport";
import { useTemplateLoader } from "@/hooks/useTemplateLoader";
import { useEditorShortcuts } from "@/hooks/useKeyboardShortcuts";

// Import undo/redo system
import {
  initFabric,
  restoreCanvasFromHistory,
  setTemplateLoading,
  isTemplateLoading,
  clearHistoryAfterTemplateLoad,
} from "@/lib/fabricHistory";
import { useCanvasStore as useHistoryCanvasStore } from "@/hooks/useCanvasStore";

// Import UI components
import SidebarNavigation, { EditorMode } from "@/components/sidebar-navigation";
import LeftPanel from "@/components/left-panel";
import TemplatesPanel from "@/components/templates-panel";
import ElementsPanel from "@/components/elements-panel";
import TextPanel from "@/components/text-panel";
import ToolsPanel from "@/components/tools-panel";
import AdvancedSettingsLeftPanel from "@/components/advanced-settings-left-panel";
import PositionLeftPanel from "@/components/position-left-panel";
import EffectsLeftPanel from "@/components/effects-left-panel";
import { Button } from "@/components/ui/button";
import HeaderActions from "@/components/header-actions";
import { ConfirmModal } from "@/components/confirm-modal";
import FabricPatchInitializer from "@/components/fabric-patch-initializer";
import Breadcrumb from "@/components/breadcrumb";

// Import mobile components
import MobileToolbar from "@/components/mobile-toolbar";
import MobileBottomPanel from "@/components/mobile-bottom-panel";
import MobileHeader from "@/components/mobile-header";
import { useResponsive, useScrollDirection } from "@/hooks/useResponsive";

// Design Editor Page Component
export default function DesignEditorPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params?.templateId as string;

  // Check if template ID is valid
  useEffect(() => {
    if (!isValidTemplateId(templateId)) {
      router.push("/");
      return;
    }
  }, [templateId, router]);

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
    // Mobile states
    setIsMobileView,
    showMobileBottomPanel,
    setShowMobileBottomPanel,
    showMobilePropertyPanel,
    setShowMobilePropertyPanel,
    isMobileToolbarVisible,
    setIsMobileToolbarVisible,
  } = useEditorStore();

  // Responsive hooks
  const { isMobile } = useResponsive();
  const { scrollDirection } = useScrollDirection();

  const { fabric, canvas, selectedObject, setSelectedObject } =
    useCanvasStore();

  // Selection state management
  const { selectionState, hideSelection } = useSelectionState(canvas, fabric);

  const imageInputRef = useRef<HTMLInputElement>(null);

  // Custom hooks
  const { handleSetCanvas } = useFabricCanvas();

  const shapeHooks = useCanvasShapes(canvas, fabric);
  const lineHooks = useCanvasLines(canvas, fabric);
  const textHooks = useCanvasText(canvas, fabric);
  const frameHooks = useCanvasFrames(canvas, fabric);

  const {
    deleteSelected,
    addImageFromURL,
    addStickyNote,
    addTable,
    handleCopy,
    handlePaste,
  } = useCanvasOperations(canvas, fabric, selectedObject, setSelectedObject);

  const layerManagement = useLayerManagement(canvas, fabric);
  const { exportAsPNG, exportAsPDF } = useCanvasExport(canvas, canvasSize);
  const { loadTemplate, handleBackgroundImageUpload } = useTemplateLoader(
    canvas,
    canvasSize
  );

  // Initialize undo/redo history system FIRST with better timing
  useEffect(() => {
    if (canvas && fabric) {
      console.log("🎯 Initializing undo/redo system for main app...");
      // Add a small delay to ensure canvas is fully initialized
      const timer = setTimeout(() => {
        // Double-check canvas is still valid and has required methods
        if (canvas && typeof canvas.getObjects === "function") {
          try {
            canvas.getObjects(); // Test that it actually works
            initFabric(canvas);
            console.log("✅ Undo/redo system initialized for main app");
          } catch (error) {
            console.warn("⏳ Canvas not ready, retrying in 100ms...", error);
            setTimeout(() => {
              if (canvas && typeof canvas.getObjects === "function") {
                initFabric(canvas);
                console.log(
                  "✅ Undo/redo system initialized for main app (retry)"
                );
              }
            }, 100);
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [canvas, fabric]);

  // Load template on mount AFTER history system is ready
  useEffect(() => {
    if (canvas && fabric && isValidTemplateId(templateId)) {
      // Wait a bit for history system to be fully initialized
      setTimeout(() => {
        const template = getTemplate(templateId);
        if (template) {
          console.log("📄 Loading template:", templateId);
          // Set loading state to prevent auto-restore during template load
          setTemplateLoading(true);

          // Load the template
          loadTemplate(template.json);

          // Clear loading state after template is loaded
          setTimeout(() => {
            setTemplateLoading(false);

            // Clear history to prevent initial undo state
            clearHistoryAfterTemplateLoad();

            console.log("✅ Template loading complete");
          }, 500); // Give time for template to fully load
        }
      }, 200);
    }
  }, [canvas, fabric, templateId, loadTemplate]);

  // Auto-restore canvas from history (for undo/redo) - but not during template loading
  const { json } = useHistoryCanvasStore();
  useEffect(() => {
    if (canvas && json && !isTemplateLoading()) {
      console.log("🔄 Restoring canvas from history in main app...");
      restoreCanvasFromHistory(canvas, json);
    } else if (isTemplateLoading()) {
      console.log("⏭️ Skipping auto-restore - template is loading");
    }
  }, [canvas, json]);

  // Sync mobile view state with responsive breakpoints
  useEffect(() => {
    setIsMobileView(isMobile);
  }, [isMobile, setIsMobileView]);

  // Handle mobile toolbar visibility based on scroll direction (disabled for now in full-screen app)
  useEffect(() => {
    if (!isMobile) return;

    // For now, keep toolbar always visible in full-screen canvas app
    // Future enhancement: detect canvas pan/zoom gestures instead of page scroll
    setIsMobileToolbarVisible(true);

    /* Scroll-based hiding - disabled for full-screen app
    if (scrollDirection === 'down') {
      setIsMobileToolbarVisible(false);
    } else if (scrollDirection === 'up') {
      setIsMobileToolbarVisible(true);
    }
    */
  }, [scrollDirection, isMobile, setIsMobileToolbarVisible]);

  // Handle mobile panel logic
  useEffect(() => {
    if (!isMobile) {
      // Close mobile panels when switching to desktop
      setShowMobileBottomPanel(false);
      setShowMobilePropertyPanel(false);
      return;
    }

    // Don't auto-control the bottom panel - let the toolbar handle it
    // The showMobileBottomPanel state is controlled by handleMobileEditorModeChange
  }, [isMobile, setShowMobileBottomPanel, setShowMobilePropertyPanel]);

  // Handle mobile property panel when object is selected (with delay to allow dragging)
  useEffect(() => {
    if (!isMobile) return;

    let isDragging = false;

    if (canvas) {
      const handleObjectMoving = () => {
        isDragging = true;
      };

      const handleObjectMoved = () => {
        // Reset dragging state after a short delay
        setTimeout(() => {
          isDragging = false;
        }, 100);
      };

      canvas.on("object:moving", handleObjectMoving);
      canvas.on("object:moved", handleObjectMoved);

      if (selectedObject && !showMobilePropertyPanel) {
        // Add a delay to prevent property panel from opening during drag operations
        const timer = setTimeout(() => {
          // Only open if the object is still selected and not being dragged
          if (
            selectedObject &&
            !isDragging &&
            !canvas.getActiveObject()?.isMoving
          ) {
            console.log(
              "📱 Main Page: Opening mobile property panel after delay"
            );
            setShowMobilePropertyPanel(true);
          }
        }, 300); // Reduced delay to 300ms for better responsiveness

        return () => {
          clearTimeout(timer);
          canvas.off("object:moving", handleObjectMoving);
          canvas.off("object:moved", handleObjectMoved);
        };
      } else if (!selectedObject && showMobilePropertyPanel) {
        setShowMobilePropertyPanel(false);
      }

      return () => {
        canvas.off("object:moving", handleObjectMoving);
        canvas.off("object:moved", handleObjectMoved);
      };
    }
  }, [
    isMobile,
    selectedObject,
    showMobilePropertyPanel,
    setShowMobilePropertyPanel,
    canvas,
  ]);

  // Coordinate mobile panels - close bottom panel when property panel opens for object editing
  useEffect(() => {
    if (!isMobile) return;

    // If property panel opens for an object and we have a bottom panel open for object-specific modes
    // (advanced-settings, position, effects), close the bottom panel
    // UNLESS the mode was triggered from the property panel itself (in which case both should coexist)
    if (showMobilePropertyPanel && selectedObject && showMobileBottomPanel) {
      if (
        editorMode &&
        ["advanced-settings", "position", "effects"].includes(editorMode)
      ) {
        console.log(
          "📱 Main Page: Both property panel and specialized mode panel are open - letting them coexist"
        );
        // Don't close either panel - let them coexist when triggered from property panel
      }
    }
  }, [
    isMobile,
    showMobilePropertyPanel,
    selectedObject,
    showMobileBottomPanel,
    editorMode,
    setShowMobileBottomPanel,
    setEditorMode,
  ]);

  // Mobile-specific editor mode handler
  const handleMobileEditorModeChange = (mode: EditorMode) => {
    console.log("📱 Main Page: Mobile editor mode change requested:", mode);

    if (mode === editorMode) {
      // If clicking the same mode, close panel
      console.log("📱 Main Page: Closing same mode panel");
      setEditorMode(null);
      setShowMobileBottomPanel(false);
    } else {
      // Open new panel
      console.log("📱 Main Page: Opening new panel for mode:", mode);
      setEditorMode(mode);
      setShowMobileBottomPanel(true);

      // For modes that should replace the property panel (advanced, position, effects)
      // only close the property panel if there's no selected object
      // If there's a selected object, let both panels coexist (property panel + specialized mode)
      if (mode && ["advanced-settings", "position", "effects"].includes(mode)) {
        if (!selectedObject) {
          console.log(
            "📱 Main Page: Closing property panel for specialized mode (no object selected):",
            mode
          );
          setShowMobilePropertyPanel(false);
        } else {
          console.log(
            "📱 Main Page: Keeping property panel open - specialized mode triggered for selected object:",
            mode
          );
          // Keep property panel open when object is selected
        }
      }
    }
  };

  // Mobile panel close handlers
  const handleCloseMobileBottomPanel = () => {
    console.log("📱 Main Page: Closing mobile bottom panel");
    setShowMobileBottomPanel(false);
    setEditorMode(null);
  };

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

    // Use canvas manager for safe dimension changes
    const manager = getCanvasManager(canvas);

    const previousSize = canvasSize;

    // Calculate simple scale factors
    const scaleX = newSize.width / previousSize.width;
    const scaleY = newSize.height / previousSize.height;

    console.log(`Scaling factors: ${scaleX}, ${scaleY}`);

    // Scale objects before dimension change
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

    // Use canvas manager for safe dimension change
    manager.safeDimensionChange(newSize.width, newSize.height, () => {
      // This callback runs after dimension change is complete and context is valid
      console.log("Canvas dimension change completed, rendering...");
      manager.safeRender(() => {
        // This runs after safe rendering is complete
        console.log("Canvas rendered successfully, saving to history...");

        console.log("Canvas resize completed successfully");
      });
    });
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

  // Show loading while checking template validity
  if (!isValidTemplateId(templateId)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">
          Invalid template. Redirecting...
        </div>
      </div>
    );
  }

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
    <>
      <FabricPatchInitializer />
      <div
        className={`flex h-screen w-screen bg-gray-100 font-sans overflow-hidden relative ${
          isMobile ? "flex-col" : "flex-col md:flex-row"
        }`}
        suppressHydrationWarning={true}
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

        {/* Left Panel - Tools - Hidden on mobile */}
        {!isMobile && (
          <LeftPanel
            editorMode={editorMode}
            hoveredMode={hoveredMode}
            setHoveredMode={setHoveredMode}
            setEditorMode={setEditorMode}
            canvas={canvas}
            fabric={fabric}
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
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header */}
          {isMobile && (
            <MobileHeader
              selectedObject={selectedObject}
              deleteSelected={deleteSelected}
              exportAsPNG={exportAsPNG}
              exportAsPDF={exportAsPDF}
            />
          )}

          {/* Desktop Header - Hide on mobile to maximize canvas space */}
          {!isMobile && (
            <header className="bg-white shadow-md z-10 flex justify-between items-center p-2 space-x-2 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <Breadcrumb />
              </div>

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
          )}

          {/* Canvas and Properties Panel Container */}
          <div className="flex-1 flex overflow-hidden">
            {/* Canvas Area */}
            <div
              className={`flex-1 flex items-center justify-center overflow-hidden min-w-0 ${
                isMobile ? "p-2 pb-20" : "p-4 md:p-8"
              }`}
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
                  {/* Selection Overlay - Unified tooltip and top property panel */}
                  <SelectionOverlay
                    canvas={canvas}
                    fabric={fabric}
                    selectionState={selectionState}
                    onHideSelection={hideSelection}
                    setEditorMode={
                      isMobile ? handleMobileEditorModeChange : setEditorMode
                    }
                  />

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
                </div>
              </CanvaContextMenu>
            </div>
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

        {/* Mobile Components */}
        {isMobile && (
          <>
            {/* Mobile Bottom Toolbar */}
            <MobileToolbar
              editorMode={editorMode}
              setEditorMode={handleMobileEditorModeChange}
              onImageUpload={() => imageInputRef.current?.click()}
              isVisible={isMobileToolbarVisible}
            />

            {/* Mobile Bottom Panel for Tools */}
            <MobileBottomPanel
              isOpen={showMobileBottomPanel}
              onClose={handleCloseMobileBottomPanel}
              title={
                editorMode === "templates"
                  ? "Design Templates"
                  : editorMode === "elements"
                  ? "Elements"
                  : editorMode === "text"
                  ? "Text Tools"
                  : editorMode === "tools"
                  ? "Tools"
                  : editorMode === "advanced-settings"
                  ? "Advanced Settings"
                  : editorMode === "position"
                  ? "Position & Layers"
                  : editorMode === "effects"
                  ? "Text Effects"
                  : "Panel"
              }
              maxHeight="70vh"
              enableSwipeGestures={true}
            >
              {(() => {
                console.log(
                  "🔍 MobileBottomPanel rendering with editorMode:",
                  editorMode,
                  "isOpen:",
                  showMobileBottomPanel
                );
                return null;
              })()}
              {/* Mobile-optimized content rendering */}
              <div className="p-4">
                {editorMode === "templates" && (
                  <TemplatesPanel
                    onSelectTemplate={loadTemplate}
                    onImageUpload={handleBackgroundImageUpload}
                    canvas={canvas}
                  />
                )}

                {editorMode === "elements" && (
                  <ElementsPanel
                    addSquare={shapeHooks.addSquare}
                    addCircle={shapeHooks.addCircle}
                    addTriangle={shapeHooks.addTriangle}
                    addRectangle={shapeHooks.addRectangle}
                    addEllipse={shapeHooks.addEllipse}
                    addStar={shapeHooks.addStar}
                    addHeart={shapeHooks.addHeart}
                    addHexagon={shapeHooks.addHexagon}
                    addPentagon={shapeHooks.addPentagon}
                    addDiamond={shapeHooks.addDiamond}
                    addArrowShape={shapeHooks.addArrowShape}
                    addLine={lineHooks.addLine}
                    addDashedLine={lineHooks.addDashedLine}
                    addArrowLine={lineHooks.addArrowLine}
                    addZigzagLine={lineHooks.addZigzagLine}
                    addWavyLine={lineHooks.addWavyLine}
                    addDottedLine={lineHooks.addDottedLine}
                    addDoubleLine={lineHooks.addDoubleLine}
                    addCurvedLine={lineHooks.addCurvedLine}
                    addStepsLine={lineHooks.addStepsLine}
                    addThickLine={lineHooks.addThickLine}
                    addDashDotLine={lineHooks.addDashDotLine}
                  />
                )}

                {editorMode === "text" && (
                  <TextPanel
                    addText={textHooks.addText}
                    addHeading={textHooks.addHeading}
                    addSubheading={textHooks.addSubheading}
                    addBodyText={textHooks.addBodyText}
                  />
                )}

                {editorMode === "tools" && (
                  <ToolsPanel
                    canvas={canvas}
                    addStickyNote={addStickyNote}
                    addTable={addTable}
                    addSimpleFrame={frameHooks.addSimpleFrame}
                    addDoubleFrame={frameHooks.addDoubleFrame}
                    addDecorativeFrame={frameHooks.addDecorativeFrame}
                    addRoundedFrame={frameHooks.addRoundedFrame}
                  />
                )}

                {editorMode === "advanced-settings" && (
                  <AdvancedSettingsLeftPanel />
                )}

                {editorMode === "position" && (
                  <PositionLeftPanel
                    canvas={canvas}
                    selectedObject={selectedObject}
                    onClose={handleCloseMobileBottomPanel}
                  />
                )}

                {editorMode === "effects" && (
                  <EffectsLeftPanel
                    canvas={canvas}
                    fabric={fabric}
                    selectedObject={selectedObject}
                    onClose={handleCloseMobileBottomPanel}
                  />
                )}
              </div>
            </MobileBottomPanel>
          </>
        )}

        {/* Debug: Force close button */}
        {showCanvasSizeModal && (
          <Button
            onClick={() => {
              console.log("FORCE CLOSING MODAL");
              setShowCanvasSizeModal(false);
              setPendingCanvasSize(null);
            }}
            variant="destructive"
            className="fixed top-4 right-4 z-[60]"
          >
            FORCE CLOSE MODAL
          </Button>
        )}
      </div>
    </>
  );
}

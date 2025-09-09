/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import TemplatesPanel from "@/components/templates-panel";
import ElementsPanel from "@/components/elements-panel";
import ToolsPanel from "@/components/tools-panel";
import TextPanel from "@/components/text-panel";
import AdvancedSettingsLeftPanel from "@/components/advanced-settings-left-panel";
import PositionLeftPanel from "@/components/position-left-panel";
import EffectsLeftPanel from "@/components/effects-left-panel";
import ContextMenuLeftPanel from "@/components/context-menu-left-panel";
import { EditorMode } from "./sidebar-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LayoutTemplate,
  Shapes,
  Type,
  Wrench,
  Settings,
  Move,
  Sparkles,
  Menu,
} from "lucide-react";

interface LeftPanelProps {
  editorMode: EditorMode;
  hoveredMode: EditorMode;
  setHoveredMode: (mode: EditorMode) => void;
  setEditorMode: (mode: EditorMode) => void;
  canvas: any;
  fabric: any;
  selectedObject: any;
  onSelectTemplate: (template: any) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Shape functions
  addSquare: (options?: { fill?: string }) => void;
  addCircle: (options?: { fill?: string }) => void;
  addTriangle: (options?: { fill?: string }) => void;
  addRectangle: (options?: { fill?: string }) => void;
  addEllipse: (options?: { fill?: string }) => void;
  addStar: (options?: { fill?: string }) => void;
  addHeart: (options?: { fill?: string }) => void;
  addHexagon: (options?: { fill?: string }) => void;
  addPentagon: (options?: { fill?: string }) => void;
  addDiamond: (options?: { fill?: string }) => void;
  addArrowShape: (options?: { fill?: string }) => void;
  // Line functions
  addLine: (options?: any) => void;
  addDashedLine: (options?: any) => void;
  addArrowLine: (options?: { stroke?: string }) => void;
  addZigzagLine: (options?: { stroke?: string }) => void;
  addWavyLine: (options?: { stroke?: string }) => void;
  addDottedLine: (options?: { stroke?: string }) => void;
  addDoubleLine: (options?: { stroke?: string }) => void;
  addCurvedLine: (options?: { stroke?: string }) => void;
  addStepsLine: (options?: { stroke?: string }) => void;
  addThickLine: (options?: { stroke?: string }) => void;
  addDashDotLine: (options?: { stroke?: string }) => void;
  // Text functions
  addText: (text: string, options?: any) => void;
  addHeading: (options?: any) => void;
  addSubheading: (options?: any) => void;
  addBodyText: (options?: any) => void;
  // Tool functions
  addStickyNote: () => void;
  addSimpleFrame: (options?: { stroke?: string; strokeWidth?: number }) => void;
  addDoubleFrame: (options?: { stroke?: string; strokeWidth?: number }) => void;
  addDecorativeFrame: (options?: {
    stroke?: string;
    strokeWidth?: number;
  }) => void;
  addRoundedFrame: (options?: {
    stroke?: string;
    strokeWidth?: number;
  }) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  editorMode,
  hoveredMode,
  setHoveredMode,
  setEditorMode,
  canvas,
  fabric,
  selectedObject,
  onSelectTemplate,
  onImageUpload,
  addSquare,
  addCircle,
  addTriangle,
  addRectangle,
  addEllipse,
  addStar,
  addHeart,
  addHexagon,
  addPentagon,
  addDiamond,
  addArrowShape,
  addLine,
  addDashedLine,
  addArrowLine,
  addZigzagLine,
  addWavyLine,
  addDottedLine,
  addDoubleLine,
  addCurvedLine,
  addStepsLine,
  addThickLine,
  addDashDotLine,
  addText,
  addHeading,
  addSubheading,
  addBodyText,
  addStickyNote,
  addSimpleFrame,
  addDoubleFrame,
  addDecorativeFrame,
  addRoundedFrame,
}) => {
  // Timeout ref to manage closing delays
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  // Track if mouse is over the panel
  const isMouseOverRef = React.useRef(false);

  // Icon mapping for different modes
  const modeIcons: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    templates: LayoutTemplate,
    elements: Shapes,
    text: Type,
    tools: Wrench,
    "advanced-settings": Settings,
    position: Move,
    effects: Sparkles,
    "context-menu": Menu,
  };

  // Determine which mode to show - prioritize editorMode, then hoveredMode
  const activeMode = editorMode || hoveredMode;
  const IconComponent = activeMode ? modeIcons[activeMode] : null;

  // Don't render if no active mode
  if (!activeMode) {
    return null;
  }

  const handleMouseEnter = () => {
    // Clear any pending close timeout when entering the panel
    isMouseOverRef.current = true;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    isMouseOverRef.current = false;
    // Only close if it's a hovered mode (not clicked/pinned)
    if (!editorMode && hoveredMode) {
      // Clear existing timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }

      // Set new timeout with longer delay
      closeTimeoutRef.current = setTimeout(() => {
        // Double-check that mouse is still not over before closing
        if (!isMouseOverRef.current && !editorMode && hoveredMode) {
          setHoveredMode(null);
        }
        closeTimeoutRef.current = null;
      }, 300);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent event bubbling and clear any pending close timeout when clicking inside the panel
    e.stopPropagation();
    isMouseOverRef.current = true;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  return (
    <>
      {/* Bridge area to help with hover transition */}
      {activeMode && !editorMode && (
        <div
          className="absolute left-16 w-8 z-[65]"
          style={{
            top: "64px",
            height: "calc(100vh - 100px)",
          }}
          onMouseEnter={() => {
            isMouseOverRef.current = true;
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current);
              closeTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            isMouseOverRef.current = false;
            // Only close if it's a hovered mode (not clicked/pinned)
            if (!editorMode && hoveredMode) {
              // Clear existing timeout
              if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
              }

              // Set new timeout with longer delay
              closeTimeoutRef.current = setTimeout(() => {
                // Double-check that mouse is still not over before closing
                if (!isMouseOverRef.current && !editorMode && hoveredMode) {
                  setHoveredMode(null);
                }
                closeTimeoutRef.current = null;
              }, 300);
            }
          }}
        />
      )}

      <Card
        className={cn(
          "absolute left-20 w-96 flex-shrink-0 z-[70]",
          "rounded-3xl border-border/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "shadow-2xl transition-all duration-300 ease-out",
          "hover:shadow-3xl hover:bg-background/100",
          activeMode
            ? "translate-x-0 opacity-100 scale-100"
            : "-translate-x-full opacity-0 scale-95"
        )}
        style={{
          top: "64px", // Start at the top of the Design item
          height: "calc(100vh - 100px)", // Leave minimal space at bottom
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 25px -6px rgba(0, 0, 0, 0.1)",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        data-left-panel
      >
        <CardContent className="p-0 h-full flex flex-col" data-left-panel>
          {/* Header with current mode */}
          <CardHeader
            className="py-3 px-4 border-b border-border/50 bg-muted/30 rounded-t-3xl"
            data-left-panel
          >
            <CardTitle className="text-base font-semibold capitalize flex items-center gap-3 text-foreground/90">
              {IconComponent && <IconComponent className="h-4 w-4" />}
              {activeMode?.replace("-", " ")}
              {!editorMode && hoveredMode && (
                <Badge
                  variant="secondary"
                  className="text-xs font-normal ml-auto"
                >
                  Preview
                </Badge>
              )}
            </CardTitle>
          </CardHeader>

          {/* Scrollable content */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full" data-left-panel>
              <div className="p-4 space-y-2" data-left-panel>
                {activeMode === "templates" && (
                  <TemplatesPanel
                    onSelectTemplate={onSelectTemplate}
                    onImageUpload={onImageUpload}
                    canvas={canvas}
                  />
                )}

                {activeMode === "elements" && (
                  <ElementsPanel
                    addSquare={addSquare}
                    addCircle={addCircle}
                    addTriangle={addTriangle}
                    addRectangle={addRectangle}
                    addEllipse={addEllipse}
                    addStar={addStar}
                    addHeart={addHeart}
                    addHexagon={addHexagon}
                    addPentagon={addPentagon}
                    addDiamond={addDiamond}
                    addArrowShape={addArrowShape}
                    addLine={addLine}
                    addDashedLine={addDashedLine}
                    addArrowLine={addArrowLine}
                    addZigzagLine={addZigzagLine}
                    addWavyLine={addWavyLine}
                    addDottedLine={addDottedLine}
                    addDoubleLine={addDoubleLine}
                    addCurvedLine={addCurvedLine}
                    addStepsLine={addStepsLine}
                    addThickLine={addThickLine}
                    addDashDotLine={addDashDotLine}
                  />
                )}
                {activeMode === "text" && (
                  <TextPanel
                    addText={addText}
                    addHeading={addHeading}
                    addSubheading={addSubheading}
                    addBodyText={addBodyText}
                    canvas={canvas}
                  />
                )}
                {activeMode === "tools" && (
                  <ToolsPanel
                    canvas={canvas}
                    addStickyNote={addStickyNote}
                    addSimpleFrame={addSimpleFrame}
                    addDoubleFrame={addDoubleFrame}
                    addDecorativeFrame={addDecorativeFrame}
                    addRoundedFrame={addRoundedFrame}
                  />
                )}
                {activeMode === "advanced-settings" && (
                  <AdvancedSettingsLeftPanel />
                )}
                {activeMode === "position" && (
                  <PositionLeftPanel
                    canvas={canvas}
                    selectedObject={selectedObject}
                    onClose={() => {
                      if (editorMode === "position") {
                        // If position mode is pinned, clear it
                        setEditorMode(null);
                      } else {
                        // If it's just hovered, clear the hover
                        setHoveredMode(null);
                      }
                    }}
                  />
                )}
                {activeMode === "effects" && (
                  <EffectsLeftPanel
                    canvas={canvas}
                    fabric={fabric}
                    selectedObject={selectedObject}
                    onClose={() => {
                      if (editorMode === "effects") {
                        // If effects mode is pinned, clear it
                        setEditorMode(null);
                      } else {
                        // If it's just hovered, clear the hover
                        setHoveredMode(null);
                      }
                    }}
                  />
                )}

                {activeMode === "context-menu" && (
                  <ContextMenuLeftPanel
                    canvas={canvas}
                    fabric={fabric}
                    selectedObject={
                      selectedObject || canvas?.getActiveObject?.() || null
                    }
                    onLayerAction={(action) => {
                      const targetObject =
                        selectedObject || canvas?.getActiveObject?.();
                      if (!targetObject || !canvas) return;

                      // Handle layer management actions
                      switch (action) {
                        case "bringToFront":
                          canvas.bringToFront(targetObject);
                          break;
                        case "bringForward":
                          canvas.bringForward(targetObject);
                          break;
                        case "sendBackward":
                          canvas.sendBackward(targetObject);
                          break;
                        case "sendToBack":
                          canvas.sendToBack(targetObject);
                          break;
                        case "group":
                          const activeObjects =
                            canvas.getActiveObjects?.() || [];
                          if (activeObjects.length > 1) {
                            // Use fabric from props instead of importing
                            if (fabric && fabric.Group) {
                              const group = new fabric.Group(activeObjects);
                              activeObjects.forEach((obj: any) =>
                                canvas.remove(obj)
                              );
                              canvas.add(group);
                              canvas.setActiveObject(group);
                            }
                          }
                          break;
                        case "ungroup":
                          if (
                            targetObject.type === "group" &&
                            targetObject.getObjects
                          ) {
                            const objects = targetObject.getObjects();
                            targetObject.destroy();
                            canvas.remove(targetObject);
                            objects.forEach((obj: any) => {
                              canvas.add(obj);
                            });
                            if (objects.length > 0) {
                              canvas.setActiveObject(objects[0]);
                            }
                          }
                          break;
                      }
                      canvas.renderAll();
                    }}
                  />
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default LeftPanel;

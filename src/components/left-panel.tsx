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
import { EditorMode } from "./sidebar-navigation";

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
  addTable: (rows: number, cols: number) => void;
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
  addTable,
  addSimpleFrame,
  addDoubleFrame,
  addDecorativeFrame,
  addRoundedFrame,
}) => {
  // Timeout ref to manage closing delays
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Determine which mode to show - prioritize editorMode, then hoveredMode
  const activeMode = editorMode || hoveredMode;

  // Don't render if no active mode
  if (!activeMode) {
    return null;
  }

  const handleMouseEnter = () => {
    // Clear any pending close timeout when entering the panel
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    // Only close if it's a hovered mode (not clicked/pinned)
    if (!editorMode && hoveredMode) {
      // Clear existing timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }

      // Set new timeout with longer delay
      closeTimeoutRef.current = setTimeout(() => {
        if (!editorMode && hoveredMode) {
          setHoveredMode(null);
        }
        closeTimeoutRef.current = null;
      }, 300);
    }
  };

  return (
    <>
      {/* Bridge area to help with hover transition */}
      {activeMode && !editorMode && (
        <div
          className="absolute left-16 w-8 z-15"
          style={{
            top: "64px",
            height: "calc(100vh - 100px)",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}

      <aside
        className={`absolute left-20 w-96 bg-white flex-shrink-0 z-20 transition-all duration-300 ease-out rounded-3xl shadow-2xl overflow-hidden ${
          activeMode
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0"
        }`}
        style={{
          top: "64px", // Start at the top of the Design item
          height: "calc(100vh - 100px)", // Leave minimal space at bottom
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 25px -6px rgba(0, 0, 0, 0.1)",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-full h-full overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
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
              addTable={addTable}
              addSimpleFrame={addSimpleFrame}
              addDoubleFrame={addDoubleFrame}
              addDecorativeFrame={addDecorativeFrame}
              addRoundedFrame={addRoundedFrame}
            />
          )}
          {activeMode === "advanced-settings" && <AdvancedSettingsLeftPanel />}
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
        </div>
      </aside>
    </>
  );
};

export default LeftPanel;

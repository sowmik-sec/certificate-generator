/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import TemplatesPanel from "@/components/templates-pannel";
import ElementsPanel from "@/components/elements-pannel";
import ToolsPanel from "@/components/tools-pannel";
import TextPanel from "@/components/text-pannel";
import { EditorMode } from "./sidebar-navigation";

interface LeftPanelProps {
  editorMode: EditorMode;
  canvas: any;
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
  canvas,
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
  return (
    <aside className="w-full md:w-80 bg-gray-200 p-4 overflow-y-auto h-64 md:h-screen flex-shrink-0">
      {editorMode === "templates" && (
        <TemplatesPanel
          onSelectTemplate={onSelectTemplate}
          onImageUpload={onImageUpload}
          canvas={canvas}
        />
      )}

      {editorMode === "elements" && (
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
      {editorMode === "text" && (
        <TextPanel
          addHeading={addHeading}
          addSubheading={addSubheading}
          addBodyText={addBodyText}
          selectedObject={selectedObject}
          canvas={canvas}
        />
      )}
      {editorMode === "tools" && (
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
    </aside>
  );
};

export default LeftPanel;

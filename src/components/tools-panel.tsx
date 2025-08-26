"use client";
import { FabricCanvas } from "@/types/fabric";
import { Pencil, StickyNote, Table } from "lucide-react";
import { useEffect } from "react";
import { useToolsStore } from "@/stores/useToolsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

interface ToolsPanelProps {
  canvas: FabricCanvas;
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
const ToolsPanel: React.FC<ToolsPanelProps> = ({
  canvas,
  addStickyNote,
  addTable,
  addSimpleFrame,
  addDoubleFrame,
  addDecorativeFrame,
  addRoundedFrame,
}) => {
  // Use zustand store for tools state
  const {
    isDrawing,
    toggleDrawing,
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    frameColor,
    setFrameColor,
    frameWidth,
    setFrameWidth,
    tableRows,
    setTableRows,
    tableCols,
    setTableCols,
    applyDrawingSettings,
  } = useToolsStore();

  useEffect(() => {
    applyDrawingSettings(canvas);
  }, [isDrawing, brushColor, brushSize, canvas, applyDrawingSettings]);
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Tools</h3>
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={toggleDrawing}
          variant={isDrawing ? "default" : "outline"}
          className={`flex flex-col items-center justify-center p-4 h-auto ${
            isDrawing ? "bg-blue-200" : ""
          }`}
        >
          <Pencil size={40} className="text-gray-700" />
          <span className="mt-2 text-sm text-gray-600">Draw</span>
        </Button>
        <Button
          onClick={addStickyNote}
          variant="outline"
          className="flex flex-col items-center justify-center p-4 h-auto"
        >
          <StickyNote size={40} className="text-gray-700" />
          <span className="mt-2 text-sm text-gray-600">Sticky Note</span>
        </Button>
        <Card className="p-4">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center">
              <Table size={40} className="text-gray-700" />
              <span className="mt-2 text-sm text-gray-600">Table</span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-600">Rows:</Label>
                <Input
                  type="number"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  className="w-16 h-8"
                  min="1"
                  max="10"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-600">Cols:</Label>
                <Input
                  type="number"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  className="w-16 h-8"
                  min="1"
                  max="10"
                />
              </div>
            </div>
            <Button
              onClick={() => addTable(tableRows, tableCols)}
              className="w-full mt-3"
            >
              Add Table
            </Button>
          </CardContent>
        </Card>
      </div>
      {isDrawing && (
        <Card className="mt-4 p-4">
          <CardContent className="p-0 space-y-3">
            <h4 className="font-semibold">Drawing Options</h4>
            <div>
              <Label className="block text-sm font-medium text-gray-700">
                Color
              </Label>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="mt-1 block w-full h-10 rounded-md border border-input bg-background"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Brush Size: {brushSize}
              </Label>
              <Slider
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Frames Section */}
      <div className="mt-6">
        <h4 className="text-md font-semibold mb-3">Frames</h4>

        {/* Frame Color and Width Controls */}
        <Card className="mb-4 p-3">
          <CardContent className="p-0 space-y-3">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Frame Color
              </Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={frameColor}
                  onChange={(e) => setFrameColor(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-600">{frameColor}</span>
              </div>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Frame Width: {frameWidth}px
              </Label>
              <Slider
                value={[frameWidth]}
                onValueChange={(value) => setFrameWidth(value[0])}
                min={1}
                max={12}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Frame Types */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() =>
              addSimpleFrame({ stroke: frameColor, strokeWidth: frameWidth })
            }
            variant="outline"
            className="flex flex-col items-center justify-center p-3 h-auto"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              className="text-gray-700 mb-2"
            >
              <rect
                x="5"
                y="5"
                width="30"
                height="30"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
              />
            </svg>
            <span className="text-xs text-gray-600">Simple</span>
          </Button>

          <Button
            onClick={() =>
              addDoubleFrame({ stroke: frameColor, strokeWidth: frameWidth })
            }
            variant="outline"
            className="flex flex-col items-center justify-center p-3 h-auto"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              className="text-gray-700 mb-2"
            >
              <rect
                x="3"
                y="3"
                width="34"
                height="34"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <rect
                x="7"
                y="7"
                width="26"
                height="26"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
            <span className="text-xs text-gray-600">Double</span>
          </Button>

          <Button
            onClick={() =>
              addDecorativeFrame({
                stroke: frameColor,
                strokeWidth: frameWidth,
              })
            }
            variant="outline"
            className="flex flex-col items-center justify-center p-3 h-auto"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              className="text-gray-700 mb-2"
            >
              <rect
                x="3"
                y="3"
                width="34"
                height="34"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <rect
                x="7"
                y="7"
                width="26"
                height="26"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <rect x="3" y="3" width="4" height="4" fill="currentColor" />
              <rect x="33" y="3" width="4" height="4" fill="currentColor" />
              <rect x="3" y="33" width="4" height="4" fill="currentColor" />
              <rect x="33" y="33" width="4" height="4" fill="currentColor" />
            </svg>
            <span className="text-xs text-gray-600">Decorative</span>
          </Button>

          <Button
            onClick={() =>
              addRoundedFrame({ stroke: frameColor, strokeWidth: frameWidth })
            }
            variant="outline"
            className="flex flex-col items-center justify-center p-3 h-auto"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              className="text-gray-700 mb-2"
            >
              <rect
                x="5"
                y="5"
                width="30"
                height="30"
                rx="5"
                ry="5"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
              />
            </svg>
            <span className="text-xs text-gray-600">Rounded</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ToolsPanel;

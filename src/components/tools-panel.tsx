"use client";
import { FabricCanvas } from "@/types/fabric";
import { Pencil, StickyNote, Table } from "lucide-react";
import { useEffect } from "react";
import { useToolsStore } from "@/stores/useToolsStore";

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
        <button
          onClick={toggleDrawing}
          className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-sm transition-all ${
            isDrawing ? "bg-blue-200" : "bg-white hover:bg-gray-50"
          }`}
        >
          <Pencil size={40} className="text-gray-700" />
          <span className="mt-2 text-sm text-gray-600">Draw</span>
        </button>
        <button
          onClick={addStickyNote}
          className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
        >
          <StickyNote size={40} className="text-gray-700" />
          <span className="mt-2 text-sm text-gray-600">Sticky Note</span>
        </button>
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <Table size={40} className="text-gray-700" />
            <span className="mt-2 text-sm text-gray-600">Table</span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Rows:</label>
              <input
                type="number"
                value={tableRows}
                onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="10"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Cols:</label>
              <input
                type="number"
                value={tableCols}
                onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="10"
              />
            </div>
          </div>
          <button
            onClick={() => addTable(tableRows, tableCols)}
            className="w-full mt-3 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Table
          </button>
        </div>
      </div>
      {isDrawing && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg space-y-3">
          <h4 className="font-semibold">Drawing Options</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Brush Size: {brushSize}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
              className="mt-1 block w-full"
            />
          </div>
        </div>
      )}

      {/* Frames Section */}
      <div className="mt-6">
        <h4 className="text-md font-semibold mb-3">Frames</h4>

        {/* Frame Color and Width Controls */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frame Color
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frame Width: {frameWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="12"
              value={frameWidth}
              onChange={(e) => setFrameWidth(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
        </div>

        {/* Frame Types */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() =>
              addSimpleFrame({ stroke: frameColor, strokeWidth: frameWidth })
            }
            className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
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
          </button>

          <button
            onClick={() =>
              addDoubleFrame({ stroke: frameColor, strokeWidth: frameWidth })
            }
            className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
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
          </button>

          <button
            onClick={() =>
              addDecorativeFrame({
                stroke: frameColor,
                strokeWidth: frameWidth,
              })
            }
            className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
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
          </button>

          <button
            onClick={() =>
              addRoundedFrame({ stroke: frameColor, strokeWidth: frameWidth })
            }
            className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
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
          </button>
        </div>
      </div>
    </div>
  );
};
export default ToolsPanel;
